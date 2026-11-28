import { test, expect } from '@playwright/test';

const API = 'http://localhost:6970/api';
const PASSWORD = 'Password123!';
const COURIER = 'delivery-courier@mtogo.dk';
const OTHER_COURIER = 'delivery-other@mtogo.dk';
const CUSTOMER = 'delivery-customer@mtogo.dk';

async function authenticate(request, email) {
  const response = await request.post(`${API}/users/auth/login`, { data: { email, password: PASSWORD } });
  await expect(response).toBeOK();
  return { Authorization: `Bearer ${(await response.json()).token}` };
}

async function logIn(page, email) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Adgangskode', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Log ind' }).click();
  await expect(page).toHaveURL('/');
  return { Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}` };
}

async function createAcceptedDelivery(request, headers) {
  const fixture = await request.post(`${API}/test-fixtures/delivery`, { headers });
  expect(fixture.status(), await fixture.text()).toBe(201);
  return (await fixture.json()).orderId;
}

async function openMyDelivery(page, orderId) {
  await page.goto('/chauffoerpanel/ture');
  const card = page.locator('article').filter({ hasText: orderId });
  await card.getByRole('button', { name: 'Se detaljer' }).click();
  return page.getByRole('region', { name: 'Ordredetaljer' });
}

test('the courier saves the minutes to pick up and to deliver and they are still there after a reload', async ({ page, request }) => {
  const headers = await logIn(page, COURIER);
  const orderId = await createAcceptedDelivery(request, headers);

  const details = await openMyDelivery(page, orderId);
  await expect(details.getByLabel('Minutter til at hente maden')).toHaveValue('');
  await expect(details.getByLabel('Minutter til at levere maden')).toHaveValue('');

  await details.getByLabel('Minutter til at hente maden').fill('10');
  await details.getByLabel('Minutter til at levere maden').fill('25');
  const saved = page.waitForResponse((response) =>
    response.url() === `${API}/deliveries/${orderId}/estimate` && response.request().method() === 'PUT');
  await details.getByRole('button', { name: 'Gem estimat' }).click();
  const response = await saved;
  expect(response.status(), await response.text()).toBe(200);
  expect((await response.json()).data).toMatchObject({ orderId, minutesToPickup: 10, minutesToDeliver: 25 });
  await expect(page.getByRole('status').filter({ hasText: 'Estimatet er gemt.' })).toBeVisible();

  await page.reload();
  const reloaded = await openMyDelivery(page, orderId);
  await expect(reloaded.getByLabel('Minutter til at hente maden')).toHaveValue('10');
  await expect(reloaded.getByLabel('Minutter til at levere maden')).toHaveValue('25');
});

test('the estimate can be changed and keeps working through the status steps', async ({ page, request }) => {
  const headers = await logIn(page, COURIER);
  const orderId = await createAcceptedDelivery(request, headers);

  const details = await openMyDelivery(page, orderId);
  await details.getByLabel('Minutter til at hente maden').fill('10');
  await details.getByLabel('Minutter til at levere maden').fill('25');
  await details.getByRole('button', { name: 'Gem estimat' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Estimatet er gemt.' })).toBeVisible();

  await details.getByRole('button', { name: 'Markér som på vej til afhentning' }).click();
  await expect(details.getByLabel('Minutter til at hente maden')).toHaveValue('10');

  await details.getByLabel('Minutter til at hente maden').fill('4');
  await details.getByRole('button', { name: 'Gem estimat' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Estimatet er gemt.' })).toBeVisible();

  const mine = await request.get(`${API}/deliveries/mine`, { headers });
  const delivery = (await mine.json()).data.find((item) => item.orderId === orderId);
  expect(delivery).toMatchObject({ minutesToPickup: 4, minutesToDeliver: 25, deliveryStatus: 'EN_ROUTE_TO_PICKUP' });
});

test('minutes of zero or less are refused with an error and nothing is saved', async ({ page, request }) => {
  const headers = await logIn(page, COURIER);
  const orderId = await createAcceptedDelivery(request, headers);

  const details = await openMyDelivery(page, orderId);
  await details.getByLabel('Minutter til at hente maden').fill('0');
  await details.getByLabel('Minutter til at levere maden').fill('25');
  await details.getByRole('button', { name: 'Gem estimat' }).click();

  await expect(page.getByRole('alert')).toContainText('The minutes to pick up and to deliver must be whole numbers between 1 and 240');

  await details.getByLabel('Minutter til at hente maden').fill('-3');
  await details.getByRole('button', { name: 'Gem estimat' }).click();
  await expect(page.getByRole('alert')).toContainText('between 1 and 240');

  await page.reload();
  const reloaded = await openMyDelivery(page, orderId);
  await expect(reloaded.getByLabel('Minutter til at hente maden')).toHaveValue('');
  await expect(reloaded.getByLabel('Minutter til at levere maden')).toHaveValue('');
});

test('a missing minute value is refused', async ({ page, request }) => {
  const headers = await logIn(page, COURIER);
  const orderId = await createAcceptedDelivery(request, headers);

  const details = await openMyDelivery(page, orderId);
  await details.getByLabel('Minutter til at hente maden').fill('10');
  await details.getByRole('button', { name: 'Gem estimat' }).click();

  await expect(page.getByRole('alert')).toContainText('between 1 and 240');
});

test('only the courier who has the delivery can set the estimate', async ({ page, request }) => {
  const headers = await logIn(page, COURIER);
  const orderId = await createAcceptedDelivery(request, headers);
  const body = { minutesToPickup: 10, minutesToDeliver: 25 };

  const other = await request.put(`${API}/deliveries/${orderId}/estimate`, {
    headers: await authenticate(request, OTHER_COURIER),
    data: body
  });
  expect(other.status()).toBe(403);
  expect(await other.text()).toBe('Only the assigned delivery agent can update this delivery');

  const customer = await request.put(`${API}/deliveries/${orderId}/estimate`, {
    headers: await authenticate(request, CUSTOMER),
    data: body
  });
  expect(customer.status()).toBe(401);

  const anonymous = await request.put(`${API}/deliveries/${orderId}/estimate`, { data: body });
  expect(anonymous.status()).toBe(401);

  const mine = await request.get(`${API}/deliveries/mine`, { headers });
  const delivery = (await mine.json()).data.find((item) => item.orderId === orderId);
  expect(delivery.minutesToPickup).toBeNull();
});

test('the customer gets an expected delivery time once the courier has set the estimate', async ({ page, request }) => {
  const courierHeaders = await logIn(page, COURIER);
  const orderId = await createAcceptedDelivery(request, courierHeaders);
  const customerHeaders = await authenticate(request, CUSTOMER);

  const before = await request.get(`${API}/orders/mine`, { headers: customerHeaders });
  const orderBefore = (await before.json()).data.find((item) => item.id === orderId);
  expect(orderBefore.expectedDeliveryAt ?? null).toBeNull();

  const start = Date.now();
  const set = await request.put(`${API}/deliveries/${orderId}/estimate`, {
    headers: courierHeaders,
    data: { minutesToPickup: 10, minutesToDeliver: 25 }
  });
  expect(set.status()).toBe(200);

  const after = await request.get(`${API}/orders/mine`, { headers: customerHeaders });
  const orderAfter = (await after.json()).data.find((item) => item.id === orderId);
  const expected = new Date(orderAfter.expectedDeliveryAt).getTime();
  const thirtyFiveMinutes = 35 * 60 * 1000;
  expect(expected).toBeGreaterThanOrEqual(start + thirtyFiveMinutes - 60 * 1000);
  expect(expected).toBeLessThanOrEqual(Date.now() + thirtyFiveMinutes + 60 * 1000);
});

const ORDER = {
  id: '11111111-1111-1111-1111-111111111111',
  restaurantName: 'Mamma Mia Pizza',
  status: 'OUT_FOR_DELIVERY',
  total: 275,
  createdAt: '2026-11-26T14:30:00',
  expectedDeliveryAt: '2026-11-26T15:05:00',
  lines: [{ menuItemId: 'a', itemName: 'Margherita', unitPrice: 100, quantity: 2 }]
};

async function openOrderModal(page, order) {
  await page.route('**/api/orders/mine', (route) => route.fulfill({ json: { data: [order] } }));
  await logIn(page, CUSTOMER);
  await page.goto('/min-profil');
  await page.getByRole('button', { name: 'Ordrehistorik' }).click();
  await page.getByRole('row', { name: /Mamma Mia Pizza/ }).click();
  return page.getByRole('dialog');
}

test('the order shows the expected delivery time while it is on its way', async ({ page }) => {
  const dialog = await openOrderModal(page, ORDER);

  await expect(dialog.getByText('Forventet levering')).toBeVisible();
  await expect(dialog.getByText(/ca\. kl\. 15[.:]05/)).toBeVisible();
});

test('the order shows no expected delivery time without an estimate', async ({ page }) => {
  const dialog = await openOrderModal(page, { ...ORDER, expectedDeliveryAt: null });

  await expect(dialog.getByText('Status')).toBeVisible();
  await expect(dialog.getByText('Forventet levering')).toHaveCount(0);
});

test('the order shows no expected delivery time once it is delivered', async ({ page }) => {
  const dialog = await openOrderModal(page, { ...ORDER, status: 'DELIVERED' });

  await expect(dialog.getByText('Leveret')).toBeVisible();
  await expect(dialog.getByText('Forventet levering')).toHaveCount(0);
});
