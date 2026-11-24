import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { matchesRoute, readBackendRoutes } from '../../test/backendRoutes';

// The value the CD pipeline builds the production frontend with.
const DEPLOYED_ORIGIN = 'https://mtogo.api.roneu.dk';

// One sample call per exported API function. Adding a new API function without
// listing it here fails the "covers every exported API function" test.
const CALLS = {
  'utils/api': {
    register: (m) => m.register({ email: 'a@b.dk' }),
    login: (m) => m.login({ email: 'a@b.dk', password: 'x' }),
    verifyEmail: (m) => m.verifyEmail('token'),
    resendVerify: (m) => m.resendVerify('a@b.dk'),
    forgotPassword: (m) => m.forgotPassword('a@b.dk'),
    resetPassword: (m) => m.resetPassword({ token: 't', password: 'x' }),
    getMyRestaurants: (m) => m.getMyRestaurants(),
    getMyRestaurant: (m) => m.getMyRestaurant('42'),
    setRestaurantVisibility: (m) => m.setRestaurantVisibility('42', true),
    getAvailableDeliveries: (m) => m.getAvailableDeliveries(),
    placeOrder: (m) => m.placeOrder({ restaurantId: '42', lines: [] }),
    getRestaurantOrders: (m) => m.getRestaurantOrders('42'),
    getMyDeliveries: (m) => m.getMyDeliveries(),
    acceptDelivery: (m) => m.acceptDelivery('42'),
    addMenuItem: (m) => m.addMenuItem('42', { name: 'Burger', price: 50 }),
    updateMenuItem: (m) => m.updateMenuItem('42', { price: 60 }),
    getRestaurantApplications: (m) => m.getRestaurantApplications(),
    getMyRestaurantApplications: (m) => m.getMyRestaurantApplications(),
    submitRestaurantApplication: (m) => m.submitRestaurantApplication({ restaurantName: 'X' }),
    resubmitRestaurantApplication: (m) => m.resubmitRestaurantApplication('42', { restaurantName: 'X' }),
    decideRestaurantApplication: (m) => m.decideRestaurantApplication('42', { status: 'APPROVED' })
  },
  'api/featureFlags': {
    fetchFeatureFlags: (m) => m.fetchFeatureFlags()
  },
  'api/restaurants': {
    fetchRestaurants: (m) => m.fetchRestaurants(),
    fetchRestaurant: (m) => m.fetchRestaurant('42'),
    fetchMenu: (m) => m.fetchMenu('42')
  }
};

// Exported helpers in those modules that do not call the backend themselves.
const NOT_ENDPOINTS = new Set([
  'api', 
  'isLoggedIn', 
  'logout', 
  'saveSession',
  'getUserName',
  'useApplicationCounts'
]);

const loaders = {
  'utils/api': () => import('../utils/api'),
  'api/featureFlags': () => import('./featureFlags'),
  'api/restaurants': () => import('./restaurants')
};

const okResponse = () =>
  new Response(JSON.stringify({ data: { data: [] } }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });

describe('frontend API calls match backend routes', () => {
  const backendRoutes = readBackendRoutes();
  let fetchMock;

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_API_URL', DEPLOYED_ORIGIN);
    fetchMock = vi.fn(async () => okResponse());
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('finds backend routes to compare against', () => {
    expect(backendRoutes).toContainEqual({ method: 'POST', path: '/api/users/auth/register' });
  });

  for (const [moduleName, calls] of Object.entries(CALLS)) {
    it(`covers every exported API function in ${moduleName}`, async () => {
      const mod = await loaders[moduleName]();
      const exported = Object.keys(mod).filter((k) => typeof mod[k] === 'function' && !NOT_ENDPOINTS.has(k));
      expect(Object.keys(calls).sort()).toEqual(exported.sort());
    });

    for (const [fnName, call] of Object.entries(calls)) {
      it(`${moduleName}.${fnName} hits an existing backend route on the deployed origin`, async () => {
        const mod = await loaders[moduleName]();
        await call(mod);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, options = {}] = fetchMock.mock.calls[0];
        const method = (options.method ?? 'GET').toUpperCase();
        const { origin, pathname } = new URL(url);

        expect(origin).toBe(DEPLOYED_ORIGIN);
        const match = backendRoutes.find((r) => matchesRoute(r, method, pathname));
        expect(match, `${method} ${pathname} is not a backend route`).toBeDefined();
      });
    }
  }
});
