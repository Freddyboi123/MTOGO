import { Link } from 'react-router-dom';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../Landing.module.css';

export default function PartnerBand() {
  return (
    <section className={ui.page}>
      <div className={styles.partnerBand}>
        <div>
          <p className={ui.eyebrowLight}>God mad fortjener godt selskab</p>
          <h2 className={styles.partnerTitle}>
            Har du en restaurant?
            <br />
            Lad os dele din gode MTOGO
          </h2>
          <p className={styles.partnerNote}>Nå flere lokale gæster med MTOGO</p>
        </div>
        <Link to="/ansoeg/restaurant" className={cx(ui.btn, ui.btnLight)}>
          Bliv restaurantpartner →
        </Link>
      </div>
    </section>
  );
}
