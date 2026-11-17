import { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import cx from '../utils/cx';
import ui from '../styles/shared.module.css';
import styles from './Checkout.module.css';
import { basket, customer, restaurant } from '../data/mtogo';

const paymentMethods = [
  { id: 'kort', title: 'Betalingskort', note: 'Visa / Mastercard' },
  { id: 'mobilepay', title: 'MobilePay', note: null }
];

export default function Checkout() {
  const [method, setMethod] = useState(paymentMethods[0].id);

  const subtotal = basket.lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const total = subtotal + basket.deliveryFee;

  return (
    <>
      <SiteHeader variant="app" />

      <section className={cx(ui.page, styles.head)}>
        <Link to="/restaurant" className={ui.linkQuiet}>
          ← Tilbage til menuen
        </Link>
        <h1 className={styles.title}>Lige om lidt er der mad.</h1>
        <div className={styles.crumbs}>
          <span>Kurv   →   Levering   →   Betaling</span>
          <span className={styles.crumbsNote}>
            Sikker betaling · Alle priser er inkl. moms
          </span>
        </div>
      </section>

      <section className={cx(ui.page, styles.layout)}>
        <div>
          <div className={ui.block}>
            <div className={ui.blockHead}>
              <h2>01  Levering</h2>
              <span className={ui.linkQuiet}>Rediger adresse →</span>
            </div>
            <div className={cx(ui.blockHead, styles.customer)}>
              <div>
                <strong className={styles.customerName}>
                  {customer.firstName} {customer.lastName}
                </strong>
                <p className={styles.customerAddress}>
                  {customer.street}, {customer.floor}
                  <br />
                  {customer.postalCode} {customer.city}
                </p>
                <p className={styles.customerContact}>
                  {customer.phone} · {customer.email}
                </p>
              </div>
              <div className={styles.eta}>
                <span className={ui.eyebrowMuted}>Forventet levering</span>
                <strong className={styles.etaValue}>20–30 min</strong>
                <span className={styles.etaNote}>Så hurtigt som muligt</span>
              </div>
            </div>
          </div>

          <div className={ui.block}>
            <h2>02  Betaling</h2>
            <div className={styles.payOptions}>
              {paymentMethods.map((option) => (
                <button
                  key={option.id}
                  className={option.id === method ? styles.payOptionActive : styles.payOption}
                  onClick={() => setMethod(option.id)}
                >
                  <strong>
                    {option.id === method ? '●' : '○'} {option.title}
                  </strong>
                  {option.note && <span>{option.note}</span>}
                </button>
              ))}
            </div>

            <div className={ui.stack}>
              <div className={ui.field}>
                <label htmlFor="card-number">Kortnummer</label>
                <input id="card-number" placeholder="1234 1234 1234 1234" />
              </div>
              <div className={ui.fieldRow}>
                <div className={ui.field}>
                  <label htmlFor="card-expiry">Udløbsdato</label>
                  <input id="card-expiry" placeholder="MM / ÅÅ" />
                </div>
                <div className={ui.field}>
                  <label htmlFor="card-cvc">Sikkerhedskode</label>
                  <input id="card-cvc" placeholder="CVC" />
                </div>
              </div>
              <div className={ui.field}>
                <label htmlFor="card-name">Navn på kortet</label>
                <input id="card-name" placeholder="Som det står på dit kort" />
              </div>
            </div>
          </div>

          <div className={ui.block}>
            <h2>03  Besked til chaufføren</h2>
            <p className={styles.noteHint}>
              Valgfrit · F.eks. dørkode eller hvor chaufføren skal ringe på.
            </p>
            <div className={ui.stack}>
              <div className={ui.field}>
                <textarea
                  defaultValue="Ring venligst på ved ankomst."
                  aria-label="Leveringsnote"
                />
              </div>
            </div>
          </div>
        </div>

        <aside>
          <div className={ui.block}>
            <h2 className={styles.summaryTitle}>Din bestilling</h2>

            <div className={styles.restaurant}>
              <img className={styles.restaurantPhoto} src={restaurant.cover} alt="" />
              <div>
                <strong>{restaurant.name}</strong>
                <span>Levering · 20–30 min</span>
              </div>
            </div>

            {basket.lines.map((line) => (
              <div className={styles.orderLine} key={line.name}>
                <span>
                  {line.quantity} × {line.name}
                </span>
                <span>{line.price} kr.</span>
              </div>
            ))}

            <p className={cx(ui.linkQuiet, styles.editBasket)}>Rediger kurv →</p>

            <div className={styles.discount}>
              <input placeholder="Rabatkode" aria-label="Rabatkode" />
              <button className={styles.apply}>Anvend</button>
            </div>

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

            <button className={cx(ui.btn, ui.btnPrimary, ui.btnBlock, styles.payButton)}>
              Betal {total} kr. og bestil
            </button>
            <p className={styles.terms}>
              Ved at bestille accepterer du handelsbetingelserne.
              <br />
              Betalingen gennemføres sikkert.
            </p>
            <p className={ui.fieldHint}>Inkl. moms · Ingen ekstra gebyrer</p>
          </div>

          <div className={ui.block}>
            <h2 className={cx(ui.display, styles.helpTitle)}>
              En god bestilling.
              <br />
              Hele vejen hjem.
            </h2>
            <p className={styles.helpBody}>Har du spørgsmål til din bestilling?</p>
            <p className={cx(ui.linkAccent, styles.helpLink)}>Kontakt kundeservice →</p>
          </div>
        </aside>
      </section>

      <SiteFooter variant="slim" />
    </>
  );
}
