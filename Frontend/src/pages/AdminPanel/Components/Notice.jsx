import { useEffect } from 'react';
import styles from '../AdminPanel.module.css';

export default function Notice({ notice, onClose }) {
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(onClose, 7000);
    return () => clearTimeout(timer);
  }, [notice, onClose]);

  if (!notice) return null;

  return (
    <div
      key={notice.id}
      role="status"
      className={notice.error ? styles.feedbackRejected : styles.feedbackApproved}
    >
      <span className={styles.feedbackIcon}>{notice.error ? '✕' : '✓'}</span>
      <div>
        <strong>{notice.title}</strong>
        {notice.text && <p>{notice.text}</p>}
      </div>
      <button className={styles.feedbackClose} onClick={onClose} aria-label="Luk besked">
        ×
      </button>
    </div>
  );
}

export function makeNotice(title, text, error = false) {
  return { id: Date.now(), title, text, error };
}
