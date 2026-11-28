import { test, expect } from '@playwright/test';

const API = 'http://localhost:6970/api';
const PASSWORD = 'Password123!';
const COURIER = 'delivery-courier@mtogo.dk';
const OTHER_COURIER = 'delivery-other@mtogo.dk';
const CUSTOMER = 'delivery-customer@mtogo.dk';
const OWNER = 'owner@mtogo.dk';

async function login(page) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(COURIER);
  await page.getByLabel('Adgangskode', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Log ind' }).click();
  await expect(page).toHaveURL('/');
  return { Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}` };
}

async function authenticate(request, email) {
  const response = await request.post(`${API}/users/auth/login`, { data: { email, password: PASSWORD } });
  await expect(response).toBeOK();
  const { token } = await response.json();
  expect(token).toBeTruthy();
  return { Authorization: `Bearer ${token}` };
}

async function myDeliveries(request, headers) {
  const response = await request.get(`${API}/deliveries/mine`, { headers });
  await expect(response).toBeOK();
  return (await response.json()).data;
}

async function expectCustomerStatus(request, headers, orderId, status) {
  const response = await request.get(`${API}/orders/mine`, { headers });
  await expect(response).toBeOK();
  const { data } = await response.json();
  const order = data.find((item) => item.id === orderId);
  expect(order).toBeDefined();
  expect(order.status).toBe(status);
  expect(order.lines).toEqual(expect.arrayContaining([
    expect.objectContaining({ itemName: 'Margherita', quantity: 1 })
  ]));
}

async function expectRestaurantOrderStatus(request, headers, restaurantId, orderId, status) {
  const response = await request.get(`${API}/my-restaurants/${restaurantId}/orders`, { headers });
  await expect(response).toBeOK();
  const { data } = await response.json();
  expect(data.find((order) => order.id === orderId)?.status).toBe(status);
}

async function expectRejected(request, headers, orderId, action, status, message) {
  const response = await request.post(`${API}/deliveries/${orderId}/${action}`, { headers });
  const body = await response.text();
  expect(response.status(), body).toBe(status);
  expect(body).toContain(message);
}

async function expectRestaurantMenus(request) {
  const response = await request.get(`${API}/restaurants`);
  await expect(response).toBeOK();
  const { data } = await response.json();
  const restaurant = data.data.find((item) => item.name === 'Mamma Mia Pizza');
  expect(restaurant).toBeDefined();
  expect(restaurant.categories.flatMap((category) => category.items).length).toBeGreaterThan(0);
  return restaurant.id;
}

test('courier picks up and completes only their own delivery, with persisted status', async ({ page, request }) => {
  const headers = await login(page);
  const otherHeaders = await authenticate(request, OTHER_COURIER);
  const customerHeaders = await authenticate(request, CUSTOMER);
  const ownerHeaders = await authenticate(request, OWNER);
  const restaurantId = await expectRestaurantMenus(request);
  const fixture = await request.post(`${API}/test-fixtures/delivery`, { headers });
  expect(fixture.status(), await fixture.text()).toBe(201);
  const { orderId } = await fixture.json();
  expect(orderId).toBeTruthy();
  const deliveries = await myDeliveries(request, headers);
  expect(deliveries.find((item) => item.orderId === orderId)).toMatchObject({
    orderId, deliveryStatus: 'ASSIGNED', orderStatus: 'READY_FOR_PICKUP'
  });

  expect((await myDeliveries(request, otherHeaders)).some((item) => item.orderId === orderId)).toBe(false);
  for (let attempt = 0; attempt < 3; attempt++) {
    await Promise.all([
      expectRestaurantMenus(request),
      expectRejected(request, otherHeaders, orderId, 'pickup', 403, 'Only the assigned delivery agent can update this delivery'),
      expectCustomerStatus(request, customerHeaders, orderId, 'READY_FOR_PICKUP')
    ]);
    await Promise.all([
      expectRestaurantMenus(request),
      expectRejected(request, headers, orderId, 'deliver', 409, 'This delivery cannot be updated from its current status'),
      expectCustomerStatus(request, customerHeaders, orderId, 'READY_FOR_PICKUP')
    ]);
  }
  await expectCustomerStatus(request, customerHeaders, orderId, 'READY_FOR_PICKUP');
  await expectRestaurantOrderStatus(request, ownerHeaders, restaurantId, orderId, 'READY_FOR_PICKUP');

  await page.goto('/chauffoerpanel');
  await page.getByRole('link', { name: 'Mine ture' }).click();
  const card = page.locator('article').filter({ hasText: orderId });
  const details = page.getByRole('region', { name: 'Ordredetaljer' });
  await expect(card).toContainText('Tildelt');
  await card.getByRole('button', { name: 'Se detaljer' }).click();
  await expect(details.getByRole('button', { name: 'Markér som leveret' })).toHaveCount(0);
  await expect(details.getByRole('button', { name: 'Markér som afhentet' })).toHaveCount(0);
  await expectRejected(request, headers, orderId, 'pickup', 409, 'This delivery cannot be updated from its current status');

  const startResponse = page.waitForResponse((response) =>
    response.url() === `${API}/deliveries/${orderId}/start` && response.request().method() === 'POST');
  await details.getByRole('button', { name: 'Markér som på vej til afhentning' }).click();
  const start = await startResponse;
  expect(start.status(), await start.text()).toBe(200);
  expect((await start.json()).data).toMatchObject({ orderId, deliveryStatus: 'EN_ROUTE_TO_PICKUP', orderStatus: 'READY_FOR_PICKUP' });
  await expect(card).toContainText('På vej til afhentning');
  await expect(details.getByRole('button', { name: 'Markér som på vej til afhentning' })).toHaveCount(0);
  await expect(details.getByRole('button', { name: 'Markér som leveret' })).toHaveCount(0);
  await expectCustomerStatus(request, customerHeaders, orderId, 'READY_FOR_PICKUP');
  await expectRejected(request, otherHeaders, orderId, 'start', 403, 'Only the assigned delivery agent can update this delivery');

  await page.reload();
  await expect(card).toContainText('På vej til afhentning');
  await card.getByRole('button', { name: 'Se detaljer' }).click();

  const pickupResponse = page.waitForResponse((response) =>
    response.url() === `${API}/deliveries/${orderId}/pickup` && response.request().method() === 'POST');
  await details.getByRole('button', { name: 'Markér som afhentet' }).click();
  const pickup = await pickupResponse;
  expect(pickup.status(), await pickup.text()).toBe(200);
  expect((await pickup.json()).data).toMatchObject({ orderId, deliveryStatus: 'PICKED_UP', orderStatus: 'OUT_FOR_DELIVERY' });
  await expect(card).toContainText('På vej til kunden');
  await expect(details.getByRole('button', { name: 'Markér som leveret' })).toBeVisible();

  await page.reload();
  await expect(card).toContainText('På vej');
  await card.getByRole('button', { name: 'Se detaljer' }).click();
  await expect(details.getByRole('button', { name: 'Markér som afhentet' })).toHaveCount(0);
  await expectRejected(request, otherHeaders, orderId, 'deliver', 403, 'Only the assigned delivery agent can update this delivery');
  await expectCustomerStatus(request, customerHeaders, orderId, 'OUT_FOR_DELIVERY');
  await expectRestaurantOrderStatus(request, ownerHeaders, restaurantId, orderId, 'OUT_FOR_DELIVERY');

  const completionResponse = page.waitForResponse((response) =>
    response.url() === `${API}/deliveries/${orderId}/deliver` && response.request().method() === 'POST');
  await details.getByRole('button', { name: 'Markér som leveret' }).click();
  const completion = await completionResponse;
  expect(completion.status(), await completion.text()).toBe(200);
  expect((await completion.json()).data).toMatchObject({ orderId, deliveryStatus: 'DELIVERED', orderStatus: 'DELIVERED' });
  await expect(page.getByText('Leveringen er gennemført.', { exact: true })).toBeVisible();
  await expect(card).toHaveCount(0);

  await page.reload();
  await expect(page.getByText('Henter leverancer...', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(card).toHaveCount(0);
  expect((await myDeliveries(request, headers)).some((item) => item.orderId === orderId)).toBe(false);
  await expectCustomerStatus(request, customerHeaders, orderId, 'DELIVERED');
  await expectRestaurantOrderStatus(request, ownerHeaders, restaurantId, orderId, 'DELIVERED');
  await expectRejected(request, headers, orderId, 'deliver', 409, 'This delivery cannot be updated from its current status');
  await expectCustomerStatus(request, customerHeaders, orderId, 'DELIVERED');
});
