import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../DriverApplication.module.css';

export default function DriverApplicationCard({ application, labels, onEdit }) {
  const times = (application.timesOfDay ?? []).map((value) => labels.timeOfDay[value]).join(', ');

  return (
    <article className={styles.card}>
      <div className={ui.sectionLabel}>Chaufførpartner</div>
      <h3>
        {labels.vehicle[application.vehicle]} · {labels.region[application.region]}
      </h3>
      <div>
        <span className={cx(ui.tagWarn, styles.statusTag)}>
          {labels.status[application.status]}
        </span>
      </div>
      <p className={styles.meta}>
        {application.weeklyHours} timer om ugen · {times}
      </p>
      <p className={styles.meta}>
        Indsendt {new Date(application.createdAt).toLocaleDateString('da-DK')}
      </p>
      {application.adminMessage && <p className={styles.body}>{application.adminMessage}</p>}
      {application.status === 'MORE_INFORMATION_NEEDED' && (
        <button
          className={cx(ui.btn, ui.btnOutline, ui.btnSmall, ui.btnBlock, styles.action)}
          onClick={() => onEdit(application)}
        >
          Ret og send igen →
        </button>
      )}
    </article>
  );
}
