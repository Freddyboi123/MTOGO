import { Link } from 'react-router-dom';
import cx from '../utils/cx';
import ui from '../styles/shared.module.css';
import styles from './SiteHeader.module.css';

export default function SiteHeader({ variant = 'marketing' }) {
  return (
    <header className={styles.header}>
      <div className={cx(ui.page, styles.inner)}>
        <Link to="/" className={styles.brand}>
          MTOGO
        </Link>

        {variant === 'marketing' && <span className={ui.linkQuiet}>København K ▾</span>}

        <nav className={styles.nav}>
          <Link to="/">Restauranter</Link>

          {variant === 'marketing' ? (
            <>
              <a href="#saadan-fungerer-det">Sådan fungerer det</a>
              <Link to="/login" className={styles.strong}>
                Log ind
              </Link>
              <Link to="/opret-konto" className={cx(ui.btn, ui.btnPrimary)}>
                Opret konto
              </Link>
            </>
          ) : (
            <>
              <Link to="/ansoeg/restaurant">Bliv partner</Link>
              <Link to="/min-profil">Min profil</Link>
              <Link to="/betaling" className={styles.strong}>
                Kurv · 2
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
