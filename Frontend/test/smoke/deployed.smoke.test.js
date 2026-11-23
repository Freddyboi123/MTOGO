// Runs the real frontend API client against the deployed backend.
// It only sends read-only requests or requests that validation rejects,
// so it creates no data and sends no emails.
// Usage: VITE_API_URL=https://mtogo.api.roneu.dk npm run test:smoke
import { describe, expect, it } from 'vitest';
import { fetchFeatureFlags } from '../../src/api/featureFlags';
import { fetchMenu, fetchRestaurant, fetchRestaurants } from '../../src/api/restaurants';
import { API_URL } from '../../src/api/config';
import * as auth from '../../src/utils/api';
import { readBackendRoutes } from '../backendRoutes';

const origin = API_URL.replace(/\/api$/, '');

// A missing route fails with Javalin's "Endpoint <METHOD> <path> not found" (404).
// An existing route given an invalid body fails validation with a 4xx instead.
async function expectRouteExistsButRejects(promise) {
  const error = await promise.then(
    () => null,
    (e) => e
  );
  expect(error, 'expected the backend to reject the invalid request').not.toBeNull();
  expect(error.message).not.toMatch(/^Endpoint .* not found$/);
  expect(error.status).toBeGreaterThanOrEqual(400);
  expect(error.status).toBeLessThan(500);
}

describe(`deployed API at ${API_URL}`, () => {
  it('registers every route the backend source defines', async () => {
    const res = await fetch(`${origin}/routes`, { headers: { Accept: 'application/json' } });
    expect(res.ok).toBe(true);
    const { handlers } = await res.json();
    const deployed = new Set(handlers.map((h) => `${h.handlerType} ${h.path}`));
    const missing = readBackendRoutes()
      .map((r) => `${r.method} ${r.path}`)
      .filter((r) => !deployed.has(r));
    expect(missing).toEqual([]);
  });

  it('allows cross-origin requests from the frontend', async () => {
    const res = await fetch(`${API_URL}/features`, { headers: { Origin: 'https://example.com' } });
    expect(res.headers.get('access-control-allow-origin')).toBeTruthy();
  });

  it('GET /features', async () => {
    expect(typeof (await fetchFeatureFlags())).toBe('object');
  });

  it('GET /restaurants, /restaurant/{id}, /restaurant/menu/{id}', async () => {
    const restaurants = await fetchRestaurants();
    expect(Array.isArray(restaurants)).toBe(true);
    if (restaurants.length === 0) return;
    const id = restaurants[0].id;
    expect((await fetchRestaurant(id)).id).toBe(id);
    expect(Array.isArray(await fetchMenu(id))).toBe(true);
  });

  it('POST /users/auth/register', () => expectRouteExistsButRejects(auth.register({})));
  it('POST /users/auth/login', () => expectRouteExistsButRejects(auth.login({})));
  it('GET /users/auth/verify', () => expectRouteExistsButRejects(auth.verifyEmail('invalid-token')));
  it('POST /users/auth/resend-verify', () => expectRouteExistsButRejects(auth.resendVerify('')));
  it('POST /users/auth/forgot-password', () => expectRouteExistsButRejects(auth.forgotPassword('')));
  it('POST /users/auth/reset-password', () => expectRouteExistsButRejects(auth.resetPassword({})));
});
