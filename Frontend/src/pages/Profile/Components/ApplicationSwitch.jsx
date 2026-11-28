import styles from '../Profile.module.css';

export default function ApplicationSwitch({ options, selected, onSelect }) {
  return (
    <div className={styles.switch} role="tablist">
      {options.map((option) => (
        <button
          key={option.value}
          role="tab"
          aria-selected={option.value === selected}
          className={option.value === selected ? styles.switchActive : styles.switchOption}
          onClick={() => onSelect(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
