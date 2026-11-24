import { howItWorks } from '../../../data/mtogo';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../Landing.module.css';

export default function HowItWorks() {
  return (
    <section className={cx(ui.page, styles.section)} id="saadan-fungerer-det">
      <h2 className={cx(ui.display, styles.sectionTitle)}>
        Fra køkken til spisebord. Helt enkelt.
      </h2>
      <div className={styles.steps}>
        {howItWorks.map((step) => (
          <div className={styles.step} key={step.number}>
            <div className={styles.stepNumber}>{step.number}</div>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
