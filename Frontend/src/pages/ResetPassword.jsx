import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { resetPassword } from '../utils/api';
import ui from '../styles/shared.module.css';
import styles from './Auth.module.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword({ token, password, repeat_password: repeatPassword });
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div>
        <p className={ui.eyebrow}>Næsten færdig</p>
        <h1 className={styles.title}>Vælg ny adgangskode.</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.fields}>
        <div className={ui.field}>
          <label htmlFor="new-password">Ny adgangskode</label>
          <input
            id="new-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span className={ui.fieldHint}>
            Brug 8-30 tegn med store og små bogstaver samt mindst ét specialtegn.
          </span>
        </div>

        <div className={ui.field}>
          <label htmlFor="new-password-repeat">Gentag adgangskode</label>
          <input
            id="new-password-repeat"
            type="password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className={ui.fieldHint}>{error}</p>}

        <button
          type="submit"
          className={ui.btn, ui.btnPrimary, ui.btnBlock}
          disabled={loading}
        >
          Gem adgangskode
        </button>
      </form>

      <p className={styles.switch}>
        <Link to="/login" className={ui.linkQuiet}>
          ← Tilbage til login
        </Link>
      </p>
    </AuthLayout>
  );
}
