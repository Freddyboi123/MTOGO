import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import {
  decideRestaurantApplication,
  getRestaurantApplications,
  useApplicationCounts
} from '../../utils/api';
import ui from '../../styles/shared.module.css';
import dash from '../../components/DashboardLayout.module.css';
import styles from './AdminRestaurantApplication.module.css';
import ApplicationList from './Components/ApplicationList';
import ApplicationDetail from './Components/ApplicationDetail';

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

export default function AdminRestaurantApplication() {
  const [applications, setApplications] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const counts = useApplicationCounts();

  async function loadApplications() {
    try {
      const res = await getRestaurantApplications();
      setApplications(res.data.data);
      return res.data.data;
    } catch (err) {
      setError(err.message);
      return [];
    }
  }

  useEffect(() => {
    loadApplications();
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

      counts.reload();
    } catch (err) {
      setApplications(previous);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const selected = applications.find((application) => application.id === selectedId) ?? applications[0];

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
        <button className={styles.tabActive}>Restauranter · {counts.restaurants}</button>
        <Link to="/admin/ansoegninger/chauffoer" className={styles.tab}>
          Chauffører · {counts.couriers}
        </Link>
        <span className={styles.tabsRight}>{counts.total} ansøgninger afventer handling</span>
      </div>

      {error && <p className={styles.errorText}>{error}</p>}
      {feedback && (
        <div
          key={feedback.id}
          role="status"
          className={feedbackClasses[feedback.status]}
        >
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
    </AdminLayout>
  );
}
