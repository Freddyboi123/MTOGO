import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { acceptDelivery, getAvailableDeliveries, getMyDeliveries, isLoggedIn } from '../utils/api';
import cx from '../utils/cx';
import ui from '../styles/shared.module.css';
import dash from '../components/DashboardLayout.module.css';
import styles from './CourierPanel.module.css';

const items = [
  { to: '/chauffoerpanel', label: 'Leverancer' },
  { to: '/chauffoerpanel/ture', label: 'Mine ture' },
  { to: '/chauffoerpanel/indtjening', label: 'Indtjening' },
  { to: '/chauffoerpanel/dokumenter', label: 'Dokumenter' },
  { to: '/chauffoerpanel/indstillinger', label: 'Indstillinger' }
];

function getSessionUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

function formatAddress(street, postalCode, city) {
  return [street, [postalCode, city].filter(Boolean).join(' ')].filter(Boolean).join(', ') || 'Adresse ikke angivet';
}

function formatPickupTime(value) {
  if (!value) return 'Ikke angivet';
  const time = new Date(value);
  if (Number.isNaN(time.getTime())) return 'Ikke angivet';
  return new Intl.DateTimeFormat('da-DK', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(time);
}

export default function CourierPanel() {
  const { pathname } = useLocation();
  const myDeliveries = pathname === '/chauffoerpanel/ture';
  const user = getSessionUser();
  const authorized = isLoggedIn() && user?.roles?.includes('DELIVERY_AGENT');
  const [deliveries, setDeliveries] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [accepting, setAccepting] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!authorized) return;
    let active = true;
    setLoading(true);
    setSelectedOrderId(null);
    setNotice('');
    (myDeliveries ? getMyDeliveries() : getAvailableDeliveries())
      .then((response) => {
        if (!active) return;
        setDeliveries(response.data ?? []);
        setError('');
        setSelectedOrderId((current) =>
          response.data?.some((delivery) => delivery.orderId === current) ? current : null
        );
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [authorized, reload, myDeliveries]);

  async function handleAccept(orderId) {
    setAccepting(orderId);
    setNotice('');
    try {
      await acceptDelivery(orderId);
      setNotice('Ordren er nu tildelt dig og findes under Mine ture.');
      setDeliveries((current) => current.filter((delivery) => delivery.orderId !== orderId));
      setSelectedOrderId(null);
    } catch (err) {
      if (err.status === 409) {
        setNotice('Ordren er allerede taget af en anden chauffør eller er ikke længere ledig.');
        setDeliveries((current) => current.filter((delivery) => delivery.orderId !== orderId));
        setSelectedOrderId(null);
      } else {
        setNotice(`Kunne ikke acceptere ordren: ${err.message}`);
      }
    } finally {
      setAccepting(null);
    }
  }

  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (!authorized) {
    return <p className={cx(ui.page, styles.message)}>Kun chaufførpartnere har adgang til leveringsoversigten.</p>;
  }

  const selected = !loading && !error
    ? deliveries.find((delivery) => delivery.orderId === selectedOrderId)
    : null;
  const displayName = [user.name, user.lastName].filter(Boolean).join(' ');

  return (
    <DashboardLayout
      role="Chaufførpartner"
      items={items}
      breadcrumb={myDeliveries ? 'Chauffør / Mine ture' : 'Chauffør / Ledige leverancer'}
      user={displayName}
    >
      <div className={dash.head}>
        <div>
          <p className={ui.eyebrow}>Chaufføroversigt</p>
          <h1 className={dash.title}>{myDeliveries ? 'Mine ture' : 'Ledige leverancer'}</h1>
          <p className={dash.subtitle}>{myDeliveries ? 'Dine accepterede leverancer og deres status.' : 'Ordrer klar til afhentning, som endnu ikke har en chauffør.'}</p>
        </div>
        <div className={dash.actions}>
          <button
            type="button"
            className={cx(ui.btn, ui.btnOutline, ui.btnSmall)}
            disabled={loading}
            onClick={() => { setLoading(true); setReload((value) => value + 1); }}
          >
            Opdater listen
          </button>
        </div>
      </div>

      {notice && <p className={styles.message} role="status">{notice}</p>}
      <div className={styles.split}>
        <section aria-label={myDeliveries ? 'Mine ture' : 'Ledige leverancer'}>
          <div className={styles.listHead}>
            <h2 className={styles.listTitle}>{myDeliveries ? 'Mine aktive leverancer' : 'Tilgængelige ordrer'}</h2>
            {!loading && !error && <p className={styles.listNote}>{deliveries.length} {myDeliveries ? 'aktive ture' : 'ledige leverancer'}</p>}
          </div>

          {loading && <p className={styles.message} role="status">Henter leverancer...</p>}
          {!loading && error && (
            <p className={styles.message} role="alert">Kunne ikke hente leverancer: {error}</p>
          )}
          {!loading && !error && deliveries.length === 0 && (
            <p className={styles.message} role="status">{myDeliveries ? 'Du har ingen aktive ture lige nu.' : 'Der er ingen ledige leverancer lige nu.'}</p>
          )}

          {!loading && !error && deliveries.map((delivery) => (
            <article className={styles.delivery} key={delivery.orderId}>
              <div>
                <div className={styles.deliveryLabel}>{myDeliveries ? `STATUS: ${delivery.deliveryStatus ?? delivery.orderStatus}` : 'LEDIG'} · ORDRE {delivery.orderId}</div>
                <h3 className={styles.deliveryName}>{delivery.restaurantName}</h3>
                <p className={styles.deliveryRoute}>Forventet afhentning: {formatPickupTime(delivery.expectedPickupAt ?? delivery.expectedPickupTime)}</p>
              </div>
              <button
                type="button"
                className={cx(ui.btn, ui.btnDark, ui.btnSmall)}
                aria-expanded={selectedOrderId === delivery.orderId}
                onClick={() => setSelectedOrderId((current) =>
                  current === delivery.orderId ? null : delivery.orderId
                )}
              >
                {selectedOrderId === delivery.orderId ? 'Skjul detaljer' : 'Se detaljer'}
              </button>
            </article>
          ))}
        </section>

        <section aria-label="Ordredetaljer" className={ui.block}>
          <h2 className={styles.detailsTitle}>Ordredetaljer</h2>
          {!selected ? (
            <p className={styles.message}>Vælg en levering for at se afhentnings- og leveringsadresse.</p>
          ) : (
            <>
              <p className={styles.orderNumber}>Ordrenummer: {selected.orderId}</p>
              <div className={styles.detail}>
                <span className={ui.sectionLabel}>RESTAURANT / AFHENTNING</span>
                <strong>{selected.restaurantName}</strong>
                <p>{selected.pickupAddress || formatAddress(selected.pickupStreet, selected.pickupPostalCode, selected.pickupCity)}</p>
              </div>
              <div className={styles.detail}>
                <span className={ui.sectionLabel}>KUNDE / LEVERING</span>
                <p>{selected.deliveryAddress || formatAddress(selected.deliveryStreet, selected.deliveryPostalCode, selected.deliveryCity)}</p>
              </div>
              <div className={styles.detail}>
                <span className={ui.sectionLabel}>FORVENTET AFHENTNING</span>
                <p>{formatPickupTime(selected.expectedPickupAt ?? selected.expectedPickupTime)}</p>
              </div>
              {myDeliveries ? (
                <div className={styles.detail}>
                  <span className={ui.sectionLabel}>LEVERINGSSTATUS</span>
                  <p>{selected.deliveryStatus ?? selected.orderStatus}</p>
                </div>
              ) : (
                <button type="button" className={cx(ui.btn, ui.btnDark)}
                  disabled={accepting !== null} onClick={() => handleAccept(selected.orderId)}>
                  {accepting === selected.orderId ? 'Accepterer...' : 'Accepter levering'}
                </button>
              )}
            </>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
