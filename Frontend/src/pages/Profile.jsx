import { useState } from 'react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { applications, customer } from '../data/mtogo';

const sections = [
  'Personlige oplysninger',
  'Leveringsadresse',
  'Mine ansøgninger',
  'Ordrehistorik',
  'Sikkerhed'
];

export default function Profile() {
  const [section, setSection] = useState(sections[0]);

  return (
    <>
      <SiteHeader variant="app" />

      <section className="page" style={{ paddingTop: 40 }}>
        <p className="eyebrow">Din MTOGO-konto</p>
        <h1 className="display" style={{ fontSize: 44, marginTop: 14 }}>
          Min profil
        </h1>
        <p className="lead" style={{ marginTop: 20 }}>
          Dine oplysninger, dine adresser og dine næste muligheder.
        </p>
      </section>

      <section className="page profile-page" style={{ marginTop: 36 }}>
        <nav className="profile-nav">
          <div className="who">
            <strong>
              {customer.firstName} {customer.lastName}
            </strong>
            <span>{customer.since}</span>
          </div>
          {sections.map((name) => (
            <button
              key={name}
              className={name === section ? 'active' : undefined}
              onClick={() => setSection(name)}
            >
              {name}
            </button>
          ))}
          <button style={{ marginTop: 24, color: 'var(--muted)' }}>Log ud</button>
        </nav>

        <div>
          <div className="block">
            <h2>Personlige oplysninger</h2>
            <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>
              Hold dine kontaktoplysninger opdateret.
            </p>
            <div className="stack">
              <div className="field-row">
                <div className="field">
                  <label htmlFor="profile-first">Fornavn</label>
                  <input id="profile-first" defaultValue={customer.firstName} />
                </div>
                <div className="field">
                  <label htmlFor="profile-last">Efternavn</label>
                  <input id="profile-last" defaultValue={customer.lastName} />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="profile-email">E-mail</label>
                  <input id="profile-email" defaultValue={customer.email} />
                </div>
                <div className="field">
                  <label htmlFor="profile-phone">Telefonnummer</label>
                  <input id="profile-phone" defaultValue={customer.phone} />
                </div>
              </div>
            </div>
            <button className="btn btn-dark btn-block" style={{ marginTop: 28 }}>
              Gem ændringer
            </button>
          </div>

          <div className="block">
            <h2>Din standardadresse</h2>
            <div className="stack">
              <div className="field">
                <label htmlFor="profile-street">Adresse</label>
                <input id="profile-street" defaultValue={customer.street} />
              </div>
              <div className="field-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="field">
                  <label htmlFor="profile-zip">Postnummer</label>
                  <input id="profile-zip" defaultValue={customer.postalCode} />
                </div>
                <div className="field">
                  <label htmlFor="profile-city">By</label>
                  <input id="profile-city" defaultValue={customer.city} />
                </div>
                <div className="field">
                  <label htmlFor="profile-floor">Etage / dør</label>
                  <input id="profile-floor" defaultValue={customer.floor} />
                </div>
              </div>
            </div>
            <button className="btn btn-dark btn-block" style={{ marginTop: 28 }}>
              Gem leveringsadresse
            </button>
          </div>

          <div className="block">
            <h2>Adgangskode og sikkerhed</h2>
            <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>
              Vælg en stærk adgangskode for at beskytte din konto.
            </p>
            <button className="btn btn-outline btn-sm" style={{ marginTop: 20 }}>
              Skift adgangskode
            </button>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>Mine ansøgninger</h2>
          {applications.map((application) => (
            <article className="status-card" key={application.type}>
              <div className="label">{application.type.toUpperCase()}</div>
              <h3>{application.title}</h3>
              <span className="tag tag-warn" style={{ marginTop: 14 }}>
                {application.status}
              </span>
              <p className="meta">{application.submitted}</p>
              <p>{application.message}</p>
              <button className="btn btn-outline btn-sm btn-block">{application.action}</button>
            </article>
          ))}

          <article className="status-card">
            <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 24 }}>
              Har du spørgsmål?
            </h3>
            <p>Vi hjælper dig gerne videre med din konto eller din ansøgning.</p>
            <p className="link-accent" style={{ marginTop: 20 }}>
              Kontakt partnersupport →
            </p>
          </article>
        </div>
      </section>

      <SiteFooter variant="slim" />
    </>
  );
}
