import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import StatCard from '../components/StatCard';
import { adminRestaurants } from '../data/mtogo';

export default function AdminRestaurants() {
  const [selected, setSelected] = useState(adminRestaurants[0].name);

  return (
    <AdminLayout breadcrumb="Administration  /  Restauranter">
      <div className="dash-head">
        <div>
          <p className="eyebrow">Partneradministration</p>
          <h1>Restauranter</h1>
          <p className="lead">
            Hold styr på dine restaurantpartnere, åbning og tilgængelighed.
          </p>
        </div>
        <button className="btn btn-dark btn-sm">+ Tilføj restaurant</button>
      </div>

      <div className="stat-grid">
        <StatCard label="Restauranter i alt" value="24" note="På tværs af København" />
        <StatCard label="Aktive partnere" value="21" note="3 restauranter er pauset" />
        <StatCard label="Nye ansøgninger" value="3" note="Afventer behandling" />
      </div>

      <div className="panel">
        <div className="panel-head">
          <input className="search-input" placeholder="Søg efter navn eller e-mail…" />
          <select className="select-input" defaultValue="Alle statusser">
            <option>Alle statusser</option>
            <option>Aktiv</option>
            <option>Pauset</option>
          </select>
          <span className="right">6 af 24 restauranter</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Restaurant</th>
              <th>Kontaktperson</th>
              <th>Område</th>
              <th>Status</th>
              <th>Handling</th>
            </tr>
          </thead>
          <tbody>
            {adminRestaurants.map((row) => (
              <tr
                key={row.name}
                className={row.name === selected ? 'selected' : undefined}
                onClick={() => setSelected(row.name)}
              >
                <td>{row.name}</td>
                <td>{row.contact}</td>
                <td>{row.area}</td>
                <td>
                  <span className={row.status === 'Aktiv' ? 'tag' : 'tag tag-warn'}>
                    {row.status}
                  </span>
                </td>
                <td className="link-accent">Rediger →</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-foot">
          <span>Viser 1–6 af 24 restauranter</span>
          <span>←  Forrige     1   2   3     Næste →</span>
        </div>
      </div>

      <div className="detail">
        <div>
          <h3>Osteria Nørrebro</h3>
          <p>Restaurant-ID R-001 · Nørrebrogade 42, 2200 København N</p>
          <p>Kontakt: luca@osteria.dk  ·  +45 22 34 56 78</p>
          <p>Åbent i dag 11.00–22.00  ·  Leveringsområde: 4 km</p>
        </div>
        <div className="detail-actions">
          <button className="btn btn-dark btn-sm">Rediger oplysninger</button>
          <button className="btn btn-outline btn-sm">Pause restaurant</button>
        </div>
      </div>
    </AdminLayout>
  );
}
