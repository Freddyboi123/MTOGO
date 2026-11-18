import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { login, resendVerify, saveSession } from '../utils/api';
import ui from '../styles/shared.module.css';
import styles from './Auth.module.css';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [notVerified, setNotVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setInfo('');
    setNotVerified(false);
    setLoading(true);
    try {
      saveSession(await login({ email, password }));
      navigate('/');
    } catch (err) {
      setError(err.message);
      setNotVerified(err.status === 403);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      const res = await resendVerify(email);
      setError('');
      setInfo(res.message);
      setNotVerified(false);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AuthLayout>
      <div>
        <p className={ui.eyebrow}>Velkommen tilbage</p>
        <h1 className={styles.title}>Godt at se dig igen.</h1>
      </div>
      <p className={ui.lead, styles.lead}>Log ind, og find noget, du har lyst til.</p>

      <form onSubmit={handleSubmit} className={styles.fields}>
        <div className={ui.field}>
          <label htmlFor="login-email">E-mail</label>
          <input
            id="login-email"
            type="email"
            placeholder="din@email.dk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={ui.field}>
          <label htmlFor="login-password">Adgangskode</label>
          <div className={styles.affix}>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Indtast din adgangskode"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Skjul' : 'Vis'}
            </button>
          </div>
        </div>

        <div className={styles.row}>
          <label className={ui.checkbox}>
            <input type="checkbox" />
            Husk mig
          </label>
          <Link to="/glemt-adgangskode" className={ui.linkAccent, styles.forgot}>
            Glemt adgangskode?
          </Link>
        </div>

        {error && <p className={ui.fieldHint}>{error}</p>}
        {info && <p className={ui.fieldHint}>{info}</p>}
        {notVerified && (
          <button type="button" className={ui.linkAccent} onClick={handleResend}>
            Send bekræftelsesmail igen
          </button>
        )}

        <button
          type="submit"
          className={ui.btn, ui.btnPrimary, ui.btnBlock}
          disabled={loading}
        >
          Log ind
        </button>
      </form>

      <p className={styles.switch}>
        Ny hos MTOGO?{' '}
        <Link to="/opret-konto" className={ui.linkAccent}>
          Opret en konto
        </Link>
      </p>
    </AuthLayout>
  );
}
