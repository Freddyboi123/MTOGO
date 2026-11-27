import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import RestaurantFilters from '../../components/RestaurantFilters';
import cx from '../../utils/cx';
import ui from '../../styles/shared.module.css';
import styles from './Restaurants.module.css';
import { fetchRestaurants } from '../../utils/api';
import restaurantImage from '../../utils/restaurantImage';
import { cuisineLabel } from '../../components/RestaurantFilters';

const SEARCH_DELAY_MS = 250;

export default function Restaurants() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [status, setStatus] = useState('loading');
  const cuisine = searchParams.get('cuisine') ?? '';
  const near = location.state?.near ?? null;

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      fetchRestaurants({ cuisine, query, latitude: near?.latitude, longitude: near?.longitude })
        .then((data) => {
          if (cancelled) return;
          setRestaurants(data);
          setStatus('ready');
        })
        .catch(() => !cancelled && setStatus('error'));
    }, SEARCH_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [cuisine, query, near?.latitude, near?.longitude]);

  function handleCuisineChange(value) {
    setSearchParams(value ? { cuisine: value } : {}, { replace: true, state: location.state });
  }

  function clearNear() {
    navigate({ pathname: location.pathname, search: location.search }, { replace: true, state: null });
  }

  const filtered = cuisine !== '' || query.trim() !== '';

  return (
    <>
      <SiteHeader />

      <section className={cx(ui.page, styles.section)}>
        <p className={ui.eyebrow}>Alle restauranter</p>
        <h1 className={cx(ui.display, styles.title)}>Find dit næste måltid</h1>
        <p className={cx(ui.lead, styles.lead)}>
          Udforsk restauranterne på MTOGO, og vælg hvor du vil bestille fra.
        </p>

        <RestaurantFilters
          cuisine={cuisine}
          onCuisineChange={handleCuisineChange}
          query={query}
          onQueryChange={setQuery}
        />

        {near && (
          <p className={styles.near}>
            Sorteret efter afstand til {near.label}.{' '}
            <button type="button" className={styles.nearClear} onClick={clearNear}>
              Fjern adresse
            </button>
          </p>
        )}

        <div className={styles.results}>
          {status === 'loading' && <p className={styles.state}>Henter restauranter…</p>}
          {status === 'error' && (
            <p className={styles.state}>Restauranterne kunne ikke hentes. Prøv igen om lidt.</p>
          )}
          {status === 'ready' && restaurants.length === 0 && (
            <p className={styles.state}>
              {near
                ? 'Der er ingen restauranter inden for rækkevidde af din adresse.'
                : filtered
                  ? 'Ingen restauranter matcher dit valg.'
                  : 'Der er ingen restauranter endnu.'}
            </p>
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
                    {restaurant.cuisine && (
                      <p className={styles.cardCuisine}>{cuisineLabel(restaurant.cuisine)}</p>
                    )}
                    {restaurant.description && (
                      <p className={styles.cardDescription}>{restaurant.description}</p>
                    )}
                    {restaurant.city && <p className={styles.cardCity}>{restaurant.city}</p>}
                    {restaurant.distanceKm != null && (
                      <p className={styles.cardDistance}>
                        {restaurant.distanceKm.toLocaleString('da-DK')} km væk
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
