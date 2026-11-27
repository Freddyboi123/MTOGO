import { Link } from 'react-router-dom';
import { useApplicationCounts } from '../../../utils/api';
import styles from '../AdminPanel.module.css';
import PageHead from './PageHead';
import RestaurantApplications from './RestaurantApplications';
import CourierApplications from './CourierApplications';

export default function Applications({ type }) {
  const counts = useApplicationCounts();
  const restaurants = type === 'restaurant';

  return (
    <>
      <PageHead
        title="Ansøgninger"
        subtitle="Gennemgå oplysninger og dokumenter, før du giver adgang til MTOGO."
      />

      <div className={styles.tabs}>
        {restaurants ? (
          <button className={styles.tabActive}>Restauranter · {counts.restaurants}</button>
        ) : (
          <Link to="/admin/ansoegninger/restaurant" className={styles.tab}>
            Restauranter · {counts.restaurants}
          </Link>
        )}
        {restaurants ? (
          <Link to="/admin/ansoegninger/chauffoer" className={styles.tab}>
            Chauffører · {counts.couriers}
          </Link>
        ) : (
          <button className={styles.tabActive}>Chauffører · {counts.couriers}</button>
        )}
        <span className={styles.tabsRight}>{counts.total} ansøgninger afventer handling</span>
      </div>

      {restaurants ? <RestaurantApplications onDecided={counts.reload} /> : <CourierApplications />}
    </>
  );
}
