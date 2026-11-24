import { test, expect } from '@playwright/test';


test('the restaurant overview is loaded from the backend', async ({ page }) => {
  await page.goto('/restauranter');

  await expect(page.getByRole('heading', { name: 'Mamma Mia Pizza' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tokyo Sushi' })).toBeVisible();
  
});
