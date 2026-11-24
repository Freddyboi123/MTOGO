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

export default function AdminRestaurantApplication() {
  const [applications, setApplications] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const counts = useApplicationCounts();

  async function loadApplications() {
    try {
      const res = await getRestaurantApplications();
      setApplications(res.data.data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  async function handleDecide(id, status, adminMessage) {
    setError('');
    setNotice('');
    try {
      const res = await decideRestaurantApplication(id, { status, adminMessage });
      setNotice(
        res.data.data.mailSent
          ? 'Ansøgeren er blevet notificeret på mail.'
          : 'Status er gemt, men mailen til ansøgeren kunne ikke sendes.'
      );
      await loadApplications();
    } catch (err) {
      setError(err.message);
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

      {error && <p className={ui.fieldHint}>{error}</p>}
      {notice && <p className={ui.fieldHint}>{notice}</p>}

      <div className={styles.split}>
        <div>
          <ApplicationList
            applications={applications}
            selectedId={selected?.id}
            statusLabels={statusLabels}
            onSelect={setSelectedId}
          />
        </div>

        {selected && (
          <ApplicationDetail
            key={selected.id}
            application={selected}
            statusLabels={statusLabels}
            onDecide={handleDecide}
          />
        )}
      </div>
    </AdminLayout>
  );
}
