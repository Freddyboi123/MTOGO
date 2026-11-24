import { useState } from 'react';
import { setRestaurantVisibility } from '../../../utils/api';
import ui from '../../../styles/shared.module.css';
import styles from '../RestaurantPanel.module.css';

export default function VisibilityToggle({ restaurantId, visible, onChanged }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleChange(event) {
    setError('');
    setSaving(true);
    try {
      const res = await setRestaurantVisibility(restaurantId, event.target.checked);
      onChanged(res.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <label className={styles.visibility}>
        <input type="checkbox" checked={visible} disabled={saving} onChange={handleChange} />
        <span className={styles.switch}/>
        Synlig for kunder
      </label>
      {error && <p className={ui.fieldHint}>{error}</p>}
    </div>
  );
}
