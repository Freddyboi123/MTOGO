import { getUser } from '../../../utils/api';
import { roleLabels } from '../../../data/mtogo';
import styles from '../Profile.module.css';

export default function ProfileNav({ sections, section, onSelect, onLogout }) {
  const user = getUser();
  const role = (user.roles ?? []).map((name) => roleLabels[name]).find(Boolean);

  return (
    <nav className={styles.nav}>
      <div className={styles.who}>
        <strong>
          {user.name} {user.lastName}
        </strong>
        {role && <span>{role}</span>}
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
