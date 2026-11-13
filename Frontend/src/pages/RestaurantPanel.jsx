import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import { restaurant, restaurantMenuRows, restaurantOrders } from '../data/mtogo';

const items = [
  { to: '/restaurantpanel/overblik', label: 'Overblik' },
  { to: '/restaurantpanel/ordrer', label: 'Ordrer' },
  { to: '/restaurantpanel', label: 'Min restaurant' },
  { to: '/restaurantpanel/menu', label: 'Menu & varer' },
  { to: '/restaurantpanel/aabningstider', label: 'Åbningstider' },
  { to: '/restaurantpanel/udbetalinger', label: 'Udbetalinger' }
];

const openingHours = [
  { days: 'Mandag – torsdag', hours: '11.00 – 22.00' },
  { days: 'Fredag – lørdag', hours: '11.00 – 23.00' },
  { days: 'Søndag', hours: '12.00 – 22.00' }
];

export default function RestaurantPanel() {
  return (
    <DashboardLayout
      role="Restaurantpartner"
      items={items}
      breadcrumb="Osteria Nørrebro  /  Restaurantpanel"
      user="Luca Moretti"
    >
      <div className="dash-head">
        <div>
          <p className="eyebrow">Dit køkken på MTOGO</p>
          <h1>Min restaurant</h1>
          <p className="lead">
            Administrer din side, hold menuen frisk, og få overblik over dagens ordrer.
          </p>
        </div>
        <div className="dash-actions">
          <button className="btn btn-outline btn-sm">Se offentlig side ↗</button>
          <button className="btn btn-dark btn-sm">Gem ændringer</button>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Ordrer i dag" value="12" note="3 aktive lige nu" />
        <StatCard label="Omsætning i dag" value="2.486 kr." note="Før gebyrer og afregning" />
        <StatCard label="Gæsternes bedømmelse" value="4,8 / 5" note="240+ anmeldelser" />
      </div>

      <div className="split" style={{ gridTemplateColumns: '704px 1fr' }}>
        <div className="block" style={{ marginBottom: 0 }}>
          <h2>Restaurantoplysninger</h2>
          <div className="stack">
            <div className="field-row">
              <div className="field">
                <label htmlFor="panel-name">Navn</label>
                <input id="panel-name" defaultValue={restaurant.name} />
              </div>
              <div className="field">
                <label htmlFor="panel-cuisine">Køkken</label>
                <select id="panel-cuisine" defaultValue="Italiensk">
                  <option>Italiensk</option>
                  <option>Pizza</option>
                  <option>Pasta</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="panel-address">Adresse</label>
              <input id="panel-address" defaultValue="Nørrebrogade 42, 2200 København N" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Beskrivelse</div>
              <p className="muted" style={{ marginTop: 12, fontSize: 14 }}>
                {restaurant.description} <span className="link-accent">Rediger →</span>
              </p>
            </div>
          </div>
        </div>

        <div className="block" style={{ marginBottom: 0, padding: 0, overflow: 'hidden' }}>
          <div
            className="photo"
            style={{ height: 160, backgroundImage: `url(${restaurant.cover})` }}
          />
          <div style={{ padding: 20 }}>
            <button className="btn btn-outline btn-sm" style={{ marginTop: -56, marginBottom: 20 }}>
              Skift coverfoto
            </button>
            <h3 style={{ fontSize: 22, fontWeight: 600 }}>{restaurant.name}</h3>
            <p className="muted" style={{ fontSize: 13, marginTop: 10 }}>
              Italiensk · Pizza · Pasta
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 20
              }}
            >
              <span className="tag">Synlig og åben</span>
              <span className="link-quiet">Pause bestillinger</span>
            </div>
          </div>
        </div>
      </div>

      <div className="split" style={{ gridTemplateColumns: '704px 1fr' }}>
        <div className="panel" style={{ marginTop: 0 }}>
          <div className="panel-head">
            <div>
              <h2>Menu &amp; varer</h2>
              <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>
                Pizza · 4 af 12 varer
              </p>
            </div>
            <button className="btn btn-dark btn-sm" style={{ marginLeft: 'auto' }}>
              + Tilføj vare
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Vare</th>
                <th>Pris</th>
                <th>Tilgængelig</th>
                <th>Handling</th>
              </tr>
            </thead>
            <tbody>
              {restaurantMenuRows.map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td>{row.price}</td>
                  <td>{row.state} ▾</td>
                  <td className="muted">Rediger · Slet</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-foot">
            <span>Administrer kategorier →</span>
            <span>Se alle 12 varer →</span>
          </div>
        </div>

        <div className="block" style={{ marginTop: 0 }}>
          <h2>Åbning &amp; levering</h2>
          <div style={{ marginTop: 24 }}>
            {openingHours.map((row) => (
              <div
                key={row.days}
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}
              >
                <span style={{ fontSize: 14 }}>{row.days}</span>
                <span style={{ fontSize: 14 }}>{row.hours}</span>
              </div>
            ))}
          </div>
          <p className="link-quiet" style={{ marginTop: 20 }}>
            Rediger åbningstider →
          </p>
          <div className="field-row" style={{ marginTop: 28 }}>
            <div className="field">
              <label htmlFor="panel-min">Min. bestilling</label>
              <input id="panel-min" defaultValue="99 kr." />
            </div>
            <div className="field">
              <label htmlFor="panel-radius">Leveringsradius</label>
              <input id="panel-radius" defaultValue="4 km" />
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Aktive ordrer</h2>
          <span className="right">3 ordrer</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Ordre</th>
              <th>Kunde</th>
              <th>Indhold</th>
              <th>Beløb</th>
              <th>Status</th>
              <th>Handling</th>
            </tr>
          </thead>
          <tbody>
            {restaurantOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.items}</td>
                <td>{order.amount}</td>
                <td>{order.status}</td>
                <td className="link-accent">{order.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
