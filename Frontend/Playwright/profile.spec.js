import { test, expect } from '@playwright/test';

const API = 'http://localhost:6970/api';
const USER = { email: 'owner@mtogo.dk', password: 'Password123!' };

async function loginAndOpenPersonalInfo(page) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(USER.email);
  await page.getByLabel('Adgangskode', { exact: true }).fill(USER.password);
  await page.getByRole('button', { name: 'Log ind' }).click();
  await expect(page).toHaveURL('/');

  await page.goto('/min-profil');
  await expect(page.getByLabel('Fornavn')).toHaveValue('Template');
}

const save = (page) => page.getByRole('button', { name: 'Gem ændringer' });

async function restoreProfile(page, body) {
  const token = await page.evaluate(() => localStorage.getItem('token'));
  await page.request.patch(`${API}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` },
    data: body
  });
}

test('the personal details come from the backend and the old Sikkerhed tab is gone', async ({ page }) => {
  await loginAndOpenPersonalInfo(page);

  await expect(page.getByLabel('Efternavn')).toHaveValue('Owner');
  await expect(page.getByLabel('E-mail')).toHaveValue(USER.email);
  await expect(page.getByRole('button', { name: 'Sikkerhed' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Skift adgangskode' })).toBeVisible();
});

test('saving without changing anything sends nothing', async ({ page }) => {
  await loginAndOpenPersonalInfo(page);

  let patchCalls = 0;
  page.on('request', (request) => {
    if (request.method() === 'PATCH') patchCalls += 1;
  });

  await save(page).click();

  await expect(page.getByText('Der er ingen ændringer at gemme.')).toBeVisible();
  expect(patchCalls).toBe(0);
});

test('a changed name and phone number are saved and still there after a reload', async ({ page }) => {
  await loginAndOpenPersonalInfo(page);

  try {
    await page.getByLabel('Efternavn').fill('Changed');
    await page.getByLabel('Telefonnummer (valgfrit)').fill('12345678');
    await save(page).click();

    await expect(page.getByText('Dine oplysninger er gemt.')).toBeVisible();
    await expect(page.locator('nav').getByText('Template Changed')).toBeVisible();

    await page.reload();
    await expect(page.getByLabel('Efternavn')).toHaveValue('Changed');
    await expect(page.getByLabel('Telefonnummer (valgfrit)')).toHaveValue('12345678');

    await page.getByLabel('Telefonnummer (valgfrit)').fill('');
    await save(page).click();
    await expect(page.getByText('Dine oplysninger er gemt.')).toBeVisible();
    await page.reload();
    await expect(page.getByLabel('Telefonnummer (valgfrit)')).toHaveValue('');
  } finally {
    await restoreProfile(page, { last_name: 'Owner', phone_number: '' });
  }
});

test('only the changed fields are sent to the backend', async ({ page }) => {
  await loginAndOpenPersonalInfo(page);

  try {
    const requestPromise = page.waitForRequest(
      (request) => request.method() === 'PATCH' && request.url().endsWith('/users/profile')
    );
    await page.getByLabel('Efternavn').fill('Partial');
    await save(page).click();

    expect((await requestPromise).postDataJSON()).toEqual({ last_name: 'Partial' });
  } finally {
    await restoreProfile(page, { last_name: 'Owner' });
  }
});

test('an invalid phone number shows the backend error and saves nothing', async ({ page }) => {
  await loginAndOpenPersonalInfo(page);

  await page.getByLabel('Telefonnummer (valgfrit)').fill('abc');
  await save(page).click();

  await expect(page.getByText('The phone number is not valid')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Telefonnummer (valgfrit)')).toHaveValue('');
});

test('the password can be changed with the current password and the old one stops working', async ({ page }) => {
  const newPassword = 'NewPassword1!';
  await loginAndOpenPersonalInfo(page);

  try {
    await page.getByLabel('Nuværende adgangskode').fill(USER.password);
    await page.getByLabel('Ny adgangskode', { exact: true }).fill(newPassword);
    await page.getByLabel('Gentag ny adgangskode').fill(newPassword);
    await save(page).click();

    await expect(page.getByText('Dine oplysninger er gemt.')).toBeVisible();
    await expect(page.getByLabel('Nuværende adgangskode')).toHaveValue('');

    const oldLogin = await page.request.post(`${API}/users/auth/login`, { data: USER });
    expect(oldLogin.status()).toBe(401);
    const newLogin = await page.request.post(`${API}/users/auth/login`, {
      data: { email: USER.email, password: newPassword }
    });
    expect(newLogin.status()).toBe(200);
  } finally {
    await restoreProfile(page, {
      current_password: newPassword,
      new_password: USER.password,
      repeat_password: USER.password
    });
  }
});

test('a wrong current password shows the backend error and keeps the password', async ({ page }) => {
  await loginAndOpenPersonalInfo(page);

  await page.getByLabel('Nuværende adgangskode').fill('Wrong-Password1!');
  await page.getByLabel('Ny adgangskode', { exact: true }).fill('NewPassword1!');
  await page.getByLabel('Gentag ny adgangskode').fill('NewPassword1!');
  await save(page).click();

  await expect(page.getByText('The current password is wrong')).toBeVisible();
  const stillWorks = await page.request.post(`${API}/users/auth/login`, { data: USER });
  expect(stillWorks.status()).toBe(200);
});
