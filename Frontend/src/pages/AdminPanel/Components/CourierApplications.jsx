import { useEffect, useState } from 'react';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../AdminPanel.module.css';
import { getAdminCourierApplications } from '../../../utils/api';
import StatusTag from './StatusTag';

export default function CourierApplications() {
  const [applications, setApplications] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminCourierApplications()
      .then((res) => setApplications(res.data))
      .catch((err) => setError(err.message));
  }, []);

  const selected = applications.find((application) => application.id === selectedId) ?? applications[0];
  const fullName = (application) => `${application.firstname} ${application.lastname}`;

  return (
    <>
      {error && <p className={styles.errorText}>{error}</p>}

      <div className={styles.split}>
        <div className={styles.listPanel}>
          <h2 className={styles.listTitle}>Chaufføransøgninger</h2>
          <div className={styles.listHead}>
            <span>Navn / ansøger</span>
            <span>Modtaget</span>
            <span>Status</span>
          </div>
          {applications.map((application) => (
            <div
              key={application.id}
              className={application.id === selected?.id ? styles.listRowActive : styles.listRow}
              onClick={() => setSelectedId(application.id)}
            >
              <div>
                <strong>{fullName(application)}</strong>
                <span>{[application.vehicle, application.area].filter(Boolean).join(' · ')}</span>
              </div>
              <span>{new Date(application.createdAt).toLocaleDateString('da-DK')}</span>
              <StatusTag status={application.status} />
            </div>
          ))}
          <p className={cx(ui.fieldHint, styles.listFoot)}>
            {applications.length === 0
              ? 'Der er ingen chaufføransøgninger endnu'
              : `Viser ${applications.length} ansøgninger  ·  Nyeste først`}
          </p>
        </div>

        {selected && (
          <div className={ui.block}>
            <h2 className={styles.caseTitle}>{fullName(selected)}</h2>
            <p className={styles.caseId}>Chauffør · {selected.id}</p>
            <div>
              <StatusTag status={selected.status} />
            </div>

            <div className={styles.caseSection}>
              <div className={ui.sectionLabel}>ANSØGER</div>
              <p className={styles.caseValue}>
                {fullName(selected)} · {selected.email}
              </p>
              {selected.phoneNumber && <p className={styles.caseNote}>{selected.phoneNumber}</p>}
            </div>

            <div className={styles.caseSection}>
              <div className={ui.sectionLabel}>LEVERINGSOPLYSNINGER</div>
              <p className={styles.caseValue}>{selected.vehicle || 'Intet køretøj angivet'}</p>
              <p className={styles.caseNote}>{selected.area || 'Intet område angivet'}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
