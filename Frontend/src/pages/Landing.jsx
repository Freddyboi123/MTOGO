import { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import cx from '../utils/cx';
import useFeatureFlag from '../featureFlags/useFeatureFlag';
import ui from '../styles/shared.module.css';
import styles from './Landing.module.css';
import { cuisines, howItWorks, restaurants } from '../data/mtogo';

export default function Landing() {
  const [activeCuisine, setActiveCuisine] = useState(cuisines[0]);
  const restaurantOverview = useFeatureFlag('restaurantOverview');

  return (
    <>
      <SiteHeader />

      <section className={cx(ui.page, styles.hero)}>
        <div>
          <p className={ui.eyebrow}>God mad. Lige om hjørnet.</p>
          <h1 className={cx(ui.display, styles.heroTitle)}>
            Din næste favorit
            <br />
            er tættere på,
            <br />
            end du tror.
          </h1>
          <p className={cx(ui.lead, styles.heroLead)}>
            Byens bedste køkkener. Friske favoritter.
            <br />
            Leveret til din dør eller klar til afhentning.
          </p>

          <form className={styles.searchbar} onSubmit={(event) => event.preventDefault()}>
            <input placeholder="Indtast din leveringsadresse" aria-label="Leveringsadresse" />
            <button type="submit" className={cx(ui.btn, ui.btnPrimary)}>
              Find mad i nærheden
            </button>
          </form>

          <p className={styles.heroNote}>Fra lokale favoritter til din nye livret.</p>
        </div>

        <div className={styles.heroMedia}>
          <div className={styles.heroPhoto} />
          <div className={styles.heroBadge}>
            <strong>Lavet lokalt. Nydt hjemme.</strong>
            <span>Smag på dit nabolag</span>
          </div>
        </div>
      </section>

      <section className={cx(ui.page, styles.section)}>
        <h2 className={styles.sectionTitleSmall}>Hvad har du lyst til?</h2>
        <div className={styles.chips}>
          {cuisines.map((cuisine) => (
            <button
              key={cuisine}
              className={cuisine === activeCuisine ? styles.chipActive : styles.chip}
              onClick={() => setActiveCuisine(cuisine)}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </section>

      <section className={cx(ui.page, styles.section)}>
        <div className={styles.sectionHead}>
          <div>
            <h2 className={cx(ui.display, styles.sectionTitle)}>Lokale favoritter</h2>
            <p className={ui.lead}>
              De steder, du vender tilbage til. Og dem, du ikke har opdaget endnu.
            </p>
          </div>
          {restaurantOverview && (
            <Link to="/restauranter" className={ui.linkAccent}>
              Se alle restauranter →
            </Link>
          )}
        </div>

        <div className={styles.grid}>
          {restaurants.map((item) => (
            <Link key={item.id} to="/restaurant" className={styles.card}>
              <div className={styles.cardPhoto}>
                <img src={item.image} alt={item.name} />
                <span className={styles.cardBadge}>{item.badge}</span>
              </div>
              <div className={styles.cardBody}>
                <h3>{item.name}</h3>
                <p className={styles.cardKind}>{item.kind}</p>
                <p className={styles.cardRating}>{item.rating}</p>
                <p className={styles.cardDelivery}>{item.delivery}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className={cx(ui.page, styles.section)}>
        <h2 className={cx(ui.display, styles.sectionTitle)}>Lidt inspiration til i aften</h2>
        <div className={styles.promoGrid}>
          <article className={styles.promo}>
            <div className={styles.promoText}>
              <p className={cx(ui.eyebrow, styles.promoEyebrow)}>En lille bid af Italien</p>
              <h3>Pizza, pasta og god stemning.</h3>
              <span className={cx(ui.linkQuiet, styles.promoLink)}>
                Find din italienske favorit →
              </span>
            </div>
            <img className={styles.promoPhoto} src="/images/restaurant-pizza.png" alt="" />
          </article>

          <article className={styles.promoSand}>
            <div className={styles.promoText}>
              <p className={cx(ui.eyebrow, styles.promoEyebrow)}>Friskt, grønt og fuldt af smag</p>
              <h3>
                God energi.
                <br />
                Endnu bedre MTOGO
              </h3>
              <span className={cx(ui.linkQuiet, styles.promoLink)}>
                Udforsk bowls &amp; salater →
              </span>
            </div>
            <img className={styles.promoPhoto} src="/images/restaurant-bowl.png" alt="" />
          </article>
        </div>
      </section>

      <section className={cx(ui.page, styles.section)} id="saadan-fungerer-det">
        <h2 className={cx(ui.display, styles.sectionTitle)}>
          Fra køkken til spisebord. Helt enkelt.
        </h2>
        <div className={styles.steps}>
          {howItWorks.map((step) => (
            <div className={styles.step} key={step.number}>
              <div className={styles.stepNumber}>{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={ui.page}>
        <div className={styles.partnerBand}>
          <div>
            <p className={ui.eyebrowLight}>God mad fortjener godt selskab</p>
            <h2 className={styles.partnerTitle}>
              Har du en restaurant?
              <br />
              Lad os dele din gode MTOGO
            </h2>
            <p className={styles.partnerNote}>Nå flere lokale gæster med MTOGO</p>
          </div>
          <Link to="/ansoeg/restaurant" className={cx(ui.btn, ui.btnLight)}>
            Bliv restaurantpartner →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
