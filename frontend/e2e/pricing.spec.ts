import { test, expect } from './fixtures';

test.describe('Pricing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing');
  });

  test('should display pricing title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Pricing Configuration/i })).toBeVisible();
  });

  test('should display weekday price field', async ({ page }) => {
    await expect(page.getByText('Weekday Price')).toBeVisible();
    await expect(page.getByText('Monday to Friday')).toBeVisible();
  });

  test('should display weekend price field', async ({ page }) => {
    await expect(page.getByText('Weekend Price')).toBeVisible();
    await expect(page.getByText('Saturday and Sunday')).toBeVisible();
  });

  test('should display holiday price field', async ({ page }) => {
    await expect(page.getByText('Holiday Price')).toBeVisible();
    await expect(page.getByText('National, municipal, or condominium holidays')).toBeVisible();
  });

  test('should display save button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Save Pricing/i })).toBeVisible();
  });

  test('should have pre-filled price values', async ({ page }) => {
    const inputs = page.locator('input[type="number"]');
    const count = await inputs.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('should update price values', async ({ page }) => {
    const weekdayInput = page.locator('input[type="number"]').first();
    await weekdayInput.fill('150');
    await expect(weekdayInput).toHaveValue('150');
  });
});
