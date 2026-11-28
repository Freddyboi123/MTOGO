import { test, expect } from '@playwright/test';

const API = 'http://localhost:6970/api';
const CUSTOMER = { email: 'delivery-customer@mtogo.dk', password: 'Password123!' };

async function logIn(page) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(CUSTOMER.email);
  await page.getByLabel('Adgangskode', { exact: true }).fill(CUSTOMER.password);
  await page.getByRole('button', { name: 'Log ind' }).click();
  await expect(page).toHaveURL('/');
}

async function openDriverApplications(page) {
  await logIn(page);
  await page.goto('/min-profil');
  await page.getByRole('button', { name: 'Mine ansøgninger' }).click();
  await page.getByRole('tab', { name: 'Driver ansøgninger' }).click();
}

async function openNewApplication(page) {
  await page.getByRole('button', { name: '+ Ny chaufførsansøgning' }).click();
}

async function fillApplication(page, { vehicle, region, hours, times }) {
  await page.getByLabel('Transportmiddel *').selectOption({ label: vehicle });
  await page.getByLabel('Region *').selectOption({ label: region });
  await page.getByLabel('Forventede timer om ugen *').fill(String(hours));
  for (const time of times) await page.getByLabel(time, { exact: true }).check();
}

async function submit(page) {
  await page.getByRole('button', { name: 'Indsend ansøgning' }).click();
}

async function token(page) {
  return page.evaluate(() => localStorage.getItem('token'));
}

test('Mine ansøgninger switches between restaurant and driver applications', async ({ page }) => {
  await logIn(page);
  await page.goto('/min-profil');
  await page.getByRole('button', { name: 'Mine ansøgninger' }).click();

  await expect(page.getByRole('tab', { name: 'Restaurant ansøgninger' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('button', { name: '+ Ny restaurantansøgning' })).toBeVisible();
  await expect(page.getByRole('button', { name: '+ Ny chaufførsansøgning' })).toHaveCount(0);

  await page.getByRole('tab', { name: 'Driver ansøgninger' }).click();

  await expect(page.getByRole('tab', { name: 'Driver ansøgninger' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('button', { name: '+ Ny chaufførsansøgning' })).toBeVisible();
  await expect(page.getByRole('button', { name: '+ Ny restaurantansøgning' })).toHaveCount(0);

  await page.getByRole('tab', { name: 'Restaurant ansøgninger' }).click();

  await expect(page.getByRole('button', { name: '+ Ny restaurantansøgning' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mine ansøgninger' })).toBeVisible();
});

test('the driver form is hidden until a new application is started', async ({ page }) => {
  await openDriverApplications(page);

  await expect(page.getByLabel('Transportmiddel *')).toHaveCount(0);

  await openNewApplication(page);

  await expect(page.getByLabel('Transportmiddel *')).toBeVisible();
});

test('name and e-mail come from the personal details and the missing phone number can be entered', async ({ page }) => {
  await openDriverApplications(page);
  await openNewApplication(page);

  await expect(page.getByLabel('Fornavn *')).toHaveValue('Delivery');
  await expect(page.getByLabel('Efternavn *')).toHaveValue('Test');
  await expect(page.getByLabel('E-mail *')).toHaveValue(CUSTOMER.email);
  await expect(page.getByLabel('Fornavn *')).toHaveAttribute('readonly', '');
  await expect(page.getByLabel('E-mail *')).toHaveAttribute('readonly', '');
  await expect(page.getByLabel('Telefonnummer *')).toHaveValue('');
  await expect(page.getByLabel('Telefonnummer *')).not.toHaveAttribute('readonly', '');
});

test('the form offers every vehicle, region and time of day', async ({ page }) => {
  await openDriverApplications(page);
  await openNewApplication(page);

  await expect(page.getByLabel('Transportmiddel *').locator('option')).toHaveText([
    'Vælg transportmiddel',
    'Cykel',
    'Elcykel',
    'Scooter',
    'Bil'
  ]);
  await expect(page.getByLabel('Region *').locator('option')).toHaveText([
    'Vælg region',
    'Region Hovedstaden',
    'Region Sjælland',
    'Region Syddanmark',
    'Region Midtjylland',
    'Region Nordjylland'
  ]);
  for (const time of ['Morgen', 'Middag', 'Aften', 'Nat']) {
    await expect(page.getByLabel(time, { exact: true })).toBeVisible();
  }
});

test('several times of day can be chosen and unchosen', async ({ page }) => {
  await openDriverApplications(page);
  await openNewApplication(page);

  await page.getByLabel('Morgen', { exact: true }).check();
  await page.getByLabel('Nat', { exact: true }).check();
  await page.getByLabel('Nat', { exact: true }).uncheck();

  await expect(page.getByLabel('Morgen', { exact: true })).toBeChecked();
  await expect(page.getByLabel('Nat', { exact: true })).not.toBeChecked();
});

test('the application tells which field is wrong', async ({ page }) => {
  await openDriverApplications(page);
  await openNewApplication(page);

  await submit(page);
  await expect(page.getByText('The phone number is not valid')).toBeVisible();

  await page.getByLabel('Telefonnummer *').fill('28345678');
  await submit(page);
  await expect(page.getByText('You must choose a vehicle')).toBeVisible();

  await page.getByLabel('Transportmiddel *').selectOption({ label: 'Cykel' });
  await submit(page);
  await expect(page.getByText('You must choose a region')).toBeVisible();

  await page.getByLabel('Region *').selectOption({ label: 'Region Sjælland' });
  await submit(page);
  await expect(page.getByText('The expected hours per week must be between 1 and 80')).toBeVisible();

  await page.getByLabel('Forventede timer om ugen *').fill('15');
  await submit(page);
  await expect(page.getByText('You must choose at least one time of day')).toBeVisible();

  await expect(page.getByLabel('Transportmiddel *')).toBeVisible();
});

test('a submitted application is saved as pending and is still there after a reload', async ({ page }) => {
  await openDriverApplications(page);
  await openNewApplication(page);
  await page.getByLabel('Telefonnummer *').fill('28345678');
  await fillApplication(page, {
    vehicle: 'Elcykel',
    region: 'Region Hovedstaden',
    hours: 20,
    times: ['Aften', 'Nat']
  });

  await submit(page);

  await expect(page.getByText('Your application as a delivery agent was submitted')).toBeVisible();
  await expect(page.getByLabel('Transportmiddel *')).toHaveCount(0);
  const card = page.locator('article').first();
  await expect(card).toContainText('Elcykel · Region Hovedstaden');
  await expect(card).toContainText('Under behandling');
  await expect(card).toContainText('20 timer om ugen · Aften, Nat');

  await page.reload();
  await page.getByRole('button', { name: 'Mine ansøgninger' }).click();
  await page.getByRole('tab', { name: 'Driver ansøgninger' }).click();

  await expect(page.locator('article').first()).toContainText('Elcykel · Region Hovedstaden');
});

test('an application that needs more information shows the request and can be corrected and sent again', async ({ page }) => {
  await openDriverApplications(page);
  await openNewApplication(page);
  await page.getByLabel('Telefonnummer *').fill('28345678');
  await fillApplication(page, {
    vehicle: 'Scooter',
    region: 'Region Syddanmark',
    hours: 12,
    times: ['Morgen']
  });
  await submit(page);
  await expect(page.getByText('Your application as a delivery agent was submitted')).toBeVisible();

  const fixture = await page.request.post(`${API}/test-fixtures/driver-application/request-information`, {
    headers: { Authorization: `Bearer ${await token(page)}` }
  });
  expect(fixture.status()).toBe(204);
  await page.reload();
  await page.getByRole('button', { name: 'Mine ansøgninger' }).click();
  await page.getByRole('tab', { name: 'Driver ansøgninger' }).click();

  const card = page.locator('article').first();
  await expect(card).toContainText('Mangler oplysninger');
  await expect(card).toContainText('Vælg den region, du kører i');

  await card.getByRole('button', { name: 'Ret og send igen →' }).click();

  await expect(page.getByLabel('Transportmiddel *')).toHaveValue('SCOOTER');
  await expect(page.getByLabel('Region *')).toHaveValue('SOUTHERN_DENMARK');
  await expect(page.getByLabel('Forventede timer om ugen *')).toHaveValue('12');
  await expect(page.getByLabel('Morgen', { exact: true })).toBeChecked();

  await page.getByLabel('Region *').selectOption({ label: 'Region Nordjylland' });
  await page.getByRole('button', { name: 'Send igen', exact: true }).click();

  await expect(page.getByText('Your application as a delivery agent was sent in again')).toBeVisible();
  const resubmitted = page.locator('article').first();
  await expect(resubmitted).toContainText('Under behandling');
  await expect(resubmitted).toContainText('Scooter · Region Nordjylland');
  await expect(resubmitted.getByRole('button', { name: 'Ret og send igen →' })).toHaveCount(0);
});

test('a pending application cannot be corrected', async ({ page }) => {
  await logIn(page);
  const headers = { Authorization: `Bearer ${await token(page)}` };
  const created = await page.request.post(`${API}/driver-applications`, {
    headers,
    data: { phoneNumber: '28345678', vehicle: 'BIKE', region: 'CAPITAL', weeklyHours: 10, timesOfDay: ['MIDDAY'] }
  });
  expect(created.status()).toBe(201);
  const { id, status } = (await created.json()).data;
  expect(status).toBe('PENDING');

  const attempt = await page.request.put(`${API}/driver-application/${id}`, {
    headers,
    data: { phoneNumber: '28345678', vehicle: 'CAR', region: 'ZEALAND', weeklyHours: 5, timesOfDay: ['NIGHT'] }
  });

  expect(attempt.status()).toBe(400);
  expect(await attempt.text()).toBe('The application can only be changed when more information is requested');
});

test('the driver applications are only for logged in customers and the admin list is closed to them', async ({ page }) => {
  const anonymous = await page.request.get(`${API}/my-driver-applications`);
  expect(anonymous.status()).toBe(401);

  await logIn(page);
  const headers = { Authorization: `Bearer ${await token(page)}` };

  expect((await page.request.get(`${API}/my-driver-applications`, { headers })).status()).toBe(200);
  expect((await page.request.get(`${API}/driver-applications`, { headers })).status()).toBe(401);
});
