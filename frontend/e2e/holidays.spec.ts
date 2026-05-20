import { test, expect } from './fixtures';

test.describe('Holidays Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/holidays');
  });

  test('should display holidays title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Holidays/i })).toBeVisible();
  });

  test('should display add holiday button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Add Holiday/i })).toBeVisible();
  });

  test('should display year filter', async ({ page }) => {
    await expect(page.locator('input[type="number"]')).toBeVisible();
  });

  test('should display holidays table', async ({ page }) => {
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

  test('should have table headers', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Date' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Type' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Notes' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();
  });

  test('should open modal when clicking add holiday', async ({ page }) => {
    await page.getByRole('button', { name: /Add Holiday/i }).click();
    await expect(page.locator('.fixed.inset-0.z-50')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Add Holiday' })).toBeVisible();
  });

  test('should have form fields in add holiday modal', async ({ page }) => {
    await page.getByRole('button', { name: /Add Holiday/i }).click();
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
    await expect(page.locator('input[type="date"]')).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('should close modal when clicking cancel', async ({ page }) => {
    await page.getByRole('button', { name: /Add Holiday/i }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.locator('.fixed.inset-0.z-50')).not.toBeVisible();
  });

  test('should display type badges', async ({ page }) => {
    await expect(page.locator('.badge').first()).toBeVisible();
  });

  test('should have edit and delete buttons for each holiday', async ({ page }) => {
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Check first row has action buttons
    const firstRow = rows.first();
    await expect(firstRow.locator('button').first()).toBeVisible();
  });
});
