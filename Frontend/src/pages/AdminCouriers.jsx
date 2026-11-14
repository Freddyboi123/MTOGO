import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import StatCard from '../components/StatCard';
import { adminCouriers } from '../data/mtogo';

export default function AdminCouriers() {
  const [selected, setSelected] = useState(adminCouriers[0].name);

  return (
    <AdminLayout breadcrumb="Administration  /  Chauffører">
      <div className="dash-head">
        <div>
          <p className="eyebrow">Partneradministration</p>
          <h1>Chauffører</h1>
          <p className="lead">
            Administrer adgang, leveringsområder og dine aktive chauffører.
          </p>
        </div>
        <button className="btn btn-dark btn-sm">+ Tilføj chauffør</button>
      </div>

      <div className="stat-grid">
        <StatCard label="Godkendte chauffører" value="18" note="Klar til at levere" />
        <StatCard label="Online lige nu" value="12" note="8 på tur · 4 tilgængelige" />
        <StatCard label="Nye ansøgninger" value="3" note="Afventer behandling" />
      </div>

      <div className="panel">
        <div className="panel-head">
          <input className="search-input" placeholder="Søg efter navn eller e-mail…" />
          <select className="select-input" defaultValue="Alle statusser">
            <option>Alle statusser</option>
            <option>Tilgængelig</option>
            <option>På levering</option>
            <option>Offline</option>
            <option>Pauset</option>
          </select>
          <span className="right">6 af 18 chauffører</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Chauffør</th>
              <th>E-mail</th>
              <th>Køretøj</th>
              <th>Status</th>
              <th>Handling</th>
            </tr>
          </thead>
          <tbody>
            {adminCouriers.map((row) => (
              <tr
                key={row.name}
                className={row.name === selected ? 'selected' : undefined}
                onClick={() => setSelected(row.name)}
              >
                <td>{row.name}</td>
                <td>{row.email}</td>
                <td>{row.vehicle}</td>
                <td>
                  <span className={row.status === 'Tilgængelig' ? 'tag' : 'tag tag-warn'}>
                    {row.status}
                  </span>
                </td>
                <td className="link-accent">Rediger →</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-foot">
          <span>Viser 1–6 af 18 chauffører</span>
          <span>←  Forrige     1   2   3     Næste →</span>
        </div>
      </div>

      <div className="detail">
        <div>
          <h3>Jonas Nielsen</h3>
          <p>Chauffør-ID D-014 · København N · Godkendt 2. november 2026</p>
          <p>Kontakt: jonas.n@email.dk  ·  +45 23 45 67 89</p>
          <p>Dokumenter godkendt  ·  128 leverancer  ·  Bedømmelse 4,9 / 5</p>
        </div>
        <div className="detail-actions">
          <button className="btn btn-dark btn-sm">Rediger chauffør</button>
          <button className="btn btn-outline btn-sm">Deaktiver adgang</button>
        </div>
      </div>
    </AdminLayout>
  );
}
