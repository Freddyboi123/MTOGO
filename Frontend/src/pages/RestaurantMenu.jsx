import { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import cx from '../utils/cx';
import ui from '../styles/shared.module.css';
import styles from './RestaurantMenu.module.css';
import { basket, restaurant } from '../data/mtogo';

const deliveryMethods = ['Levering', 'Afhentning'];

export default function RestaurantMenu() {
  const [category, setCategory] = useState(restaurant.categories[0]);
  const [method, setMethod] = useState(deliveryMethods[0]);

  const subtotal = basket.lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const total = subtotal + basket.deliveryFee;

  return (
    <>
      <SiteHeader />

      <div className={styles.cover}>
        <img src={restaurant.cover} alt={restaurant.name} />
        <Link to="/" className={styles.back}>
          ← Alle restauranter
        </Link>
      </div>

      <section className={cx(ui.page, styles.head)}>
        <div>
          <p className={ui.eyebrow}>{restaurant.eyebrow}</p>
          <h1 className={styles.title}>{restaurant.name}</h1>
          <p className={cx(ui.lead, styles.description)}>{restaurant.description}</p>
          <p className={styles.meta}>{restaurant.meta}</p>
        </div>
        <div className={styles.headAside}>
          <span className={ui.pillMint}>{restaurant.openUntil}</span>
          <span className={ui.linkQuiet}>Se restaurantinfo →</span>
        </div>
      </section>

      <section className={cx(ui.page, styles.layout)}>
        <div>
          <div className={styles.tabs}>
            {restaurant.categories.map((name) => (
              <button
                key={name}
                className={name === category ? styles.tabActive : styles.tab}
                onClick={() => setCategory(name)}
              >
                {name}
              </button>
            ))}
          </div>

          <div className={styles.intro}>
            <h2>{restaurant.menuTitle}</h2>
            <p>{restaurant.menuIntro}</p>
          </div>

          <div className={styles.menuGrid}>
            {restaurant.items.map((item) => (
              <article className={styles.item} key={item.name}>
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  {item.flag && <div className={styles.itemFlag}>{item.flag}</div>}
                  <div className={styles.itemPrice}>{item.price} kr.</div>
                </div>
                <button className={styles.addButton} aria-label={`Tilføj ${item.name}`}>
                  +
                </button>
              </article>
            ))}
          </div>

          <h2 className={cx(ui.display, styles.drinksTitle)}>Noget koldt til?</h2>
          {restaurant.drinks.map((drink) => (
            <div className={styles.drinkRow} key={drink.name}>
              <div>
                <strong>{drink.name}</strong>
                <span>{drink.description}</span>
              </div>
              <div className={styles.drinkPrice}>{drink.price} kr.</div>
              <button className={styles.addButton} aria-label={`Tilføj ${drink.name}`}>
                +
              </button>
            </div>
          ))}
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

          <div className={ui.sumRow}>
            <span>Subtotal</span>
            <span>{subtotal} kr.</span>
          </div>
          <div className={ui.sumRow}>
            <span>Levering</span>
            <span>{basket.deliveryFee} kr.</span>
          </div>
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
