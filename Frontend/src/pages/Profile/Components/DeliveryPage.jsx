import { Link } from 'react-router-dom';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../Profile.module.css';

export default function DeliveryPage() {
  return (
    <>
      <div className={ui.block}>
        <h2>Delivery page</h2>
        <p className={styles.sectionHint}>
          Se ordrer, der er klar til levering, tag en ordre og følg dine ture.
        </p>
      </div>
      <article className={styles.statusCard}>
        <div className={ui.sectionLabel}>Chaufførpartner</div>
        <h3>Ledige leverancer</h3>
        <p className={styles.statusMeta}>Ordrer klar til afhentning, som endnu ikke har en chauffør.</p>
        <Link
          to="/chauffoerpanel"
          className={cx(ui.btn, ui.btnPrimary, ui.btnSmall, ui.btnBlock, styles.statusAction)}
        >
          Se ledige leverancer →
        </Link>
      </article>
      <article className={styles.statusCard}>
        <div className={ui.sectionLabel}>Chaufførpartner</div>
        <h3>Mine ture</h3>
        <p className={styles.statusMeta}>Dine accepterede leverancer og deres status.</p>
        <Link
          to="/chauffoerpanel/ture"
          className={cx(ui.btn, ui.btnOutline, ui.btnSmall, ui.btnBlock, styles.statusAction)}
        >
          Åbn mine ture →
        </Link>
      </article>
    </>
  );
}
