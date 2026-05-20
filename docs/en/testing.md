# Testing Guide

This guide covers testing for both the backend and frontend of the Coriga project.

## Backend E2E Tests

### Running Tests

```bash
cd backend
npm run test:e2e
```

### Test Coverage

| Module | Tests |
|--------|-------|
| Residents | CRUD operations, search functionality, input validation |
| Reservations | CRUD operations, date filtering, cancellation, automatic pricing |
| Payments | Payment recording, status updates, partial payments |
| Holidays | CRUD operations, year filtering |
| Pricing Config | Get and update pricing configuration |
| Dashboard | Statistics calculation |

### Running Specific Tests

```bash
# Run tests for a specific module
npm run test:e2e -- residents
npm run test:e2e -- reservations
npm run test:e2e -- payments
```

### Test Configuration

Tests use a separate test database to avoid affecting development data. Configuration is in `jest-e2e.json`.

## Frontend E2E Tests

### Running Tests

```bash
cd frontend
npm run test:e2e
```

### Test Coverage

| Page | Tests |
|------|-------|
| Navigation | Sidebar links, active states, mobile menu |
| Dashboard | Stat cards, revenue overview, upcoming reservations |
| Calendar | Month navigation, day grid, status filter, legend, modals |
| Residents | Table display, search, add/edit modals, status badges |
| Reservations | Table display, filters, new reservation modal, CSV export |
| Payments | Stat cards, table display, status badges |
| Holidays | Table display, year filter, add/edit modals, type badges |
| Pricing | Price fields, save button |

### Running Specific Tests

```bash
# Run tests with Playwright UI
npm run test:e2e -- --ui

# Run tests in headed mode
npm run test:e2e -- --headed
```

### Test Configuration

Frontend tests use Playwright. Configuration is in `playwright.config.ts`.

## Writing Tests

### Backend Tests

Backend tests are located in `backend/test/`. Use the NestJS testing utilities:

```typescript
import { Test, TestingModule } from '@nestjs/testing';

describe('ResidentsService', () => {
  let service: ResidentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResidentsService],
    }).compile();

    service = module.get<ResidentsService>(ResidentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### Frontend Tests

Frontend tests are located in `frontend/e2e/`. Use Playwright:

```typescript
import { test, expect } from '@playwright/test';

test('should display dashboard', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```
