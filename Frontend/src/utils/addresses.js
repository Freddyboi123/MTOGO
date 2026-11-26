const PHOTON_URL = 'https://photon.komoot.io/api/';

const DENMARK_BBOX = '8.0,54.5,15.3,57.8';

export const MIN_QUERY_LENGTH = 3;

export function toSuggestion(feature) {
  const p = feature?.properties ?? {};
  if (p.countrycode !== 'DK') return null;

  const streetName = p.street ?? (p.type === 'street' ? p.name : null);
  const city = p.city ?? p.town ?? p.village ?? p.locality ?? '';
  if (!streetName || !p.postcode || !city) return null;

  const hasNumber = Boolean(p.housenumber);
  const street = hasNumber ? `${streetName} ${p.housenumber}` : streetName;

  return {
    street,
    streetName,
    hasNumber,
    postalCode: p.postcode,
    city,
    label: `${street}, ${p.postcode} ${city}`
  };
}

export async function searchAddresses(query, { signal } = {}) {
  const params = new URLSearchParams({ q: query, limit: '8', bbox: DENMARK_BBOX });
  const response = await fetch(`${PHOTON_URL}?${params}`, { signal });

  if (!response.ok) {
    throw new Error(`Address search failed with status ${response.status}`);
  }

  const body = await response.json();
  const seen = new Set();

  return (body.features ?? [])
    .map(toSuggestion)
    .filter((suggestion) => {
      if (!suggestion || seen.has(suggestion.label)) return false;
      seen.add(suggestion.label);
      return true;
    });
}
