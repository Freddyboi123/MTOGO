import styles from '../AdminPanel.module.css';

const statuses = {
  ACTIVE: ['Aktiv', styles.statusApproved],
  PAUSED: ['Pause', styles.statusPending],
  FROZEN: ['Frosset', styles.statusRejected],

  AVAILABLE: ['Tilgængelig', styles.statusApproved],
  EN_ROUTE_TO_ORDER: ['På vej til ordre', styles.statusInfo],
  DELIVERING: ['Levering i gang', styles.statusInfo],
  OFFLINE: ['Offline', styles.statusPending],

  COMPLETED: ['Afsluttet', styles.statusApproved],
  CANCELLED: ['Annulleret', styles.statusRejected],
  PROCESSING: ['Under behandling', styles.statusInfo],
  REFUNDED: ['Refunderet', styles.statusPending],
  REQUEST: ['Anmodning', styles.statusPending],

  PENDING: ['Ny', styles.statusPending],
  APPROVED: ['Godkendt', styles.statusApproved],
  REJECTED: ['Afvist', styles.statusRejected],
  MORE_INFORMATION_NEEDED: ['Mangler oplysninger', styles.statusInfo]
};

export default function StatusTag({ status }) {
  const [label, className] = statuses[status] ?? [status, styles.statusPending];
  return <span className={className}>{label}</span>;
}
