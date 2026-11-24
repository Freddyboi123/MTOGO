import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../Landing.module.css';

export default function Hero() {
  return (
    <section className={cx(ui.page, styles.hero)}>
      <div>
        <p className={ui.eyebrow}>God mad. Lige om hjørnet.</p>
        <h1 className={cx(ui.display, styles.heroTitle)}>
          Din næste favorit
          <br />
          er tættere på,
          <br />
          end du tror.
        </h1>
        <p className={cx(ui.lead, styles.heroLead)}>
          Byens bedste køkkener. Friske favoritter.
          <br />
          Leveret til din dør eller klar til afhentning.
        </p>

        <form className={styles.searchbar} onSubmit={(event) => event.preventDefault()}>
          <input placeholder="Indtast din leveringsadresse" aria-label="Leveringsadresse" />
          <button type="submit" className={cx(ui.btn, ui.btnPrimary)}>
            Find mad i nærheden
          </button>
        </form>

        <p className={styles.heroNote}>Fra lokale favoritter til din nye livret.</p>
      </div>

      <div className={styles.heroMedia}>
        <div className={styles.heroPhoto} />
        <div className={styles.heroBadge}>
          <strong>Lavet lokalt. Nydt hjemme.</strong>
          <span>Smag på dit nabolag</span>
        </div>
      </div>
    </section>
  );
}
