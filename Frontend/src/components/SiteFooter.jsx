import { Link } from 'react-router-dom';
import cx from '../utils/cx';
import ui from '../styles/shared.module.css';
import styles from './SiteFooter.module.css';

export default function SiteFooter({ variant = 'full' }) {
  if (variant === 'slim') {
    return (
      <footer className={styles.footer}>
        <div className={cx(ui.page, styles.slim)}>
          <span>© 2026 MTOGO</span>
          <span>
            <Link to="/help">Hjælp &amp; kontakt</Link>     Privatliv     Handelsbetingelser
          </span>
        </div>
      </footer>
    );
  }

  return (
    <footer className={styles.footer}>
      <div className={cx(ui.page, styles.grid)}>
        <div>
          <div className={styles.brand}>MTOGO</div>
          <p className={styles.sub}>Gode måltider. Tættere på.</p>
          <p className={styles.sub}>© 2026 MTOGO Alle rettigheder forbeholdes.</p>
        </div>
        <div>
          <div className={styles.links}>
            <a href="#om">Om MTOGO</a>
            <Link to="/help">Hjælp &amp; kontakt</Link>
            <a href="#partner">Bliv partner</a>
          </div>
          <div className={styles.linksSecondary}>
            <a href="#privatliv">Privatliv</a>
            <a href="#betingelser">Handelsbetingelser</a>
            <a href="#cookies">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
