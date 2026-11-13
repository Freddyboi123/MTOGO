import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { cuisines, howItWorks, restaurants } from '../data/mtogo';

export default function Landing() {
  return (
    <>
      <SiteHeader />

      <section className="page hero">
        <div>
          <p className="eyebrow">God mad. Lige om hjørnet.</p>
          <h1 className="display">
            Din næste favorit
            <br />
            er tættere på,
            <br />
            end du tror.
          </h1>
          <p className="lead">
            Byens bedste køkkener. Friske favoritter.
            <br />
            Leveret til din dør eller klar til afhentning.
          </p>
          <form className="searchbar" onSubmit={(event) => event.preventDefault()}>
            <input placeholder="Indtast din leveringsadresse" aria-label="Leveringsadresse" />
            <button type="submit" className="btn btn-primary">
              Find mad i nærheden
            </button>
          </form>
          <p className="hero-note">Fra lokale favoritter til din nye livret.</p>
        </div>
        <div className="hero-media">
          <div className="photo" style={{ backgroundImage: 'url(/images/hero-pizza.png)' }} />
          <div className="hero-badge">
            <strong>Lavet lokalt. Nydt hjemme.</strong>
            <span>Smag på dit nabolag</span>
          </div>
        </div>
      </section>

      <section className="page section">
        <h2 style={{ fontSize: 24, fontWeight: 600 }}>Hvad har du lyst til?</h2>
        <div className="chips">
          {cuisines.map((cuisine, index) => (
            <button key={cuisine} className={index === 0 ? 'chip chip-active' : 'chip'}>
              {cuisine}
            </button>
          ))}
        </div>
      </section>

      <section className="page section">
        <div className="section-head">
          <div>
            <h2 className="display">Lokale favoritter</h2>
            <p className="lead" style={{ fontSize: 15, marginTop: 16 }}>
              De steder, du vender tilbage til. Og dem, du ikke har opdaget endnu.
            </p>
          </div>
          <span className="link-accent">Se alle restauranter →</span>
        </div>
        <div className="restaurant-grid">
          {restaurants.map((item) => (
            <Link key={item.id} to="/restaurant" className="restaurant-card">
              <div className="photo" style={{ backgroundImage: `url(${item.image})` }}>
                <span className="badge">{item.badge}</span>
              </div>
              <div className="body">
                <h3>{item.name}</h3>
                <p className="kind">{item.kind}</p>
                <p className="rating">{item.rating}</p>
                <p className="delivery">{item.delivery}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="page section">
        <h2 className="display">Lidt inspiration til i aften</h2>
        <div className="promo-grid">
          <article className="promo">
            <div className="text">
              <p className="eyebrow">En lille bid af Italien</p>
              <h3>Pizza, pasta og god stemning.</h3>
              <span className="link-quiet">Find din italienske favorit →</span>
            </div>
            <div className="photo" style={{ backgroundImage: 'url(/images/restaurant-pizza.png)' }} />
          </article>
          <article className="promo promo-sand">
            <div className="text">
              <p className="eyebrow">Friskt, grønt og fuldt af smag</p>
              <h3>
                God energi.
                <br />
                Endnu bedre MTOGO
              </h3>
              <span className="link-quiet">Udforsk bowls &amp; salater →</span>
            </div>
            <div className="photo" style={{ backgroundImage: 'url(/images/restaurant-bowl.png)' }} />
          </article>
        </div>
      </section>

      <section className="page section" id="saadan-fungerer-det">
        <h2 className="display">Fra køkken til spisebord. Helt enkelt.</h2>
        <div className="steps">
          {howItWorks.map((step) => (
            <div className="step" key={step.number}>
              <div className="num">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page">
        <div className="partner-band">
          <div>
            <p className="eyebrow eyebrow-light">God mad fortjener godt selskab</p>
            <h2>
              Har du en restaurant?
              <br />
              Lad os dele din gode MTOGO
            </h2>
            <p className="note">Nå flere lokale gæster med MTOGO</p>
          </div>
          <Link to="/ansoeg/restaurant" className="btn btn-light">
            Bliv restaurantpartner →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
