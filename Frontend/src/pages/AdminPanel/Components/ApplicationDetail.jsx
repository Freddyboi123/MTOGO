import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../AdminPanel.module.css';
import ApplicationDecision from './ApplicationDecision';

export default function ApplicationDetail({ application, statusLabels, statusTagClasses, submitting, onDecide }) {
  const pending = application.status === 'PENDING';

  return (
    <div className={ui.block}>
      <h2 className={styles.caseTitle}>{application.restaurantName}</h2>
      <p className={styles.caseId}>Restaurant · {application.id}</p>
      <div>
        <span
          key={application.status}
          className={cx(
            statusTagClasses[application.status],
            styles.caseTag,
            !pending && styles.caseTagChanged
          )}
        >
          {statusLabels[application.status]}
        </span>
      </div>

      <div className={styles.caseSection}>
        <div className={ui.sectionLabel}>ANSØGER</div>
        <p className={styles.caseValue}>
          {application.applicantName} · {application.email}
        </p>
        <p className={styles.caseNote}>{application.phoneNumber}</p>
      </div>

      <div className={styles.caseSection}>
        <div className={ui.sectionLabel}>RESTAURANTOPLYSNINGER</div>
        <p className={application.addressInUse ? styles.addressWarning : styles.caseValue}>
          {application.street}, {application.postalCode} {application.city}
        </p>
        {application.addressInUse && (
          <p className={styles.addressWarning}>
            Der findes allerede en restaurant på denne adresse. Undersøg det nærmere.
          </p>
        )}
        <p className={styles.caseNote}>CVR {application.cvr}</p>
        {application.description && <p className={styles.caseNote}>{application.description}</p>}
      </div>

      <ApplicationDecision
        application={application}
        approveLabel="Godkend restaurant"
        submitting={submitting}
        onDecide={onDecide}
      />
    </div>
  );
}
