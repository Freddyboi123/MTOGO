import { Link, NavLink } from 'react-router-dom';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout({ role, items, breadcrumb, user, children }) {
  return (
    <div className={styles.dash}>
      <aside className={styles.side}>
        <div className={styles.brand}>MTOGO</div>
        <div className={styles.role}>{role}</div>

        <nav className={styles.nav}>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}
            >
              <span>{item.label}</span>
              {item.count !== undefined && <span>{item.count}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={styles.bottom}>
          <a href="#hjaelp">Hjælp &amp; kontakt</a>
          <Link to="/">← Tilbage til MTOGO</Link>
          <Link to="/login">Log ud</Link>
        </div>
      </aside>

      <div className={styles.main}>
        <div className={styles.top}>
          <span>{breadcrumb}</span>
          <span>{user} ▾</span>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
