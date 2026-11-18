import { Link } from 'react-router-dom';
import { isLoggedIn } from '../utils/api';
import ui from '../styles/shared.module.css';
import styles from './SiteHeader.module.css';

export default function SiteHeader({ variant = 'marketing' }) {
  const loggedIn = isLoggedIn();

  return (
    <header className={styles.header}>
      <div className={ui.page, styles.inner}>
        <Link to="/" className={styles.brand}>
          MTOGO
        </Link>

        {variant === 'marketing' && <span className={ui.linkQuiet}>København K ▾</span>}

        <nav className={styles.nav}>
          <Link to="/">Restauranter</Link>

          {variant === 'marketing' ? (
            <>
              <a href="#saadan-fungerer-det">Sådan fungerer det</a>
              {loggedIn ? (
                <Link to="/min-profil" className={ui.btn, ui.btnPrimary}>
                  Profil
                </Link>
              ) : (
                <div>
                  <Link to="/login" className={styles.strong}>
                    Log ind
                  </Link>
                  <Link to="/opret-konto" className={ui.btn, ui.btnPrimary}>
                    Opret konto
                  </Link>
                </div>
              )}
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
