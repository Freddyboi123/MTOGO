const DEFAULT_ORIGIN = 'http://localhost:6969';

// VITE_API_URL is the backend origin (e.g. https://mtogo.api.roneu.dk).
// Every backend route lives under /api, so it is appended here, in one place.
// A trailing slash or an already-present /api is tolerated so both forms work.
export function buildApiUrl(base) {
  const origin = (base || DEFAULT_ORIGIN).trim().replace(/\/+$/, '').replace(/\/api$/, '');
  return `${origin}/api`;
}

export const API_URL = buildApiUrl(import.meta.env.VITE_API_URL);
