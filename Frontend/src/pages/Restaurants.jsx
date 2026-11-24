import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import cx from '../utils/cx';
import ui from '../styles/shared.module.css';
import styles from './Restaurants.module.css';
import { fetchRestaurants } from '../api/restaurants';
import restaurantImage from '../utils/restaurantImage';
import { restaurantOverview } from '../data/mtogo';

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    fetchRestaurants()
      .then((data) => {
        setRestaurants(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <>
      <SiteHeader />

      <section className={cx(ui.page, styles.section)}>
        <p className={ui.eyebrow}>{restaurantOverview.eyebrow}</p>
        <h1 className={cx(ui.display, styles.title)}>{restaurantOverview.title}</h1>
        <p className={cx(ui.lead, styles.lead)}>{restaurantOverview.lead}</p>

        {status === 'loading' && <p className={styles.state}>{restaurantOverview.loading}</p>}
        {status === 'error' && <p className={styles.state}>{restaurantOverview.error}</p>}
        {status === 'ready' && restaurants.length === 0 && (
          <p className={styles.state}>{restaurantOverview.empty}</p>
        )}

        {status === 'ready' && restaurants.length > 0 && (
          <div className={styles.grid}>
            {restaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                to={`/restaurant/${restaurant.id}`}
                className={styles.card}
              >
                <div className={styles.cardPhoto}>
                  <img src={restaurantImage(restaurant)} alt={restaurant.name} />
                </div>
                <div className={styles.cardBody}>
                  <h2>{restaurant.name}</h2>
                  {restaurant.description && (
                    <p className={styles.cardDescription}>{restaurant.description}</p>
                  )}
                  {restaurant.city && <p className={styles.cardCity}>{restaurant.city}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </>
  );
}
