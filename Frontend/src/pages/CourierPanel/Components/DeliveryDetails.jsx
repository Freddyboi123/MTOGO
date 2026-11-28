import React from 'react';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../CourierPanel.module.css';
import DeliveryEstimate from './DeliveryEstimate';

export default function DeliveryDetails({
  selected,
  myDeliveries,
  pickupAddress,
  deliveryAddress,
  pickupTime,
  statusLabel,
  actionLabel,
  updating,
  accepting,
  savingEstimate,
  onSaveEstimate,
  onStatusUpdate,
  onAccept
}) {
  return (
    <section aria-label="Ordredetaljer" className={ui.block}>
      <h2 className={styles.detailsTitle}>Ordredetaljer</h2>
      {!selected ? (
        <p className={styles.message}>Vælg en levering for at se afhentnings- og leveringsadresse.</p>
      ) : (
        <>
          <p className={styles.orderNumber}>Ordrenummer: {selected.orderId}</p>
          <div className={styles.detail}>
            <span className={ui.sectionLabel}>RESTAURANT / AFHENTNING</span>
            <strong>{selected.restaurantName}</strong>
            <p>{pickupAddress}</p>
          </div>
          <div className={styles.detail}>
            <span className={ui.sectionLabel}>KUNDE / LEVERING</span>
            <p>{deliveryAddress}</p>
          </div>
          <div className={styles.detail}>
            <span className={ui.sectionLabel}>FORVENTET AFHENTNING</span>
            <p>{pickupTime}</p>
          </div>
          {myDeliveries && selected.orderStatus !== 'CANCELLED' && (
            <DeliveryEstimate
              key={selected.orderId}
              delivery={selected}
              saving={savingEstimate === selected.orderId}
              onSave={onSaveEstimate}
            />
          )}
          {myDeliveries ? (
            <div className={styles.detail}>
              <span className={ui.sectionLabel}>LEVERINGSSTATUS</span>
              <p>{statusLabel}</p>
              {actionLabel && (
                <button
                  type="button"
                  className={cx(ui.btn, ui.btnDark)}
                  disabled={updating !== null}
                  onClick={() => onStatusUpdate(selected)}
                >
                  {actionLabel}
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              className={cx(ui.btn, ui.btnDark)}
              disabled={accepting !== null}
              onClick={() => onAccept(selected.orderId)}
            >
              {accepting === selected.orderId ? 'Accepterer...' : 'Accepter levering'}
            </button>
          )}
        </>
      )}
    </section>
  );
}
