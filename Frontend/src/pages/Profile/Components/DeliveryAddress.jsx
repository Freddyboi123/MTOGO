import { useEffect, useState } from 'react';
import { getProfile, saveSession, updateProfile } from '../../../utils/api';
import AddressSearch from '../../../components/AddressSearch';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../Profile.module.css';

const emptyAddress = { street: '', postalCode: '', city: '', floorDoor: '' };

export default function DeliveryAddress({ onSaved }) {
  const [saved, setSaved] = useState(emptyAddress);
  const [address, setAddress] = useState(emptyAddress);
  const [query, setQuery] = useState('');
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProfile()
      .then((res) => applyUser(res.data))
      .catch((err) => setFeedback({ type: 'error', text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  function applyUser(user) {
    const values = {
      street: user.street ?? '',
      postalCode: user.postalCode ?? '',
      city: user.city ?? '',
      floorDoor: user.floorDoor ?? ''
    };
    setSaved(values);
    setAddress(values);
    setQuery(values.street ? `${values.street}, ${values.postalCode} ${values.city}` : '');
  }

  function handleSelect(suggestion) {
    setAddress({ ...address, street: suggestion.street, postalCode: suggestion.postalCode, city: suggestion.city });
  }

  function changedFields() {
    const body = {};
    if (address.street !== saved.street) body.street = address.street;
    if (address.postalCode !== saved.postalCode) body.postal_code = address.postalCode;
    if (address.city !== saved.city) body.city = address.city;
    if (address.floorDoor !== saved.floorDoor) body.floor_door = address.floorDoor;
    return body;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!address.street) {
      setFeedback({ type: 'error', text: 'Søg efter din adresse, og vælg et af forslagene.' });
      return;
    }

    const body = changedFields();
    if (Object.keys(body).length === 0) {
      setFeedback({ type: 'info', text: 'Der er ingen ændringer at gemme.' });
      return;
    }

    setSaving(true);
    setFeedback({ type: '', text: '' });
    try {
      const res = await updateProfile(body);
      saveSession(res);
      applyUser(res.data);
      setFeedback({ type: 'success', text: 'Din leveringsadresse er gemt.' });
      onSaved?.();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={ui.block} onSubmit={handleSubmit}>
      <h2>Din standardadresse</h2>
      <p className={styles.sectionHint}>Søg efter din adresse, og vælg et af forslagene.</p>
      <div className={ui.stack}>
        <AddressSearch
          id="profile-address-search"
          label="Adresse"
          text={query}
          onTextChange={setQuery}
          onSelect={handleSelect}
          disabled={loading}
        />
        <div className={ui.fieldRowThree}>
          <div className={ui.field}>
            <label htmlFor="profile-zip">Postnummer</label>
            <input id="profile-zip" value={address.postalCode} readOnly />
          </div>
          <div className={ui.field}>
            <label htmlFor="profile-city">By</label>
            <input id="profile-city" value={address.city} readOnly />
          </div>
          <div className={ui.field}>
            <label htmlFor="profile-floor">Etage / dør</label>
            <input
              id="profile-floor"
              value={address.floorDoor}
              onChange={(event) => setAddress({ ...address, floorDoor: event.target.value })}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {feedback.text && (
        <p className={ui.fieldHint} role={feedback.type === 'error' ? 'alert' : 'status'}>
          {feedback.text}
        </p>
      )}

      <button
        type="submit"
        className={cx(ui.btn, ui.btnDark, ui.btnBlock, styles.save)}
        disabled={loading || saving}
      >
        Gem leveringsadresse
      </button>
    </form>
  );
}
