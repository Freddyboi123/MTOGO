import { customer } from '../../../data/mtogo';
import styles from '../Profile.module.css';

export default function ProfileNav({ sections, section, onSelect, onLogout }) {
  return (
    <nav className={styles.nav}>
      <div className={styles.who}>
        <strong>
          {customer.firstName} {customer.lastName}
        </strong>
        <span>{customer.since}</span>
      </div>
      {sections.map((name) => (
        <button
          key={name}
          className={name === section ? styles.navButtonActive : styles.navButton}
          onClick={() => onSelect(name)}
        >
          {name}
        </button>
      ))}
      <button className={styles.logout} onClick={onLogout}>
        Log ud
      </button>
    </nav>
  );
}
