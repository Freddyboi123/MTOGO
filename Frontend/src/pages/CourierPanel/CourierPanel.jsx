import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import {
  acceptDelivery,
  completeDelivery,
  getAvailableDeliveries,
  getMyDeliveries,
  isLoggedIn,
  pickUpDelivery,
  refreshUser
} from '../../utils/api';
import { courierDeliveryStatusTexts } from '../../data/mtogo';
import cx from '../../utils/cx';
import ui from '../../styles/shared.module.css';
import dash from '../../components/DashboardLayout.module.css';
import styles from './CourierPanel.module.css';
import DeliveryCard from './Components/DeliveryCard';
import DeliveryDetails from './Components/DeliveryDetails';

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

function isDeliveryAgent(user) {
  return Boolean(isLoggedIn() && user?.roles?.includes('DELIVERY_AGENT'));
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

function pickupTimeOf(delivery) {
  return formatPickupTime(delivery.expectedPickupAt ?? delivery.expectedPickupTime);
}

function canUpdateStatus(delivery) {
  return (
    (delivery.deliveryStatus === 'ASSIGNED' && delivery.orderStatus === 'READY_FOR_PICKUP') ||
    (delivery.deliveryStatus === 'PICKED_UP' && delivery.orderStatus === 'OUT_FOR_DELIVERY')
  );
}

export default function CourierPanel() {
  const { pathname } = useLocation();
  const myDeliveries = pathname === '/chauffoerpanel/ture';
  const [user, setUser] = useState(getSessionUser);
  const [checkingAccess, setCheckingAccess] = useState(() => isLoggedIn() && !isDeliveryAgent(getSessionUser()));
  const authorized = isDeliveryAgent(user);
  const [deliveries, setDeliveries] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [accepting, setAccepting] = useState(null);
  const [notice, setNotice] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [statusError, setStatusError] = useState('');

  useEffect(() => {
    if (!checkingAccess) return undefined;
    let active = true;
    refreshUser()
      .then((fresh) => {
        if (active) setUser(fresh);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setCheckingAccess(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!authorized) return;
    let active = true;
    setLoading(true);
    setSelectedOrderId(null);
    setNotice('');
    setStatusError('');
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

  async function handleStatusUpdate(delivery) {
    const completing = delivery.deliveryStatus === 'PICKED_UP';
    setUpdatingStatus(delivery.orderId);
    setStatusError('');
    setNotice('');
    try {
      const response = await (completing ? completeDelivery(delivery.orderId) : pickUpDelivery(delivery.orderId));
      setDeliveries((current) => completing
        ? current.filter((item) => item.orderId !== delivery.orderId)
        : current.map((item) => item.orderId === delivery.orderId ? response.data : item));
      if (completing) setSelectedOrderId((current) => current === delivery.orderId ? null : current);
      setNotice(completing ? courierDeliveryStatusTexts.completed : courierDeliveryStatusTexts.pickedUp);
    } catch (err) {
      setStatusError(err.message);
    } finally {
      setUpdatingStatus(null);
    }
  }

  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (checkingAccess) return null;
  if (!authorized) {
    return <p className={cx(ui.page, styles.message)}>Kun chaufførpartnere har adgang til leveringsoversigten.</p>;
  }

  const selected = !loading && !error
    ? deliveries.find((delivery) => delivery.orderId === selectedOrderId)
    : null;
  const displayName = [user.name, user.lastName].filter(Boolean).join(' ');

  function actionLabelOf(delivery) {
    if (!delivery || !canUpdateStatus(delivery)) return null;
    if (updatingStatus === delivery.orderId) return courierDeliveryStatusTexts.updating;
    return delivery.deliveryStatus === 'ASSIGNED' ? courierDeliveryStatusTexts.pickUp : courierDeliveryStatusTexts.deliver;
  }

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
            disabled={loading || updatingStatus !== null}
            onClick={() => { setLoading(true); setReload((value) => value + 1); }}
          >
            Opdater listen
          </button>
        </div>
      </div>

      {statusError && <p className={styles.message} role="alert">{statusError}</p>}
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
            <DeliveryCard
              key={delivery.orderId}
              delivery={delivery}
              label={myDeliveries ? `STATUS: ${courierDeliveryStatusTexts.labels[delivery.deliveryStatus] ?? delivery.orderStatus}` : 'LEDIG'}
              pickupTime={pickupTimeOf(delivery)}
              expanded={selectedOrderId === delivery.orderId}
              onToggle={() => setSelectedOrderId((current) =>
                current === delivery.orderId ? null : delivery.orderId
              )}
            />
          ))}
        </section>

        <DeliveryDetails
          selected={selected}
          myDeliveries={myDeliveries}
          pickupAddress={selected && (selected.pickupAddress || formatAddress(selected.pickupStreet, selected.pickupPostalCode, selected.pickupCity))}
          deliveryAddress={selected && (selected.deliveryAddress || formatAddress(selected.deliveryStreet, selected.deliveryPostalCode, selected.deliveryCity))}
          pickupTime={selected && pickupTimeOf(selected)}
          statusLabel={selected && (courierDeliveryStatusTexts.labels[selected.deliveryStatus] ?? selected.orderStatus)}
          actionLabel={actionLabelOf(selected)}
          updating={updatingStatus}
          accepting={accepting}
          onStatusUpdate={handleStatusUpdate}
          onAccept={handleAccept}
        />
      </div>
    </DashboardLayout>
  );
}
