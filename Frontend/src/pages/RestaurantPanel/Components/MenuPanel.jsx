import { useState } from 'react';
import { addMenuItem, updateMenuItem } from '../../../utils/api';
import { menuPanelTexts, restaurantPanelStats } from '../../../data/mtogo';
import Panel from '../../../components/Panel';
import DataTable from '../../../components/DataTable';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../RestaurantPanel.module.css';

const emptyForm = { name: '', description: '', price: '' };

export default function MenuPanel({ categories, onMenuChanged }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  const items = categories.flatMap((category) => category.items ?? []);

  function closeForm() {
    setEditing(null);
    setForm(emptyForm);
  }

  function openAdd() {
    setError('');
    setSaved('');
    if (editing === 'new') {
      closeForm();
      return;
    }
    setEditing('new');
    setForm(emptyForm);
  }

  function openEdit(item) {
    setError('');
    setSaved('');
    setEditing(item.id);
    setForm({ name: item.name, description: item.description ?? '', price: String(item.price) });
  }

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaved('');
    try {
      if (editing === 'new') {
        await addMenuItem(categories[0].id, form);
      } else {
        await updateMenuItem(editing, form);
      }
      setSaved(`${form.name} ${menuPanelTexts.saved}`);
      closeForm();
      await onMenuChanged();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleAvailable(item) {
    setError('');
    setSaved('');
    try {
      await updateMenuItem(item.id, { available: !item.available });
      setSaved(`${item.name} ${menuPanelTexts.saved}`);
      await onMenuChanged();
    } catch (err) {
      setError(err.message);
    }
  }

  const columns = [
    { key: 'name', label: menuPanelTexts.columns.name },
    { key: 'price', label: menuPanelTexts.columns.price, render: (item) => `${item.price} kr.` },
    {
      key: 'available',
      label: menuPanelTexts.columns.available,
      render: (item) => (
        <div className={styles.availability}>
          <span>{item.available ? menuPanelTexts.available : menuPanelTexts.unavailable}</span>
          <button
            type="button"
            className={cx(ui.btn, ui.btnOutline, ui.btnSmall, styles.toggle)}
            onClick={() => toggleAvailable(item)}
          >
            {item.available ? menuPanelTexts.markUnavailable : menuPanelTexts.markAvailable}
          </button>
        </div>
      )
    },
    {
      key: 'actions',
      label: menuPanelTexts.columns.actions,
      render: (item) => (
        <button
          type="button"
          className={cx(ui.btn, ui.btnOutline, ui.btnSmall)}
          onClick={() => openEdit(item)}
        >
          {menuPanelTexts.edit}
        </button>
      )
    }
  ];

  return (
    <div className={styles.panelFlat}>
      <Panel
        title={menuPanelTexts.title}
        subtitle={`${restaurantPanelStats.menuCategory} · ${items.length} af ${restaurantPanelStats.menuItemsTotal} varer`}
        controls={
          <button
            className={cx(ui.btn, ui.btnDark, ui.btnSmall, styles.addItem)}
            onClick={openAdd}
            disabled={categories.length === 0}
          >
            {menuPanelTexts.add}
          </button>
        }
      >
        {editing && (
          <form onSubmit={handleSubmit} className={ui.stack}>
            <div className={ui.field}>
              <label htmlFor="item-name">{menuPanelTexts.name}</label>
              <input id="item-name" name="name" value={form.name} onChange={updateField} />
            </div>
            <div className={ui.field}>
              <label htmlFor="item-description">{menuPanelTexts.description}</label>
              <input id="item-description" name="description" value={form.description} onChange={updateField} />
            </div>
            <div className={ui.field}>
              <label htmlFor="item-price">{menuPanelTexts.price}</label>
              <input id="item-price" name="price" type="number" step="0.01" value={form.price} onChange={updateField} />
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={cx(ui.btn, ui.btnDark, ui.btnSmall)}>
                {editing === 'new' ? menuPanelTexts.saveNew : menuPanelTexts.saveChanges}
              </button>
              <button type="button" className={cx(ui.btn, ui.btnOutline, ui.btnSmall)} onClick={closeForm}>
                {menuPanelTexts.cancel}
              </button>
            </div>
          </form>
        )}
        {error && <p className={ui.fieldHint}>{error}</p>}
        {saved && <p className={styles.saved}>{saved}</p>}
        <DataTable
          columns={columns}
          rows={items}
          rowKey="id"
          footLeft={menuPanelTexts.categories}
          footRight={menuPanelTexts.allItems}
        />
      </Panel>
    </div>
  );
}
