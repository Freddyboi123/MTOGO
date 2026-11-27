import { Link } from 'react-router-dom';
import useFeatureFlag from '../../../featureFlags/useFeatureFlag';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../Landing.module.css';

// Opens the restaurant list with the category already chosen.
function PromoLink({ cuisine, enabled, children }) {
  const className = cx(ui.linkQuiet, styles.promoLink);

  return enabled ? (
    <Link to={`/restauranter?cuisine=${cuisine}`} className={className}>
      {children}
    </Link>
  ) : (
    <span className={className}>{children}</span>
  );
}

export default function Inspiration() {
  const restaurantOverview = useFeatureFlag('restaurantOverview');

  return (
    <section className={cx(ui.page, styles.section)}>
      <h2 className={cx(ui.display, styles.sectionTitle)}>Lidt inspiration til i aften</h2>
      <div className={styles.promoGrid}>
        <article className={styles.promo}>
          <div className={styles.promoText}>
            <p className={cx(ui.eyebrow, styles.promoEyebrow)}>En lille bid af Italien</p>
            <h3>Pizza, pasta og god stemning.</h3>
            <PromoLink cuisine="ITALIENSK" enabled={restaurantOverview}>Find din italienske favorit →</PromoLink>
          </div>
          <img className={styles.promoPhoto} src="/images/restaurant-pizza.png" alt="" />
        </article>

        <article className={styles.promoSand}>
          <div className={styles.promoText}>
            <p className={cx(ui.eyebrow, styles.promoEyebrow)}>Friskt, grønt og fuldt af smag</p>
            <h3>
              God energi.
              <br />
              Endnu bedre MTOGO
            </h3>
            <PromoLink cuisine="GROENT" enabled={restaurantOverview}>Udforsk bowls &amp; salater →</PromoLink>
          </div>
          <img className={styles.promoPhoto} src="/images/restaurant-bowl.png" alt="" />
        </article>
      </div>
    </section>
  );
}
