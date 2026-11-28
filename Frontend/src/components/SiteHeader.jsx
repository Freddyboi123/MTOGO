import { Link } from 'react-router-dom';
import { getUser, isLoggedIn } from '../utils/api';
import cx from '../utils/cx';
import useFeatureFlag from '../featureFlags/useFeatureFlag';
import useBasket from '../basket/useBasket';
import useLanguage from '../language/useLanguage';
import useTexts from '../language/useTexts';
import ui from '../styles/shared.module.css';
import styles from './SiteHeader.module.css';

const headerTexts = {
  da: {
    restaurants: 'Restauranter',
    howItWorks: 'Sådan fungerer det',
    partner: 'Bliv partner',
    basket: 'Kurv',
    profile: 'Profil',
    admin: 'Admin',
    login: 'Log ind',
    signUp: 'Opret konto',
    switchLanguage: 'EN',
    switchLanguageLabel: 'Switch to English'
  },
  en: {
    restaurants: 'Restaurants',
    howItWorks: 'How it works',
    partner: 'Become a partner',
    basket: 'Basket',
    profile: 'Profile',
    admin: 'Admin',
    login: 'Log in',
    signUp: 'Sign up',
    switchLanguage: 'DA',
    switchLanguageLabel: 'Skift til dansk'
  }
};

export default function SiteHeader() {
  const restaurantOverview = useFeatureFlag('restaurantOverview');
  const ordering = useFeatureFlag('ordering');
  const languageChoice = useFeatureFlag('languageChoice');
  const { language, setLanguage } = useLanguage();
  const texts = useTexts(headerTexts);
  const { count } = useBasket();
  const loggedIn = isLoggedIn();
  const isAdmin = loggedIn && (getUser().roles ?? []).includes('ADMIN');

  return (
    <header className={styles.header}>
      <div className={cx(ui.page, styles.inner)}>
        <Link to="/" className={styles.brand}>
          MTOGO
        </Link>

        <nav className={styles.nav}>
          <Link to={restaurantOverview ? '/restauranter' : '/'}>{texts.restaurants}</Link>
          <a href="/#saadan-fungerer-det">{texts.howItWorks}</a>
          <Link to="/ansoeg/restaurant">{texts.partner}</Link>
          {ordering && count > 0 && (
            <Link to="/betaling" className={styles.strong}>
              {texts.basket} · {count}
            </Link>
          )}
          {loggedIn ? (
            <div className={styles.account}>
              {isAdmin && (
                <Link to="/admin" className={cx(ui.btn, ui.btnOutline)}>
                  {texts.admin}
                </Link>
              )}
              <Link to="/min-profil" className={cx(ui.btn, ui.btnPrimary)}>
                {texts.profile}
              </Link>
            </div>
          ) : (
            <div className={styles.auth}>
              <Link to="/login" className={styles.strong}>
                {texts.login}
              </Link>
              <Link to="/opret-konto" className={cx(ui.btn, ui.btnPrimary)}>
                {texts.signUp}
              </Link>
            </div>
          )}
          {languageChoice && (
            <button
              type="button"
              className={styles.language}
              aria-label={texts.switchLanguageLabel}
              onClick={() => setLanguage(language === 'da' ? 'en' : 'da')}
            >
              {texts.switchLanguage}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
