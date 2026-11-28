import { useState } from 'react';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../AdminPanel.module.css';

export default function ApplicationDecision({ application, approveLabel, submitting, onDecide }) {
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

  if (!pending) {
    return (
      application.adminMessage && (
        <div className={styles.caseSection}>
          <div className={ui.sectionLabel}>BESKED TIL ANSØGER</div>
          <p className={styles.caseValue}>{application.adminMessage}</p>
        </div>
      )
    );
  }

  return (
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
          {submitting ? 'Gemmer…' : approveLabel}
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
  );
}
