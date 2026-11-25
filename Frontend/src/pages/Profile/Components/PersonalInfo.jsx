import { getUser } from '../../../utils/api';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../Profile.module.css';

export default function PersonalInfo() {
  const user = getUser();

  return (
    <div className={ui.block}>
      <h2>Personlige oplysninger</h2>
      <p className={styles.sectionHint}>Hold dine kontaktoplysninger opdateret.</p>
      <div className={ui.stack}>
        <div className={ui.fieldRow}>
          <div className={ui.field}>
            <label htmlFor="profile-first">Fornavn</label>
            <input id="profile-first" defaultValue={user.name ?? ''} />
          </div>
          <div className={ui.field}>
            <label htmlFor="profile-last">Efternavn</label>
            <input id="profile-last" defaultValue={user.lastName ?? ''} />
          </div>
        </div>
        <div className={ui.fieldRow}>
          <div className={ui.field}>
            <label htmlFor="profile-email">E-mail</label>
            <input id="profile-email" defaultValue={user.email ?? ''} />
          </div>
          <div className={ui.field}>
            <label htmlFor="profile-phone">Telefonnummer</label>
            <input id="profile-phone" />
          </div>
        </div>
      </div>
      <button className={cx(ui.btn, ui.btnDark, ui.btnBlock, styles.save)}>Gem ændringer</button>
    </div>
  );
}
