import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchRestaurants } from '../../../api/restaurants';
import useFeatureFlag from '../../../featureFlags/useFeatureFlag';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import restaurantImage from '../../../utils/restaurantImage';
import styles from '../Landing.module.css';


export default function LocalFavorites() {
  const restaurantOverview = useFeatureFlag('restaurantOverview');
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
    <section className={cx(ui.page, styles.section)}>
      <div className={styles.sectionHead}>
        <div>
          <h2 className={cx(ui.display, styles.sectionTitle)}>Lokale favoritter</h2>
          <p className={ui.lead}>
            De steder, du vender tilbage til. Og dem, du ikke har opdaget endnu.
          </p>
        </div>
        {restaurantOverview && (
          <Link to="/restauranter" className={ui.linkAccent}>
            Se alle restauranter →
          </Link>
        )}
      </div>

      {status === 'loading' && <p className={ui.fieldHint}>Henter restauranter…</p>}
      {status === 'error' && <p className={ui.fieldHint}>Restauranterne kunne ikke hentes.</p>}
      {status === 'ready' && restaurants.length === 0 && (
        <p className={ui.fieldHint}>Der er ingen restauranter lige nu.</p>
      )}

      {status === 'ready' && restaurants.length > 0 && (
        <div className={styles.grid}>
          {restaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              to={restaurantOverview ? `/restaurant/${restaurant.id}` : '/'}
              className={styles.card}
            >
              <div className={styles.cardPhoto}>
                <img src={restaurantImage(restaurant)} alt={restaurant.name} />
              </div>
              <div className={styles.cardBody}>
                <h3>{restaurant.name}</h3>
                {restaurant.description && (
                  <p className={styles.cardKind}>{restaurant.description}</p>
                )}
                {restaurant.city && <p className={styles.cardDelivery}>{restaurant.city}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
