import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getUser, logout, refreshUser } from '../../utils/api';
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
import DeliveryPage from './Components/DeliveryPage';
import OrderHistory from './Components/OrderHistory';
import useFeatureFlag from '../../featureFlags/useFeatureFlag';

const DELIVERY_PAGE = 'Delivery page';

const profileSections = [
  'Personlige oplysninger',
  'Leveringsadresse',
  'Mine ansøgninger',
  'Mine restauranter',
  DELIVERY_PAGE,
  'Ordrehistorik'
];

export default function Profile() {
  const location = useLocation();
  const ordering = useFeatureFlag('ordering');
  const deliveryOverview = useFeatureFlag('deliveryOverview');
  const [roles, setRoles] = useState(() => getUser().roles ?? []);
  const deliveryAgent = deliveryOverview && roles.includes('DELIVERY_AGENT');
  const sections = profileSections.filter((name) => {
    if (name === 'Ordrehistorik') return ordering;
    if (name === DELIVERY_PAGE) return deliveryAgent;
    return true;
  });
  const [section, setSection] = useState(location.state?.section ?? profileSections[0]);
  const [, setVersion] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    refreshUser()
      .then((user) => setRoles(user.roles ?? []))
      .catch(() => {});
  }, []);

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
          sections={sections}
          section={section}
          onSelect={setSection}
          onLogout={handleLogout}
        />

        <div>
          {section === 'Personlige oplysninger' && <PersonalInfo onSaved={() => setVersion((version) => version + 1)} />}
          {section === 'Leveringsadresse' && <DeliveryAddress onSaved={() => setVersion((version) => version + 1)} />}
          {section === 'Mine ansøgninger' && <MyApplications />}
          {section === 'Mine restauranter' && <MyRestaurants />}
          {deliveryAgent && section === DELIVERY_PAGE && <DeliveryPage />}
          {ordering && section === 'Ordrehistorik' && <OrderHistory />}
        </div>
      </section>

      <SiteFooter variant="slim" />
    </>
  );
}
