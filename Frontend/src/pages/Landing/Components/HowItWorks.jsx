import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../Landing.module.css';

const howItWorks = [
  {
    number: '01',
    title: 'Find dit næste måltid',
    body: 'Indtast din adresse, og udforsk de bedste køkkener i nærheden.'
  },
  {
    number: '02',
    title: 'Vælg dine favoritter',
    body: 'Sammensæt din bestilling. Vi giver dine ønsker videre til køkkenet.'
  },
  {
    number: '03',
    title: 'Nyd den gode smag',
    body: 'Få maden leveret til døren, eller hent den selv på vejen.'
  }
];

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
