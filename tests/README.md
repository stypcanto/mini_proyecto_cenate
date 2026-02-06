# CENATE Playwright Test Suite

## Overview

This directory contains end-to-end (E2E) tests for the CENATE telemedicine application using Playwright. The tests validate critical user flows and ensure the application functions correctly across different scenarios.

## Test Files

### 1. `atender-paciente-v1.47.0.spec.ts`

**Purpose:** Tests the v1.47.0 "Atender Paciente" feature with conditional validation fix.

**Key Features Tested:**
- Medical attention workflow without optional actions
- Conditional backend validation (interconsultaEspecialidad and enfermedades are optional)
- Modal interactions and state management
- API request/response validation
- Error handling and loading states
- UI updates after successful submission

**Test Scenarios:**
1. **Main Flow:** Mark patient as "Atendido" WITHOUT selecting optional actions
2. **With Recita:** Mark patient as "Atendido" WITH only Recita selected
3. **Error Handling:** API failure shows error toast
4. **Cancel Flow:** Cancel button closes modal without API call
5. **Close Flow:** X button closes modal
6. **Loading State:** Shows "Procesando..." during API request

### 2. `dengue-module.spec.ts`

**Purpose:** Tests the Dengue module icon rendering and navigation.

**Key Features Tested:**
- Icon rendering (Bug, Upload, List, Search, BarChart)
- Navigation between subpages
- Menu structure and responsiveness
- API integration
- Permissions

## Setup Instructions

### Prerequisites

1. **Node.js & npm** installed (v16+ recommended)
2. **Playwright** installed as a dev dependency
3. **Backend API** running on `http://localhost:8080`
4. **Frontend React app** running on `http://localhost:3000`

### Installation

```bash
# Install Playwright and dependencies
npm install -D @playwright/test

# Install browsers (first time only)
npx playwright install chromium
```

### Configuration

The test configuration is defined in `playwright.config.ts`:

```typescript
{
  baseURL: 'http://localhost:3000',
  testDir: './tests',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  }
}
```

## Running Tests

### Run All Tests

```bash
npx playwright test
```

### Run Specific Test File

```bash
npx playwright test tests/atender-paciente-v1.47.0.spec.ts
```

### Run Tests in Headed Mode (with browser UI)

```bash
npx playwright test --headed
```

### Run Tests in Debug Mode

```bash
npx playwright test --debug
```

### Run Specific Test by Name

```bash
npx playwright test -g "should successfully mark patient as Atendido"
```

### Run Tests in UI Mode (Interactive)

```bash
npx playwright test --ui
```

## Test Reports

After running tests, generate and view the HTML report:

```bash
npx playwright show-report
```

The report includes:
- Test execution timeline
- Screenshots of failures
- Video recordings (on failures)
- Network activity
- Console logs

## Test User Configuration

### Setting Up Test Users

For the v1.47.0 test suite, you need a MEDICO role user. Update the credentials in `atender-paciente-v1.47.0.spec.ts`:

```typescript
const TEST_MEDICO = {
  username: 'medico_test',  // Replace with actual username
  password: 'test123',      // Replace with actual password
  token: null
};
```

### Creating Test Data

Ensure there are patients in the system:

1. Login as COORDINADOR
2. Assign patients to the test MEDICO user
3. Ensure at least one patient has status "Pendiente" or "Citado" (not "Atendido")

## Test Structure Best Practices

### 1. Exploration Phase (Already Done)

Before writing tests, we explored:
- The actual UI structure using screenshots
- Element locators (buttons, modals, tables)
- API endpoints and payloads
- User flows and interactions

### 2. Test Generation Phase

Tests follow this structure:

```typescript
test.describe('Feature Name', () => {
  // Setup
  test.beforeEach(async ({ browser }) => {
    // Initialize page, login, navigate
  });

  // Cleanup
  test.afterEach(async () => {
    // Close page
  });

  // Test cases
  test('should do something', async () => {
    // Arrange: Set up initial state
    // Act: Perform user action
    // Assert: Verify expected outcome
  });
});
```

### 3. Locator Selection Strategy

We use this priority order:

1. **Text content:** `page.locator('button:has-text("Confirmar")')`
2. **ARIA labels/roles:** `page.locator('button[aria-label="Close"]')`
3. **Data attributes:** `page.locator('[data-testid="patient-row"]')`
4. **CSS selectors:** `page.locator('button.bg-green-100')` (least preferred)

### 4. Waiting Strategies

- `waitForLoadState('networkidle')` - After navigation
- `waitForSelector()` - For dynamic elements
- `expect().toBeVisible({ timeout: 5000 })` - For assertions
- Avoid `waitForTimeout()` except for animations

## Debugging Tests

### View Browser Console Logs

Tests capture console errors automatically:

```typescript
page.on('console', msg => {
  if (msg.type() === 'error') {
    console.log('[Browser error]:', msg.text());
  }
});
```

### Inspect API Requests

Tests monitor API responses:

```typescript
page.on('response', response => {
  if (response.url().includes('/atendido')) {
    console.log(`[API] ${response.status()} ${response.url()}`);
  }
});
```

### Take Screenshots on Demand

```typescript
await page.screenshot({ path: 'debug-screenshot.png' });
```

### Pause Execution

```typescript
await page.pause();  // Opens Playwright Inspector
```

## Common Issues & Solutions

### Issue: Tests fail with "element not found"

**Solution:** Increase timeout or verify element selector:

```typescript
await expect(element).toBeVisible({ timeout: 10000 });
```

### Issue: Login fails

**Solution:** Check:
1. Backend API is running (`http://localhost:8080`)
2. Test user credentials are correct
3. Database has the test user

### Issue: Modal doesn't open

**Solution:** Verify:
1. Patient table has data
2. Status button locator is correct
3. Network request completed successfully

### Issue: API returns 500 error

**Solution:** Check:
1. Backend logs for error details
2. Request payload matches backend expectations
3. Database constraints are satisfied

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps chromium
      - name: Run Playwright tests
        run: npx playwright test
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Test Maintenance

### When to Update Tests

Update tests when:
1. UI changes (new buttons, layouts)
2. API endpoints change
3. Business logic changes
4. New features added

### Test Stability Tips

1. **Use reliable locators** - Prefer text content over CSS classes
2. **Avoid hard-coded waits** - Use `waitForSelector()` instead
3. **Isolate tests** - Each test should be independent
4. **Clean up state** - Reset database or use test-specific data
5. **Handle flakiness** - Add retries in CI: `retries: 2`

## Performance Metrics

Expected test execution times:

| Test | Duration |
|------|----------|
| Atender Paciente (main flow) | ~5-8 seconds |
| With Recita | ~6-9 seconds |
| Error handling | ~3-5 seconds |
| Modal interactions | ~2-3 seconds |

Total suite execution: **~25-35 seconds**

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Inspector](https://playwright.dev/docs/debug#playwright-inspector)
- [Playwright Test Reporter](https://playwright.dev/docs/test-reporters)

## Contributing

When adding new tests:

1. Follow the existing structure
2. Add descriptive test names
3. Include console logs for debugging
4. Document complex locators
5. Update this README with new test cases
6. Run tests locally before committing

## Support

For issues or questions:

1. Check existing test reports
2. Review browser console logs
3. Check backend API logs
4. Contact: stypcanto@essalud.gob.pe
