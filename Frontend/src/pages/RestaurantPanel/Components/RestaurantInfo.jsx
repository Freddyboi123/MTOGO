import { restaurant } from '../../../data/mtogo';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../RestaurantPanel.module.css';
import VisibilityToggle from './VisibilityToggle';

export default function RestaurantInfo({ myRestaurant, onRestaurantChanged }) {
  return (
    <div className={styles.split}>
      <div className={cx(ui.block, styles.block)}>
        <h2>Restaurantoplysninger</h2>
        <div className={ui.stack}>
          <div className={ui.fieldRow}>
            <div className={ui.field}>
              <label htmlFor="panel-name">Navn</label>
              <input id="panel-name" defaultValue={myRestaurant.name} />
            </div>
            <div className={ui.field}>
              <label htmlFor="panel-cuisine">Køkken</label>
              <select id="panel-cuisine" defaultValue="Italiensk">
                <option>Italiensk</option>
                <option>Pizza</option>
                <option>Pasta</option>
              </select>
            </div>
          </div>
          <div className={ui.field}>
            <label htmlFor="panel-address">Adresse</label>
            <input
              id="panel-address"
              defaultValue={`${myRestaurant.street}, ${myRestaurant.postalCode} ${myRestaurant.city}`}
            />
          </div>
          <div>
            <div className={styles.descriptionLabel}>Beskrivelse</div>
            <p className={styles.description}>
              {myRestaurant.description} <span className={ui.linkAccent}>Rediger →</span>
            </p>
          </div>
        </div>
      </div>

      <div className={styles.preview}>
        <img className={styles.previewPhoto} src={restaurant.cover} alt="" />
        <div className={styles.previewBody}>
          <button className={cx(ui.btn, ui.btnOutline, ui.btnSmall, styles.changeCover)}>
            Skift coverfoto
          </button>
          <h3 className={styles.previewName}>{myRestaurant.name}</h3>
          <p className={styles.previewKind}>Italiensk · Pizza · Pasta</p>
          <div className={styles.previewFooter}>
            <VisibilityToggle
              restaurantId={myRestaurant.id}
              visible={myRestaurant.active}
              onChanged={onRestaurantChanged}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
