import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../../utils/api';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import cx from '../../utils/cx';
import ui from '../../styles/shared.module.css';
import styles from './Profile.module.css';
import ProfileNav from './Components/ProfileNav';
import PersonalInfo from './Components/PersonalInfo';
import DeliveryAddress from './Components/DeliveryAddress';
import MyApplications from './Components/MyApplications';
import MyRestaurants from './Components/MyRestaurants';
import OrderHistory from './Components/OrderHistory';
import Security from './Components/Security';

const profileSections = [
  'Personlige oplysninger',
  'Leveringsadresse',
  'Mine ansøgninger',
  'Mine restauranter',
  'Ordrehistorik',
  'Sikkerhed'
];

export default function Profile() {
  const location = useLocation();
  const [section, setSection] = useState(location.state?.section ?? profileSections[0]);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <>
      <SiteHeader />

      <section className={cx(ui.page, styles.intro)}>
        <p className={ui.eyebrow}>Din MTOGO-konto</p>
        <h1 className={styles.title}>Min profil</h1>
        <p className={cx(ui.lead, styles.lead)}>
          Dine oplysninger, dine adresser og dine næste muligheder.
        </p>
      </section>

      <section className={cx(ui.page, styles.layout)}>
        <ProfileNav
          sections={profileSections}
          section={section}
          onSelect={setSection}
          onLogout={handleLogout}
        />

        <div>
          {section === 'Personlige oplysninger' && <PersonalInfo />}
          {section === 'Leveringsadresse' && <DeliveryAddress />}
          {section === 'Mine ansøgninger' && <MyApplications />}
          {section === 'Mine restauranter' && <MyRestaurants />}
          {section === 'Ordrehistorik' && <OrderHistory />}
          {section === 'Sikkerhed' && <Security />}
        </div>
      </section>

      <SiteFooter variant="slim" />
    </>
  );
}
