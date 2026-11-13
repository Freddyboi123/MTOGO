import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import { openDeliveries } from '../data/mtogo';

const items = [
  { to: '/chauffoerpanel', label: 'Leverancer' },
  { to: '/chauffoerpanel/ture', label: 'Mine ture' },
  { to: '/chauffoerpanel/indtjening', label: 'Indtjening' },
  { to: '/chauffoerpanel/dokumenter', label: 'Dokumenter' },
  { to: '/chauffoerpanel/indstillinger', label: 'Indstillinger' }
];

export default function CourierPanel() {
  return (
    <DashboardLayout
      role="Chaufførpartner"
      items={items}
      breadcrumb="Chauffør  /  Leverancer"
      user="Jonas Nielsen"
    >
      <div className="dash-head">
        <div>
          <p className="eyebrow">Godt at have dig på vejen, Jonas</p>
          <h1>Dine leverancer</h1>
          <p className="lead">København N · Cykel · Onsdag den 11. november</p>
        </div>
        <div className="dash-actions">
          <span className="online-pill">
            <span className="dot" />
            Du er online
          </span>
          <button className="btn btn-outline btn-sm">Gå offline</button>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Leveringer i dag" value="6" note="Tak for de gode ture" />
        <StatCard label="Indtjening i dag" value="224 kr." note="Før skat · ekskl. drikkepenge" />
        <StatCard label="Dine ture" value="1 aktiv" note="0 planlagte efterfølgende" />
      </div>

      <div className="split" style={{ gridTemplateColumns: '624px 1fr' }}>
        <div>
          <div className="section-head" style={{ marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 600 }}>Ledige leverancer</h2>
              <p className="muted" style={{ fontSize: 14, marginTop: 12 }}>
                3 ture i nærheden · opdateret lige nu
              </p>
            </div>
            <span className="link-quiet">Nærmest først ▾</span>
          </div>

          {openDeliveries.map((delivery) => (
            <article className="delivery-card" key={delivery.id}>
              <div>
                <div className="label">LEDIG · {delivery.id}</div>
                <h3>{delivery.restaurant}</h3>
                <p className="route">{delivery.route}</p>
                <p className="route">{delivery.distance}</p>
              </div>
              <div>
                <div className="pay">{delivery.pay}</div>
                <button className="btn btn-dark btn-sm" style={{ marginTop: 28 }}>
                  Tag levering
                </button>
              </div>
            </article>
          ))}

          <p className="field-hint" style={{ marginTop: 24 }}>
            Nye ture planlægges efter din aktive levering. Se ruten, før du accepterer.
          </p>
        </div>

        <div>
          <div className="block">
            <h2 style={{ fontSize: 24 }}>Din aktive levering</h2>
            <p className="label" style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginTop: 14 }}>
              ORDRE #1042 · 2 VARER
            </p>
            <div className="status-strip">På vej til afhentning · Maden er klar</div>

            <div className="stop">
              <div className="dot">1</div>
              <div>
                <div className="label">AFHENTNING</div>
                <strong>Osteria Nørrebro</strong>
                <span>Nørrebrogade 42, 2200 København N</span>
                <span>Margherita + Burrata · 2 poser</span>
              </div>
            </div>

            <div className="stop">
              <div className="dot">2</div>
              <div>
                <div className="label">LEVERING</div>
                <strong>Mikkel Hansen</strong>
                <span>Tagensvej 12, 1. th., 2200 København N</span>
                <span>
                  Ring på ved ankomst.  ·  <span className="link-accent">Ring til kunde →</span>
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 32,
                fontSize: 15,
                fontWeight: 500
              }}
            >
              <span>2,4 km · ca. 18 min</span>
              <span>Din betaling: 38 kr.</span>
            </div>

            <button className="btn btn-outline btn-block" style={{ marginTop: 24 }}>
              Åbn rute ↗
            </button>
            <button className="btn btn-primary btn-block" style={{ marginTop: 16 }}>
              Bekræft afhentning
            </button>
          </div>

          <div className="block">
            <h3 style={{ fontSize: 18, fontWeight: 600 }}>Brug for hjælp på turen?</h3>
            <p className="link-accent" style={{ marginTop: 16 }}>
              Kontakt leveringssupport →
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
