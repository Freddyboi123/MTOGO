import { test, expect } from '@playwright/test';

const API = 'http://localhost:6970/api';
const PASSWORD = 'Password123!';
const ADMIN = 'admin@mtogo.dk';

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

async function applyForDelivery(request, email, overrides = {}) {
  const headers = await authenticate(request, email);
  const response = await request.post(`${API}/driver-applications`, {
    headers,
    data: {
      phoneNumber: '28345678',
      vehicle: 'E_BIKE',
      region: 'CAPITAL',
      weeklyHours: 20,
      timesOfDay: ['EVENING', 'NIGHT'],
      ...overrides
    }
  });
  expect(response.status()).toBe(201);
  return { headers, id: (await response.json()).data.id };
}

async function openAdminApplications(page) {
  await logIn(page, ADMIN);
  await page.goto('/admin/ansoegninger/chauffoer');
  await expect(page.getByRole('heading', { name: 'Chaufføransøgninger' })).toBeVisible();
}

function row(page, name) {
  return page.locator('div[class*="listRow"]').filter({ hasText: name });
}

async function select(page, name) {
  await row(page, name).first().click();
  await expect(page.getByRole('heading', { name, level: 2 })).toBeVisible();
}

async function isDeliveryAgent(request, headers) {
  const response = await request.get(`${API}/deliveries/mine`, { headers });
  return response.status() === 200;
}

async function openMyDriverApplications(page, email) {
  await logIn(page, email);
  await page.goto('/min-profil');
  await page.getByRole('button', { name: 'Mine ansøgninger' }).click();
  await page.getByRole('tab', { name: 'Driver ansøgninger' }).click();
}

test('the admin sees the delivery applications with the details the applicant gave', async ({ page }) => {
  await applyForDelivery(page.request, 'applicant-info@mtogo.dk', {
    vehicle: 'SCOOTER',
    region: 'SOUTHERN_DENMARK',
    weeklyHours: 14,
    timesOfDay: ['MORNING', 'MIDDAY']
  });

  await openAdminApplications(page);
  await select(page, 'Info Applicant');

  await expect(page.getByText('Info Applicant · applicant-info@mtogo.dk')).toBeVisible();
  await expect(page.getByText('28345678')).toBeVisible();
  await expect(page.getByText('Scooter', { exact: true }).last()).toBeVisible();
  await expect(page.getByText('Region Syddanmark').last()).toBeVisible();
  await expect(page.getByText('14 timer om ugen')).toBeVisible();
  await expect(page.getByText('Morgen, Middag')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Godkend chauffør' })).toBeVisible();
});

test('approving creates the delivery agent and the applicant sees the application as approved', async ({ page, browser }) => {
  const { headers, id } = await applyForDelivery(page.request, 'applicant-approve@mtogo.dk');
  expect(await isDeliveryAgent(page.request, headers)).toBe(false);

  await openAdminApplications(page);
  await select(page, 'Approve Applicant');
  await page.getByRole('button', { name: 'Godkend chauffør' }).click();

  await expect(page.getByRole('status')).toContainText('Approve Applicant er godkendt og oprettet som chauffør');
  await expect(page.getByRole('status')).toContainText('Ansøgeren er blevet notificeret på mail.');
  await expect(page.getByRole('button', { name: 'Godkend chauffør' })).toHaveCount(0);

  expect(await isDeliveryAgent(page.request, headers)).toBe(true);

  const applicant = await browser.newPage();
  await openMyDriverApplications(applicant, 'applicant-approve@mtogo.dk');
  await expect(applicant.locator('article').first()).toContainText('Godkendt');
  await applicant.close();

  const again = await page.request.put(`${API}/driver-application/${id}/decision`, {
    headers: await authenticate(page.request, ADMIN),
    data: { status: 'REJECTED' }
  });
  expect(again.status()).toBe(400);
  expect(await again.text()).toBe('Only a new application can get a decision');
});

test('rejecting keeps the reason, gives no role and the applicant sees why', async ({ page, browser }) => {
  const { headers } = await applyForDelivery(page.request, 'applicant-reject@mtogo.dk', { vehicle: 'CAR' });

  await openAdminApplications(page);
  await select(page, 'Reject Applicant');
  await page.getByLabel('Besked til ansøger').fill('Vi har ikke brug for bilchauffører');
  await page.getByRole('button', { name: 'Afvis' }).click();

  await expect(page.getByRole('status')).toContainText('Reject Applicant er afvist');
  await expect(page.getByText('BESKED TIL ANSØGER')).toBeVisible();
  await expect(page.getByText('Vi har ikke brug for bilchauffører').last()).toBeVisible();

  expect(await isDeliveryAgent(page.request, headers)).toBe(false);

  const applicant = await browser.newPage();
  await openMyDriverApplications(applicant, 'applicant-reject@mtogo.dk');
  const card = applicant.locator('article').first();
  await expect(card).toContainText('Afvist');
  await expect(card).toContainText('Vi har ikke brug for bilchauffører');
  await expect(card.getByRole('button', { name: 'Ret og send igen →' })).toHaveCount(0);
  await applicant.close();
});

test('asking for more information needs a message, reaches the applicant and comes back as new after a correction', async ({ page, browser }) => {
  await applyForDelivery(page.request, 'applicant-resubmit@mtogo.dk', { region: 'ZEALAND' });

  await openAdminApplications(page);
  await select(page, 'Resubmit Applicant');

  await page.getByRole('button', { name: 'Bed om oplysninger' }).click();
  await expect(page.getByText('Skriv hvad der mangler, før du beder om flere oplysninger.')).toBeVisible();

  await page.getByLabel('Besked til ansøger').fill('Vælg den region, du kører i');
  await page.getByRole('button', { name: 'Bed om oplysninger' }).click();

  await expect(page.getByRole('status')).toContainText(
    'Resubmit Applicant er sendt tilbage til ansøgeren for flere oplysninger'
  );
  await expect(row(page, 'Resubmit Applicant').first()).toContainText('Mangler oplysninger');

  const applicant = await browser.newPage();
  await openMyDriverApplications(applicant, 'applicant-resubmit@mtogo.dk');
  const card = applicant.locator('article').first();
  await expect(card).toContainText('Mangler oplysninger');
  await expect(card).toContainText('Vælg den region, du kører i');

  await card.getByRole('button', { name: 'Ret og send igen →' }).click();
  await applicant.getByLabel('Region *').selectOption({ label: 'Region Nordjylland' });
  await applicant.getByRole('button', { name: 'Send igen', exact: true }).click();
  await expect(applicant.getByText('Your application as a delivery agent was sent in again')).toBeVisible();
  await applicant.close();

  await page.reload();
  await select(page, 'Resubmit Applicant');
  await expect(row(page, 'Resubmit Applicant').first()).toContainText('Ny');
  await expect(page.getByText('Region Nordjylland').last()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Godkend chauffør' })).toBeVisible();
});

test('the delivery application list and the decision are closed to everyone but admins', async ({ page }) => {
  const customer = await authenticate(page.request, 'delivery-customer@mtogo.dk');
  const { id } = await applyForDelivery(page.request, 'delivery-customer@mtogo.dk');

  expect((await page.request.get(`${API}/driver-applications`, { headers: customer })).status()).toBe(401);
  expect((await page.request.get(`${API}/driver-application/${id}`, { headers: customer })).status()).toBe(401);
  expect(
    (
      await page.request.put(`${API}/driver-application/${id}/decision`, {
        headers: customer,
        data: { status: 'APPROVED' }
      })
    ).status()
  ).toBe(401);

  const admin = await authenticate(page.request, ADMIN);
  const list = await page.request.get(`${API}/driver-applications`, { headers: admin });
  expect(list.status()).toBe(200);
  const one = await page.request.get(`${API}/driver-application/${id}`, { headers: admin });
  expect(one.status()).toBe(200);
  expect((await one.json()).data.data.id).toBe(id);
});
