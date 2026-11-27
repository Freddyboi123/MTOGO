import styles from '../AdminPanel.module.css';

export default function RowActions({ actions }) {
  return (
    <div className={styles.rowActions}>
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          className={action.danger ? styles.actionDanger : styles.action}
          disabled={action.disabled}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
