import { Link } from 'react-router-dom';
import { getUser, isLoggedIn } from '../utils/api';
import cx from '../utils/cx';
import useFeatureFlag from '../featureFlags/useFeatureFlag';
import useBasket from '../basket/useBasket';
import { headerTexts } from '../data/mtogo';
import ui from '../styles/shared.module.css';
import styles from './SiteHeader.module.css';

export default function SiteHeader() {
  const restaurantOverview = useFeatureFlag('restaurantOverview');
  const ordering = useFeatureFlag('ordering');
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
          <Link to={restaurantOverview ? '/restauranter' : '/'}>{headerTexts.restaurants}</Link>
          <a href="/#saadan-fungerer-det">{headerTexts.howItWorks}</a>
          <Link to="/ansoeg/restaurant">{headerTexts.partner}</Link>
          {ordering && count > 0 && (
            <Link to="/betaling" className={styles.strong}>
              {headerTexts.basket} · {count}
            </Link>
          )}
          {loggedIn ? (
            <div className={styles.account}>
              {isAdmin && (
                <Link to="/admin" className={cx(ui.btn, ui.btnOutline)}>
                  {headerTexts.admin}
                </Link>
              )}
              <Link to="/min-profil" className={cx(ui.btn, ui.btnPrimary)}>
                {headerTexts.profile}
              </Link>
            </div>
          ) : (
            <div className={styles.auth}>
              <Link to="/login" className={styles.strong}>
                {headerTexts.login}
              </Link>
              <Link to="/opret-konto" className={cx(ui.btn, ui.btnPrimary)}>
                {headerTexts.signUp}
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
