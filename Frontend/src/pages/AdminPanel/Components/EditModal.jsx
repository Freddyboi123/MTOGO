import { useState } from 'react';
import Modal from '../../../components/Modal';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../AdminPanel.module.css';

export default function EditModal({ title, subtitle, fields, initial, onSave, onClose }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((field) => [field.key, initial[field.key] ?? '']))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function change(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave(values);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      footer={
        <>
          <button type="button" className={cx(ui.btn, ui.btnOutline, ui.btnSmall)} onClick={onClose}>
            Annuller
          </button>
          <button
            type="submit"
            form="edit-modal-form"
            className={cx(ui.btn, ui.btnDark, ui.btnSmall)}
            disabled={saving}
          >
            {saving ? 'Gemmer…' : 'Gem ændringer'}
          </button>
        </>
      }
    >
      <form id="edit-modal-form" className={styles.formGrid} onSubmit={submit}>
        {fields.map((field) => (
          <div key={field.key} className={cx(ui.field, field.wide && styles.formWide)}>
            <label htmlFor={`edit-${field.key}`}>{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                id={`edit-${field.key}`}
                value={values[field.key]}
                onChange={(e) => change(field.key, e.target.value)}
              />
            ) : field.type === 'select' ? (
              <select
                id={`edit-${field.key}`}
                value={values[field.key]}
                onChange={(e) => change(field.key, e.target.value)}
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={`edit-${field.key}`}
                type={field.type ?? 'text'}
                value={values[field.key]}
                onChange={(e) => change(field.key, e.target.value)}
              />
            )}
          </div>
        ))}
        {error && <p className={cx(styles.errorText, styles.formWide)}>{error}</p>}
      </form>
    </Modal>
  );
}
