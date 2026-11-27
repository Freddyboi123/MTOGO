import { test, expect } from '@playwright/test';

const USER = { email: 'owner@mtogo.dk', password: 'Password123!' };

const ORDER = {
  id: '11111111-1111-1111-1111-111111111111',
  restaurantName: 'Mamma Mia Pizza',
  status: 'RECEIVED',
  total: 275,
  createdAt: '2026-11-26T14:30:00',
  lines: [
    { menuItemId: 'a', itemName: 'Margherita', unitPrice: 100, quantity: 2 },
    { menuItemId: 'b', itemName: 'Cola', unitPrice: 75, quantity: 1 }
  ]
};

async function openOrderHistory(page) {
  await page.route('**/api/orders/mine', (route) => route.fulfill({ json: { data: [ORDER] } }));

  await page.goto('/login');
  await page.getByLabel('E-mail').fill(USER.email);
  await page.getByLabel('Adgangskode', { exact: true }).fill(USER.password);
  await page.getByRole('button', { name: 'Log ind' }).click();
  await expect(page).toHaveURL('/');

  await page.goto('/min-profil');
  await page.getByRole('button', { name: 'Ordrehistorik' }).click();
}

test('clicking an order opens a modal with restaurant, date, status, items with quantity and price, and total', async ({ page }) => {
  await openOrderHistory(page);

  await page.getByRole('row', { name: /Mamma Mia Pizza/ }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Mamma Mia Pizza' })).toBeVisible();
  await expect(dialog.getByText('Ny ordre')).toBeVisible();
  await expect(dialog.getByText('26. nov. 2026')).toBeVisible();
  await expect(dialog.getByText('2 × Margherita')).toBeVisible();
  await expect(dialog.getByText('200 kr.', { exact: true })).toBeVisible();
  await expect(dialog.getByText('1 × Cola')).toBeVisible();
  await expect(dialog.getByText('75 kr.', { exact: true })).toBeVisible();
  await expect(dialog.getByText('275 kr.', { exact: true })).toBeVisible();
});

test('the order modal closes with the close button and with Escape', async ({ page }) => {
  await openOrderHistory(page);
  const row = page.getByRole('row', { name: /Mamma Mia Pizza/ });

  await row.click();
  await page.getByRole('button', { name: 'Luk' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await row.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
