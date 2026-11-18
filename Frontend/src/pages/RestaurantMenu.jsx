import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import cx from '../utils/cx';
import ui from '../styles/shared.module.css';
import styles from './RestaurantMenu.module.css';
import { basket, restaurantMenu } from '../data/mtogo';
import { fetchMenu, fetchRestaurant } from '../api/restaurants';

const deliveryMethods = ['Levering', 'Afhentning'];

function formatPrice(price) {
  return `${Number(price).toLocaleString('da-DK', { maximumFractionDigits: 2 })} ${restaurantMenu.currency}`;
}

export default function RestaurantMenu() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [status, setStatus] = useState('loading');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [method, setMethod] = useState(deliveryMethods[0]);

  useEffect(() => {
    setStatus('loading');
    Promise.all([fetchRestaurant(id), fetchMenu(id)])
      .then(([restaurantData, menuData]) => {
        setRestaurant(restaurantData);
        setMenu(menuData);
        setSelectedCategoryId(menuData[0]?.id ?? null);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [id]);

  const total = basket.lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  const selectedCategory = menu.find((category) => category.id === selectedCategoryId);
  const address = restaurant
    ? [restaurant.street, [restaurant.postalCode, restaurant.city].filter(Boolean).join(' ')]
        .filter(Boolean)
        .join(', ')
    : '';

  return (
    <>
      <SiteHeader />

      <div className={styles.cover}>
        <img src={restaurantMenu.cover} alt={restaurant?.name ?? ''} />
        <Link to="/restauranter" className={styles.back}>
          {restaurantMenu.back}
        </Link>
      </div>

      {status !== 'ready' && (
        <section className={cx(ui.page, styles.head)}>
          <p className={styles.state}>
            {status === 'loading' ? restaurantMenu.loading : restaurantMenu.error}
          </p>
        </section>
      )}

      {status === 'ready' && (
        <section className={cx(ui.page, styles.head)}>
          <div>
            {restaurant.city && <p className={ui.eyebrow}>{restaurant.city}</p>}
            <h1 className={styles.title}>{restaurant.name}</h1>
            {restaurant.description && (
              <p className={cx(ui.lead, styles.description)}>{restaurant.description}</p>
            )}
            <p className={styles.meta}>
              {[address, restaurant.phoneNumber].filter(Boolean).join('     ·     ')}
            </p>
          </div>
        </section>
      )}

      <section className={cx(ui.page, styles.layout)}>
        <div>
          {status === 'ready' && menu.length === 0 && (
            <p className={styles.state}>{restaurantMenu.emptyMenu}</p>
          )}

          {status === 'ready' && menu.length > 0 && (
            <>
              <div className={styles.tabs}>
                {menu.map((category) => (
                  <button
                    key={category.id}
                    className={category.id === selectedCategoryId ? styles.tabActive : styles.tab}
                    onClick={() => setSelectedCategoryId(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              <div className={styles.intro}>
                <h2>{selectedCategory.name}</h2>
              </div>

              {selectedCategory.items.length === 0 && (
                <p className={styles.state}>{restaurantMenu.emptyCategory}</p>
              )}

              <div className={styles.menuGrid}>
                {selectedCategory.items.map((item) => (
                  <article
                    className={item.available === false ? styles.itemUnavailable : styles.item}
                    key={item.id}
                  >
                    <div>
                      <h3>{item.name}</h3>
                      {item.description && <p>{item.description}</p>}
                      {item.available === false && (
                        <div className={styles.itemFlag}>{restaurantMenu.unavailable}</div>
                      )}
                      <div className={styles.itemPrice}>{formatPrice(item.price)}</div>
                    </div>
                    <button
                      className={styles.addButton}
                      aria-label={`Tilføj ${item.name}`}
                      disabled={item.available === false}
                    >
                      +
                    </button>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>

        <aside className={styles.basket}>
          <h2>Din bestilling</h2>

          <div className={styles.toggle}>
            {deliveryMethods.map((name) => (
              <button
                key={name}
                className={name === method ? styles.toggleButtonActive : styles.toggleButton}
                onClick={() => setMethod(name)}
              >
                {name}
              </button>
            ))}
          </div>

          <p className={styles.address}>{basket.address}</p>
          <p className={styles.eta}>{basket.eta}</p>

          {basket.lines.map((line) => (
            <div className={styles.line} key={line.name}>
              <div className={styles.lineRow}>
                <span>
                  {line.quantity} × {line.name}
                </span>
                <span>{line.price} kr.</span>
              </div>
              <div className={styles.quantity}>
                <button aria-label="Færre">−</button>
                <span>{line.quantity}</span>
                <button aria-label="Flere">+</button>
              </div>
            </div>
          ))}

          <hr className={ui.divider} />

          <div className={ui.sumTotal}>
            <span>I alt</span>
            <span>{total} kr.</span>
          </div>

          <Link
            to="/betaling"
            className={cx(ui.btn, ui.btnPrimary, ui.btnBlock, styles.checkoutButton)}
          >
            Gå til betaling · {total} kr.
          </Link>
          <p className={styles.fine}>Alle priser er inkl. moms.</p>
        </aside>
      </section>

      <SiteFooter variant="slim" />
    </>
  );
}
