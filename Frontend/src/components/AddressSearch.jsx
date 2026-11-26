import { useEffect, useRef, useState } from 'react';
import { MIN_QUERY_LENGTH, searchAddresses } from '../utils/addresses';
import cx from '../utils/cx';
import styles from './AddressSearch.module.css';

const SEARCH_DELAY_MS = 300;

export default function AddressSearch({
  id,
  label,
  ariaLabel,
  placeholder = 'Skriv fx Bytoften',
  text,
  onTextChange,
  onSelect,
  disabled,
  className
}) {
  const [postcodeHint, setPostcodeHint] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [searchState, setSearchState] = useState('idle');
  const [open, setOpen] = useState(false);
  const input = useRef(null);

  useEffect(() => {
    const trimmed = text.trim();
    if (!open || trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setSearchState('idle');
      return undefined;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      const searchText =
        postcodeHint && !trimmed.includes(postcodeHint.postalCode)
          ? `${trimmed} ${postcodeHint.postalCode}`
          : trimmed;
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
  }, [text, open, postcodeHint]);

  function handleChange(event) {
    const value = event.target.value;
    onTextChange(value);
    setOpen(true);
    if (postcodeHint && !value.startsWith(postcodeHint.streetName)) {
      setPostcodeHint(null);
    }
  }

  function handleSelect(suggestion) {
    if (!suggestion.hasNumber) {
      onTextChange(`${suggestion.streetName} `);
      setPostcodeHint(suggestion);
      input.current?.focus();
      return;
    }

    onTextChange(suggestion.label);
    setPostcodeHint(null);
    setSuggestions([]);
    setOpen(false);
    onSelect(suggestion);
  }

  const showList = open && text.trim().length >= MIN_QUERY_LENGTH && searchState !== 'idle';

  return (
    <div className={cx(styles.search, className)}>
      {label && <label htmlFor={id}>{label}</label>}
      <input
        id={id}
        ref={input}
        aria-label={label ? undefined : ariaLabel}
        autoComplete="off"
        placeholder={placeholder}
        value={text}
        onChange={handleChange}
        onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
        disabled={disabled}
      />
      {showList && (
        <ul role="listbox" className={styles.suggestions}>
          {searchState === 'loading' && suggestions.length === 0 && (
            <li className={styles.info}>Søger…</li>
          )}
          {searchState === 'error' && (
            <li className={styles.info}>Adresseforslag kan ikke hentes lige nu.</li>
          )}
          {searchState === 'done' && suggestions.length === 0 && (
            <li className={styles.info}>Ingen adresser fundet.</li>
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
  );
}
