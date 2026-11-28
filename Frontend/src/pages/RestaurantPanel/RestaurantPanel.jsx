import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getMyRestaurant } from '../../utils/api';
import cx from '../../utils/cx';
import ui from '../../styles/shared.module.css';
import dash from '../../components/DashboardLayout.module.css';
import styles from './RestaurantPanel.module.css';
import PanelStats from './Components/PanelStats';
import RestaurantInfo from './Components/RestaurantInfo';
import MenuPanel from './Components/MenuPanel';
import OpeningHours from './Components/OpeningHours';
import ActiveOrders from './Components/ActiveOrders';
import useFeatureFlag from '../../featureFlags/useFeatureFlag';

const buildItems = (id, ordering) =>
  [
    { to: `/restaurantpanel/${id}/overblik`, label: 'Overblik' },
    ordering && { to: `/restaurantpanel/${id}/ordrer`, label: 'Ordrer' },
    { to: `/restaurantpanel/${id}`, label: 'Min restaurant' },
    { to: `/restaurantpanel/${id}/menu`, label: 'Menu & varer' },
    { to: `/restaurantpanel/${id}/aabningstider`, label: 'Åbningstider' }
  ].filter(Boolean);

const sectionIds = {
  overblik: 'overblik',
  ordrer: 'ordrer',
  menu: 'menu',
  aabningstider: 'menu'
};

export default function RestaurantPanel() {
  const { id, '*': section } = useParams();
  const [myRestaurant, setMyRestaurant] = useState(null);
  const [error, setError] = useState('');
  const ordering = useFeatureFlag('ordering');

  async function loadRestaurant() {
    try {
      const res = await getMyRestaurant(id);
      setMyRestaurant(res.data.data);
      setError('');
    } catch (err) {
      setMyRestaurant(null);
      setError(err.message);
    }
  }

  useEffect(() => {
    loadRestaurant();
  }, [id]);

  const loaded = Boolean(myRestaurant);

  useEffect(() => {
    if (!loaded) {
      return;
    }
    const target = document.getElementById(sectionIds[section] ?? 'restaurant');
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [section, loaded]);

  if (!myRestaurant) {
    return (
      <DashboardLayout
        role="Restaurantpartner"
        items={buildItems(id, ordering)}
        breadcrumb="Restaurantpanel"
        user="Restaurantpartner"
        helpLink
      >
        <p className={ui.fieldHint}>{error || 'Henter restaurant…'}</p>
        <Link to="/min-profil" state={{ section: 'Mine restauranter' }} className={ui.linkAccent}>
          ← Tilbage til mine restauranter
        </Link>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="Restaurantpartner"
      items={buildItems(id, ordering)}
      breadcrumb={`${myRestaurant.name}  /  Restaurantpanel`}
      user="Luca Moretti"
      helpLink
    >
      <div className={dash.head}>
        <div>
          <p className={ui.eyebrow}>Dit køkken på MTOGO</p>
          <h1 className={dash.title}>Min restaurant</h1>
          <p className={dash.subtitle}>
            Administrer din side, hold menuen frisk, og få overblik over dagens ordrer.
          </p>
        </div>
        <div className={dash.actions}>
          <Link to={`/restaurant/${id}`} className={cx(ui.btn, ui.btnOutline, ui.btnSmall)}>
            Se offentlig side ↗
          </Link>
        </div>
      </div>

      <div id="overblik">
        <PanelStats categories={myRestaurant.categories ?? []} />
      </div>
      <div id="restaurant">
        <RestaurantInfo myRestaurant={myRestaurant} onRestaurantChanged={setMyRestaurant} />
      </div>

      <div id="menu" className={styles.split}>
        <MenuPanel categories={myRestaurant.categories ?? []} onMenuChanged={loadRestaurant} />
        <OpeningHours />
      </div>

      {ordering && (
        <div id="ordrer">
          <ActiveOrders restaurantId={id} />
        </div>
      )}
    </DashboardLayout>
  );
}
