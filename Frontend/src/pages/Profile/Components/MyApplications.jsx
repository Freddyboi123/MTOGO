import { useEffect, useState } from 'react';
import {
  getMyRestaurantApplications,
  resubmitRestaurantApplication,
  submitRestaurantApplication
} from '../../../utils/api';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../Profile.module.css';
import ApplicationForm from './ApplicationForm';
import ApplicationCard from './ApplicationCard';

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
  description: '',
  cuisine: '',
  latitude: null,
  longitude: null
};

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function loadApplications() {
    try {
      const res = await getMyRestaurantApplications();
      setApplications(res.data.data);
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

  // The address comes from a suggestion, so the coordinates follow with it.
  function handleAddressSelect(suggestion) {
    setForm({
      ...form,
      street: suggestion.street,
      postalCode: suggestion.postalCode,
      city: suggestion.city,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude
    });
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
      // No category chosen is sent as null, so the backend answers that a category is required.
      const body = { ...form, cuisine: form.cuisine || null };
      const res = editingId
        ? await resubmitRestaurantApplication(editingId, body)
        : await submitRestaurantApplication(body);
      setInfo(res.message);
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      await loadApplications();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
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
        <ApplicationForm
          key={editingId ?? 'new'}
          form={form}
          editing={Boolean(editingId)}
          onChange={handleChange}
          onAddressSelect={handleAddressSelect}
          onSubmit={handleSubmit}
        />
      )}

      {applications.map((application) => (
        <ApplicationCard
          key={application.id}
          application={application}
          statusLabels={statusLabels}
          onEdit={handleEdit}
        />
      ))}
    </>
  );
}
