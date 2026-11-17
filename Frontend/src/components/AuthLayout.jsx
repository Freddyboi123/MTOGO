import { Link } from 'react-router-dom';
import ui from '../styles/shared.module.css';
import styles from './AuthLayout.module.css';

export default function AuthLayout({ children }) {
  return (
    <div className={styles.auth}>
      <aside className={styles.aside}>
        <div className={styles.photo} />
        <div className={styles.logo}>MTOGO</div>
        <div className={styles.asideText}>
          <p className={ui.eyebrowLight}>God mad. Godt nabolag.</p>
          <h2 className={styles.asideTitle}>
            Mere smag.
            <br />
            Mindre hverdag.
          </h2>
          <p className={styles.asideBody}>
            Opdag lokale favoritter, og få dit næste
            <br />
            gode måltid leveret lige til døren.
          </p>
          <p className={styles.footnote}>Lavet lokalt. Nydt hjemme.</p>
        </div>
      </aside>

      <main className={styles.main}>
        <Link to="/" className={ui.linkQuiet}>
          ← Tilbage til restauranter
        </Link>
        <div className={styles.form}>{children}</div>
      </main>
    </div>
  );
}
