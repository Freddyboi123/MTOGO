import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getAvailableDeliveries, getMyDeliveries, acceptDelivery, getUserName } from '../utils/api';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import cx from '../utils/cx';
import ui from '../styles/shared.module.css';
import dash from '../components/DashboardLayout.module.css';
import styles from './CourierPanel.module.css';
import { courierPanelStats } from '../data/mtogo';

const items = [
  { to: '/chauffoerpanel', label: 'Leverancer' },
  { to: '/chauffoerpanel/ture', label: 'Mine ture' },
  { to: '/chauffoerpanel/indtjening', label: 'Indtjening' },
  { to: '/chauffoerpanel/dokumenter', label: 'Dokumenter' },
  { to: '/chauffoerpanel/indstillinger', label: 'Indstillinger' }
];

export default function CourierPanel() {
  const location = useLocation();
  const showingMine = location.pathname.startsWith('/chauffoerpanel/ture');
  const [available, setAvailable] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = useCallback(async () => {
    try {
      const [open, assigned] = await Promise.all([getAvailableDeliveries(), getMyDeliveries()]);
      setAvailable(open.data ?? []);
      setMine(assigned.data ?? []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  async function takeOrder(orderId) {
    setAccepting(orderId);
    setNotice('');
    try {
      await acceptDelivery(orderId);
      setNotice('Leveringen er nu tildelt dig.');
    } catch (err) {
      setError(err.status === 409 ? 'Leveringen er allerede taget af en anden chauffør.' : err.message);
    } finally {
      await refresh();
      setAccepting(null);
    }
  }

  function addressRow(delivery) {
    return `${delivery.pickupAddress || 'Adresse mangler'} → ${delivery.deliveryAddress || 'Adresse mangler'}`;
  }

  return (
    <DashboardLayout
      role="Chaufførpartner"
      items={items}
      breadcrumb="Chauffør  /  Leverancer"
      user={getUserName() || "Chauffør"}
    >
      <div className={dash.head}>
        <div>
          <p className={ui.eyebrow}>Velkommen til dine leverancer</p>
          <h1 className={dash.title}>{showingMine ? "Mine ture" : "Dine leverancer"}</h1>
          <p className={dash.subtitle}>
            {courierPanelStats.area} · {courierPanelStats.vehicle} · {courierPanelStats.date}
          </p>
        </div>
        <div className={dash.actions}>
          <span className={styles.onlinePill}>
            <span className={styles.dot} />
            Du er online
          </span>
          <button className={cx(ui.btn, ui.btnOutline, ui.btnSmall)}>Gå offline</button>
        </div>
      </div>

      <div className={dash.statGrid}>
        <StatCard
          label="Leveringer i dag"
          value={courierPanelStats.deliveriesToday}
          note="Tak for de gode ture"
        />
        <StatCard
          label="Indtjening i dag"
          value={courierPanelStats.earningsToday}
          note="Før skat · ekskl. drikkepenge"
        />
        <StatCard
          label="Dine ture"
          value={`${mine.length} aktiv`}
          note="Accepterede, ikke afsluttede leveringer"
        />
      </div>

      {error && <p role="alert" className={ui.fieldHint}>{error}</p>}
      {notice && <p role="status" className={ui.fieldHint}>{notice}</p>}
      <div className={styles.split}>
        <div>
          <div className={styles.listHead}>
            <div>
              <h2 className={styles.listTitle}>{showingMine ? 'Mine ture' : 'Ledige leverancer'}</h2>
              <p className={styles.listNote}>
                {loading ? 'Indlæser leveringer…' : `${showingMine ? mine.length : available.length} leveringer`}
              </p>
            </div>
            <button type="button" className={cx(ui.btn, ui.btnOutline, ui.btnSmall)} onClick={refresh}>Opdater</button>
          </div>
          {!loading && (showingMine ? mine : available).length === 0 &&
            <p>{showingMine ? 'Du har ingen aktive leveringer.' : 'Der er ingen ledige leveringer lige nu.'}</p>}
          {(showingMine ? mine : available).map((delivery) => (
            <article className={styles.delivery} key={delivery.orderId}>
              <div>
                <div className={styles.deliveryLabel}>ORDRE {delivery.orderId}</div>
                <h3 className={styles.deliveryName}>{delivery.restaurantName}</h3>
                <p className={styles.deliveryRoute}>{addressRow(delivery)}</p>
                {showingMine && <p className={styles.deliveryRoute}>Status: {delivery.deliveryStatus} / {delivery.orderStatus}</p>}
                {delivery.expectedPickupTime && <p className={styles.deliveryRoute}>Afhentning: {delivery.expectedPickupTime}</p>}
              </div>
              {!showingMine &&
                <button type="button" disabled={accepting !== null}
                  onClick={() => takeOrder(delivery.orderId)}
                  className={cx(ui.btn, ui.btnDark, ui.btnSmall, styles.takeButton)}>
                  {accepting === delivery.orderId ? 'Accepterer…' : 'Tag levering'}
                </button>}
            </article>
          ))}
        </div>
        <div className={ui.block}>
          <h2 className={styles.activeTitle}>Mine aktive leveringer</h2>
          {mine.length === 0 && <p>Du har endnu ikke accepteret en levering.</p>}
          {mine.map((delivery) => (
            <div key={delivery.orderId} className={styles.stop}>
              <div>
                <strong className={styles.stopName}>{delivery.restaurantName}</strong>
                <span className={styles.stopLine}>Ordre: {delivery.orderId}</span>
                <span className={styles.stopLine}>Afhent: {delivery.pickupAddress}</span>
                <span className={styles.stopLine}>Lever: {delivery.deliveryAddress}</span>
                <span className={styles.stopLine}>Status: {delivery.deliveryStatus}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
