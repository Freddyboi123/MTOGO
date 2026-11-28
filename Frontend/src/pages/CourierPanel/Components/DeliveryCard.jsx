import React from 'react';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../CourierPanel.module.css';

export default function DeliveryCard({ delivery, label, pickupTime, expanded, onToggle }) {
  return (
    <article className={styles.delivery}>
      <div>
        <div className={styles.deliveryLabel}>
          {label} · ORDRE {delivery.orderId}
        </div>
        <h3 className={styles.deliveryName}>{delivery.restaurantName}</h3>
        <p className={styles.deliveryRoute}>Forventet afhentning: {pickupTime}</p>
      </div>
      <button
        type="button"
        className={cx(ui.btn, ui.btnDark, ui.btnSmall)}
        aria-expanded={expanded}
        onClick={onToggle}
      >
        {expanded ? 'Skjul detaljer' : 'Se detaljer'}
      </button>
    </article>
  );
}
