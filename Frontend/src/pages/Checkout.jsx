import { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import cx from '../utils/cx';
import ui from '../styles/shared.module.css';
import styles from './Checkout.module.css';
import { isLoggedIn, placeOrder } from '../utils/api';
import useBasket from '../basket/useBasket';

const checkoutTexts = {
  back: '← Tilbage til menuen',
  title: 'Lige om lidt er der mad.',
  crumbs: 'Kurv   →   Levering   →   Betaling',
  crumbsNote: 'Sikker betaling · Alle priser er inkl. moms',
  deliveryTitle: '01  Levering',
  street: 'Adresse',
  postalCode: 'Postnummer',
  city: 'By',
  paymentTitle: '02  Betaling',
  paymentNote: 'Betalingen er simuleret i denne version.',
  summaryTitle: 'Din bestilling',
  total: 'I alt',
  pay: 'Betal og bestil',
  sending: 'Bestiller…',
  terms: 'Ved at bestille accepterer du handelsbetingelserne.',
  hint: 'Inkl. levering og moms · Ingen ekstra gebyrer',
  emptyTitle: 'Din kurv er tom.',
  emptyLink: 'Find en restaurant →',
  loginRequired: 'Du skal være logget ind for at bestille.',
  login: 'Log ind',
  signUp: 'Opret konto',
  addressRequired: 'Udfyld adresse, postnummer og by.',
  paymentFailed: 'Betalingen blev afvist. Der er ikke oprettet nogen ordre.',
  failed: 'Ordren kunne ikke oprettes. Prøv igen om lidt.',
  confirmedTitle: 'Tak for din bestilling.',
  orderNumber: 'Ordrenummer',
  confirmedTotal: 'Betalt',
  confirmedNote: 'Restauranten har modtaget din ordre.',
  more: 'Bestil mere →'
};

const paymentMethods = [
  { id: 'kort', title: 'Betalingskort', note: 'Visa / Mastercard' },
  { id: 'mobilepay', title: 'MobilePay', note: null }
];

function formatPrice(price) {
  return `${Number(price).toLocaleString('da-DK', { maximumFractionDigits: 2 })} kr.`;
}

function errorMessage(error) {
  if (error.status === 402) return checkoutTexts.paymentFailed;
  if (error.status === 401 || error.status === 403) return checkoutTexts.loginRequired;
  if (error.status === 400 && error.message) return error.message;
  return checkoutTexts.failed;
}

export default function Checkout() {
  const { basket, total, clear } = useBasket();
  const [method, setMethod] = useState(paymentMethods[0].id);
  const [address, setAddress] = useState({ street: '', postalCode: '', city: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const loggedIn = isLoggedIn();

  function updateAddress(field, value) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  function submit() {
    if (!address.street.trim() || !address.postalCode.trim() || !address.city.trim()) {
      setError(checkoutTexts.addressRequired);
      return;
    }

    setStatus('sending');
    setError(null);

    placeOrder({
      restaurantId: basket.restaurantId,
      street: address.street.trim(),
      postalCode: address.postalCode.trim(),
      city: address.city.trim(),
      lines: basket.lines.map((line) => ({ menuItemId: line.menuItemId, quantity: line.quantity }))
    })
      .then((response) => {
        setConfirmation({ id: response.data.id, total: response.data.total });
        clear();
      })
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setStatus('idle'));
  }

  if (confirmation) {
    return (
      <>
        <SiteHeader />
        <section className={cx(ui.page, styles.head)}>
          <h1 className={styles.title}>{checkoutTexts.confirmedTitle}</h1>
          <div className={cx(ui.block, styles.confirmation)}>
            <p>
              <span className={ui.eyebrowMuted}>{checkoutTexts.orderNumber}</span>
              <strong className={styles.orderNumber}>{confirmation.id}</strong>
            </p>
            <p>
              <span className={ui.eyebrowMuted}>{checkoutTexts.confirmedTotal}</span>
              <strong>{formatPrice(confirmation.total)}</strong>
            </p>
            <p>{checkoutTexts.confirmedNote}</p>
            <Link to="/restauranter" className={ui.linkAccent}>
              {checkoutTexts.more}
            </Link>
          </div>
        </section>
        <SiteFooter variant="slim" />
      </>
    );
  }

  if (basket.lines.length === 0) {
    return (
      <>
        <SiteHeader />
        <section className={cx(ui.page, styles.head)}>
          <h1 className={styles.title}>{checkoutTexts.emptyTitle}</h1>
          <Link to="/restauranter" className={ui.linkAccent}>
            {checkoutTexts.emptyLink}
          </Link>
        </section>
        <SiteFooter variant="slim" />
      </>
    );
  }

  return (
    <>
      <SiteHeader />

      <section className={cx(ui.page, styles.head)}>
        <Link to={`/restaurant/${basket.restaurantId}`} className={ui.linkQuiet}>
          {checkoutTexts.back}
        </Link>
        <h1 className={styles.title}>{checkoutTexts.title}</h1>
        <div className={styles.crumbs}>
          <span>{checkoutTexts.crumbs}</span>
          <span className={styles.crumbsNote}>{checkoutTexts.crumbsNote}</span>
        </div>
      </section>

      <section className={cx(ui.page, styles.layout)}>
        <div>
          {!loggedIn && (
            <div className={cx(ui.block, styles.message)}>
              <p>{checkoutTexts.loginRequired}</p>
              <div className={styles.messageActions}>
                <Link to="/login" className={cx(ui.btn, ui.btnPrimary)}>
                  {checkoutTexts.login}
                </Link>
                <Link to="/opret-konto" className={cx(ui.btn, ui.btnOutline)}>
                  {checkoutTexts.signUp}
                </Link>
              </div>
            </div>
          )}

          <div className={ui.block}>
            <h2>{checkoutTexts.deliveryTitle}</h2>
            <div className={ui.stack}>
              <div className={ui.field}>
                <label htmlFor="checkout-street">{checkoutTexts.street}</label>
                <input
                  id="checkout-street"
                  value={address.street}
                  onChange={(e) => updateAddress('street', e.target.value)}
                />
              </div>
              <div className={ui.fieldRow}>
                <div className={ui.field}>
                  <label htmlFor="checkout-postal">{checkoutTexts.postalCode}</label>
                  <input
                    id="checkout-postal"
                    value={address.postalCode}
                    onChange={(e) => updateAddress('postalCode', e.target.value)}
                  />
                </div>
                <div className={ui.field}>
                  <label htmlFor="checkout-city">{checkoutTexts.city}</label>
                  <input
                    id="checkout-city"
                    value={address.city}
                    onChange={(e) => updateAddress('city', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={ui.block}>
            <h2>{checkoutTexts.paymentTitle}</h2>
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
            <p className={ui.fieldHint}>{checkoutTexts.paymentNote}</p>
          </div>
        </div>

        <aside>
          <div className={ui.block}>
            <h2 className={styles.summaryTitle}>{checkoutTexts.summaryTitle}</h2>

            <div className={styles.restaurant}>
              <img className={styles.restaurantPhoto} alt="" />
              <div>
                <strong>{basket.restaurantName}</strong>
              </div>
            </div>

            {basket.lines.map((line) => (
              <div className={styles.orderLine} key={line.menuItemId}>
                <span>
                  {line.quantity} × {line.name}
                </span>
                <span>{formatPrice(line.price * line.quantity)}</span>
              </div>
            ))}

            <hr className={ui.divider} />
            <div className={ui.sumTotal}>
              <span>{checkoutTexts.total}</span>
              <span>{formatPrice(total)}</span>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button
              className={cx(ui.btn, ui.btnPrimary, ui.btnBlock, styles.payButton)}
              onClick={submit}
              disabled={!loggedIn || status === 'sending'}
            >
              {status === 'sending' ? checkoutTexts.sending : `${checkoutTexts.pay} · ${formatPrice(total)}`}
            </button>
            <p className={styles.terms}>{checkoutTexts.terms}</p>
            <p className={ui.fieldHint}>{checkoutTexts.hint}</p>
          </div>
        </aside>
      </section>

      <SiteFooter variant="slim" />
    </>
  );
}
