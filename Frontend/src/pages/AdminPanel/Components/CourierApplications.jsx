import { useEffect, useState } from 'react';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../AdminPanel.module.css';
import { decideDriverApplication, getDriverApplications } from '../../../utils/api';
import { regionLabels, vehicleLabels } from '../../DriverApplication/DriverApplication';
import StatusTag from './StatusTag';
import CourierApplicationDetail from './CourierApplicationDetail';
import DecisionFeedback from './DecisionFeedback';

const decisionTexts = {
  APPROVED: 'er godkendt og oprettet som chauffør',
  REJECTED: 'er afvist',
  MORE_INFORMATION_NEEDED: 'er sendt tilbage til ansøgeren for flere oplysninger'
};

export default function CourierApplications({ onDecided }) {
  const [applications, setApplications] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getDriverApplications()
      .then((res) => setApplications(res.data?.data ?? []))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!feedback) return undefined;
    const timer = setTimeout(() => setFeedback(null), 6000);
    return () => clearTimeout(timer);
  }, [feedback]);

  async function handleDecide(id, status, adminMessage) {
    setError('');
    setFeedback(null);
    setSubmitting(true);

    const previous = applications;
    setSelectedId(id);
    setApplications((current) =>
      current.map((application) =>
        application.id === id ? { ...application, status, adminMessage } : application
      )
    );

    try {
      const res = await decideDriverApplication(id, { status, adminMessage });
      const decided = res.data;

      setApplications((current) =>
        current.map((application) =>
          application.id === id ? { ...application, ...decided } : application
        )
      );

      setFeedback({
        id: Date.now(),
        status,
        title: `${decided.firstname} ${decided.lastname} ${decisionTexts[status]}`,
        mail: decided.mailSent
          ? 'Ansøgeren er blevet notificeret på mail.'
          : 'Status er gemt, men mailen til ansøgeren kunne ikke sendes.'
      });

      onDecided();
    } catch (err) {
      setApplications(previous);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const selected = applications.find((application) => application.id === selectedId) ?? applications[0];
  const fullName = (application) => `${application.firstname} ${application.lastname}`;

  return (
    <>
      {error && <p className={styles.errorText}>{error}</p>}
      {feedback && (
        <DecisionFeedback key={feedback.id} feedback={feedback} onClose={() => setFeedback(null)} />
      )}

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
                <span>
                  {[vehicleLabels[application.vehicle], regionLabels[application.region]]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
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
          <CourierApplicationDetail
            key={selected.id}
            application={selected}
            submitting={submitting}
            onDecide={handleDecide}
          />
        )}
      </div>
    </>
  );
}
