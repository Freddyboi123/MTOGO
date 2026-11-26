import { useState } from 'react';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../AdminRestaurantApplication.module.css';

export default function ApplicationDetail({ application, statusLabels, statusTagClasses, submitting, onDecide }) {
  const [message, setMessage] = useState('');
  const [messageMissing, setMessageMissing] = useState(false);
  const pending = application.status === 'PENDING';

  function requestMoreInformation() {
    if (!message.trim()) {
      setMessageMissing(true);
      return;
    }
    onDecide(application.id, 'MORE_INFORMATION_NEEDED', message);
  }

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

      {pending ? (
        <>
          <div className={cx(ui.field, styles.caseSection)}>
            <label htmlFor="applicant-message">Besked til ansøger</label>
            <textarea
              id="applicant-message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setMessageMissing(false);
              }}
              placeholder="Skriv en begrundelse ved afvisning, eller bed om yderligere oplysninger…"
            />
            {messageMissing && (
              <p className={styles.errorText}>
                Skriv hvad der mangler, før du beder om flere oplysninger.
              </p>
            )}
          </div>

          <div className={styles.decision}>
            <button
              className={cx(ui.btn, ui.btnPrimary, ui.btnSmall)}
              disabled={submitting}
              onClick={() => onDecide(application.id, 'APPROVED', message)}
            >
              {submitting ? 'Gemmer…' : 'Godkend restaurant'}
            </button>
            <button
              className={cx(ui.btn, ui.btnOutline, ui.btnSmall)}
              disabled={submitting}
              onClick={() => onDecide(application.id, 'REJECTED', message)}
            >
              Afvis
            </button>
          </div>
          <button
            className={cx(ui.btn, ui.btnOutline, ui.btnSmall, ui.btnBlock, styles.secondaryAction)}
            disabled={submitting}
            onClick={requestMoreInformation}
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
