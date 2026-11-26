import { test, expect } from '@playwright/test';

const API = 'http://localhost:6970/api';
const OWNER = { email: 'owner@mtogo.dk', password: 'Password123!' };

async function logIn(page) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(OWNER.email);
  await page.getByLabel('Adgangskode', { exact: true }).fill(OWNER.password);
  await page.getByRole('button', { name: 'Log ind' }).click();
  await expect(page).toHaveURL('/');
}

async function restaurantId(page, name) {
  const res = await page.request.get(`${API}/restaurants`);
  const { data } = await res.json();
  return data.data.find((restaurant) => restaurant.name === name).id;
}

const menuRow = (page, itemName) => page.getByRole('row', { name: new RegExp(itemName) });
const menuCard = (page, itemName) => page.locator('article', { hasText: itemName });

test('the restaurant changes a price and the customer sees the new price', async ({ page }) => {
  const id = await restaurantId(page, 'Mamma Mia Pizza');
  await logIn(page);
  await page.goto(`/restaurantpanel/${id}/menu`);

  await menuRow(page, 'Quattro Formaggi').getByRole('button', { name: 'Rediger' }).click();
  await page.getByLabel('Pris (kr.)').fill('115');
  await page.getByRole('button', { name: 'Gem ændringer' }).click();

  await expect(page.getByText('Quattro Formaggi er gemt')).toBeVisible();
  await expect(menuRow(page, 'Quattro Formaggi')).toContainText('115 kr.');

  await page.goto(`/restaurant/${id}`);
  await expect(menuCard(page, 'Quattro Formaggi')).toContainText('115 kr.');
});

test('the restaurant marks an item as sold out and the customer sees it', async ({ page }) => {
  const id = await restaurantId(page, 'Mamma Mia Pizza');
  await logIn(page);
  await page.goto(`/restaurantpanel/${id}/menu`);

  await menuRow(page, 'Pepperoni').getByRole('button', { name: 'Marker udsolgt' }).click();
  await expect(menuRow(page, 'Pepperoni')).toContainText('Udsolgt');

  await page.goto(`/restaurant/${id}`);
  await expect(menuCard(page, 'Pepperoni')).toContainText('Udsolgt');

  await page.goto(`/restaurantpanel/${id}/menu`);
  await menuRow(page, 'Pepperoni').getByRole('button', { name: 'Gør aktiv' }).click();
  await expect(menuRow(page, 'Pepperoni')).toContainText('Aktiv');
});
