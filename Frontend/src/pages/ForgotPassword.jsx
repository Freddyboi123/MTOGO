import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import cx from '../utils/cx';
import ui from '../styles/shared.module.css';
import styles from './Auth.module.css';

export default function ForgotPassword() {
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

      <form onSubmit={(event) => event.preventDefault()} className={styles.fields}>
        <div className={ui.field}>
          <label htmlFor="reset-email">E-mail</label>
          <input id="reset-email" type="email" placeholder="din@email.dk" />
        </div>

        <button type="submit" className={cx(ui.btn, ui.btnPrimary, ui.btnBlock)}>
          Send nulstillingslink
        </button>
      </form>

      <p className={ui.fieldHint}>Tjek også din spam-mappe, hvis mailen ikke dukker op.</p>

      <p className={styles.switch}>
        <Link to="/login" className={ui.linkQuiet}>
          ← Tilbage til login
        </Link>
      </p>
    </AuthLayout>
  );
}
