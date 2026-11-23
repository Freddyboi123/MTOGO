import { useState } from 'react';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../AdminRestaurantApplication.module.css';

export default function ApplicationDetail({ application, statusLabels, onDecide }) {
  const [message, setMessage] = useState('');
  const pending = application.status === 'PENDING';

  return (
    <div className={ui.block}>
      <h2 className={styles.caseTitle}>{application.restaurantName}</h2>
      <p className={styles.caseId}>Restaurant · {application.id}</p>
      <div>
        <span className={cx(ui.tagWarn, styles.caseTag)}>{statusLabels[application.status]}</span>
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

      {pending ? (
        <>
          <div className={cx(ui.field, styles.caseSection)}>
            <label htmlFor="applicant-message">Besked til ansøger</label>
            <textarea
              id="applicant-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Skriv en begrundelse ved afvisning, eller bed om yderligere oplysninger…"
            />
          </div>

          <div className={styles.decision}>
            <button
              className={cx(ui.btn, ui.btnPrimary, ui.btnSmall)}
              onClick={() => onDecide(application.id, 'APPROVED', message)}
            >
              Godkend restaurant
            </button>
            <button
              className={cx(ui.btn, ui.btnOutline, ui.btnSmall)}
              onClick={() => onDecide(application.id, 'REJECTED', message)}
            >
              Afvis
            </button>
          </div>
          <button
            className={cx(ui.btn, ui.btnOutline, ui.btnSmall, ui.btnBlock, styles.secondaryAction)}
            onClick={() => onDecide(application.id, 'MORE_INFORMATION_NEEDED', message)}
          >
            Bed om oplysninger
          </button>
        </>
      ) : (
        application.adminMessage && (
          <div className={styles.caseSection}>
            <div className={ui.sectionLabel}>BESKED TIL ANSØGER</div>
            <p className={styles.caseValue}>{application.adminMessage}</p>
          </div>
        )
      )}
    </div>
  );
}
