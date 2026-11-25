import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../Profile.module.css';

export default function DeliveryAddress() {
  return (
    <div className={ui.block}>
      <h2>Din standardadresse</h2>
      <div className={ui.stack}>
        <div className={ui.field}>
          <label htmlFor="profile-street">Adresse</label>
          <input id="profile-street" />
        </div>
        <div className={ui.fieldRowThree}>
          <div className={ui.field}>
            <label htmlFor="profile-zip">Postnummer</label>
            <input id="profile-zip" />
          </div>
          <div className={ui.field}>
            <label htmlFor="profile-city">By</label>
            <input id="profile-city" />
          </div>
          <div className={ui.field}>
            <label htmlFor="profile-floor">Etage / dør</label>
            <input id="profile-floor" />
          </div>
        </div>
      </div>
      <button className={cx(ui.btn, ui.btnDark, ui.btnBlock, styles.save)}>
        Gem leveringsadresse
      </button>
    </div>
  );
}
