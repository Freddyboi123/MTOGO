import React, { useState } from 'react';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../CourierPanel.module.css';

export default function DeliveryEstimate({ delivery, saving, onSave }) {
  const [minutesToPickup, setMinutesToPickup] = useState(delivery.minutesToPickup ?? '');
  const [minutesToDeliver, setMinutesToDeliver] = useState(delivery.minutesToDeliver ?? '');

  function handleSubmit(event) {
    event.preventDefault();
    onSave(delivery.orderId, {
      minutesToPickup: minutesToPickup === '' ? null : Number(minutesToPickup),
      minutesToDeliver: minutesToDeliver === '' ? null : Number(minutesToDeliver)
    });
  }

  return (
    <form className={styles.detail} onSubmit={handleSubmit} noValidate>
      <span className={ui.sectionLabel}>ESTIMAT</span>
      <div className={ui.field}>
        <label htmlFor="estimate-pickup">Minutter til at hente maden</label>
        <input
          id="estimate-pickup"
          type="number"
          min="1"
          max="240"
          value={minutesToPickup}
          onChange={(event) => setMinutesToPickup(event.target.value)}
        />
      </div>
      <div className={ui.field}>
        <label htmlFor="estimate-deliver">Minutter til at levere maden</label>
        <input
          id="estimate-deliver"
          type="number"
          min="1"
          max="240"
          value={minutesToDeliver}
          onChange={(event) => setMinutesToDeliver(event.target.value)}
        />
      </div>
      <button type="submit" className={cx(ui.btn, ui.btnOutline, ui.btnSmall)} disabled={saving}>
        {saving ? 'Gemmer...' : 'Gem estimat'}
      </button>
    </form>
  );
}
