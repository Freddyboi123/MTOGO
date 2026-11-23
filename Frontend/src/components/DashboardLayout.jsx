import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { getUserName, logout } from '../utils/api';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout({ role, items, breadcrumb, user, helpLink = false, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const name = getUserName() ?? user;

  function handleLogout() {
    logout();
    navigate('/login');
  }

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
              className={({ isActive }) =>
                isActive || (item.activePath && pathname.startsWith(item.activePath)) ? styles.navLinkActive : styles.navLink
              }
            >
              <span>{item.label}</span>
              {item.count !== undefined && <span>{item.count}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className={styles.main}>
        <div className={styles.top}>
          <span>{breadcrumb}</span>
          <div className={styles.userMenu}>
            <button className={styles.userButton} onClick={() => setMenuOpen(!menuOpen)}>{name} ▾</button>
            {menuOpen && (
              <div className={styles.userDropdown}>
                {helpLink && <Link to="/help">Hjælp & kontakt</Link>}
                <Link to="/">← Tilbage til MTOGO</Link>
                <button onClick={handleLogout}>Log ud</button>
              </div>
            )}
          </div>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
