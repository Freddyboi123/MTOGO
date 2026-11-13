import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { restaurantApplications } from '../data/mtogo';

const activity = [
  { when: '10. nov. · 14.32', text: 'Ansøgning modtaget fra Sofie Andersen.' },
  { when: '11. nov. · 09.10', text: 'CVR-oplysninger kontrolleret.' },
  { when: '11. nov. · 09.15', text: 'Sagen er klar til din vurdering.' }
];

export default function AdminRestaurantApplication() {
  const [selected, setSelected] = useState(restaurantApplications[0]);

  return (
    <AdminLayout breadcrumb="Administration  /  Ansøgninger">
      <div className="dash-head">
        <div>
          <p className="eyebrow">Partneradministration</p>
          <h1>Ansøgninger</h1>
          <p className="lead">
            Gennemgå oplysninger og dokumenter, før du giver adgang til MTOGO.
          </p>
        </div>
      </div>

      <div className="tabs">
        <button className="tab active">Restauranter · 3</button>
        <Link to="/admin/ansoegninger/chauffoer" className="tab">
          Chauffører · 3
        </Link>
        <span className="right">6 ansøgninger afventer handling</span>
      </div>

      <div className="split">
        <div>
          <div className="panel" style={{ marginTop: 20, padding: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 22 }}>
              Restaurantansøgninger
            </h2>
            <div className="list-head">
              <span>Navn / ansøger</span>
              <span>Modtaget</span>
              <span>Status</span>
            </div>
            {restaurantApplications.map((application) => (
              <div
                key={application.id}
                className={application.id === selected.id ? 'list-row active' : 'list-row'}
                onClick={() => setSelected(application)}
              >
                <div>
                  <strong>{application.name}</strong>
                  <span>{application.applicant}</span>
                </div>
                <span>{application.received}</span>
                <span className={application.status === 'Ny' ? 'tag' : 'tag tag-warn'}>
                  {application.status}
                </span>
              </div>
            ))}
            <p className="field-hint" style={{ marginTop: 22, paddingLeft: 20 }}>
              Viser 3 ansøgninger  ·  Nyeste først
            </p>
          </div>

          <div className="block">
            <h2>Seneste aktivitet</h2>
            <div className="timeline">
              {activity.map((entry) => (
                <div key={entry.when}>
                  <div className="when">{entry.when}</div>
                  <p>{entry.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="block" style={{ marginTop: 20 }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 26 }}>
            {selected.name}
          </h2>
          <p className="muted" style={{ fontSize: 13, marginTop: 14 }}>
            Restaurant · {selected.id}
          </p>
          <span className="tag tag-warn" style={{ marginTop: 16 }}>
            {selected.status}
          </span>

          <div style={{ marginTop: 32 }}>
            <div className="label" style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>
              ANSØGER
            </div>
            <p style={{ marginTop: 12 }}>{selected.applicant} · sofie.a@email.dk</p>
            <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>
              +45 28 34 56 78
            </p>
          </div>

          <div style={{ marginTop: 28 }}>
            <div className="label" style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>
              RESTAURANTOPLYSNINGER
            </div>
            <p style={{ marginTop: 12 }}>Nørrebrogade 88, 2200 København N</p>
            <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>
              CVR 12345678 · Italiensk · 11.00–22.00
            </p>
          </div>

          <div style={{ marginTop: 28 }}>
            <div className="label" style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>
              DOKUMENTER
            </div>
            <div className="doc">
              <span>CVR-registrering.pdf</span>
              <span className="state">Kontrolleret  ·  Se →</span>
            </div>
            <div className="doc">
              <span>Fødevaregistrering.pdf</span>
              <span className="state">Vedhæftet  ·  Se →</span>
            </div>
          </div>

          <div className="field" style={{ marginTop: 28 }}>
            <label htmlFor="applicant-message">Besked til ansøger</label>
            <textarea
              id="applicant-message"
              placeholder="Skriv en begrundelse ved afvisning, eller bed om yderligere oplysninger…"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 144px', gap: 12, marginTop: 24 }}>
            <button className="btn btn-primary btn-sm">Godkend restaurant</button>
            <button className="btn btn-outline btn-sm">Afvis</button>
          </div>
          <button className="btn btn-outline btn-sm btn-block" style={{ marginTop: 14 }}>
            Bed om oplysninger
          </button>
          <p className="field-hint" style={{ marginTop: 20 }}>
            Ansøger får besked om din afgørelse på e-mail.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
