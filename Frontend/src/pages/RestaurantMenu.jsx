import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import cx from '../utils/cx';
import ui from '../styles/shared.module.css';
import styles from './RestaurantMenu.module.css';
import { basketTexts, restaurantMenu } from '../data/mtogo';
import { fetchMenu, fetchRestaurant } from '../api/restaurants';
import useFeatureFlag from '../featureFlags/useFeatureFlag';
import useBasket from '../basket/useBasket';

function formatPrice(price) {
  return `${Number(price).toLocaleString('da-DK', { maximumFractionDigits: 2 })} ${restaurantMenu.currency}`;
}

export default function RestaurantMenu() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [status, setStatus] = useState('loading');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [pendingItem, setPendingItem] = useState(null);
  const ordering = useFeatureFlag('ordering');
  const { basket, total, add, increase, decrease, isOtherRestaurant } = useBasket();

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

  function handleAdd(item) {
    if (isOtherRestaurant(restaurant.id)) {
      setPendingItem(item);
      return;
    }
    add(restaurant, item);
  }

  function emptyAndAdd() {
    add(restaurant, pendingItem);
    setPendingItem(null);
  }

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

      <section className={cx(ui.page, ordering ? styles.layout : styles.layoutMenuOnly)}>
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
                    {ordering && (
                      <button
                        className={styles.addButton}
                        aria-label={`Tilføj ${item.name}`}
                        disabled={item.available === false}
                        onClick={() => handleAdd(item)}
                      >
                        +
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </>
          )}
        </div>

        {ordering && (
          <aside className={styles.basket}>
            <h2>{basketTexts.title}</h2>

            {pendingItem && (
              <div className={styles.conflict}>
                <p>{basketTexts.otherRestaurant}</p>
                <div className={styles.conflictActions}>
                  <button className={cx(ui.btn, ui.btnPrimary)} onClick={emptyAndAdd}>
                    {basketTexts.emptyAndAdd}
                  </button>
                  <button className={cx(ui.btn, ui.btnOutline)} onClick={() => setPendingItem(null)}>
                    {basketTexts.keep}
                  </button>
                </div>
              </div>
            )}

            {basket.lines.length === 0 && <p className={styles.emptyBasket}>{basketTexts.empty}</p>}

            {basket.lines.length > 0 && (
              <>
                <p className={styles.address}>
                  {basketTexts.from} {basket.restaurantName}
                </p>

                {basket.lines.map((line) => (
                  <div className={styles.line} key={line.menuItemId}>
                    <div className={styles.lineRow}>
                      <span>
                        {line.quantity} × {line.name}
                      </span>
                      <span>{formatPrice(line.price * line.quantity)}</span>
                    </div>
                    <div className={styles.quantity}>
                      <button aria-label={basketTexts.fewer} onClick={() => decrease(line.menuItemId)}>
                        −
                      </button>
                      <span>{line.quantity}</span>
                      <button aria-label={basketTexts.more} onClick={() => increase(line.menuItemId)}>
                        +
                      </button>
                    </div>
                  </div>
                ))}

                <hr className={ui.divider} />

                <div className={ui.sumTotal}>
                  <span>{basketTexts.total}</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <Link
                  to="/betaling"
                  className={cx(ui.btn, ui.btnPrimary, ui.btnBlock, styles.checkoutButton)}
                >
                  {basketTexts.checkout} · {formatPrice(total)}
                </Link>
              </>
            )}

            <p className={styles.fine}>{basketTexts.fine}</p>
          </aside>
        )}
      </section>

      <SiteFooter variant="slim" />
    </>
  );
}
