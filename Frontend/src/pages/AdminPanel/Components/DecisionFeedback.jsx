import styles from '../AdminPanel.module.css';

const feedbackIcons = {
  APPROVED: '✓',
  REJECTED: '✕',
  MORE_INFORMATION_NEEDED: '?'
};

const feedbackClasses = {
  APPROVED: styles.feedbackApproved,
  REJECTED: styles.feedbackRejected,
  MORE_INFORMATION_NEEDED: styles.feedbackInfo
};

export default function DecisionFeedback({ feedback, onClose }) {
  return (
    <div role="status" className={feedbackClasses[feedback.status]}>
      <span className={styles.feedbackIcon}>{feedbackIcons[feedback.status]}</span>
      <div>
        <strong>{feedback.title}</strong>
        <p>{feedback.mail}</p>
      </div>
      <button className={styles.feedbackClose} onClick={onClose} aria-label="Luk besked">
        ×
      </button>
    </div>
  );
}
