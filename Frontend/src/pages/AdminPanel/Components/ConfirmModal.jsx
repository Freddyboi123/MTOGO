import { useState } from 'react';
import Modal from '../../../components/Modal';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../AdminPanel.module.css';

export default function ConfirmModal({
  title,
  message,
  confirmLabel,
  reasonLabel,
  reasonPlaceholder,
  reasonRequired = true,
  danger = false,
  onConfirm,
  onClose
}) {
  const [reason, setReason] = useState('');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  async function confirm() {
    if (reasonLabel && reasonRequired && !reason.trim()) {
      setError('Skriv en begrundelse, før du fortsætter.');
      return;
    }
    setWorking(true);
    setError('');
    try {
      await onConfirm(reason.trim());
    } catch (err) {
      setError(err.message);
      setWorking(false);
    }
  }

  return (
    <Modal
      open
      size="sm"
      title={title}
      onClose={onClose}
      footer={
        <>
          <button type="button" className={cx(ui.btn, ui.btnOutline, ui.btnSmall)} onClick={onClose}>
            Annuller
          </button>
          <button
            type="button"
            className={cx(ui.btn, danger ? ui.btnPrimary : ui.btnDark, ui.btnSmall)}
            disabled={working}
            onClick={confirm}
          >
            {working ? 'Arbejder…' : confirmLabel}
          </button>
        </>
      }
    >
      <p className={styles.modalText}>{message}</p>
      {reasonLabel && (
        <div className={ui.field}>
          <label htmlFor="confirm-reason">{reasonLabel}</label>
          <textarea
            id="confirm-reason"
            value={reason}
            placeholder={reasonPlaceholder}
            onChange={(e) => {
              setReason(e.target.value);
              setError('');
            }}
          />
        </div>
      )}
      {error && <p className={styles.errorText}>{error}</p>}
    </Modal>
  );
}
