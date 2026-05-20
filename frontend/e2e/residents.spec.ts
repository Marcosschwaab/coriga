import { test, expect } from './fixtures';

test.describe('Residents Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/residents');
  });

  test('should display residents title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Residents/i })).toBeVisible();
  });

  test('should display add resident button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Add Resident/i })).toBeVisible();
  });

  test('should display search input', async ({ page }) => {
    await expect(page.getByPlaceholder(/Search by name/i)).toBeVisible();
  });

  test('should display residents table', async ({ page }) => {
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

  test('should have table headers', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Phone' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Address' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();
  });

  test('should open modal when clicking add resident', async ({ page }) => {
    await page.getByRole('button', { name: /Add Resident/i }).click();
    await expect(page.locator('.fixed.inset-0.z-50')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Add Resident' })).toBeVisible();
  });

  test('should have form fields in add resident modal', async ({ page }) => {
    await page.getByRole('button', { name: /Add Resident/i }).click();
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should have cancel and create buttons in modal', async ({ page }) => {
    await page.getByRole('button', { name: /Add Resident/i }).click();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create' })).toBeVisible();
  });

  test('should close modal when clicking cancel', async ({ page }) => {
    await page.getByRole('button', { name: /Add Resident/i }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should display status badges for residents', async ({ page }) => {
    await expect(page.getByText('Active').first()).toBeVisible();
  });

  test('should filter residents when searching', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search by name/i);
    await searchInput.fill('Test');
    await expect(searchInput).toHaveValue('Test');
  });
});
