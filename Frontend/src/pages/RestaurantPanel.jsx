import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { addMenuItem, getMyRestaurants } from '../utils/api';
import StatCard from '../components/StatCard';
import Panel from '../components/Panel';
import DataTable from '../components/DataTable';
import cx from '../utils/cx';
import ui from '../styles/shared.module.css';
import dash from '../components/DashboardLayout.module.css';
import styles from './RestaurantPanel.module.css';
import {
  openingHours,
  restaurant,
  restaurantOrders,
  restaurantPanelStats
} from '../data/mtogo';

const items = [
  { to: '/restaurantpanel/overblik', label: 'Overblik' },
  { to: '/restaurantpanel/ordrer', label: 'Ordrer' },
  { to: '/restaurantpanel', label: 'Min restaurant' },
  { to: '/restaurantpanel/menu', label: 'Menu & varer' },
  { to: '/restaurantpanel/aabningstider', label: 'Åbningstider' },
  { to: '/restaurantpanel/udbetalinger', label: 'Udbetalinger' }
];

const menuColumns = [
  { key: 'name', label: 'Vare' },
  { key: 'price', label: 'Pris' },
  { key: 'state', label: 'Tilgængelig', render: (row) => `${row.state} ▾` },
  { key: 'actions', label: 'Handling', render: () => 'Rediger · Slet' }
];

const orderColumns = [
  { key: 'id', label: 'Ordre' },
  { key: 'customer', label: 'Kunde' },
  { key: 'items', label: 'Indhold' },
  { key: 'amount', label: 'Beløb' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: 'Handling' }
];

export default function RestaurantPanel() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [error, setError] = useState('');

  async function loadMenu() {
    try {
      const res = await getMyRestaurants();
      setCategories(res.data.data[0]?.categories ?? []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadMenu();
  }, []);

  async function handleAddItem(event) {
    event.preventDefault();
    setError('');
    try {
      await addMenuItem(categories[0].id, {
        name: itemName,
        description: itemDescription,
        price: itemPrice
      });
      setItemName('');
      setItemDescription('');
      setItemPrice('');
      setShowForm(false);
      await loadMenu();
    } catch (err) {
      setError(err.message);
    }
  }

  const menuRows = categories.flatMap((category) =>
    (category.items ?? []).map((item) => ({
      name: item.name,
      price: `${item.price} kr.`,
      state: item.available ? 'Aktiv' : 'Ikke tilgængelig'
    }))
  );

  return (
    <DashboardLayout
      role="Restaurantpartner"
      items={items}
      breadcrumb={`${restaurant.name}  /  Restaurantpanel`}
      user="Luca Moretti"
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

      <div className={styles.split}>
        <div className={cx(ui.block, styles.block)}>
          <h2>Restaurantoplysninger</h2>
          <div className={ui.stack}>
            <div className={ui.fieldRow}>
              <div className={ui.field}>
                <label htmlFor="panel-name">Navn</label>
                <input id="panel-name" defaultValue={restaurant.name} />
              </div>
              <div className={ui.field}>
                <label htmlFor="panel-cuisine">Køkken</label>
                <select id="panel-cuisine" defaultValue="Italiensk">
                  <option>Italiensk</option>
                  <option>Pizza</option>
                  <option>Pasta</option>
                </select>
              </div>
            </div>
            <div className={ui.field}>
              <label htmlFor="panel-address">Adresse</label>
              <input id="panel-address" defaultValue="Nørrebrogade 42, 2200 København N" />
            </div>
            <div>
              <div className={styles.descriptionLabel}>Beskrivelse</div>
              <p className={styles.description}>
                {restaurant.description} <span className={ui.linkAccent}>Rediger →</span>
              </p>
            </div>
          </div>
        </div>

        <div className={styles.preview}>
          <img className={styles.previewPhoto} src={restaurant.cover} alt="" />
          <div className={styles.previewBody}>
            <button className={cx(ui.btn, ui.btnOutline, ui.btnSmall, styles.changeCover)}>
              Skift coverfoto
            </button>
            <h3 className={styles.previewName}>{restaurant.name}</h3>
            <p className={styles.previewKind}>Italiensk · Pizza · Pasta</p>
            <div className={styles.previewFooter}>
              <span className={ui.tag}>Synlig og åben</span>
              <span className={ui.linkQuiet}>Pause bestillinger</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.split}>
        <div className={styles.panelFlat}>
          <Panel
            title="Menu & varer"
            subtitle={`${restaurantPanelStats.menuCategory} · ${menuRows.length} af ${restaurantPanelStats.menuItemsTotal} varer`}
            controls={
              <button
                className={cx(ui.btn, ui.btnDark, ui.btnSmall, styles.addItem)}
                onClick={() => setShowForm(!showForm)}
                disabled={categories.length === 0}
              >
                + Tilføj vare
              </button>
            }
          >
            {showForm && (
              <form onSubmit={handleAddItem} className={ui.stack}>
                <div className={ui.field}>
                  <label htmlFor="item-name">Navn</label>
                  <input
                    id="item-name"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                </div>
                <div className={ui.field}>
                  <label htmlFor="item-description">Beskrivelse</label>
                  <input
                    id="item-description"
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                  />
                </div>
                <div className={ui.field}>
                  <label htmlFor="item-price">Pris (kr.)</label>
                  <input
                    id="item-price"
                    type="number"
                    step="0.01"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                  />
                </div>
                <button type="submit" className={cx(ui.btn, ui.btnDark, ui.btnSmall)}>
                  Gem vare
                </button>
              </form>
            )}
            {error && <p className={ui.fieldHint}>{error}</p>}
            <DataTable
              columns={menuColumns}
              rows={menuRows}
              rowKey="name"
              footLeft="Administrer kategorier →"
              footRight={`Se alle ${restaurantPanelStats.menuItemsTotal} varer →`}
            />
          </Panel>
        </div>

        <div className={cx(ui.block, styles.block)}>
          <h2>Åbning &amp; levering</h2>
          <div className={styles.hours}>
            {openingHours.map((row) => (
              <div className={styles.hoursRow} key={row.days}>
                <span>{row.days}</span>
                <span>{row.hours}</span>
              </div>
            ))}
          </div>
          <p className={cx(ui.linkQuiet, styles.editHours)}>Rediger åbningstider →</p>
          <div className={cx(ui.fieldRow, styles.limits)}>
            <div className={ui.field}>
              <label htmlFor="panel-min">Min. bestilling</label>
              <input id="panel-min" defaultValue={restaurantPanelStats.minimumOrder} />
            </div>
            <div className={ui.field}>
              <label htmlFor="panel-radius">Leveringsradius</label>
              <input id="panel-radius" defaultValue={restaurantPanelStats.deliveryRadius} />
            </div>
          </div>
        </div>
      </div>

      <Panel title="Aktive ordrer" right={`${restaurantOrders.length} ordrer`}>
        <DataTable columns={orderColumns} rows={restaurantOrders} rowKey="id" />
      </Panel>
    </DashboardLayout>
  );
}
