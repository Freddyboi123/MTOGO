import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { getRestaurantApplications } from '../utils/api';
import cx from '../utils/cx';
import ui from '../styles/shared.module.css';
import dash from '../components/DashboardLayout.module.css';
import styles from './Admin.module.css';
import { courierApplications } from '../data/mtogo';

const statusLabels = {
  PENDING: 'Ny',
  APPROVED: 'Godkendt',
  REJECTED: 'Afvist',
  MORE_INFORMATION_NEEDED: 'Mangler oplysninger'
};

export default function AdminRestaurantApplication() {
  const [applications, setApplications] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadApplications() {
      try {
        const res = await getRestaurantApplications();
        setApplications(res.data.data);
      } catch (err) {
        setError(err.message);
      }
    }
    loadApplications();
  }, []);

  const selected = applications.find((application) => application.id === selectedId) ?? applications[0];
  const pending = applications.length + courierApplications.length;

  return (
    <AdminLayout breadcrumb="Administration  /  Ansøgninger">
      <div className={dash.head}>
        <div>
          <p className={ui.eyebrow}>Partneradministration</p>
          <h1 className={dash.title}>Ansøgninger</h1>
          <p className={dash.subtitle}>
            Gennemgå oplysninger og dokumenter, før du giver adgang til MTOGO.
          </p>
        </div>
      </div>

      <div className={styles.tabs}>
        <button className={styles.tabActive}>Restauranter · {applications.length}</button>
        <Link to="/admin/ansoegninger/chauffoer" className={styles.tab}>
          Chauffører · {courierApplications.length}
        </Link>
        <span className={styles.tabsRight}>{pending} ansøgninger afventer handling</span>
      </div>

      {error && <p className={ui.fieldHint}>{error}</p>}

      <div className={styles.split}>
        <div>
          <div className={styles.listPanel}>
            <h2 className={styles.listTitle}>Restaurantansøgninger</h2>
            <div className={styles.listHead}>
              <span>Navn / ansøger</span>
              <span>Modtaget</span>
              <span>Status</span>
            </div>
            {applications.map((application) => (
              <div
                key={application.id}
                className={application.id === selected.id ? styles.listRowActive : styles.listRow}
                onClick={() => setSelectedId(application.id)}
              >
                <div>
                  <strong>{application.restaurantName}</strong>
                  <span>{application.applicantName}</span>
                </div>
                <span>{new Date(application.createdAt).toLocaleDateString('da-DK')}</span>
                <span>
                  <span className={application.status === 'PENDING' ? ui.tag : ui.tagWarn}>
                    {statusLabels[application.status]}
                  </span>
                </span>
              </div>
            ))}
            <p className={cx(ui.fieldHint, styles.listFoot)}>
              Viser {applications.length} ansøgninger  ·  Nyeste først
            </p>
          </div>
        </div>

        {selected && (
          <div className={ui.block}>
            <h2 className={styles.caseTitle}>{selected.restaurantName}</h2>
            <p className={styles.caseId}>Restaurant · {selected.id}</p>
            <div>
              <span className={cx(ui.tagWarn, styles.caseTag)}>
                {statusLabels[selected.status]}
              </span>
            </div>

            <div className={styles.caseSection}>
              <div className={ui.sectionLabel}>ANSØGER</div>
              <p className={styles.caseValue}>
                {selected.applicantName} · {selected.email}
              </p>
              <p className={styles.caseNote}>{selected.phoneNumber}</p>
            </div>

            <div className={styles.caseSection}>
              <div className={ui.sectionLabel}>RESTAURANTOPLYSNINGER</div>
              <p className={selected.addressInUse ? styles.addressWarning : styles.caseValue}>
                {selected.street}, {selected.postalCode} {selected.city}
              </p>
              {selected.addressInUse && (
                <p className={styles.addressWarning}>
                  Der findes allerede en restaurant på denne adresse. Undersøg det nærmere.
                </p>
              )}
              <p className={styles.caseNote}>CVR {selected.cvr}</p>
              {selected.description && <p className={styles.caseNote}>{selected.description}</p>}
            </div>

            <div className={cx(ui.field, styles.caseSection)}>
              <label htmlFor="applicant-message">Besked til ansøger</label>
              <textarea
                id="applicant-message"
                placeholder="Skriv en begrundelse ved afvisning, eller bed om yderligere oplysninger…"
              />
            </div>

            <div className={styles.decision}>
              <button className={cx(ui.btn, ui.btnPrimary, ui.btnSmall)}>Godkend restaurant</button>
              <button className={cx(ui.btn, ui.btnOutline, ui.btnSmall)}>Afvis</button>
            </div>
            <button
              className={cx(ui.btn, ui.btnOutline, ui.btnSmall, ui.btnBlock, styles.secondaryAction)}
            >
              Bed om oplysninger
            </button>
            <p className={cx(ui.fieldHint, styles.decisionNote)}>
              Ansøger får besked om din afgørelse på e-mail.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
