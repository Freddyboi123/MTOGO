import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { register } from '../utils/api';
import cx from '../utils/cx';
import ui from '../styles/shared.module.css';
import styles from './Auth.module.css';

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    const parts = name.trim().split(/\s+/);
    if (parts.length < 2) {
      setError('Indtast både for- og efternavn.');
      return;
    }
    setLoading(true);
    try {
      const res = await register({
        first_name: parts.slice(0, -1).join(' '),
        last_name: parts[parts.length - 1],
        email,
        password,
        repeat_password: repeatPassword
      });
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
        <p className={ui.eyebrow}>En verden af lokale favoritter</p>
        <h1 className={styles.title}>Din næste livret venter.</h1>
      </div>
      <p className={cx(ui.lead, styles.lead)}>Opret en konto, og få god smag tættere på.</p>

      <form onSubmit={handleSubmit} className={styles.fields}>
        <div className={ui.field}>
          <label htmlFor="signup-name">Fulde navn</label>
          <input
            id="signup-name"
            placeholder="Dit for- og efternavn"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className={ui.field}>
          <label htmlFor="signup-email">E-mail</label>
          <input
            id="signup-email"
            type="email"
            placeholder="din@email.dk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={ui.field}>
          <label htmlFor="signup-password">Adgangskode</label>
          <div className={styles.affix}>
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Vælg en sikker adgangskode"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Skjul' : 'Vis'}
            </button>
          </div>
          <span className={ui.fieldHint}>
            Brug 8-30 tegn med store og små bogstaver samt mindst ét specialtegn.
          </span>
        </div>

        <div className={ui.field}>
          <label htmlFor="signup-repeat">Gentag adgangskode</label>
          <input
            id="signup-repeat"
            type={showPassword ? 'text' : 'password'}
            placeholder="Gentag adgangskoden"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            required
          />
        </div>

        <label className={ui.checkbox}>
          <input type="checkbox" />
          Jeg accepterer handelsbetingelserne og har læst privatlivspolitikken.
        </label>

        {error && <p className={ui.fieldHint}>{error}</p>}
        {success && <p className={ui.fieldHint}>{success}</p>}

        <button
          type="submit"
          className={cx(ui.btn, ui.btnPrimary, ui.btnBlock)}
          disabled={loading || Boolean(success)}
        >
          Opret konto
        </button>
      </form>

      <p className={styles.switch}>
        Har du allerede en konto?{' '}
        <Link to="/login" className={ui.linkAccent}>
          Log ind
        </Link>
      </p>
    </AuthLayout>
  );
}
