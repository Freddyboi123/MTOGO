import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import cx from '../utils/cx';
import ui from '../styles/shared.module.css';
import dash from '../components/DashboardLayout.module.css';
import styles from './Admin.module.css';
import useApplicationCounts from '../utils/useApplicationCounts';
import { courierApplicationDetail } from '../data/mtogo';

const courierApplications = [];

export default function AdminCourierApplication() {
  const [selected, setSelected] = useState(courierApplications[0]);
  const counts = useApplicationCounts();

  return (
    <AdminLayout breadcrumb="Administration  /  Ansøgninger">
      <div className={dash.head}>
        <div>
          <p className={ui.eyebrow}>Partneradministration</p>
          <h1 className={dash.title}>Ansøgninger</h1>
          <p className={dash.subtitle}>Gennemgå oplysninger og dokumenter, før du giver adgang til MTOGO.</p>
        </div>
      </div>

      <div className={styles.tabs}>
        <Link to="/admin/ansoegninger/restaurant" className={styles.tab}>Restauranter · {counts.restaurants}</Link>
        <button className={styles.tabActive}>Chauffører · {counts.couriers}</button>
        <span className={styles.tabsRight}>{counts.total} ansøgninger afventer handling</span>
      </div>

      <div className={styles.split}>
        <div>
          <div className={styles.listPanel}>
            <h2 className={styles.listTitle}>Chaufføransøgninger</h2>
            <div className={styles.listHead}>
              <span>Navn / ansøger</span>
              <span>Modtaget</span>
              <span>Status</span>
            </div>
            {courierApplications.map((application) => (
              <div
                key={application.id}
                className={application.id === selected.id ? styles.listRowActive : styles.listRow}
                onClick={() => setSelected(application)}
              >
                <div>
                  <strong>{application.name}</strong>
                  <span>{application.detail}</span>
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
              Viser {courierApplications.length} ansøgninger  ·  Nyeste først
            </p>
          </div>

          {selected && (
            <div className={ui.block}>
              <h2>Seneste aktivitet</h2>
              <div className={styles.timeline}>
                {courierApplicationDetail.activity.map((entry) => (
                  <div key={entry.when}>
                    <div className={styles.timelineWhen}>{entry.when}</div>
                    <p>{entry.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {selected && (
          <div className={ui.block}>
            <h2 className={styles.caseTitle}>{selected.name}</h2>
            <p className={styles.caseId}>Chauffør · {selected.id}</p>
            <div>
              <span className={cx(ui.tagWarn, styles.caseTag)}>{selected.status}</span>
            </div>

            <div className={styles.caseSection}>
              <div className={ui.sectionLabel}>ANSØGER</div>
              <p className={styles.caseValue}>
                {selected.name} · {courierApplicationDetail.applicantEmail}
              </p>
              <p className={styles.caseNote}>{courierApplicationDetail.applicantPhone}</p>
            </div>

            <div className={styles.caseSection}>
              <div className={ui.sectionLabel}>LEVERINGSOPLYSNINGER</div>
              <p className={styles.caseValue}>{selected.detail}</p>
              <p className={styles.caseNote}>{courierApplicationDetail.requirements}</p>
            </div>

            <div className={styles.caseSection}>
              <div className={ui.sectionLabel}>DOKUMENTER</div>
              {courierApplicationDetail.documents.map((document) => (
                <div className={styles.doc} key={document.name}>
                  <span>{document.name}</span>
                  <span className={styles.docState}>{document.state}</span>
                </div>
              ))}
            </div>

            <div className={cx(ui.field, styles.caseSection)}>
              <label htmlFor="courier-message">Efterspørg dokumentation</label>
              <textarea
                id="courier-message"
                defaultValue="Upload venligst gyldig billedlegitimation via din profil, så vi kan behandle ansøgningen."
              />
            </div>

            <div className={styles.decision}>
              <button className={cx(ui.btn, ui.btnPrimary, ui.btnSmall)}>Send påmindelse</button>
              <button className={cx(ui.btn, ui.btnOutline, ui.btnSmall)}>Afvis</button>
            </div>
            <button
              className={cx(ui.btn, ui.btnOutline, ui.btnSmall, ui.btnBlock, styles.secondaryAction)}
              disabled
            >
              Godkend · afventer dokument
            </button>
            <p className={cx(ui.fieldHint, styles.decisionNote)}>
              Godkendelse kræver den manglende legitimation.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
