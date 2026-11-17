import styles from './StatCard.module.css';

export default function StatCard({ label, value, note }) {
  return (
    <div className={styles.stat}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
      <div className={styles.note}>{note}</div>
    </div>
  );
}
