import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/api';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import cx from '../utils/cx';
import ui from '../styles/shared.module.css';
import styles from './Profile.module.css';
import { applications, customer, profileSections } from '../data/mtogo';

export default function Profile() {
  const [section, setSection] = useState(profileSections[0]);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <>
      <SiteHeader variant="app" />

      <section className={cx(ui.page, styles.intro)}>
        <p className={ui.eyebrow}>Din MTOGO-konto</p>
        <h1 className={styles.title}>Min profil</h1>
        <p className={cx(ui.lead, styles.lead)}>
          Dine oplysninger, dine adresser og dine næste muligheder.
        </p>
      </section>

      <section className={cx(ui.page, styles.layout)}>
        <nav className={styles.nav}>
          <div className={styles.who}>
            <strong>
              {customer.firstName} {customer.lastName}
            </strong>
            <span>{customer.since}</span>
          </div>
          {profileSections.map((name) => (
            <button
              key={name}
              className={name === section ? styles.navButtonActive : styles.navButton}
              onClick={() => setSection(name)}
            >
              {name}
            </button>
          ))}
          <button className={styles.logout} onClick={handleLogout}>
            Log ud
          </button>
        </nav>

        <div>
          <div className={ui.block}>
            <h2>Personlige oplysninger</h2>
            <p className={styles.sectionHint}>Hold dine kontaktoplysninger opdateret.</p>
            <div className={ui.stack}>
              <div className={ui.fieldRow}>
                <div className={ui.field}>
                  <label htmlFor="profile-first">Fornavn</label>
                  <input id="profile-first" defaultValue={customer.firstName} />
                </div>
                <div className={ui.field}>
                  <label htmlFor="profile-last">Efternavn</label>
                  <input id="profile-last" defaultValue={customer.lastName} />
                </div>
              </div>
              <div className={ui.fieldRow}>
                <div className={ui.field}>
                  <label htmlFor="profile-email">E-mail</label>
                  <input id="profile-email" defaultValue={customer.email} />
                </div>
                <div className={ui.field}>
                  <label htmlFor="profile-phone">Telefonnummer</label>
                  <input id="profile-phone" defaultValue={customer.phone} />
                </div>
              </div>
            </div>
            <button className={cx(ui.btn, ui.btnDark, ui.btnBlock, styles.save)}>
              Gem ændringer
            </button>
          </div>

          <div className={ui.block}>
            <h2>Din standardadresse</h2>
            <div className={ui.stack}>
              <div className={ui.field}>
                <label htmlFor="profile-street">Adresse</label>
                <input id="profile-street" defaultValue={customer.street} />
              </div>
              <div className={ui.fieldRowThree}>
                <div className={ui.field}>
                  <label htmlFor="profile-zip">Postnummer</label>
                  <input id="profile-zip" defaultValue={customer.postalCode} />
                </div>
                <div className={ui.field}>
                  <label htmlFor="profile-city">By</label>
                  <input id="profile-city" defaultValue={customer.city} />
                </div>
                <div className={ui.field}>
                  <label htmlFor="profile-floor">Etage / dør</label>
                  <input id="profile-floor" defaultValue={customer.floor} />
                </div>
              </div>
            </div>
            <button className={cx(ui.btn, ui.btnDark, ui.btnBlock, styles.save)}>
              Gem leveringsadresse
            </button>
          </div>

          <div className={ui.block}>
            <h2>Adgangskode og sikkerhed</h2>
            <p className={styles.sectionHint}>
              Vælg en stærk adgangskode for at beskytte din konto.
            </p>
            <button className={cx(ui.btn, ui.btnOutline, ui.btnSmall, styles.statusAction)}>
              Skift adgangskode
            </button>
          </div>
        </div>

        <div>
          <h2 className={styles.applicationsTitle}>Mine ansøgninger</h2>

          {applications.map((application) => (
            <article className={styles.statusCard} key={application.type}>
              <div className={ui.sectionLabel}>{application.type}</div>
              <h3>{application.title}</h3>
              <div>
                <span className={cx(ui.tagWarn, styles.statusTag)}>{application.status}</span>
              </div>
              <p className={styles.statusMeta}>{application.submitted}</p>
              <p className={styles.statusBody}>{application.message}</p>
              <button
                className={cx(ui.btn, ui.btnOutline, ui.btnSmall, ui.btnBlock, styles.statusAction)}
              >
                {application.action}
              </button>
            </article>
          ))}

          <article className={styles.statusCard}>
            <h3 className={styles.helpTitle}>Har du spørgsmål?</h3>
            <p className={styles.statusBody}>
              Vi hjælper dig gerne videre med din konto eller din ansøgning.
            </p>
            <p className={cx(ui.linkAccent, styles.helpLink)}>Kontakt partnersupport →</p>
          </article>
        </div>
      </section>

      <SiteFooter variant="slim" />
    </>
  );
}
