import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../RestaurantPanel.module.css';

const openingHours = [
  { days: 'Mandag – torsdag', hours: '11.00 – 22.00' },
  { days: 'Fredag – lørdag', hours: '11.00 – 23.00' },
  { days: 'Søndag', hours: '12.00 – 22.00' }
];

const restaurantPanelStats = {
  minimumOrder: '99 kr.',
  deliveryRadius: '4 km'
};

export default function OpeningHours() {
  return (
    <div className={cx(ui.block, styles.block)}>
      <h2>Åbning &amp; levering</h2>
      <div className={styles.hours}>
        {openingHours.map((row) => (
          <div className={styles.hoursRow} key={row.days}>
            <span>{row.days}</span>
            <span>{row.hours}</span>
          </div>
        ))}
      </div>
      <p className={cx(ui.linkQuiet, styles.editHours)}>Rediger åbningstider →</p>
      <div className={cx(ui.fieldRow, styles.limits)}>
        <div className={ui.field}>
          <label htmlFor="panel-min">Min. bestilling</label>
          <input id="panel-min" defaultValue={restaurantPanelStats.minimumOrder} />
        </div>
        <div className={ui.field}>
          <label htmlFor="panel-radius">Leveringsradius</label>
          <input id="panel-radius" defaultValue={restaurantPanelStats.deliveryRadius} />
        </div>
      </div>
    </div>
  );
}
