import { Link } from 'react-router-dom';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import cx from '../../utils/cx';
import ui from '../../styles/shared.module.css';
import styles from './FAQ.module.css';
import FaqHero from './Components/FaqHero';
import FaqItem from './Components/FaqItem';

// Just created some basic FAQs and made it generic, so we can add more in the future.
const FAQs = [
  {
    question: 'Hvordan bestiller jeg?',
    answer:
      'Du vælger restauranten og maden du ønsker at bestille. Derefter indtaster du din leveringsadresse. Herefter betaler du og afventer levering af din mad.'
  },
  {
    question: 'Jeg er sur over min mad',
    answer: (
      <div>
        Too bad, maden er lavet med kærlighed. Men hvis du insistere på, at maden ikke lever op til
        dine forventninger kan du skrive en mail under <Link to="/" className={styles.link}>kontakt</Link>.
      </div>
    )
  },
  {
    question: 'Hvor lang tid tager en levering?',
    answer:
      'Det afhænger af trafik og travlhed på restauranten. Men du vil modtage et estimat for leveringstid beregnet ud fra hvor lang tid det tager at tilberede din mad, samt levering.'
  }
];

export default function FAQ() {
  return (
    <>
      <SiteHeader />

      <FaqHero title="Har du brug for hjælp?" lead="Få svar på dine spørgsmål her:" />

      <section className={cx(ui.page, styles.list)}>
        {FAQs.map((faq) => (
          <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
        ))}
      </section>

      <SiteFooter variant="slim" />
    </>
  );
}
