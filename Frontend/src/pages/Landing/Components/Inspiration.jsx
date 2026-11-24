import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../Landing.module.css';

export default function Inspiration() {
  return (
    <section className={cx(ui.page, styles.section)}>
      <h2 className={cx(ui.display, styles.sectionTitle)}>Lidt inspiration til i aften</h2>
      <div className={styles.promoGrid}>
        <article className={styles.promo}>
          <div className={styles.promoText}>
            <p className={cx(ui.eyebrow, styles.promoEyebrow)}>En lille bid af Italien</p>
            <h3>Pizza, pasta og god stemning.</h3>
            <span className={cx(ui.linkQuiet, styles.promoLink)}>
              Find din italienske favorit →
            </span>
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
            <span className={cx(ui.linkQuiet, styles.promoLink)}>
              Udforsk bowls &amp; salater →
            </span>
          </div>
          <img className={styles.promoPhoto} src="/images/restaurant-bowl.png" alt="" />
        </article>
      </div>
    </section>
  );
}
