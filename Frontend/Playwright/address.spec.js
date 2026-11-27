import { test, expect } from '@playwright/test';

const API = 'http://localhost:6970/api';
const USER = { email: 'owner@mtogo.dk', password: 'Password123!' };

const feature = (properties) => ({ type: 'Feature', properties: { countrycode: 'DK', ...properties } });

const STREETS = [feature({ name: 'Bytoften', postcode: '2650', city: 'Hvidovre', type: 'street' })];
const HOUSES = [
  feature({ street: 'Bytoften', housenumber: '1', postcode: '2650', city: 'Hvidovre', type: 'house' }),
  feature({ street: 'Bytoften', housenumber: '12', postcode: '2650', city: 'Hvidovre', type: 'house' })
];

async function mockAddressService(page) {
  const queries = [];
  await page.route('https://photon.komoot.io/**', async (route) => {
    const q = new URL(route.request().url()).searchParams.get('q');
    queries.push(q);
    const features = /\d/.test(q.replace(/2650/, '')) ? HOUSES : STREETS;
    await route.fulfill({ json: { features } });
  });
  return queries;
}

async function openDeliveryAddress(page) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(USER.email);
  await page.getByLabel('Adgangskode', { exact: true }).fill(USER.password);
  await page.getByRole('button', { name: 'Log ind' }).click();
  await expect(page).toHaveURL('/');

  await page.goto('/min-profil');
  await page.getByRole('button', { name: 'Leveringsadresse' }).click();
  await expect(page.getByLabel('Adresse')).toBeVisible();
}

async function clearAddress(page) {
  const token = await page.evaluate(() => localStorage.getItem('token'));
  await page.request.patch(`${API}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { street: '', postal_code: '', city: '' }
  });
}

test('typing a street suggests addresses and the chosen one is saved and shown again after a reload', async ({ page }) => {
  await mockAddressService(page);
  await openDeliveryAddress(page);

  try {
    await page.getByLabel('Adresse').fill('Bytoften');
    await page.getByRole('option', { name: 'Bytoften, 2650 Hvidovre' }).click();

    // A street alone has no number yet, so the customer keeps typing and gets numbers back.
    await expect(page.getByLabel('Adresse')).toHaveValue('Bytoften ');
    await page.getByLabel('Adresse').fill('Bytoften 1');
    await expect(page.getByRole('option', { name: 'Bytoften 12, 2650 Hvidovre' })).toBeVisible();
    await page.getByRole('option', { name: 'Bytoften 1, 2650 Hvidovre' }).click();

    await expect(page.getByLabel('Postnummer')).toHaveValue('2650');
    await expect(page.getByLabel('By')).toHaveValue('Hvidovre');

    await page.getByLabel('Etage / dør').fill('2. th');
    await page.getByRole('button', { name: 'Gem leveringsadresse' }).click();
    await expect(page.getByText('Din leveringsadresse er gemt.')).toBeVisible();

    await page.reload();
    await page.getByRole('button', { name: 'Leveringsadresse' }).click();
    await expect(page.getByLabel('Adresse')).toHaveValue('Bytoften 1, 2650 Hvidovre');
    await expect(page.getByLabel('Postnummer')).toHaveValue('2650');
    await expect(page.getByLabel('Etage / dør')).toHaveValue('2. th');
  } finally {
    await clearAddress(page);
  }
});

test('no request is sent to the address service before three letters are typed', async ({ page }) => {
  const queries = await mockAddressService(page);
  await openDeliveryAddress(page);

  await page.getByLabel('Adresse').fill('By');
  await page.waitForTimeout(600);

  expect(queries).toHaveLength(0);
  await expect(page.getByRole('listbox')).toHaveCount(0);
});

test('saving without choosing an address asks the customer to search for one', async ({ page }) => {
  await mockAddressService(page);
  await openDeliveryAddress(page);

  await page.getByRole('button', { name: 'Gem leveringsadresse' }).click();

  await expect(page.getByText('Søg efter din adresse, og vælg et af forslagene.').last()).toBeVisible();
});

test('a failing address service shows a message instead of breaking the page', async ({ page }) => {
  await page.route('https://photon.komoot.io/**', (route) => route.fulfill({ status: 500, body: '' }));
  await openDeliveryAddress(page);

  await page.getByLabel('Adresse').fill('Bytoften');

  await expect(page.getByText('Adresseforslag kan ikke hentes lige nu.')).toBeVisible();
});
