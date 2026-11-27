import { useEffect, useState } from 'react';
import StatCard from '../../../components/StatCard';
import dash from '../../../components/DashboardLayout.module.css';
import styles from '../AdminPanel.module.css';
import { getAdminOverview } from '../../../utils/api';
import PageHead from './PageHead';

export default function Overview() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminOverview()
      .then((res) => setOverview(res.data))
      .catch((err) => setError(err.message));
  }, []);

  const value = (key) => (overview ? overview[key] : '–');

  return (
    <>
      <PageHead title="Overblik" subtitle="Status på ordrer, partnere og ansøgninger lige nu." />
      {error && <p className={styles.errorText}>{error}</p>}

      <div className={dash.statGrid}>
        <StatCard label="Ordrer i gang" value={value('activeOrders')} note="Endnu ikke leveret eller annulleret" />
        <StatCard label="Restauranter" value={value('restaurants')} note="Oprettede restauranter" />
        <StatCard label="Chauffører" value={value('couriers')} note="Godkendte chauffører" />
        <StatCard
          label="Restaurantansøgninger"
          value={value('restaurantApplications')}
          note="Afventer behandling"
        />
        <StatCard
          label="Chaufføransøgninger"
          value={value('courierApplications')}
          note="Afventer behandling"
        />
        <StatCard label="Ansøgninger i alt" value={value('totalApplications')} note="Restauranter og chauffører" />
      </div>
    </>
  );
}
