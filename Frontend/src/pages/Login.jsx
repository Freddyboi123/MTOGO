import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import cx from '../utils/cx';
import ui from '../styles/shared.module.css';
import styles from './Auth.module.css';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    navigate('/');
  }

  return (
    <AuthLayout>
      <div>
        <p className={ui.eyebrow}>Velkommen tilbage</p>
        <h1 className={styles.title}>Godt at se dig igen.</h1>
      </div>
      <p className={cx(ui.lead, styles.lead)}>Log ind, og find noget, du har lyst til.</p>

      <form onSubmit={handleSubmit} className={styles.fields}>
        <div className={ui.field}>
          <label htmlFor="login-email">E-mail</label>
          <input id="login-email" type="email" placeholder="din@email.dk" />
        </div>

        <div className={ui.field}>
          <label htmlFor="login-password">Adgangskode</label>
          <div className={styles.affix}>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Indtast din adgangskode"
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
          <Link to="/glemt-adgangskode" className={cx(ui.linkAccent, styles.forgot)}>
            Glemt adgangskode?
          </Link>
        </div>

        <button type="submit" className={cx(ui.btn, ui.btnPrimary, ui.btnBlock)}>
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
