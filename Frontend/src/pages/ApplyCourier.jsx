import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import cx from '../utils/cx';
import ui from '../styles/shared.module.css';
import styles from './Apply.module.css';
import { applyCourierSteps } from '../data/mtogo';

const vehicles = ['Cykel', 'Elcykel', 'Scooter', 'Bil'];
const areas = [
  'København N',
  'København K',
  'København V',
  'København Ø',
  'København S',
  'Frederiksberg'
];

export default function ApplyCourier() {
  return (
    <>
      <SiteHeader variant="app" />

      <section className={cx(ui.page, styles.intro)}>
        <p className={ui.eyebrow}>Bliv chaufførpartner</p>
        <h1 className={styles.title}>Gode måltider. På din vej.</h1>
        <p className={cx(ui.lead, styles.lead)}>
          Ansøg som chauffør, og lever mad fra lokale køkkener til sultne naboer.
        </p>
      </section>

      <section className={cx(ui.page, styles.layout)}>
        <aside className={styles.aside}>
          <h2 className={styles.asideTitle}>
            Din by.
            <br />
            Dit næste stop.
          </h2>
          <p className={styles.asideLead}>
            Tag leverancer, når det passer dig.
            <br />
            Se rute og betaling på forhånd.
          </p>
          <div className={styles.steps}>
            {applyCourierSteps.map((step) => (
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

          <h2>01  Dine oplysninger</h2>
          <div className={ui.stack}>
            <div className={ui.fieldRow}>
              <div className={ui.field}>
                <label htmlFor="courier-first">Fornavn *</label>
                <input id="courier-first" placeholder="Sofie" />
              </div>
              <div className={ui.field}>
                <label htmlFor="courier-last">Efternavn *</label>
                <input id="courier-last" placeholder="Andersen" />
              </div>
            </div>
            <div className={ui.fieldRow}>
              <div className={ui.field}>
                <label htmlFor="courier-email">E-mail *</label>
                <input id="courier-email" type="email" placeholder="sofie.a@email.dk" />
              </div>
              <div className={ui.field}>
                <label htmlFor="courier-phone">Telefonnummer *</label>
                <input id="courier-phone" placeholder="+45 28 34 56 78" />
              </div>
            </div>
          </div>

          <h2>02  På vejen</h2>
          <div className={ui.stack}>
            <div className={ui.fieldRow}>
              <div className={ui.field}>
                <label htmlFor="vehicle">Køretøj *</label>
                <select id="vehicle" defaultValue={vehicles[0]}>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle}>{vehicle}</option>
                  ))}
                </select>
              </div>
              <div className={ui.field}>
                <label htmlFor="area">Leveringsområde *</label>
                <select id="area" defaultValue={areas[0]}>
                  {areas.map((area) => (
                    <option key={area}>{area}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className={ui.fieldHint}>
              Kørekort og relevant dokumentation kræves ved motoriseret køretøj.
            </p>
          </div>

          <h2>03  Dokumentation</h2>
          <div className={styles.uploadRow}>
            <div className={styles.upload}>
              <strong>Gyldig billedlegitimation *</strong>
              <span>PDF, JPG eller PNG · maks. 10 MB</span>
              <span className={styles.uploadFile}>Vælg fil →</span>
            </div>
            <div className={styles.upload}>
              <strong>Dokumentation for arbejdsret *</strong>
              <span>PDF, JPG eller PNG · maks. 10 MB</span>
              <span className={styles.uploadFile}>Arbejdstilladelse.pdf  ·  Skift fil</span>
            </div>
          </div>

          <label className={cx(ui.checkbox, styles.consent)}>
            <input type="checkbox" />
            Jeg er fyldt 18 år og har ret til at arbejde i Danmark.
          </label>
          <label className={cx(ui.checkbox, styles.consent)}>
            <input type="checkbox" />
            Jeg accepterer partnervilkårene og har læst privatlivspolitikken.
          </label>

          <button
            type="submit"
            className={cx(ui.btn, ui.btnPrimary, ui.btnBlock, styles.submit)}
          >
            Send chaufføransøgning
          </button>
          <p className={cx(ui.fieldHint, styles.footnote)}>
            Upload begge dokumenter før indsendelse. Du følger din ansøgning på Min profil.
          </p>
        </form>
      </section>

      <SiteFooter variant="slim" />
    </>
  );
}
