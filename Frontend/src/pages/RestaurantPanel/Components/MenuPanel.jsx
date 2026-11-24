import { useState } from 'react';
import { addMenuItem } from '../../../utils/api';
import { restaurantPanelStats } from '../../../data/mtogo';
import Panel from '../../../components/Panel';
import DataTable from '../../../components/DataTable';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../RestaurantPanel.module.css';

const menuColumns = [
  { key: 'name', label: 'Vare' },
  { key: 'price', label: 'Pris' },
  { key: 'state', label: 'Tilgængelig', render: (row) => `${row.state} ▾` },
  { key: 'actions', label: 'Handling', render: () => 'Rediger · Slet' }
];

export default function MenuPanel({ categories, onItemAdded }) {
  const [showForm, setShowForm] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [error, setError] = useState('');

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
      await onItemAdded();
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
  );
}
