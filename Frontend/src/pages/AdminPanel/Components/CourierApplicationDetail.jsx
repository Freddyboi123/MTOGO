import ui from '../../../styles/shared.module.css';
import styles from '../AdminPanel.module.css';
import {
  regionLabels,
  timeOfDayLabels,
  vehicleLabels
} from '../../DriverApplication/DriverApplication';
import StatusTag from './StatusTag';
import ApplicationDecision from './ApplicationDecision';

export default function CourierApplicationDetail({ application, submitting, onDecide }) {
  const times = (application.timesOfDay ?? []).map((value) => timeOfDayLabels[value]).join(', ');

  return (
    <div className={ui.block}>
      <h2 className={styles.caseTitle}>
        {application.firstname} {application.lastname}
      </h2>
      <p className={styles.caseId}>Chauffør · {application.id}</p>
      <div>
        <StatusTag status={application.status} />
      </div>

      <div className={styles.caseSection}>
        <div className={ui.sectionLabel}>ANSØGER</div>
        <p className={styles.caseValue}>
          {application.firstname} {application.lastname} · {application.email}
        </p>
        {application.phoneNumber && <p className={styles.caseNote}>{application.phoneNumber}</p>}
      </div>

      <div className={styles.caseSection}>
        <div className={ui.sectionLabel}>LEVERINGSOPLYSNINGER</div>
        <p className={styles.caseValue}>
          {vehicleLabels[application.vehicle] || 'Intet køretøj angivet'}
        </p>
        <p className={styles.caseNote}>{regionLabels[application.region] || 'Intet område angivet'}</p>
        <p className={styles.caseNote}>{application.weeklyHours} timer om ugen</p>
        <p className={styles.caseNote}>{times}</p>
      </div>

      <ApplicationDecision
        application={application}
        approveLabel="Godkend chauffør"
        submitting={submitting}
        onDecide={onDecide}
      />
    </div>
  );
}
