import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { forgotPassword } from '../utils/api';
import cx from '../utils/cx';
import ui from '../styles/shared.module.css';
import styles from './Auth.module.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setSuccess(res.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>

      <div>

        <p className={ui.eyebrow}>Vi hjælper dig ind igen</p>
        <h1 className={styles.title}>Glemt adgangskoden?</h1>

      </div>

      <p className={cx(ui.lead, styles.lead)}>

        Indtast din e-mail, så sender vi dig et link til
        <br />
        at vælge en ny adgangskode.

      </p>

      <form onSubmit={handleSubmit} className={styles.fields}>
        <div className={ui.field}>

          <label htmlFor="reset-email">E-mail</label>

          <input
            id="reset-email"
            type="email"
            placeholder="din@email.dk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

        </div>

        {error && <p className={ui.fieldHint} role="alert">{error}</p>}
        {success && <p className={ui.fieldHint}>{success}</p>}

        <button type="submit" className={cx(ui.btn, ui.btnPrimary, ui.btnBlock)} disabled={loading}>Send nulstillingslink</button>

      </form>

      <p className={ui.fieldHint}>Tjek også din spam-mappe, hvis mailen ikke dukker op.</p>

      <p className={styles.switch}>
        <Link to="/login" className={ui.linkQuiet}>← Tilbage til login</Link>
      </p>
    </AuthLayout>
  );
}
