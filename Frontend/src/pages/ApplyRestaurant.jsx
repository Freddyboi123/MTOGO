import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

const steps = [
  {
    number: '01',
    title: 'Fortæl os om restauranten',
    body: 'Udfyld oplysninger og upload dine registreringsdokumenter.'
  },
  {
    number: '02',
    title: 'Vi gennemgår din ansøgning',
    body: 'Følg status direkte på din profil.'
  },
  {
    number: '03',
    title: 'Gør klar til første ordre',
    body: 'Tilføj menu, billeder og åbningstider i dit restaurantpanel.'
  }
];

export default function ApplyRestaurant() {
  return (
    <>
      <SiteHeader variant="app" />

      <section className="page" style={{ paddingTop: 40 }}>
        <p className="eyebrow">Bliv restaurantpartner</p>
        <h1 className="display" style={{ fontSize: 44, marginTop: 14 }}>
          Del din gode smag med byen.
        </h1>
        <p className="lead" style={{ marginTop: 20 }}>
          Ansøg om at få din restaurant på MTOGO. Vi hjælper dig godt i gang.
        </p>
      </section>

      <section className="page apply-page" style={{ marginTop: 36 }}>
        <aside className="apply-aside">
          <h2>
            Dit køkken.
            <br />
            Flere gæster.
          </h2>
          <p className="sub">
            Fokusér på maden.
            <br />
            Vi gør det lettere at nå ud.
          </p>
          <div className="apply-steps">
            {steps.map((step) => (
              <div key={step.number}>
                <div className="num">{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </aside>

        <form className="apply-form" onSubmit={(event) => event.preventDefault()}>
          <p className="required">Felter markeret med * skal udfyldes.</p>

          <h2>01  Restauranten</h2>
          <div className="stack">
            <div className="field">
              <label htmlFor="restaurant-name">Restaurantnavn *</label>
              <input id="restaurant-name" placeholder="Nabo Trattoria" />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="cvr">CVR-nummer *</label>
                <input id="cvr" placeholder="12345678" />
              </div>
              <div className="field">
                <label htmlFor="cuisine">Køkkentype *</label>
                <select id="cuisine" defaultValue="Italiensk">
                  <option>Italiensk</option>
                  <option>Burger</option>
                  <option>Sushi</option>
                  <option>Asiatisk</option>
                  <option>Grønt &amp; sundt</option>
                  <option>Indisk</option>
                </select>
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="restaurant-address">Restaurantadresse *</label>
                <input id="restaurant-address" placeholder="Nørrebrogade 88" />
              </div>
              <div className="field">
                <label htmlFor="restaurant-city">Postnummer og by *</label>
                <input id="restaurant-city" placeholder="2200 København N" />
              </div>
            </div>
          </div>

          <h2>02  Kontaktperson</h2>
          <div className="stack">
            <div className="field-row">
              <div className="field">
                <label htmlFor="contact-first">Fornavn *</label>
                <input id="contact-first" placeholder="Sofie" />
              </div>
              <div className="field">
                <label htmlFor="contact-last">Efternavn *</label>
                <input id="contact-last" placeholder="Andersen" />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="contact-email">E-mail *</label>
                <input id="contact-email" type="email" placeholder="sofie.a@email.dk" />
              </div>
              <div className="field">
                <label htmlFor="contact-phone">Telefonnummer *</label>
                <input id="contact-phone" placeholder="+45 28 34 56 78" />
              </div>
            </div>
          </div>

          <h2>03  Registrering og dokumenter</h2>
          <div className="upload-row">
            <div className="upload">
              <strong>CVR-registrering *</strong>
              <span>PDF, JPG eller PNG · maks. 10 MB</span>
              <span className="file">CVR-registrering.pdf  ·  Skift fil</span>
            </div>
            <div className="upload">
              <strong>Fødevaregistrering *</strong>
              <span>PDF, JPG eller PNG · maks. 10 MB</span>
              <span className="file">Fødevaregistrering.pdf  ·  Skift fil</span>
            </div>
          </div>

          <label className="checkbox" style={{ marginTop: 28 }}>
            <input type="checkbox" />
            Jeg bekræfter oplysningerne og accepterer partnervilkårene og privatlivspolitikken.
          </label>

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 28 }}>
            Send restaurantansøgning
          </button>
          <p className="field-hint" style={{ marginTop: 20 }}>
            Du kan følge status på Min profil. Vi kontakter dig, hvis der mangler oplysninger.
          </p>
        </form>
      </section>

      <SiteFooter variant="slim" />
    </>
  );
}
