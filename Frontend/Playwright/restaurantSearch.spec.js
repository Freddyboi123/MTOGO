import { test, expect } from '@playwright/test';

const USER = { email: 'owner@mtogo.dk', password: 'Password123!' };

const heading = (page, name) => page.getByRole('heading', { name });

const feature = (properties, longitude, latitude) => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [longitude, latitude] },
  properties: { countrycode: 'DK', ...properties }
});

async function mockAddressService(page, features) {
  await page.route('https://photon.komoot.io/**', (route) => route.fulfill({ json: { features } }));
}

const NORREBROGADE = feature(
  { street: 'Nørrebrogade', housenumber: '12', postcode: '2200', city: 'København N', type: 'house' },
  12.548,
  55.6945
);
const AARHUS = feature(
  { street: 'Strøget', housenumber: '5', postcode: '8000', city: 'Aarhus C', type: 'house' },
  10.2039,
  56.1629
);

async function login(page) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(USER.email);
  await page.getByLabel('Adgangskode', { exact: true }).fill(USER.password);
  await page.getByRole('button', { name: 'Log ind' }).click();
  await expect(page).toHaveURL('/');
}

test.describe('/restauranter', () => {
  test('a category only shows the restaurants of that category', async ({ page }) => {
    await page.goto('/restauranter');
    await expect(heading(page, 'Mamma Mia Pizza')).toBeVisible();
    await expect(heading(page, 'Tokyo Sushi')).toBeVisible();
    await expect(heading(page, 'Burger Barn')).toBeVisible();

    await page.getByRole('button', { name: 'Sushi' }).click();

    await expect(heading(page, 'Tokyo Sushi')).toBeVisible();
    await expect(heading(page, 'Mamma Mia Pizza')).toHaveCount(0);
    await expect(heading(page, 'Burger Barn')).toHaveCount(0);

    await page.getByRole('button', { name: 'Alle køkkener' }).click();
    await expect(heading(page, 'Mamma Mia Pizza')).toBeVisible();
  });

  test('the search finds restaurants by name', async ({ page }) => {
    await page.goto('/restauranter');

    await page.getByPlaceholder('Søg efter restaurant').fill('tokyo');

    await expect(heading(page, 'Tokyo Sushi')).toBeVisible();
    await expect(heading(page, 'Mamma Mia Pizza')).toHaveCount(0);
  });

  test('a search inside a category only finds restaurants of that category', async ({ page }) => {
    await page.goto('/restauranter');
    const search = page.getByPlaceholder('Søg efter restaurant');

    await page.getByRole('button', { name: 'Sushi' }).click();
    await search.fill('mamma');

    // Mamma Mia Pizza matches the search, but it is not a sushi restaurant.
    await expect(page.getByText('Ingen restauranter matcher dit valg.')).toBeVisible();
    await expect(heading(page, 'Mamma Mia Pizza')).toHaveCount(0);

    await page.getByRole('button', { name: 'Pizza' }).click();
    await expect(heading(page, 'Mamma Mia Pizza')).toBeVisible();
  });

  test('a link with a category opens the page with that category chosen', async ({ page }) => {
    await page.goto('/restauranter?cuisine=SUSHI');

    await expect(heading(page, 'Tokyo Sushi')).toBeVisible();
    await expect(heading(page, 'Burger Barn')).toHaveCount(0);
  });
});

test.describe('home page', () => {
  test('the category chips and the search change the list of local favourites', async ({ page }) => {
    await page.goto('/');
    await expect(heading(page, 'Burger Barn')).toBeVisible();

    await page.getByRole('button', { name: 'Burger' }).click();
    await expect(heading(page, 'Burger Barn')).toBeVisible();
    await expect(heading(page, 'Tokyo Sushi')).toHaveCount(0);

    await page.getByRole('button', { name: 'Alle køkkener' }).click();
    await page.getByPlaceholder('Søg efter restaurant').fill('mamma');
    await expect(heading(page, 'Mamma Mia Pizza')).toBeVisible();
    await expect(heading(page, 'Burger Barn')).toHaveCount(0);
  });

  test('"Find din italienske favorit" opens the restaurants under Italiensk', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /Find din italienske favorit/ }).click();

    await expect(page).toHaveURL('/restauranter?cuisine=ITALIENSK');
    // No seeded restaurant has this category, so the category is shown as chosen by an empty list.
    await expect(page.getByText('Ingen restauranter matcher dit valg.')).toBeVisible();
  });

  test('"Udforsk bowls & salater" opens the restaurants under Grønt & sundt', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /Udforsk bowls/ }).click();

    await expect(page).toHaveURL('/restauranter?cuisine=GROENT');
    // No seeded restaurant has this category, so the category is shown as chosen by an empty list.
    await expect(page.getByText('Ingen restauranter matcher dit valg.')).toBeVisible();
  });
});

test.describe('find food nearby', () => {
  test('the address is suggested and the nearest restaurants come first with their distance', async ({ page }) => {
    await mockAddressService(page, [NORREBROGADE]);
    await page.goto('/');

    await page.getByPlaceholder('Indtast din leveringsadresse').fill('Nørrebrogade 12');
    await page.getByRole('option', { name: 'Nørrebrogade 12, 2200 København N' }).click();
    await page.getByRole('button', { name: 'Find mad i nærheden' }).click();

    await expect(page).toHaveURL('/restauranter');
    await expect(page.getByText('Sorteret efter afstand til Nørrebrogade 12, 2200 København N')).toBeVisible();

    // Mamma Mia Pizza is next door, Burger Barn about 2 km away and Tokyo Sushi about 3 km away.
    await expect(page.getByRole('heading', { level: 2 })).toHaveText(['Mamma Mia Pizza', 'Burger Barn', 'Tokyo Sushi']);
    await expect(page.getByText(/km væk/)).toHaveCount(3);
  });

  test('the nearby list can be limited to a category and a search', async ({ page }) => {
    await mockAddressService(page, [NORREBROGADE]);
    await page.goto('/');
    await page.getByPlaceholder('Indtast din leveringsadresse').fill('Nørrebrogade 12');
    await page.getByRole('option', { name: 'Nørrebrogade 12, 2200 København N' }).click();
    await page.getByRole('button', { name: 'Find mad i nærheden' }).click();

    await page.getByRole('button', { name: 'Sushi' }).click();

    await expect(page.getByRole('heading', { level: 2 })).toHaveText(['Tokyo Sushi']);
  });

  test('restaurants out of reach are not shown', async ({ page }) => {
    await mockAddressService(page, [AARHUS]);
    await page.goto('/');

    await page.getByPlaceholder('Indtast din leveringsadresse').fill('Strøget 5');
    await page.getByRole('option', { name: 'Strøget 5, 8000 Aarhus C' }).click();
    await page.getByRole('button', { name: 'Find mad i nærheden' }).click();

    await expect(page.getByText('Der er ingen restauranter inden for rækkevidde af din adresse.')).toBeVisible();
    await expect(heading(page, 'Mamma Mia Pizza')).toHaveCount(0);
  });

  test('without a chosen suggestion the customer is asked to pick an address', async ({ page }) => {
    await mockAddressService(page, [NORREBROGADE]);
    await page.goto('/');

    await page.getByPlaceholder('Indtast din leveringsadresse').fill('Nørrebrogade 12');
    await page.getByRole('button', { name: 'Find mad i nærheden' }).click();

    await expect(page.getByText('Søg efter din adresse, og vælg et af forslagene.')).toBeVisible();
    await expect(page).toHaveURL('/');
  });
});

test.describe('restaurant application', () => {
  async function openApplicationForm(page) {
    await login(page);
    await page.goto('/min-profil');
    await page.getByRole('button', { name: 'Mine ansøgninger' }).click();
    await page.getByRole('button', { name: '+ Ny restaurantansøgning' }).click();
  }

  async function fillApplication(page, name) {
    await page.getByLabel('Restaurantnavn *').fill(name);
    await page.getByLabel('CVR-nummer *').fill('12345678');
    await page.getByLabel('E-mail *').fill('kontakt@testeria.dk');
    await page.getByLabel('Telefonnummer *').fill('12345678');
  }

  test('the applicant chooses a category and an address from the suggestions', async ({ page }) => {
    await mockAddressService(page, [NORREBROGADE]);
    await openApplicationForm(page);
    await fillApplication(page, `Testeria ${Date.now()}`);

    await page.getByLabel('Kategori *').selectOption('SUSHI');
    await page.getByLabel('Adresse *').fill('Nørrebrogade 12');
    await page.getByRole('option', { name: 'Nørrebrogade 12, 2200 København N' }).click();
    await expect(page.getByLabel('Postnummer')).toHaveValue('2200');
    await expect(page.getByLabel('By')).toHaveValue('København N');

    const requestPromise = page.waitForRequest(
      (request) => request.method() === 'POST' && request.url().endsWith('/restaurant-applications')
    );
    await page.getByRole('button', { name: 'Indsend ansøgning' }).click();

    const body = (await requestPromise).postDataJSON();
    expect(body).toMatchObject({ cuisine: 'SUSHI', street: 'Nørrebrogade 12', latitude: 55.6945, longitude: 12.548 });
    await expect(page.getByRole('heading', { name: /Testeria/ })).toBeVisible();
  });

  test('an application without a category is not sent', async ({ page }) => {
    await mockAddressService(page, [NORREBROGADE]);
    await openApplicationForm(page);
    await fillApplication(page, `Testeria ${Date.now()}`);
    await page.getByLabel('Adresse *').fill('Nørrebrogade 12');
    await page.getByRole('option', { name: 'Nørrebrogade 12, 2200 København N' }).click();

    await page.getByRole('button', { name: 'Indsend ansøgning' }).click();

    await expect(page.getByText('You must choose a category for the restaurant')).toBeVisible();
  });
});
