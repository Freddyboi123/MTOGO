import { test, expect } from '@playwright/test';

const API = 'http://localhost:6970/api';
const PASSWORD = 'Password123!';
const ADMIN = 'admin@mtogo.dk';
const AGENT = 'delivery-courier@mtogo.dk';
const CUSTOMER = 'delivery-customer@mtogo.dk';
const APPLICANT = 'applicant-delivery@mtogo.dk';

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
}

async function openProfile(page) {
  await page.goto('/min-profil');
  await expect(page.getByRole('heading', { name: 'Min profil' })).toBeVisible();
}

const deliveryPageButton = (page) => page.getByRole('button', { name: 'Delivery page', exact: true });

test('a customer without an approved application has no Delivery page', async ({ page }) => {
  await logIn(page, CUSTOMER);
  await openProfile(page);

  await expect(page.getByRole('button', { name: 'Personlige oplysninger' })).toBeVisible();
  await expect(deliveryPageButton(page)).toHaveCount(0);
});

test('the delivery routes reject a user who is not a delivery agent', async ({ page }) => {
  const headers = await authenticate(page.request, CUSTOMER);

  expect((await page.request.get(`${API}/deliveries/available`, { headers })).status()).toBe(401);
  expect((await page.request.get(`${API}/deliveries/mine`, { headers })).status()).toBe(401);
  expect((await page.request.post(`${API}/deliveries/${crypto.randomUUID()}/accept`, { headers })).status()).toBe(401);
});

test('opening the delivery page directly is refused for a user who is not a delivery agent', async ({ page }) => {
  await logIn(page, CUSTOMER);

  await page.goto('/chauffoerpanel');

  await expect(page.getByText('Kun chaufførpartnere har adgang til leveringsoversigten.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ledige leverancer' })).toHaveCount(0);
});

test('an approved delivery agent sees the Delivery page in the profile and reaches the available orders and own trips', async ({ page }) => {
  await logIn(page, AGENT);
  await openProfile(page);

  await expect(deliveryPageButton(page)).toBeVisible();
  await deliveryPageButton(page).click();
  await expect(page.getByRole('heading', { name: 'Delivery page', level: 2 })).toBeVisible();

  await page.getByRole('link', { name: 'Se ledige leverancer →' }).click();
  await expect(page).toHaveURL('/chauffoerpanel');
  await expect(page.getByRole('heading', { name: 'Ledige leverancer', level: 1 })).toBeVisible();

  await openProfile(page);
  await deliveryPageButton(page).click();
  await page.getByRole('link', { name: 'Åbn mine ture →' }).click();
  await expect(page).toHaveURL('/chauffoerpanel/ture');
  await expect(page.getByRole('heading', { name: 'Mine ture', level: 1 })).toBeVisible();
});

test('a user who is approved while logged in gets the Delivery page without logging in again', async ({ page }) => {
  await logIn(page, APPLICANT);
  await openProfile(page);
  await expect(deliveryPageButton(page)).toHaveCount(0);

  const applicant = await authenticate(page.request, APPLICANT);
  const created = await page.request.post(`${API}/driver-applications`, {
    headers: applicant,
    data: {
      phoneNumber: '28345678',
      vehicle: 'BIKE',
      region: 'CAPITAL',
      weeklyHours: 10,
      timesOfDay: ['MIDDAY']
    }
  });
  expect(created.status()).toBe(201);
  const { id } = (await created.json()).data;

  await page.goto('/chauffoerpanel');
  await expect(page.getByText('Kun chaufførpartnere har adgang til leveringsoversigten.')).toBeVisible();

  const decision = await page.request.put(`${API}/driver-application/${id}/decision`, {
    headers: await authenticate(page.request, ADMIN),
    data: { status: 'APPROVED' }
  });
  expect(decision.status()).toBe(200);

  await page.goto('/chauffoerpanel');
  await expect(page.getByRole('heading', { name: 'Ledige leverancer', level: 1 })).toBeVisible();

  await page.goto('/min-profil');
  await expect(deliveryPageButton(page)).toBeVisible();
});
