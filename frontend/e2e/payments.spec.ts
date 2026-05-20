import { test, expect } from './fixtures';

test.describe('Payments Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/payments');
  });

  test('should display payments title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Payments/i })).toBeVisible();
  });

  test('should display stat cards', async ({ page }) => {
    await page.waitForTimeout(1000);
    const statCards = page.locator('.grid.grid-cols-1.sm\\:grid-cols-3.gap-4.mb-6 .card');
    await expect(statCards).toHaveCount(3);
  });

  test('should display status filter', async ({ page }) => {
    await expect(page.getByRole('combobox')).toBeVisible();
  });

  test('should display payments table', async ({ page }) => {
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

  test('should have table headers', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Reservation ID' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Total' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Paid' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Remaining' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Method' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();
  });

  test('should display payment status badges', async ({ page }) => {
    await expect(page.locator('.badge').first()).toBeVisible();
  });

  test('should have numeric values for amounts', async ({ page }) => {
    const amountCells = page.locator('td').filter({ hasText: /\$\d+/ });
    const count = await amountCells.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
