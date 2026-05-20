import { test, expect } from './fixtures';

test.describe('Navigation', () => {
  test('should have sidebar with all navigation items', async ({ page }) => {
    const navItems = ['Dashboard', 'Calendar', 'Residents', 'Reservations', 'Payments', 'Holidays', 'Pricing'];
    for (const item of navItems) {
      await expect(page.getByRole('link', { name: item })).toBeVisible();
    }
  });

  test('should navigate to Dashboard page', async ({ page }) => {
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
  });

  test('should navigate to Calendar page', async ({ page }) => {
    await page.getByRole('link', { name: 'Calendar' }).click();
    await expect(page).toHaveURL('/calendar');
    await expect(page.getByRole('heading', { name: /Calendar/i })).toBeVisible();
  });

  test('should navigate to Residents page', async ({ page }) => {
    await page.getByRole('link', { name: 'Residents' }).click();
    await expect(page).toHaveURL('/residents');
    await expect(page.getByRole('heading', { name: /Residents/i })).toBeVisible();
  });

  test('should navigate to Reservations page', async ({ page }) => {
    await page.getByRole('link', { name: 'Reservations' }).click();
    await expect(page).toHaveURL('/reservations');
    await expect(page.getByRole('heading', { name: /Reservations/i })).toBeVisible();
  });

  test('should navigate to Payments page', async ({ page }) => {
    await page.getByRole('link', { name: 'Payments' }).click();
    await expect(page).toHaveURL('/payments');
    await expect(page.getByRole('heading', { name: /Payments/i })).toBeVisible();
  });

  test('should navigate to Holidays page', async ({ page }) => {
    await page.getByRole('link', { name: 'Holidays' }).click();
    await expect(page).toHaveURL('/holidays');
    await expect(page.getByRole('heading', { name: /Holidays/i })).toBeVisible();
  });

  test('should navigate to Pricing page', async ({ page }) => {
    await page.getByRole('link', { name: 'Pricing' }).click();
    await expect(page).toHaveURL('/pricing');
    await expect(page.getByRole('heading', { name: /Pricing Configuration/i })).toBeVisible();
  });

  test('should have active state on current page link', async ({ page }) => {
    await page.goto('/');
    const dashboardLink = page.getByRole('link', { name: 'Dashboard' });
    await expect(dashboardLink).toHaveClass(/bg-indigo-50/);
  });

  test('should have mobile menu button on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('button', { name: '' }).first()).toBeVisible();
  });
});
