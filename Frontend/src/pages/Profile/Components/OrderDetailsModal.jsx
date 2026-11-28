import { useEffect } from 'react';
import ui from '../../../styles/shared.module.css';
import styles from '../Profile.module.css';

export default function OrderDetailsModal({ order, formatPrice, statusText, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleString('da-DK', { dateStyle: 'medium', timeStyle: 'short' })
    : '';

  const active = order.status !== 'DELIVERED' && order.status !== 'CANCELLED';
  const expectedDelivery = order.expectedDeliveryAt && active
    ? new Date(order.expectedDeliveryAt).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={order.restaurantName}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHead}>
          <h2>{order.restaurantName}</h2>
          <button type="button" className={styles.modalClose} aria-label="Luk" onClick={onClose}>
            ×
          </button>
        </div>

        <dl className={styles.orderMeta}>
          <div>
            <dt>Dato</dt>
            <dd>{date}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{statusText(order.status)}</dd>
          </div>
          {expectedDelivery && (
            <div>
              <dt>Forventet levering</dt>
              <dd>ca. kl. {expectedDelivery}</dd>
            </div>
          )}
        </dl>

        <ul className={styles.orderLines}>
          {(order.lines ?? []).map((line) => (
            <li key={line.menuItemId}>
              <span>
                {line.quantity} × {line.itemName}
              </span>
              <span>{formatPrice(line.unitPrice * line.quantity)}</span>
            </li>
          ))}
        </ul>

        <hr className={ui.divider} />

        <div className={ui.sumTotal}>
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
