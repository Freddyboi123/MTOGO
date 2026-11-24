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

const buildItems = (id) => [
  { to: `/restaurantpanel/${id}/overblik`, label: 'Overblik' },
  { to: `/restaurantpanel/${id}/ordrer`, label: 'Ordrer' },
  { to: `/restaurantpanel/${id}`, label: 'Min restaurant' },
  { to: `/restaurantpanel/${id}/menu`, label: 'Menu & varer' },
  { to: `/restaurantpanel/${id}/aabningstider`, label: 'Åbningstider' },
  { to: `/restaurantpanel/${id}/udbetalinger`, label: 'Udbetalinger' }
];

export default function RestaurantPanel() {
  const { id } = useParams();
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

  if (!myRestaurant) {
    return (
      <DashboardLayout
        role="Restaurantpartner"
        items={buildItems(id)}
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
      items={buildItems(id)}
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
          <button className={cx(ui.btn, ui.btnOutline, ui.btnSmall)}>Se offentlig side ↗</button>
          <button className={cx(ui.btn, ui.btnDark, ui.btnSmall)}>Gem ændringer</button>
        </div>
      </div>

      <PanelStats />
      <RestaurantInfo myRestaurant={myRestaurant} onRestaurantChanged={setMyRestaurant} />

      <div className={styles.split}>
        <MenuPanel categories={myRestaurant.categories ?? []} onMenuChanged={loadRestaurant} />
        <OpeningHours />
      </div>

      {ordering && <ActiveOrders restaurantId={id} />}
    </DashboardLayout>
  );
}
