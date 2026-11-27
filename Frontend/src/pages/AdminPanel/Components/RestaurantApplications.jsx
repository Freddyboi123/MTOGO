import { useEffect, useState } from 'react';
import { decideRestaurantApplication, getRestaurantApplications } from '../../../utils/api';
import styles from '../AdminPanel.module.css';
import ApplicationList from './ApplicationList';
import ApplicationDetail from './ApplicationDetail';

const statusLabels = {
  PENDING: 'Ny',
  APPROVED: 'Godkendt',
  REJECTED: 'Afvist',
  MORE_INFORMATION_NEEDED: 'Mangler oplysninger'
};

const decisionTexts = {
  APPROVED: 'er godkendt og oprettet som restaurant',
  REJECTED: 'er afvist',
  MORE_INFORMATION_NEEDED: 'er sendt tilbage til ansøgeren for flere oplysninger'
};

const feedbackIcons = {
  APPROVED: '✓',
  REJECTED: '✕',
  MORE_INFORMATION_NEEDED: '?'
};

const feedbackClasses = {
  APPROVED: styles.feedbackApproved,
  REJECTED: styles.feedbackRejected,
  MORE_INFORMATION_NEEDED: styles.feedbackInfo
};

const statusTagClasses = {
  PENDING: styles.statusPending,
  APPROVED: styles.statusApproved,
  REJECTED: styles.statusRejected,
  MORE_INFORMATION_NEEDED: styles.statusInfo
};

export default function RestaurantApplications({ onDecided }) {
  const [applications, setApplications] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getRestaurantApplications()
      .then((res) => setApplications(res.data.data))
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

    // Show the new status straight away, and undo it if the server refuses.
    const previous = applications;
    setSelectedId(id);
    setApplications((current) =>
      current.map((application) =>
        application.id === id ? { ...application, status, adminMessage } : application
      )
    );

    try {
      const res = await decideRestaurantApplication(id, { status, adminMessage });
      const decided = res.data;

      setApplications((current) =>
        current.map((application) =>
          application.id === id ? { ...application, ...decided } : application
        )
      );

      setFeedback({
        id: Date.now(),
        status,
        title: `${decided.restaurantName} ${decisionTexts[status]}`,
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

  return (
    <>
      {error && <p className={styles.errorText}>{error}</p>}
      {feedback && (
        <div key={feedback.id} role="status" className={feedbackClasses[feedback.status]}>
          <span className={styles.feedbackIcon}>{feedbackIcons[feedback.status]}</span>
          <div>
            <strong>{feedback.title}</strong>
            <p>{feedback.mail}</p>
          </div>
          <button
            className={styles.feedbackClose}
            onClick={() => setFeedback(null)}
            aria-label="Luk besked"
          >
            ×
          </button>
        </div>
      )}

      <div className={styles.split}>
        <div>
          <ApplicationList
            applications={applications}
            selectedId={selected?.id}
            statusLabels={statusLabels}
            statusTagClasses={statusTagClasses}
            onSelect={setSelectedId}
          />
        </div>

        {selected && (
          <ApplicationDetail
            key={selected.id}
            application={selected}
            statusLabels={statusLabels}
            statusTagClasses={statusTagClasses}
            submitting={submitting}
            onDecide={handleDecide}
          />
        )}
      </div>
    </>
  );
}
