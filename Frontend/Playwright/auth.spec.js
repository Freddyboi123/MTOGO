import { test, expect } from '@playwright/test';

const USER = { email: 'owner@mtogo.dk', password: 'Password123!' };

async function fillLogin(page, { email, password }) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Adgangskode', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Log ind' }).click();
}

const token = (page) => page.evaluate(() => localStorage.getItem('token'));

test('a verified user can log in, see their profile and log out', async ({ page }) => {
  await fillLogin(page, USER);

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('link', { name: 'Profil', exact: true })).toBeVisible();
  expect(await token(page)).toBeTruthy();

  await page.getByRole('link', { name: 'Profil', exact: true }).click();
  await expect(page).toHaveURL('/min-profil');

  await page.getByRole('button', { name: 'Log ud' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('link', { name: 'Log ind', exact: true })).toBeVisible();
  expect(await token(page)).toBeNull();
});

test('a wrong password shows the backend error and does not log in', async ({ page }) => {
  await fillLogin(page, { email: USER.email, password: 'Wrong-Password1!' });

  await expect(page.getByText('Wrong email or password')).toBeVisible();
  await expect(page).toHaveURL('/login');
  expect(await token(page)).toBeNull();
});

test('a new user can sign up but cannot log in before verifying their email', async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;
  const password = 'Password123!';

  await page.goto('/opret-konto');
  await page.getByLabel('Fulde navn').fill('E2E Tester');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Adgangskode', { exact: true }).fill(password);
  await page.getByLabel('Gentag adgangskode').fill(password);
  await page.getByRole('button', { name: 'Opret konto' }).click();

  await expect(page.getByRole('button', { name: 'Opret konto' })).toBeDisabled();

  await fillLogin(page, { email, password });

  await expect(page.getByText('You must verify your account')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send bekræftelsesmail igen' })).toBeVisible();
  expect(await token(page)).toBeNull();
});
