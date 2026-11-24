import ui from '../../../styles/shared.module.css';
import styles from '../Profile.module.css';

export default function OrderHistory() {
  return (
    <div className={ui.block}>
      <h2>Ordrehistorik</h2>
      <p className={styles.sectionHint}>Her kan du se dine tidligere ordrer.</p>
    </div>
  );
}
