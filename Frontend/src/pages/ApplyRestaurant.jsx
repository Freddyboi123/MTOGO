import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import cx from '../utils/cx';
import ui from '../styles/shared.module.css';
import styles from './Apply.module.css';
import { applyRestaurantSteps, cuisines } from '../data/mtogo';

const cuisineOptions = cuisines.slice(1);

export default function ApplyRestaurant() {
  return (
    <>
      <SiteHeader />

      <section className={cx(ui.page, styles.intro)}>
        <p className={ui.eyebrow}>Bliv restaurantpartner</p>
        <h1 className={styles.title}>Del din gode smag med byen.</h1>
        <p className={cx(ui.lead, styles.lead)}>
          Ansøg om at få din restaurant på MTOGO. Vi hjælper dig godt i gang.
        </p>
      </section>

      <section className={cx(ui.page, styles.layout)}>
        <aside className={styles.aside}>
          <h2 className={styles.asideTitle}>
            Dit køkken.
            <br />
            Flere gæster.
          </h2>
          <p className={styles.asideLead}>
            Fokusér på maden.
            <br />
            Vi gør det lettere at nå ud.
          </p>
          <div className={styles.steps}>
            {applyRestaurantSteps.map((step) => (
              <div key={step.number}>
                <div className={styles.stepNumber}>{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </aside>

        <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
          <p className={styles.required}>Felter markeret med * skal udfyldes.</p>

          <h2>01  Restauranten</h2>
          <div className={ui.stack}>
            <div className={ui.field}>
              <label htmlFor="restaurant-name">Restaurantnavn *</label>
              <input id="restaurant-name" placeholder="Nabo Trattoria" />
            </div>
            <div className={ui.fieldRow}>
              <div className={ui.field}>
                <label htmlFor="cvr">CVR-nummer *</label>
                <input id="cvr" placeholder="12345678" />
              </div>
              <div className={ui.field}>
                <label htmlFor="cuisine">Køkkentype *</label>
                <select id="cuisine" defaultValue={cuisineOptions[5]}>
                  {cuisineOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className={ui.fieldRow}>
              <div className={ui.field}>
                <label htmlFor="restaurant-address">Restaurantadresse *</label>
                <input id="restaurant-address" placeholder="Nørrebrogade 88" />
              </div>
              <div className={ui.field}>
                <label htmlFor="restaurant-city">Postnummer og by *</label>
                <input id="restaurant-city" placeholder="2200 København N" />
              </div>
            </div>
          </div>

          <h2>02  Kontaktperson</h2>
          <div className={ui.stack}>
            <div className={ui.fieldRow}>
              <div className={ui.field}>
                <label htmlFor="contact-first">Fornavn *</label>
                <input id="contact-first" placeholder="Sofie" />
              </div>
              <div className={ui.field}>
                <label htmlFor="contact-last">Efternavn *</label>
                <input id="contact-last" placeholder="Andersen" />
              </div>
            </div>
            <div className={ui.fieldRow}>
              <div className={ui.field}>
                <label htmlFor="contact-email">E-mail *</label>
                <input id="contact-email" type="email" placeholder="sofie.a@email.dk" />
              </div>
              <div className={ui.field}>
                <label htmlFor="contact-phone">Telefonnummer *</label>
                <input id="contact-phone" placeholder="+45 28 34 56 78" />
              </div>
            </div>
          </div>

          <h2>03  Registrering og dokumenter</h2>
          <div className={styles.uploadRow}>
            <div className={styles.upload}>
              <strong>CVR-registrering *</strong>
              <span>PDF, JPG eller PNG · maks. 10 MB</span>
              <span className={styles.uploadFile}>CVR-registrering.pdf  ·  Skift fil</span>
            </div>
            <div className={styles.upload}>
              <strong>Fødevaregistrering *</strong>
              <span>PDF, JPG eller PNG · maks. 10 MB</span>
              <span className={styles.uploadFile}>Fødevaregistrering.pdf  ·  Skift fil</span>
            </div>
          </div>

          <label className={cx(ui.checkbox, styles.consent)}>
            <input type="checkbox" />
            Jeg bekræfter oplysningerne og accepterer partnervilkårene og privatlivspolitikken.
          </label>

          <button
            type="submit"
            className={cx(ui.btn, ui.btnPrimary, ui.btnBlock, styles.submit)}
          >
            Send restaurantansøgning
          </button>
          <p className={cx(ui.fieldHint, styles.footnote)}>
            Du kan følge status på Min profil. Vi kontakter dig, hvis der mangler oplysninger.
          </p>
        </form>
      </section>

      <SiteFooter variant="slim" />
    </>
  );
}
