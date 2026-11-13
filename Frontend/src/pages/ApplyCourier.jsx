import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

const steps = [
  {
    number: '01',
    title: 'Udfyld din ansøgning',
    body: 'Fortæl om dig selv og dit køretøj.'
  },
  {
    number: '02',
    title: 'Få dine dokumenter godkendt',
    body: 'Du skal være fyldt 18 år og have ret til at arbejde i Danmark.'
  },
  {
    number: '03',
    title: 'Tag din første levering',
    body: 'Gå online, og vælg en ledig tur.'
  }
];

export default function ApplyCourier() {
  return (
    <>
      <SiteHeader variant="app" />

      <section className="page" style={{ paddingTop: 40 }}>
        <p className="eyebrow">Bliv chaufførpartner</p>
        <h1 className="display" style={{ fontSize: 44, marginTop: 14 }}>
          Gode måltider. På din vej.
        </h1>
        <p className="lead" style={{ marginTop: 20 }}>
          Ansøg som chauffør, og lever mad fra lokale køkkener til sultne naboer.
        </p>
      </section>

      <section className="page apply-page" style={{ marginTop: 36 }}>
        <aside className="apply-aside">
          <h2>
            Din by.
            <br />
            Dit næste stop.
          </h2>
          <p className="sub">
            Tag leverancer, når det passer dig.
            <br />
            Se rute og betaling på forhånd.
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

          <h2>01  Dine oplysninger</h2>
          <div className="stack">
            <div className="field-row">
              <div className="field">
                <label htmlFor="courier-first">Fornavn *</label>
                <input id="courier-first" placeholder="Sofie" />
              </div>
              <div className="field">
                <label htmlFor="courier-last">Efternavn *</label>
                <input id="courier-last" placeholder="Andersen" />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="courier-email">E-mail *</label>
                <input id="courier-email" type="email" placeholder="sofie.a@email.dk" />
              </div>
              <div className="field">
                <label htmlFor="courier-phone">Telefonnummer *</label>
                <input id="courier-phone" placeholder="+45 28 34 56 78" />
              </div>
            </div>
          </div>

          <h2>02  På vejen</h2>
          <div className="stack">
            <div className="field-row">
              <div className="field">
                <label htmlFor="vehicle">Køretøj *</label>
                <select id="vehicle" defaultValue="Cykel">
                  <option>Cykel</option>
                  <option>Elcykel</option>
                  <option>Scooter</option>
                  <option>Bil</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="area">Leveringsområde *</label>
                <select id="area" defaultValue="København N">
                  <option>København N</option>
                  <option>København K</option>
                  <option>København V</option>
                  <option>København Ø</option>
                  <option>København S</option>
                  <option>Frederiksberg</option>
                </select>
              </div>
            </div>
            <p className="field-hint">
              Kørekort og relevant dokumentation kræves ved motoriseret køretøj.
            </p>
          </div>

          <h2>03  Dokumentation</h2>
          <div className="upload-row">
            <div className="upload">
              <strong>Gyldig billedlegitimation *</strong>
              <span>PDF, JPG eller PNG · maks. 10 MB</span>
              <span className="file">Vælg fil →</span>
            </div>
            <div className="upload">
              <strong>Dokumentation for arbejdsret *</strong>
              <span>PDF, JPG eller PNG · maks. 10 MB</span>
              <span className="file">Arbejdstilladelse.pdf  ·  Skift fil</span>
            </div>
          </div>

          <label className="checkbox" style={{ marginTop: 28 }}>
            <input type="checkbox" />
            Jeg er fyldt 18 år og har ret til at arbejde i Danmark.
          </label>
          <label className="checkbox" style={{ marginTop: 16 }}>
            <input type="checkbox" />
            Jeg accepterer partnervilkårene og har læst privatlivspolitikken.
          </label>

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 28 }}>
            Send chaufføransøgning
          </button>
          <p className="field-hint" style={{ marginTop: 20 }}>
            Upload begge dokumenter før indsendelse. Du følger din ansøgning på Min profil.
          </p>
        </form>
      </section>

      <SiteFooter variant="slim" />
    </>
  );
}
