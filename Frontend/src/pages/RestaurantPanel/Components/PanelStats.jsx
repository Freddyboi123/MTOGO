import StatCard from '../../../components/StatCard';
import dash from '../../../components/DashboardLayout.module.css';

const restaurantPanelTexts = {
  publicPage: 'Se offentlig side ↗',
  logout: 'Log ud',
  items: 'Varer på menuen',
  itemsNote: 'Alle varer i dine kategorier',
  unavailable: 'Udsolgte varer',
  unavailableNote: 'Kan ikke bestilles lige nu',
  categories: 'Kategorier',
  categoriesNote: 'På din menu'
};

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
