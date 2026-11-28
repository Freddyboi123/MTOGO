import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../RestaurantPanel.module.css';
import VisibilityToggle from './VisibilityToggle';

const restaurant = {
  name: 'Osteria Nørrebro',
  eyebrow: 'Italiensk håndværk · København N',
  description: 'Napolitansk pizza, gode råvarer og lidt italiensk kærlighed.',
  meta: '★ 4,8 (240+)     ·     20–30 min     ·     Min. 99 kr.',
  openUntil: 'Åbent til 22.00',
  cover: '/images/restaurant-cover.png',
  categories: ['Populært', 'Pizza', 'Pasta', 'Tilbehør', 'Drikkevarer'],
  menuTitle: 'Pizza, som den skal være',
  menuIntro: 'Langtidshævet dej. Bagt ved 450°. Altid frisk fra ovnen.',
  items: [
    {
      name: 'Margherita',
      description: 'Tomat, fior di latte, frisk basilikum og ekstra jomfruolivenolie.',
      price: 119,
      flag: 'Gæsternes favorit'
    },
    {
      name: 'Burrata',
      description: 'Tomat, cremet burrata, cherrytomat og frisk basilikum.',
      price: 129,
      flag: null
    },
    {
      name: 'Diavola',
      description: 'Tomat, mozzarella, stærk salami og et strejf af chili.',
      price: 139,
      flag: null
    },
    {
      name: 'Funghi',
      description: 'Mozzarella, blandede svampe, timian og parmesan.',
      price: 129,
      flag: 'Vegetarisk'
    }
  ],
  drinks: [
    {
      name: 'San Pellegrino · 33 cl',
      description: 'Danskvand fra Italien',
      price: 29
    }
  ]
};

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
