import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../Profile.module.css';

export default function Security() {
  return (
    <div className={ui.block}>
      <h2>Adgangskode og sikkerhed</h2>
      <p className={styles.sectionHint}>Vælg en stærk adgangskode for at beskytte din konto.</p>
      <button className={cx(ui.btn, ui.btnOutline, ui.btnSmall, styles.statusAction)}>
        Skift adgangskode
      </button>
    </div>
  );
}
