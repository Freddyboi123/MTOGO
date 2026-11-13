import { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { basket, restaurant } from '../data/mtogo';

export default function RestaurantMenu() {
  const [category, setCategory] = useState(restaurant.categories[0]);
  const [method, setMethod] = useState('Levering');

  const subtotal = basket.lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const total = subtotal + basket.deliveryFee;

  return (
    <>
      <SiteHeader />

      <div className="cover" style={{ backgroundImage: `url(${restaurant.cover})` }}>
        <Link to="/" className="back">
          ← Alle restauranter
        </Link>
      </div>

      <section className="page restaurant-head">
        <div>
          <p className="eyebrow">{restaurant.eyebrow}</p>
          <h1>{restaurant.name}</h1>
          <p className="lead" style={{ marginTop: 20 }}>
            {restaurant.description}
          </p>
          <p className="meta">{restaurant.meta}</p>
        </div>
        <div className="aside">
          <span className="pill pill-mint">{restaurant.openUntil}</span>
          <span className="link-quiet">Se restaurantinfo →</span>
        </div>
      </section>

      <section className="page menu-layout">
        <div>
          <div className="menu-tabs">
            {restaurant.categories.map((name) => (
              <button
                key={name}
                className={name === category ? 'menu-tab menu-tab-active' : 'menu-tab'}
                onClick={() => setCategory(name)}
              >
                {name}
              </button>
            ))}
          </div>

          <div className="menu-intro">
            <h2>{restaurant.menuTitle}</h2>
            <p>{restaurant.menuIntro}</p>
          </div>

          <div className="menu-grid">
            {restaurant.items.map((item) => (
              <article className="menu-item" key={item.name}>
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  {item.flag && <div className="flag">{item.flag.toUpperCase()}</div>}
                  <div className="price">{item.price} kr.</div>
                </div>
                <button className="add-btn" aria-label={`Tilføj ${item.name}`}>
                  +
                </button>
              </article>
            ))}
          </div>

          <h2 className="display" style={{ fontSize: 26, marginTop: 48 }}>
            Noget koldt til?
          </h2>
          {restaurant.drinks.map((drink) => (
            <div className="drink-row" key={drink.name}>
              <div>
                <strong>{drink.name}</strong>
                <span>{drink.description}</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{drink.price} kr.</div>
              <button className="add-btn" aria-label={`Tilføj ${drink.name}`}>
                +
              </button>
            </div>
          ))}
        </div>

        <aside className="basket">
          <h2>Din bestilling</h2>
          <div className="toggle">
            {['Levering', 'Afhentning'].map((name) => (
              <button
                key={name}
                className={name === method ? 'active' : undefined}
                onClick={() => setMethod(name)}
              >
                {name}
              </button>
            ))}
          </div>
          <p className="basket-address">{basket.address}</p>
          <p className="basket-eta">{basket.eta}</p>

          {basket.lines.map((line) => (
            <div className="basket-line" key={line.name}>
              <div className="row">
                <span>
                  {line.quantity} × {line.name}
                </span>
                <span>{line.price} kr.</span>
              </div>
              <div className="qty">
                <button aria-label="Færre">−</button>
                <span>{line.quantity}</span>
                <button aria-label="Flere">+</button>
              </div>
            </div>
          ))}

          <hr />
          <div className="sum-row">
            <span>Subtotal</span>
            <span>{subtotal} kr.</span>
          </div>
          <div className="sum-row">
            <span>Levering</span>
            <span>{basket.deliveryFee} kr.</span>
          </div>
          <div className="sum-total">
            <span>I alt</span>
            <span>{total} kr.</span>
          </div>
          <Link to="/betaling" className="btn btn-primary btn-block">
            Gå til betaling · {total} kr.
          </Link>
          <p className="fine">Alle priser er inkl. moms.</p>
        </aside>
      </section>

      <SiteFooter variant="slim" />
    </>
  );
}
