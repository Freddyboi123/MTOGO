import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import cx from '../utils/cx';
import ui from '../styles/shared.module.css';
import styles from './Auth.module.css';

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    navigate('/login');
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
          <input id="signup-name" placeholder="Dit for- og efternavn" />
        </div>

        <div className={ui.field}>
          <label htmlFor="signup-email">E-mail</label>
          <input id="signup-email" type="email" placeholder="din@email.dk" />
        </div>

        <div className={ui.field}>
          <label htmlFor="signup-password">Adgangskode</label>
          <div className={styles.affix}>
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Vælg en sikker adgangskode"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Skjul' : 'Vis'}
            </button>
          </div>
          <span className={ui.fieldHint}>Brug mindst 8 tegn.</span>
        </div>

        <label className={ui.checkbox}>
          <input type="checkbox" />
          Jeg accepterer handelsbetingelserne og har læst privatlivspolitikken.
        </label>

        <button type="submit" className={cx(ui.btn, ui.btnPrimary, ui.btnBlock)}>
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
