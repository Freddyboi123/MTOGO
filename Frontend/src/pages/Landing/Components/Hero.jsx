import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddressSearch from '../../../components/AddressSearch';
import useFeatureFlag from '../../../featureFlags/useFeatureFlag';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../Landing.module.css';

export default function Hero() {
  const navigate = useNavigate();
  const restaurantOverview = useFeatureFlag('restaurantOverview');
  const [text, setText] = useState('');
  const [address, setAddress] = useState(null);
  const [message, setMessage] = useState('');

  function handleTextChange(value) {
    setText(value);
    setAddress(null);
    setMessage('');
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!address || typeof address.latitude !== 'number' || typeof address.longitude !== 'number') {
      setMessage('Søg efter din adresse, og vælg et af forslagene.');
      return;
    }
    if (!restaurantOverview) return;

    navigate('/restauranter', {
      state: {
        near: { label: address.label, latitude: address.latitude, longitude: address.longitude }
      }
    });
  }

  return (
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

        <form className={styles.searchbar} onSubmit={handleSubmit}>
          <AddressSearch
            id="hero-address"
            placeholder="Indtast din leveringsadresse"
            text={text}
            onTextChange={handleTextChange}
            onSelect={setAddress}
            className={styles.heroAddress}
          />
          <button type="submit" className={cx(ui.btn, ui.btnPrimary)}>
            Find mad i nærheden
          </button>
        </form>
        {message && <p className={styles.heroNote}>{message}</p>}

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
  );
}
