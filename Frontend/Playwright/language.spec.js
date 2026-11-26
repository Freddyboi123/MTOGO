import { test, expect } from '@playwright/test';

async function turnOnLanguageChoice(page) {
  await page.route('**/api/features', async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    await route.fulfill({ json: { ...body, data: { ...body.data, languageChoice: true } } });
  });
}

test('the language switch is hidden while the flag is off', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('button', { name: 'Switch to English' })).toHaveCount(0);
});

test('the header and footer switch to English and the choice is remembered', async ({ page }) => {
  await turnOnLanguageChoice(page);
  await page.goto('/');

  await page.getByRole('button', { name: 'Switch to English' }).click();

  await expect(page.getByRole('link', { name: 'Become a partner' }).first()).toBeVisible();
  await expect(page.getByText('All rights reserved')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  await page.reload();
  await expect(page.getByRole('link', { name: 'Log in', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Skift til dansk' }).click();
  await expect(page.getByRole('link', { name: 'Log ind', exact: true })).toBeVisible();
});
