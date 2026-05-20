import { test, expect } from './fixtures';

test.describe('Calendar Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calendar');
  });

  test('should display calendar title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Reservation Calendar/i })).toBeVisible();
  });

  test('should display month and year', async ({ page }) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    await expect(page.getByText(`${monthNames[currentMonth]} ${currentYear}`)).toBeVisible();
  });

  test('should display day names header', async ({ page }) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (const day of dayNames) {
      await expect(page.getByText(day).first()).toBeVisible();
    }
  });

  test('should display calendar grid with days', async ({ page }) => {
    const calendarDays = page.locator('button.min-h-\\[80px\\]');
    await expect(calendarDays).toHaveCount(42);
  });

  test('should navigate to previous month', async ({ page }) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = new Date().getMonth();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear();

    await page.locator('.flex.items-center.justify-between.mb-6 button').first().click();
    await expect(page.getByText(`${monthNames[prevMonth]} ${prevYear}`)).toBeVisible();
  });

  test('should navigate to next month', async ({ page }) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = new Date().getMonth();
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? new Date().getFullYear() + 1 : new Date().getFullYear();

    await page.locator('.flex.items-center.justify-between.mb-6 button').last().click();
    await expect(page.getByText(`${monthNames[nextMonth]} ${nextYear}`)).toBeVisible();
  });

  test('should display status filter dropdown', async ({ page }) => {
    await expect(page.getByRole('combobox')).toBeVisible();
  });

  test('should display legend with status indicators', async ({ page }) => {
    await expect(page.locator('.flex-wrap.gap-4').getByText('Paid').first()).toBeVisible();
    await expect(page.locator('.flex-wrap.gap-4').getByText('Pending').first()).toBeVisible();
    await expect(page.locator('.flex-wrap.gap-4').getByText('Partially Paid').first()).toBeVisible();
    await expect(page.locator('.flex-wrap.gap-4').getByText('Cancelled').first()).toBeVisible();
    await expect(page.locator('.flex-wrap.gap-4').getByText('Holiday').first()).toBeVisible();
  });

  test('should open modal when clicking on a day', async ({ page }) => {
    const firstCurrentMonthDay = page.locator('button.min-h-\\[80px\\]').filter({ hasText: '1' }).first();
    await firstCurrentMonthDay.click();
    await expect(page.locator('.fixed.inset-0.z-50')).toBeVisible();
  });

  test('should show resident selection form for empty day', async ({ page }) => {
    // Click on a day in the current month (days with white background, not gray)
    const currentMonthDays = page.locator('button.min-h-\\[80px\\].bg-white, button.min-h-\\[80px\\].bg-yellow-50, button.min-h-\\[80px\\].bg-green-50, button.min-h-\\[80px\\].bg-blue-50, button.min-h-\\[80px\\].bg-red-50, button.min-h-\\[80px\\].bg-purple-50');
    const firstCurrentMonthDay = currentMonthDays.first();
    await firstCurrentMonthDay.click();
    await page.waitForTimeout(500);

    // Check that modal is visible
    await expect(page.locator('.fixed.inset-0.z-50')).toBeVisible();
  });
});
