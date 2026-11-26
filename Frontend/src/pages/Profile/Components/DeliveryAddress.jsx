import { useEffect, useRef, useState } from 'react';
import { getProfile, saveSession, updateProfile } from '../../../utils/api';
import { MIN_QUERY_LENGTH, searchAddresses } from '../../../utils/addresses';
import cx from '../../../utils/cx';
import ui from '../../../styles/shared.module.css';
import styles from '../Profile.module.css';

const SEARCH_DELAY_MS = 300;
const emptyAddress = { street: '', postalCode: '', city: '', floorDoor: '' };

export default function DeliveryAddress({ onSaved }) {
  const [saved, setSaved] = useState(emptyAddress);
  const [address, setAddress] = useState(emptyAddress);
  const [query, setQuery] = useState('');
  const [postcodeHint, setPostcodeHint] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [searchState, setSearchState] = useState('idle');
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const searchInput = useRef(null);

  useEffect(() => {
    getProfile()
      .then((res) => applyUser(res.data))
      .catch((err) => setFeedback({ type: 'error', text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const text = query.trim();
    if (!open || text.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setSearchState('idle');
      return undefined;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      const searchText = postcodeHint && !text.includes(postcodeHint.postalCode) ? `${text} ${postcodeHint.postalCode}` : text;
      setSearchState('loading');
      searchAddresses(searchText, { signal: controller.signal })
        .then((results) => {
          setSuggestions(results);
          setSearchState('done');
        })
        .catch((err) => {
          if (err.name !== 'AbortError') setSearchState('error');
        });
    }, SEARCH_DELAY_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open, postcodeHint]);

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
    setPostcodeHint(null);
  }

  function handleQueryChange(event) {
    const value = event.target.value;
    setQuery(value);
    setOpen(true);
    if (postcodeHint && !value.startsWith(postcodeHint.streetName)) {
      setPostcodeHint(null);
    }
  }

  function handleSelect(suggestion) {
    if (!suggestion.hasNumber) {
      setQuery(`${suggestion.streetName} `);
      setPostcodeHint(suggestion);
      searchInput.current?.focus();
      return;
    }

    setAddress({ ...address, street: suggestion.street, postalCode: suggestion.postalCode, city: suggestion.city });
    setQuery(suggestion.label);
    setPostcodeHint(null);
    setSuggestions([]);
    setOpen(false);
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

  const showList = open && query.trim().length >= MIN_QUERY_LENGTH && searchState !== 'idle';

  return (
    <form className={ui.block} onSubmit={handleSubmit}>
      <h2>Din standardadresse</h2>
      <p className={styles.sectionHint}>Søg efter din adresse, og vælg et af forslagene.</p>
      <div className={ui.stack}>
        <div className={cx(ui.field, styles.addressSearch)}>
          <label htmlFor="profile-address-search">Adresse</label>
          <input
            id="profile-address-search"
            ref={searchInput}
            autoComplete="off"
            placeholder="Skriv fx Bytoften"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
            disabled={loading}
          />
          {showList && (
            <ul id="profile-address-suggestions" role="listbox" className={styles.suggestions}>
              {searchState === 'loading' && suggestions.length === 0 && (
                <li className={styles.suggestionInfo}>Søger…</li>
              )}
              {searchState === 'error' && (
                <li className={styles.suggestionInfo}>Adresseforslag kan ikke hentes lige nu.</li>
              )}
              {searchState === 'done' && suggestions.length === 0 && (
                <li className={styles.suggestionInfo}>Ingen adresser fundet.</li>
              )}
              {suggestions.map((suggestion) => (
                <li key={suggestion.label} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected="false"
                    className={styles.suggestion}
                    onClick={() => handleSelect(suggestion)}
                  >
                    {suggestion.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
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
