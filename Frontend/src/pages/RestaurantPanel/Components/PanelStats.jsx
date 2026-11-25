import { restaurantPanelTexts } from '../../../data/mtogo';
import StatCard from '../../../components/StatCard';
import dash from '../../../components/DashboardLayout.module.css';

export default function PanelStats({ categories }) {
  const items = categories.flatMap((category) => category.items ?? []);
  const unavailable = items.filter((item) => !item.available).length;

  return (
    <div className={dash.statGrid}>
      <StatCard label={restaurantPanelTexts.items} value={items.length} note={restaurantPanelTexts.itemsNote} />
      <StatCard
        label={restaurantPanelTexts.unavailable}
        value={unavailable}
        note={restaurantPanelTexts.unavailableNote}
      />
      <StatCard
        label={restaurantPanelTexts.categories}
        value={categories.length}
        note={restaurantPanelTexts.categoriesNote}
      />
    </div>
  );
}
