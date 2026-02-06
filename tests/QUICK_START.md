# Quick Start Guide - CENATE Playwright Tests

## Prerequisites Check

Before running tests, ensure:

1. **Backend running:** `http://localhost:8080` ✓
2. **Frontend running:** `http://localhost:3000` ✓
3. **Test user exists:** MEDICO role with credentials
4. **Test data exists:** At least one patient assigned to the test medico

## One-Time Setup

```bash
# Install Playwright (first time only)
npm install -D @playwright/test

# Install Chromium browser
npx playwright install chromium
```

## Running Tests - Easy Way

Use the helper script:

```bash
# Run all tests
./tests/run-tests.sh all

# Run v1.47.0 Atender Paciente tests only
./tests/run-tests.sh atender

# Run with browser visible
./tests/run-tests.sh atender headed

# Debug mode (step through tests)
./tests/run-tests.sh debug

# Interactive UI mode
./tests/run-tests.sh ui

# View last test report
./tests/run-tests.sh report
```

## Running Tests - Manual Way

```bash
# All tests
npx playwright test

# Specific test file
npx playwright test tests/atender-paciente-v1.47.0.spec.ts

# Specific test by name
npx playwright test -g "should successfully mark patient as Atendido"

# With browser visible
npx playwright test --headed

# Debug mode
npx playwright test --debug

# Interactive UI
npx playwright test --ui
```

## Test User Setup

Update credentials in `tests/atender-paciente-v1.47.0.spec.ts`:

```typescript
const TEST_MEDICO = {
  username: 'your_test_username',  // Change this
  password: 'your_test_password',  // Change this
  token: null
};
```

## Expected Test Results

### v1.47.0 Main Test: "should successfully mark patient as Atendido without selecting optional actions"

**Steps:**
1. Login as MEDICO
2. Navigate to Mis Pacientes page
3. Click patient status button
4. Select "Atendido" radio button
5. Verify 3 optional buttons appear (Recita, Referencia, Crónico)
6. Do NOT click any optional buttons
7. Click "Confirmar"
8. Verify API returns 200 OK
9. Verify modal closes
10. Verify patient status updates to "Atendido"

**Expected Duration:** ~5-8 seconds

**Expected Output:**
```
✓ Logged in as MEDICO
✓ Navigated to Mis Pacientes page
✓ Found 2 patient(s) in table
✓ Clicked patient status button
✓ Patient status modal opened
✓ Selected "Atendido" option
✓ Three optional action buttons (Recita, Referencia, Crónico) are visible
✓ Optional actions are NOT selected (default state)
✓ Clicked "Confirmar" button
✓ Request payload is correct (all optional actions are false)
✓ API responded with status: 200
✓ Modal closed after successful submission
✓ Patient status updated to "Atendido" in table
✓ Statistics updated: 1 Atendidos
```

## Viewing Test Results

After tests complete:

```bash
# Open HTML report
npx playwright show-report

# Or use helper script
./tests/run-tests.sh report
```

The report shows:
- Test execution timeline
- Screenshots (on failures)
- Video recordings (on failures)
- Network requests
- Console logs

## Troubleshooting

### Test fails with "Login failed"

**Solution:**
1. Check backend is running: `curl http://localhost:8080/actuator/health`
2. Verify test user credentials in database
3. Check console output for error details

### Test fails with "Patient table not found"

**Solution:**
1. Verify frontend is running: `curl http://localhost:3000`
2. Check that test medico has assigned patients
3. Review browser console logs in test output

### Test fails with "API returned 500"

**Solution:**
1. Check backend logs for error details
2. Verify database is accessible
3. Check request payload matches backend expectations

### Tests are flaky (sometimes pass, sometimes fail)

**Solution:**
1. Increase timeouts: `{ timeout: 10000 }`
2. Add explicit waits: `await page.waitForLoadState('networkidle')`
3. Check network latency

## Test Coverage

### v1.47.0 Atender Paciente Tests

| Test | Status | Purpose |
|------|--------|---------|
| Main flow without actions | ✓ | Verify fix: optional actions are truly optional |
| With Recita selected | ✓ | Verify Recita flow works |
| API failure handling | ✓ | Verify error toast appears |
| Cancel button | ✓ | Verify modal closes without API call |
| X button close | ✓ | Verify X button closes modal |
| Loading state | ✓ | Verify "Procesando..." appears |

## Next Steps

1. **Run tests locally:** `./tests/run-tests.sh atender`
2. **Review results:** Check console output for any failures
3. **View HTML report:** `./tests/run-tests.sh report`
4. **Fix issues:** Update test user credentials if needed
5. **Integrate CI/CD:** Add tests to GitHub Actions workflow

## Key Files

```
tests/
├── atender-paciente-v1.47.0.spec.ts   # Main test file
├── dengue-module.spec.ts               # Dengue module tests
├── README.md                           # Comprehensive documentation
├── QUICK_START.md                      # This file
└── run-tests.sh                        # Helper script

playwright.config.ts                    # Playwright configuration
```

## Support

For questions or issues:
- Review README.md in tests/ directory
- Check Playwright docs: https://playwright.dev/
- Contact: stypcanto@essalud.gob.pe

---

**Happy Testing!** 🎭
