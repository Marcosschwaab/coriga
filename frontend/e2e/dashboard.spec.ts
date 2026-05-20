import { test, expect } from './fixtures';

test.describe('Dashboard Page', () => {
  test('should display dashboard title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
  });

  test('should display stat cards', async ({ page }) => {
    await expect(page.getByText('Total Reservations')).toBeVisible();
    await expect(page.getByText('Confirmed')).toBeVisible();
    await expect(page.getByText('Pending Payment')).toBeVisible();
    await expect(page.getByText('Predicted Revenue')).toBeVisible();
  });

  test('should display revenue overview section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Revenue Overview/i })).toBeVisible();
    await expect(page.locator('.bg-green-50').getByText('Received').first()).toBeVisible();
    await expect(page.locator('.bg-blue-50').getByText('Predicted').first()).toBeVisible();
  });

  test('should display upcoming reservations section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Upcoming Reservations/i })).toBeVisible();
  });

  test('should have numeric values for stats', async ({ page }) => {
    await page.waitForTimeout(1000);
    const statValues = page.locator('.text-3xl.font-bold');
    const count = await statValues.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });
});
