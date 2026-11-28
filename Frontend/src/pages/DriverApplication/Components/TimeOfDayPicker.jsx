import ui from '../../../styles/shared.module.css';
import styles from '../DriverApplication.module.css';

export default function TimeOfDayPicker({ labels, selected, onToggle }) {
  return (
    <fieldset className={styles.times}>
      <legend>Tid på døgnet *</legend>
      <div className={styles.timeOptions}>
        {Object.entries(labels).map(([value, label]) => (
          <label key={value} className={ui.checkbox}>
            <input
              type="checkbox"
              checked={selected.includes(value)}
              onChange={() => onToggle(value)}
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
