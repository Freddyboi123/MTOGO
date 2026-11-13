import { Link, NavLink } from 'react-router-dom';

export default function DashboardLayout({ role, items, breadcrumb, user, children }) {
  return (
    <div className="dash">
      <aside className="dash-side">
        <div className="brand">MTOGO</div>
        <div className="role">{role}</div>
        <nav>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              <span>{item.label}</span>
              {item.count && <span>{item.count}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="bottom">
          <a href="#hjaelp">Hjælp &amp; kontakt</a>
          <Link to="/">← Tilbage til MTOGO</Link>
          <Link to="/login">Log ud</Link>
        </div>
      </aside>
      <div className="dash-main">
        <div className="dash-top">
          <span>{breadcrumb}</span>
          <span>{user} ▾</span>
        </div>
        <div className="dash-body">{children}</div>
      </div>
    </div>
  );
}
