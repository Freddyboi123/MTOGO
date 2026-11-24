import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMyRestaurantApplications,
  logout,
  resubmitRestaurantApplication,
  submitRestaurantApplication
} from '../utils/api';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import cx from '../utils/cx';
import ui from '../styles/shared.module.css';
import styles from './Profile.module.css';
import { customer, profileSections } from '../data/mtogo';

const statusLabels = {
  PENDING: 'Under behandling',
  APPROVED: 'Godkendt',
  REJECTED: 'Afvist',
  MORE_INFORMATION_NEEDED: 'Mangler oplysninger'
};

const emptyForm = {
  restaurantName: '',
  cvr: '',
  street: '',
  postalCode: '',
  city: '',
  email: '',
  phoneNumber: '',
  description: ''
};

export default function Profile() {
  const [section, setSection] = useState(profileSections[0]);
  const [restaurantApplications, setRestaurantApplications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const navigate = useNavigate();

  async function loadApplications() {
    try {
      const res = await getMyRestaurantApplications();
      setRestaurantApplications(res.data.data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleEdit(application) {
    setForm({ ...emptyForm, ...application });
    setEditingId(application.id);
    setShowForm(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setInfo('');
    try {
      const res = editingId
        ? await resubmitRestaurantApplication(editingId, form)
        : await submitRestaurantApplication(form);
      setInfo(res.message);
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      await loadApplications();
    } catch (err) {
      setError(err.message);
    }
  }

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
          {section === 'Personlige oplysninger' && (
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
          )}

          {section === 'Leveringsadresse' && (
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
          )}

          {section === 'Mine ansøgninger' && (
            <>
              <div className={ui.block}>
                <h2>Mine ansøgninger</h2>
                <p className={styles.sectionHint}>
                  Ansøg om at blive restaurantpartner, og følg status her.
                </p>
                <button
                  className={cx(ui.btn, ui.btnDark, ui.btnBlock, styles.save)}
                  onClick={() => {
                    setForm(emptyForm);
                    setEditingId(null);
                    setShowForm(!showForm);
                  }}
                >
                  + Ny restaurantansøgning
                </button>
                {error && <p className={ui.fieldHint}>{error}</p>}
                {info && <p className={ui.fieldHint}>{info}</p>}
              </div>

              {showForm && (
                <form className={ui.block} onSubmit={handleSubmit}>
                  <h2>{editingId ? 'Ret ansøgning' : 'Ny restaurantansøgning'}</h2>
                  <div className={ui.stack}>
                    <div className={ui.field}>
                      <label htmlFor="app-name">Restaurantnavn *</label>
                      <input
                        id="app-name"
                        name="restaurantName"
                        value={form.restaurantName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className={ui.field}>
                      <label htmlFor="app-cvr">CVR-nummer *</label>
                      <input id="app-cvr" name="cvr" value={form.cvr} onChange={handleChange} />
                    </div>
                    <div className={ui.field}>
                      <label htmlFor="app-street">Adresse *</label>
                      <input
                        id="app-street"
                        name="street"
                        value={form.street}
                        onChange={handleChange}
                      />
                    </div>
                    <div className={ui.fieldRow}>
                      <div className={ui.field}>
                        <label htmlFor="app-zip">Postnummer *</label>
                        <input
                          id="app-zip"
                          name="postalCode"
                          value={form.postalCode}
                          onChange={handleChange}
                        />
                      </div>
                      <div className={ui.field}>
                        <label htmlFor="app-city">By *</label>
                        <input
                          id="app-city"
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className={ui.fieldRow}>
                      <div className={ui.field}>
                        <label htmlFor="app-email">E-mail *</label>
                        <input
                          id="app-email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                        />
                      </div>
                      <div className={ui.field}>
                        <label htmlFor="app-phone">Telefonnummer *</label>
                        <input
                          id="app-phone"
                          name="phoneNumber"
                          value={form.phoneNumber}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className={ui.field}>
                      <label htmlFor="app-description">Beskrivelse af konceptet</label>
                      <textarea
                        id="app-description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className={cx(ui.btn, ui.btnPrimary, ui.btnBlock, styles.save)}
                  >
                    Indsend ansøgning
                  </button>
                </form>
              )}

              {restaurantApplications.map((application) => (
                <article className={styles.statusCard} key={application.id}>
                  <div className={ui.sectionLabel}>Restaurantpartner</div>
                  <h3>{application.restaurantName}</h3>
                  <div>
                    <span className={cx(ui.tagWarn, styles.statusTag)}>
                      {statusLabels[application.status]}
                    </span>
                  </div>
                  <p className={styles.statusMeta}>
                    Indsendt {new Date(application.createdAt).toLocaleDateString('da-DK')}
                  </p>
                  {application.adminMessage && (
                    <p className={styles.statusBody}>{application.adminMessage}</p>
                  )}
                  {application.status === 'MORE_INFORMATION_NEEDED' && (
                    <button
                      className={cx(
                        ui.btn,
                        ui.btnOutline,
                        ui.btnSmall,
                        ui.btnBlock,
                        styles.statusAction
                      )}
                      onClick={() => handleEdit(application)}
                    >
                      Ret og send igen →
                    </button>
                  )}
                </article>
              ))}
            </>
          )}

          {section === 'Ordrehistorik' && (
            <div className={ui.block}>
              <h2>Ordrehistorik</h2>
              <p className={styles.sectionHint}>Her kan du se dine tidligere ordrer.</p>
            </div>
          )}

          {section === 'Sikkerhed' && (
            <div className={ui.block}>
              <h2>Adgangskode og sikkerhed</h2>
              <p className={styles.sectionHint}>
                Vælg en stærk adgangskode for at beskytte din konto.
              </p>
              <button className={cx(ui.btn, ui.btnOutline, ui.btnSmall, styles.statusAction)}>
                Skift adgangskode
              </button>
            </div>
          )}
        </div>
      </section>

      <SiteFooter variant="slim" />
    </>
  );
}
