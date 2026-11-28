import { Link } from 'react-router-dom';
import cx from '../utils/cx';
import useTexts from '../language/useTexts';
import ui from '../styles/shared.module.css';
import styles from './SiteFooter.module.css';

const footerTexts = {
  da: {
    tagline: 'Gode måltider. Tættere på.',
    rights: '© 2026 MTOGO Alle rettigheder forbeholdes.',
    about: 'Om MTOGO',
    help: 'Hjælp & kontakt',
    partner: 'Bliv partner',
    privacy: 'Privatliv',
    terms: 'Handelsbetingelser',
    cookies: 'Cookies'
  },
  en: {
    tagline: 'Good meals. Closer to you.',
    rights: '© 2026 MTOGO All rights reserved.',
    about: 'About MTOGO',
    help: 'Help & contact',
    partner: 'Become a partner',
    privacy: 'Privacy',
    terms: 'Terms of sale',
    cookies: 'Cookies'
  }
};

export default function SiteFooter({ variant = 'full' }) {
  const texts = useTexts(footerTexts);

  if (variant === 'slim') {
    return (
      <footer className={styles.footer}>
        <div className={cx(ui.page, styles.slim)}>
          <span>© 2026 MTOGO</span>
          <span>
            <Link to="/help">{texts.help}</Link>     {texts.privacy}     {texts.terms}
          </span>
        </div>
      </footer>
    );
  }

  return (
    <footer className={styles.footer}>
      <div className={cx(ui.page, styles.grid)}>
        <div>
          <div className={styles.brand}>MTOGO</div>
          <p className={styles.sub}>{texts.tagline}</p>
          <p className={styles.sub}>{texts.rights}</p>
        </div>
        <div>
          <div className={styles.links}>
            <a href="#om">{texts.about}</a>
            <Link to="/help">{texts.help}</Link>
            <a href="#partner">{texts.partner}</a>
          </div>
          <div className={styles.linksSecondary}>
            <a href="#privatliv">{texts.privacy}</a>
            <a href="#betingelser">{texts.terms}</a>
            <a href="#cookies">{texts.cookies}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
