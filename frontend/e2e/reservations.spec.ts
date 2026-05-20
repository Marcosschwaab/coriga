import { test, expect } from './fixtures';

test.describe('Reservations Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reservations');
  });

  test('should display reservations title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Reservations/i })).toBeVisible();
  });

  test('should display new reservation button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /New Reservation/i })).toBeVisible();
  });

  test('should display export CSV button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Export CSV/i })).toBeVisible();
  });

  test('should display status filter', async ({ page }) => {
    await expect(page.getByRole('combobox')).toBeVisible();
  });

  test('should display reservations table', async ({ page }) => {
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

  test('should have table headers', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Date' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Resident' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Day Type' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Price' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Payment' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();
  });

  test('should open modal when clicking new reservation', async ({ page }) => {
    await page.getByRole('button', { name: /New Reservation/i }).click();
    await expect(page.locator('.fixed.inset-0.z-50')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'New Reservation' })).toBeVisible();
  });

  test('should have form fields in new reservation modal', async ({ page }) => {
    await page.getByRole('button', { name: /New Reservation/i }).click();
    await page.waitForTimeout(500);
    await expect(page.locator('select').first()).toBeVisible();
    await expect(page.locator('input[type="date"]')).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('should close modal when clicking cancel', async ({ page }) => {
    await page.getByRole('button', { name: /New Reservation/i }).click();
    await page.getByText('Cancel', { exact: true }).click();
    await expect(page.locator('.fixed.inset-0.z-50')).not.toBeVisible();
  });

  test('should display status badges', async ({ page }) => {
    await expect(page.locator('.badge').first()).toBeVisible();
  });
});
