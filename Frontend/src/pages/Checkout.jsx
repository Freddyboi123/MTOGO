import { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { basket, customer, restaurant } from '../data/mtogo';

export default function Checkout() {
  const [method, setMethod] = useState('kort');

  const subtotal = basket.lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const total = subtotal + basket.deliveryFee;

  return (
    <>
      <SiteHeader variant="app" />

      <section className="page checkout-head">
        <Link to="/restaurant" className="link-quiet">
          ← Tilbage til menuen
        </Link>
        <h1>Lige om lidt er der mad.</h1>
        <div className="crumbs">
          <span>Kurv   →   Levering   →   Betaling</span>
          <span className="fine">Sikker betaling · Alle priser er inkl. moms</span>
        </div>
      </section>

      <section className="page checkout">
        <div>
          <div className="block">
            <div className="block-head">
              <h2>01  Levering</h2>
              <span className="link-quiet">Rediger adresse →</span>
            </div>
            <div className="block-head" style={{ marginTop: 24 }}>
              <div>
                <strong style={{ fontSize: 17 }}>
                  {customer.firstName} {customer.lastName}
                </strong>
                <p className="muted" style={{ marginTop: 12 }}>
                  {customer.street}, {customer.floor}
                  <br />
                  {customer.postalCode} {customer.city}
                </p>
                <p className="muted" style={{ marginTop: 20, fontSize: 13 }}>
                  {customer.phone} · {customer.email}
                </p>
              </div>
              <div className="eta-card">
                <span className="eyebrow" style={{ color: 'var(--muted)' }}>
                  Forventet levering
                </span>
                <strong>20–30 min</strong>
                <span>Så hurtigt som muligt</span>
              </div>
            </div>
          </div>

          <div className="block">
            <h2>02  Betaling</h2>
            <div className="pay-options">
              <button
                className={method === 'kort' ? 'pay-option active' : 'pay-option'}
                onClick={() => setMethod('kort')}
              >
                <strong>● Betalingskort</strong>
                <span>Visa / Mastercard</span>
              </button>
              <button
                className={method === 'mobilepay' ? 'pay-option active' : 'pay-option'}
                onClick={() => setMethod('mobilepay')}
              >
                <strong>○ MobilePay</strong>
              </button>
            </div>

            <div className="stack">
              <div className="field">
                <label htmlFor="card-number">Kortnummer</label>
                <input id="card-number" placeholder="1234 1234 1234 1234" />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="card-expiry">Udløbsdato</label>
                  <input id="card-expiry" placeholder="MM / ÅÅ" />
                </div>
                <div className="field">
                  <label htmlFor="card-cvc">Sikkerhedskode</label>
                  <input id="card-cvc" placeholder="CVC" />
                </div>
              </div>
              <div className="field">
                <label htmlFor="card-name">Navn på kortet</label>
                <input id="card-name" placeholder="Som det står på dit kort" />
              </div>
            </div>
          </div>

          <div className="block">
            <h2>03  Besked til chaufføren</h2>
            <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>
              Valgfrit · F.eks. dørkode eller hvor chaufføren skal ringe på.
            </p>
            <div className="field" style={{ marginTop: 20 }}>
              <textarea defaultValue="Ring venligst på ved ankomst." aria-label="Leveringsnote" />
            </div>
          </div>
        </div>

        <aside>
          <div className="block">
            <h2 style={{ fontSize: 24 }}>Din bestilling</h2>
            <div className="order-restaurant">
              <div className="photo" style={{ backgroundImage: `url(${restaurant.cover})` }} />
              <div>
                <strong>{restaurant.name}</strong>
                <span>Levering · 20–30 min</span>
              </div>
            </div>

            {basket.lines.map((line) => (
              <div className="order-line" key={line.name}>
                <span>
                  {line.quantity} × {line.name}
                </span>
                <span>{line.price} kr.</span>
              </div>
            ))}

            <p className="link-quiet" style={{ marginTop: 20 }}>
              Rediger kurv →
            </p>

            <div className="discount">
              <input placeholder="Rabatkode" aria-label="Rabatkode" />
              <button className="apply">Anvend</button>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '28px 0 20px' }} />

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

            <button className="btn btn-primary btn-block" style={{ marginTop: 28 }}>
              Betal {total} kr. og bestil
            </button>
            <p className="apply-info">
              Ved at bestille accepterer du handelsbetingelserne.
              <br />
              Betalingen gennemføres sikkert.
            </p>
            <p className="field-hint">Inkl. moms · Ingen ekstra gebyrer</p>
          </div>

          <div className="block">
            <h2 className="display" style={{ fontSize: 26 }}>
              En god bestilling.
              <br />
              Hele vejen hjem.
            </h2>
            <p style={{ marginTop: 20 }}>Har du spørgsmål til din bestilling?</p>
            <p className="link-accent" style={{ marginTop: 16 }}>
              Kontakt kundeservice →
            </p>
          </div>
        </aside>
      </section>

      <SiteFooter variant="slim" />
    </>
  );
}
