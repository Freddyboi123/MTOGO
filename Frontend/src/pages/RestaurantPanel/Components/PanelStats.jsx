import { restaurantPanelStats } from '../../../data/mtogo';
import StatCard from '../../../components/StatCard';
import dash from '../../../components/DashboardLayout.module.css';

export default function PanelStats() {
  return (
    <div className={dash.statGrid}>
      <StatCard
        label="Ordrer i dag"
        value={restaurantPanelStats.ordersToday}
        note={`${restaurantPanelStats.activeOrders} aktive lige nu`}
      />
      <StatCard
        label="Omsætning i dag"
        value={restaurantPanelStats.revenueToday}
        note="Før gebyrer og afregning"
      />
      <StatCard
        label="Gæsternes bedømmelse"
        value={restaurantPanelStats.rating}
        note={`${restaurantPanelStats.reviews} anmeldelser`}
      />
    </div>
  );
}
