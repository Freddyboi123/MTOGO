import { test, expect } from '@playwright/test';

const OWNER = { email: 'owner@mtogo.dk', password: 'Password123!' };

async function logIn(page) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(OWNER.email);
  await page.getByLabel('Adgangskode', { exact: true }).fill(OWNER.password);
  await page.getByRole('button', { name: 'Log ind' }).click();
  await expect(page).toHaveURL('/');
}

test('the restaurant application page sends a visitor who is not logged in to login', async ({ page }) => {
  await page.goto('/ansoeg/restaurant');

  await expect(page).toHaveURL('/login');
});

test('Bliv partner sends a logged in user to the application in the profile', async ({ page }) => {
  await logIn(page);

  await page.getByRole('link', { name: 'Bliv partner' }).first().click();

  await expect(page).toHaveURL('/min-profil');
  await expect(page.getByRole('heading', { name: 'Mine ansøgninger' })).toBeVisible();
});
