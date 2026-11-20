import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../FAQ.module.css';

export default function FaqHero({ title, lead }) {
  return (
    <section className={cx(ui.page, styles.hero)}>
      <h1 className={styles.title}>{title}</h1>
      <p className={cx(ui.lead, styles.lead)}>{lead}</p>
    </section>
  );
}
