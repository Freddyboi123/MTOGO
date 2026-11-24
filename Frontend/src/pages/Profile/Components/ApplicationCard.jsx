import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../Profile.module.css';

export default function ApplicationCard({ application, statusLabels, onEdit }) {
  return (
    <article className={styles.statusCard}>
      <div className={ui.sectionLabel}>Restaurantpartner</div>
      <h3>{application.restaurantName}</h3>
      <div>
        <span className={cx(ui.tagWarn, styles.statusTag)}>
          {statusLabels[application.status]}
        </span>
      </div>
      <p className={styles.statusMeta}>
        Indsendt {new Date(application.createdAt).toLocaleDateString('da-DK')}
      </p>
      {application.adminMessage && <p className={styles.statusBody}>{application.adminMessage}</p>}
      {application.status === 'MORE_INFORMATION_NEEDED' && (
        <button
          className={cx(ui.btn, ui.btnOutline, ui.btnSmall, ui.btnBlock, styles.statusAction)}
          onClick={() => onEdit(application)}
        >
          Ret og send igen →
        </button>
      )}
    </article>
  );
}
