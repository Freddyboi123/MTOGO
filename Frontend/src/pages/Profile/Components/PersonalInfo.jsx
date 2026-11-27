import { useEffect, useState } from 'react';
import { getProfile, saveSession, updateProfile } from '../../../utils/api';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../Profile.module.css';

const emptyPasswords = { currentPassword: '', newPassword: '', repeatPassword: '' };

export default function PersonalInfo({ onSaved }) {
  const [saved, setSaved] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '' });
  const [passwords, setPasswords] = useState(emptyPasswords);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(null);

  useEffect(() => {
    getProfile()
      .then((res) => applyUser(res.data))
      .catch((err) => setFeedback({ type: 'error', text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  function applyUser(user) {
    const values = {
      firstName: user.name ?? '',
      lastName: user.lastName ?? '',
      email: user.email ?? '',
      phoneNumber: user.phoneNumber ?? ''
    };
    setSaved(values);
    setForm(values);
    setPendingEmail(user.pendingEmail ?? null);
  }

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handlePasswordChange(event) {
    setPasswords({ ...passwords, [event.target.name]: event.target.value });
  }

  function changedFields() {
    const body = {};
    if (form.firstName !== saved.firstName) body.first_name = form.firstName;
    if (form.lastName !== saved.lastName) body.last_name = form.lastName;
    if (form.email !== saved.email) body.email = form.email;
    if (form.phoneNumber !== saved.phoneNumber) body.phone_number = form.phoneNumber;
    if (passwords.newPassword || passwords.currentPassword || passwords.repeatPassword) {
      body.current_password = passwords.currentPassword;
      body.new_password = passwords.newPassword;
      body.repeat_password = passwords.repeatPassword;
    }
    return body;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!saved) return;
    const body = changedFields();

    if (Object.keys(body).length === 0) {
      setFeedback({ type: 'info', text: 'Der er ingen ændringer at gemme.' });
      return;
    }

    setSaving(true);
    setFeedback({ type: '', text: '' });
    try {
      const res = await updateProfile(body);
      saveSession(res);
      applyUser(res.data);
      setPasswords(emptyPasswords);
      // A new email address does not replace the current one before it has been confirmed.
      setFeedback({
        type: 'success',
        text: res.data.pendingEmail
          ? `Dine oplysninger er gemt. Vi har sendt en bekræftelsesmail til ${res.data.pendingEmail}. Din e-mail skifter, når du har bekræftet den nye adresse.`
          : 'Dine oplysninger er gemt.'
      });
      onSaved?.();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={ui.block} onSubmit={handleSubmit}>
      <h2>Personlige oplysninger</h2>
      <p className={styles.sectionHint}>Hold dine kontaktoplysninger opdateret.</p>
      <div className={ui.stack}>
        <div className={ui.fieldRow}>
          <div className={ui.field}>
            <label htmlFor="profile-first">Fornavn</label>
            <input
              id="profile-first"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className={ui.field}>
            <label htmlFor="profile-last">Efternavn</label>
            <input
              id="profile-last"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>
        <div className={ui.fieldRow}>
          <div className={ui.field}>
            <label htmlFor="profile-email">E-mail</label>
            <input
              id="profile-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
            />
            {pendingEmail && (
              <span className={ui.fieldHint}>Afventer bekræftelse: {pendingEmail}</span>
            )}
          </div>
          <div className={ui.field}>
            <label htmlFor="profile-phone">Telefonnummer (valgfrit)</label>
            <input
              id="profile-phone"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <h3>Skift adgangskode</h3>
        <p className={styles.sectionHint}>
          Lad felterne stå tomme, hvis du ikke vil skifte adgangskode.
        </p>
        <div className={ui.field}>
          <label htmlFor="profile-current-password">Nuværende adgangskode</label>
          <input
            id="profile-current-password"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            value={passwords.currentPassword}
            onChange={handlePasswordChange}
          />
        </div>
        <div className={ui.fieldRow}>
          <div className={ui.field}>
            <label htmlFor="profile-new-password">Ny adgangskode</label>
            <input
              id="profile-new-password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
            />
          </div>
          <div className={ui.field}>
            <label htmlFor="profile-repeat-password">Gentag ny adgangskode</label>
            <input
              id="profile-repeat-password"
              name="repeatPassword"
              type="password"
              autoComplete="new-password"
              value={passwords.repeatPassword}
              onChange={handlePasswordChange}
            />
          </div>
        </div>
      </div>

      {feedback.text && (
        <p className={ui.fieldHint} role={feedback.type === 'error' ? 'alert' : 'status'}>
          {feedback.text}
        </p>
      )}

      <button
        type="submit"
        className={cx(ui.btn, ui.btnDark, ui.btnBlock, styles.save)}
        disabled={loading || saving}
      >
        Gem ændringer
      </button>
    </form>
  );
}
