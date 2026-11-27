import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../AdminPanel.module.css';

export default function ApplicationList({ applications, selectedId, statusLabels, statusTagClasses, onSelect }) {
  return (
    <div className={styles.listPanel}>
      <h2 className={styles.listTitle}>Restaurantansøgninger</h2>
      <div className={styles.listHead}>
        <span>Navn / ansøger</span>
        <span>Modtaget</span>
        <span>Status</span>
      </div>
      {applications.map((application) => (
        <div
          key={application.id}
          className={application.id === selectedId ? styles.listRowActive : styles.listRow}
          onClick={() => onSelect(application.id)}
        >
          <div>
            <strong>{application.restaurantName}</strong>
            <span>{application.applicantName}</span>
          </div>
          <span>{new Date(application.createdAt).toLocaleDateString('da-DK')}</span>
          <span className={statusTagClasses[application.status]}>
            {statusLabels[application.status]}
          </span>
        </div>
      ))}
      <p className={cx(ui.fieldHint, styles.listFoot)}>
        Viser {applications.length} ansøgninger  ·  Nyeste først
      </p>
    </div>
  );
}
