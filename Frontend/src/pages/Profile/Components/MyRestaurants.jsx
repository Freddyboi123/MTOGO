import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyRestaurants } from '../../../utils/api';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../Profile.module.css';

export default function MyRestaurants() {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    async function loadRestaurants() {
      try {
        const res = await getMyRestaurants();
        setRestaurants(res.data.data);
      } catch {
        setRestaurants([]);
      }
    }
    loadRestaurants();
  }, []);

  return (
    <>
      <div className={ui.block}>
        <h2>Mine restauranter</h2>
        <p className={styles.sectionHint}>
          {restaurants.length > 0
            ? 'Vælg en restaurant for at åbne dens panel.'
            : 'Du har ingen restauranter endnu. Ansøg under "Mine ansøgninger".'}
        </p>
      </div>
      {restaurants.map((restaurant) => (
        <article className={styles.statusCard} key={restaurant.id}>
          <div className={ui.sectionLabel}>Restaurantpartner</div>
          <h3>{restaurant.name}</h3>
          <p className={styles.statusMeta}>
            {restaurant.street}, {restaurant.postalCode} {restaurant.city}
          </p>
          <Link
            to={`/restaurantpanel/${restaurant.id}`}
            className={cx(ui.btn, ui.btnPrimary, ui.btnSmall, ui.btnBlock, styles.statusAction)}
          >
            Åbn restaurantpanel →
          </Link>
        </article>
      ))}
    </>
  );
}
