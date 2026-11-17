import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import cx from '../utils/cx';
import ui from '../styles/shared.module.css';
import dash from '../components/DashboardLayout.module.css';
import styles from './Admin.module.css';
import {
  courierApplications,
  restaurantApplicationDetail,
  restaurantApplications
} from '../data/mtogo';

export default function AdminRestaurantApplication() {
  const [selected, setSelected] = useState(restaurantApplications[0]);
  const pending = restaurantApplications.length + courierApplications.length;

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
        <button className={styles.tabActive}>Restauranter · {restaurantApplications.length}</button>
        <Link to="/admin/ansoegninger/chauffoer" className={styles.tab}>
          Chauffører · {courierApplications.length}
        </Link>
        <span className={styles.tabsRight}>{pending} ansøgninger afventer handling</span>
      </div>

      <div className={styles.split}>
        <div>
          <div className={styles.listPanel}>
            <h2 className={styles.listTitle}>Restaurantansøgninger</h2>
            <div className={styles.listHead}>
              <span>Navn / ansøger</span>
              <span>Modtaget</span>
              <span>Status</span>
            </div>
            {restaurantApplications.map((application) => (
              <div
                key={application.id}
                className={application.id === selected.id ? styles.listRowActive : styles.listRow}
                onClick={() => setSelected(application)}
              >
                <div>
                  <strong>{application.name}</strong>
                  <span>{application.applicant}</span>
                </div>
                <span>{application.received}</span>
                <span>
                  <span className={application.status === 'Ny' ? ui.tag : ui.tagWarn}>
                    {application.status}
                  </span>
                </span>
              </div>
            ))}
            <p className={cx(ui.fieldHint, styles.listFoot)}>
              Viser {restaurantApplications.length} ansøgninger  ·  Nyeste først
            </p>
          </div>

          <div className={ui.block}>
            <h2>Seneste aktivitet</h2>
            <div className={styles.timeline}>
              {restaurantApplicationDetail.activity.map((entry) => (
                <div key={entry.when}>
                  <div className={styles.timelineWhen}>{entry.when}</div>
                  <p>{entry.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={ui.block}>
          <h2 className={styles.caseTitle}>{selected.name}</h2>
          <p className={styles.caseId}>Restaurant · {selected.id}</p>
          <div>
            <span className={cx(ui.tagWarn, styles.caseTag)}>{selected.status}</span>
          </div>

          <div className={styles.caseSection}>
            <div className={ui.sectionLabel}>ANSØGER</div>
            <p className={styles.caseValue}>
              {selected.applicant} · {restaurantApplicationDetail.applicantEmail}
            </p>
            <p className={styles.caseNote}>{restaurantApplicationDetail.applicantPhone}</p>
          </div>

          <div className={styles.caseSection}>
            <div className={ui.sectionLabel}>RESTAURANTOPLYSNINGER</div>
            <p className={styles.caseValue}>{restaurantApplicationDetail.address}</p>
            <p className={styles.caseNote}>{restaurantApplicationDetail.registration}</p>
          </div>

          <div className={styles.caseSection}>
            <div className={ui.sectionLabel}>DOKUMENTER</div>
            {restaurantApplicationDetail.documents.map((document) => (
              <div className={styles.doc} key={document.name}>
                <span>{document.name}</span>
                <span className={styles.docState}>{document.state}</span>
              </div>
            ))}
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
      </div>
    </AdminLayout>
  );
}
