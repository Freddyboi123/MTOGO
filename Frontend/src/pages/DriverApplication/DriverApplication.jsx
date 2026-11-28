import { useEffect, useState } from 'react';
import {
  getMyDriverApplications,
  getProfile,
  resubmitDriverApplication,
  submitDriverApplication
} from '../../utils/api';
import cx from '../../utils/cx';
import ui from '../../styles/shared.module.css';
import styles from './DriverApplication.module.css';
import DriverApplicationForm from './Components/DriverApplicationForm';
import DriverApplicationCard from './Components/DriverApplicationCard';

export const vehicleLabels = {
  BIKE: 'Cykel',
  E_BIKE: 'Elcykel',
  SCOOTER: 'Scooter',
  CAR: 'Bil'
};

export const regionLabels = {
  CAPITAL: 'Region Hovedstaden',
  ZEALAND: 'Region Sjælland',
  SOUTHERN_DENMARK: 'Region Syddanmark',
  CENTRAL_JUTLAND: 'Region Midtjylland',
  NORTH_JUTLAND: 'Region Nordjylland'
};

export const timeOfDayLabels = {
  MORNING: 'Morgen',
  MIDDAY: 'Middag',
  EVENING: 'Aften',
  NIGHT: 'Nat'
};

export const statusLabels = {
  PENDING: 'Under behandling',
  APPROVED: 'Godkendt',
  REJECTED: 'Afvist',
  MORE_INFORMATION_NEEDED: 'Mangler oplysninger'
};

const emptyForm = {
  firstname: '',
  lastname: '',
  email: '',
  phoneNumber: '',
  vehicle: '',
  region: '',
  weeklyHours: '',
  timesOfDay: []
};

const emptyProfile = { firstname: '', lastname: '', email: '', phoneNumber: '' };

function contactDetails(user) {
  return {
    firstname: user.name ?? '',
    lastname: user.lastName ?? '',
    email: user.email ?? '',
    phoneNumber: user.phoneNumber ?? ''
  };
}

export default function DriverApplication() {
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(emptyProfile);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function loadApplications() {
    try {
      const res = await getMyDriverApplications();
      setApplications(res.data.data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadProfile() {
    try {
      const res = await getProfile();
      setProfile(contactDetails(res.data));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadApplications();
    loadProfile();
  }, []);

  function blankForm() {
    return { ...emptyForm, ...profile };
  }

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleToggleTime(value) {
    const selected = form.timesOfDay.includes(value)
      ? form.timesOfDay.filter((time) => time !== value)
      : [...form.timesOfDay, value];
    setForm({ ...form, timesOfDay: selected });
  }

  function handleNew() {
    setForm(blankForm());
    setEditingId(null);
    setShowForm(!showForm);
  }

  function handleEdit(application) {
    setForm({
      ...blankForm(),
      ...application,
      weeklyHours: application.weeklyHours ?? '',
      timesOfDay: application.timesOfDay ?? []
    });
    setEditingId(application.id);
    setShowForm(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setInfo('');
    try {
      const body = {
        ...form,
        vehicle: form.vehicle || null,
        region: form.region || null,
        weeklyHours: form.weeklyHours === '' ? null : Number(form.weeklyHours)
      };
      const res = editingId
        ? await resubmitDriverApplication(editingId, body)
        : await submitDriverApplication(body);
      setInfo(res.message);
      setForm(blankForm());
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
        <p className={styles.hint}>Ansøg om at blive chaufførpartner, og følg status her.</p>
        <button className={cx(ui.btn, ui.btnDark, ui.btnBlock, styles.save)} onClick={handleNew}>
          + Ny chaufførsansøgning
        </button>
        {error && <p className={ui.fieldHint}>{error}</p>}
        {info && <p className={ui.fieldHint}>{info}</p>}
      </div>

      {showForm && (
        <DriverApplicationForm
          key={editingId ?? 'new'}
          form={form}
          profile={profile}
          editing={Boolean(editingId)}
          vehicleLabels={vehicleLabels}
          regionLabels={regionLabels}
          timeOfDayLabels={timeOfDayLabels}
          onChange={handleChange}
          onToggleTime={handleToggleTime}
          onSubmit={handleSubmit}
        />
      )}

      {applications.map((application) => (
        <DriverApplicationCard
          key={application.id}
          application={application}
          labels={{
            vehicle: vehicleLabels,
            region: regionLabels,
            timeOfDay: timeOfDayLabels,
            status: statusLabels
          }}
          onEdit={handleEdit}
        />
      ))}
    </>
  );
}
