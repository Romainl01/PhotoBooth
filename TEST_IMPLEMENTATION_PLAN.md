# 🧪 MORPHEO Test Implementation Plan

**Created:** 2025-11-14
**Status:** Ready for Implementation
**Target Coverage:** 80%+ overall, 100% for critical paths

---

## 🤝 How This Plan Works (IMPORTANT - Read First!)

### For Beginners: The Go/No-Go Approval Process

**You're in control.** For each test, we'll follow this simple process:

1. **I explain** what we're testing in plain English:
   - What the test does
   - Why it matters for your app
   - What bugs it will catch

2. **You decide:** Say "Go" or "No go"
   - "Go" = I implement the test for you
   - "No go" = We skip it and move to the next one

3. **I implement & explain:**
   - I write the test code
   - I tell you what I did
   - You learn as we go

4. **Repeat** until your app is protected by tests!

### Order of Implementation

We'll implement tests in this order (beginner-friendly):

```
Phase 1: Setup (one-time) → Everyone starts here
    ↓
Phase 2: Unit Tests → Test individual functions (easiest)
    ↓
Phase 3: Integration Tests → Test multiple pieces together
    ↓
Phase 4: E2E Tests → Test full user flows (browser automation)
```

**Why this order?**
- Unit tests are simplest and fastest to write
- Integration tests build on unit tests
- E2E tests require everything else working first

### How to Know Tests Actually Work

**Three ways to verify:**

1. **Watch them fail first** (Red → Green)
   - Before implementing the feature, write the test
   - Test fails (red) = Good! It's working correctly
   - Implement the feature
   - Test passes (green) = Feature works!

2. **Intentionally break your code**
   - After test passes, temporarily break the code
   - Test should fail immediately
   - Fix the code → Test passes again
   - This proves the test is catching bugs!

3. **Check test output**
   - Run `npm test`
   - Green checkmarks = Tests pass
   - Red X = Tests caught a problem
   - Coverage report shows what's tested

**Example verification flow:**
```javascript
// 1. Write test (it will fail - that's good!)
it('should deduct 1 credit', () => {
  expect(userCredits).toBe(9); // Fails: credits = 10
});

// 2. Implement feature
function deductCredit() {
  userCredits -= 1;
}

// 3. Test passes! (green checkmark)

// 4. Verify test works: Break code temporarily
function deductCredit() {
  // userCredits -= 1;  // Commented out
}

// 5. Test fails! (red X) = Test is catching bugs correctly

// 6. Fix code → Test passes again
```

---

## 📋 Table of Contents

1. [Why This Matters](#why-this-matters)
2. [Tech Stack Decisions](#tech-stack-decisions)
3. [Setup Guide (Beginner-Friendly)](#setup-guide)
4. [Test Roadmap by Type](#test-roadmap-by-type) ← **NEW: Unit → Integration → E2E**
5. [Detailed Test Specifications](#detailed-test-specifications)
6. [Database & Mocking Strategy](#database--mocking-strategy)
7. [Running Tests](#running-tests)
8. [How to Verify Tests Work](#how-to-verify-tests-work) ← **NEW**
9. [CI/CD Setup (GitHub Actions)](#cicd-setup)
10. [Maintenance & Best Practices](#maintenance--best-practices)

---

## 🎯 Why This Matters

### Your Recent Bugs (The Pain Points)
- ❌ **Logout didn't clear session** → Users stayed logged in after logout
- ❌ **Profile/credits not loading** → New users saw 0 credits or hung indefinitely
- ❌ **Cascading fixes** → Fixing one thing broke another

### What Tests Will Do For You
- ✅ **Instant feedback** → Know immediately if you broke something
- ✅ **Confidence to deploy** → No more "hope it works" deployments
- ✅ **Faster development** → Catch bugs in 10 seconds, not 10 minutes of manual clicking
- ✅ **Living documentation** → Tests show how your app *should* work

**ROI Estimate:** After initial 2-week setup, tests will save you ~5 hours/week on manual testing and bug hunting.

---

## 🛠️ Tech Stack Decisions

### What We're Using & Why

| Tool | Purpose | Why This One? |
|------|---------|---------------|
| **Vitest** | Unit & Integration Tests | Fast, minimal config, works with Next.js, similar to Jest but modern |
| **Playwright** | End-to-End Tests | Industry standard, excellent docs, handles auth/cookies well |
| **Husky** | Git Hooks | Auto-run tests before push, prevents broken deploys |
| **GitHub Actions** | CI/CD | Free 2,000 min/month, standard for open source |

### Dependencies Added (Minimal)
```json
{
  "devDependencies": {
    "vitest": "^2.1.0",
    "@playwright/test": "^1.48.0",
    "husky": "^9.1.0",
    "@testing-library/react": "^16.1.0",
    "@testing-library/jest-dom": "^6.6.0",
    "jsdom": "^25.0.0"
  }
}
```

**Total:** 6 dev dependencies (~50MB) — All industry-standard tools.

---

## 🚀 Setup Guide

### Prerequisites
- Node.js 22+ (you already have this)
- Git (you already have this)
- GitHub repository (you already have this)

### Step 1: Install Testing Dependencies

```bash
# Navigate to your project
cd /Users/romainlagrange/Desktop/VibeCoding/NanoBananaTutorial

# Install all test dependencies
npm install --save-dev vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @playwright/test husky
```

**What each does:**
- `vitest` - Test runner (like Jest but faster)
- `@vitest/ui` - Beautiful UI for watching tests
- `jsdom` - Simulates browser environment for testing
- `@testing-library/react` - Test React components
- `@testing-library/jest-dom` - Extra matchers (like `toBeInTheDocument()`)
- `@playwright/test` - E2E testing framework
- `husky` - Git hooks manager

---

### Step 2: Configure Vitest

Create `vitest.config.js` in your project root:

```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '.next/',
        '*.config.js',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

**What this does:**
- Uses `jsdom` to simulate browser (lets you test React components)
- Enables global test functions (`describe`, `it`, `expect`)
- Sets up test utilities
- Configures code coverage tracking
- Allows `@/` imports (matches your app's import style)

---

Create `tests/setup.js`:

```javascript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/',
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';
```

**What this does:**
- Cleans up DOM after each test (prevents test pollution)
- Mocks Next.js router (so components using `useRouter` work in tests)
- Sets safe test environment variables (won't hit production APIs)

---

### Step 3: Configure Playwright

Install Playwright browsers (one-time setup):

```bash
npx playwright install
```

Create `playwright.config.js`:

```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Run tests sequentially (easier for database cleanup)
  forbidOnly: !!process.env.CI, // Prevent `test.only` in CI
  retries: process.env.CI ? 2 : 0, // Retry flaky tests in CI
  workers: process.env.CI ? 1 : 1, // One worker (avoid parallel DB conflicts)
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry', // Record traces for debugging failures
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Add more browsers later if needed
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
  ],

  // Start dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

**What this does:**
- Tests run against your local dev server (`localhost:3000`)
- Captures screenshots when tests fail (for debugging)
- Starts your app automatically before running tests
- Configured for solo dev (sequential tests, single browser)

---

### Step 4: Setup Husky (Pre-Push Hook)

Initialize Husky:

```bash
# Initialize Husky
npx husky init

# Create pre-push hook
npx husky add .husky/pre-push "npm test"
```

This creates `.husky/pre-push`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm test
```

**What this does:**
- Every `git push` automatically runs `npm test`
- If tests fail, push is blocked
- Prevents deploying broken code

---

### Step 5: Add NPM Scripts

Update `package.json` scripts section:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",

    "test": "vitest run",
    "test:watch": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm test && npm run test:e2e",

    "prepare": "husky install"
  }
}
```

**What each does:**
- `npm test` - Run all unit/integration tests once (for CI and pre-push)
- `npm run test:watch` - Watch mode with UI (during development)
- `npm run test:coverage` - Generate coverage report
- `npm run test:e2e` - Run E2E tests
- `npm run test:e2e:ui` - Interactive E2E test UI
- `npm run test:all` - Run everything (unit + E2E)
- `prepare` - Auto-install Husky hooks on `npm install`

---

### Step 6: Create Test Directories

```bash
mkdir -p tests/{unit,integration,e2e,helpers}
```

**Structure:**
```
tests/
├── setup.js           # Test environment setup
├── helpers/           # Shared test utilities
│   ├── db.js         # Database helpers (create/cleanup test data)
│   └── mocks.js      # Mock API responses
├── unit/             # Unit tests (individual functions/components)
│   ├── components/   # React component tests
│   └── lib/          # Utility function tests
├── integration/      # Integration tests (multiple pieces working together)
│   ├── api/          # API route tests
│   └── flows/        # User flow tests (multi-step)
└── e2e/              # End-to-end tests (full browser automation)
    └── critical/     # Critical user paths
```

---

## 📊 Test Roadmap by Type

### Implementation Order: Unit → Integration → E2E

**Beginner-friendly approach:** Start simple, build up to complex tests.

```
Phase 1: Setup (3-4 hours, one-time)
    ↓
Phase 2: Unit Tests (8 hours)
    ↓
Phase 3: Integration Tests (15 hours)
    ↓
Phase 4: E2E Tests (8 hours)
```

**Total Effort:** ~34 hours of testing + setup

---

### 🧩 Phase 2: Unit Tests (Start Here)

**What are unit tests?** Test individual functions in isolation (no database, no API calls).

**Why start here?**
- Simplest to understand
- Fastest to run (< 1 second each)
- Don't need server running
- Learn testing basics safely

| # | Test Name | What It Tests | File | Priority | Effort |
|---|-----------|---------------|------|----------|--------|
| 1 | **File validation: Valid formats** | Accepts JPEG, PNG, WebP | `tests/unit/lib/file-validation.test.js` | Critical | 30min |
| 2 | **File validation: Rejects invalid** | Rejects PDF, HEIC, etc | `tests/unit/lib/file-validation.test.js` | Critical | 30min |
| 3 | **File validation: Size limits** | Rejects files > 10MB | `tests/unit/lib/file-validation.test.js` | Critical | 30min |
| 4 | **Credits: Prevent negative balance** | Can't go below 0 credits | `tests/unit/lib/credits.test.js` | Critical | 1h |
| 5 | **Filters: All filters defined** | 13 filters exist | `tests/unit/constants/filters.test.js` | Medium | 30min |
| 6 | **Logger: Sanitizes PII** | Redacts emails, IDs | `tests/unit/lib/logger.test.js` | High | 1h |
| 7 | **Watermark: Adds branding** | Adds "Morpheo" to images | `tests/unit/lib/watermark.test.js` | Medium | 1h |
| 8 | **Design tokens: Valid values** | All colors/sizes valid | `tests/unit/lib/design-tokens.test.js` | Low | 30min |

**Total: ~6 hours** | **Files:** 5 test files | **Tests:** ~20 individual tests

**What you'll learn:**
- How to write test assertions (`expect(x).toBe(y)`)
- How to test functions with inputs/outputs
- How to mock external dependencies

---

### 🔗 Phase 3: Integration Tests (After Unit Tests)

**What are integration tests?** Test multiple pieces working together (database + API).

**Why second?**
- Tests real interactions
- Catches bugs between components
- Requires database access
- More complex than unit tests

| # | Test Name | What It Tests | File | Priority | Effort |
|---|-----------|---------------|------|----------|--------|
| 9 | **Auth: Profile loads after sign-in** | Database query works | `tests/integration/flows/profile-loading.test.js` | Critical | 2h |
| 10 | **Auth: Handles new users** | Creates profile if missing | `tests/integration/flows/profile-loading.test.js` | Critical | 1h |
| 11 | **Auth: Timeout protection** | Doesn't hang on slow query | `tests/integration/flows/profile-loading.test.js` | Critical | 1h |
| 12 | **Credits: Deduct on generation** | Subtracts 1 credit | `tests/integration/api/credits-deduction.test.js` | Critical | 2h |
| 13 | **Credits: Prevent race conditions** | Two clicks = 1 deduction | `tests/integration/api/credits-deduction.test.js` | High | 1h |
| 14 | **Credits: Don't deduct on error** | Failed gen = no deduction | `tests/integration/api/credits-deduction.test.js` | Critical | 1h |
| 15 | **Stripe: Reject invalid webhook** | Security check works | `tests/integration/api/stripe-webhook.test.js` | Critical | 2h |
| 16 | **Stripe: Grant credits on payment** | Credits added to DB | `tests/integration/api/stripe-webhook.test.js` | Critical | 1.5h |
| 17 | **Stripe: Idempotent webhooks** | No duplicate credits | `tests/integration/api/stripe-webhook.test.js` | High | 1.5h |
| 18 | **API: Health endpoint** | Returns 200 OK | `tests/integration/api/health.test.js` | Low | 30min |
| 19 | **API: Generate validates input** | Rejects bad requests | `tests/integration/api/generate-validation.test.js` | High | 1h |

**Total: ~15 hours** | **Files:** 5 test files | **Tests:** ~30 individual tests

**What you'll learn:**
- How to setup/cleanup test data
- How to test database operations
- How to mock external APIs (Stripe, Gemini)

---

### 🌐 Phase 4: E2E Tests (Final Step)

**What are E2E tests?** Automated browser testing full user journeys.

**Why last?**
- Most realistic (tests like a real user)
- Slowest to run (30+ seconds each)
- Requires app running
- Complex to debug

| # | Test Name | What It Tests | File | Priority | Effort |
|---|-----------|---------------|------|----------|--------|
| 20 | **Auth: Logout clears session** | Session fully cleared | `tests/e2e/critical/auth-logout.spec.js` | Critical | 2h |
| 21 | **Auth: Logout across tabs** | All tabs logged out | `tests/e2e/critical/auth-logout.spec.js` | High | 1h |
| 22 | **Image Gen: Upload → Generate → Download** | Full happy path | `tests/e2e/critical/image-generation.spec.js` | Critical | 3h |
| 23 | **Image Gen: Error handling** | Shows error message | `tests/e2e/critical/image-generation.spec.js` | High | 1.5h |
| 24 | **Image Gen: Prevents 0 credits** | Blocks generation | `tests/e2e/critical/image-generation.spec.js` | Critical | 30min |

**Total: ~8 hours** | **Files:** 2 test files | **Tests:** ~5 major flows

**What you'll learn:**
- How to automate browser actions
- How to test full user journeys
- How to debug visual test failures

---

### 📈 Recommended Implementation Schedule

**Beginner-friendly timeline:**

```
Week 1: Setup + Unit Tests
├─ Day 1: Setup (install dependencies, configs)
├─ Day 2-3: Unit tests 1-4 (file validation, credits)
├─ Day 4-5: Unit tests 5-8 (filters, logger, etc)
└─ Checkpoint: Run `npm test` (should see green checks!)

Week 2: Integration Tests (Part 1)
├─ Day 1-2: Tests 9-11 (Auth & profile loading)
├─ Day 3-4: Tests 12-14 (Credits deduction)
└─ Day 5: Tests 15-16 (Stripe webhooks basics)

Week 3: Integration Tests (Part 2) + E2E Start
├─ Day 1-2: Tests 17-19 (Stripe idempotency, API validation)
├─ Day 3-4: Tests 20-21 (Auth E2E)
└─ Day 5: Test 22 (Image generation happy path)

Week 4: E2E Completion + Polish
├─ Day 1-2: Tests 23-24 (Image gen error cases)
├─ Day 3: Run full test suite (`npm run test:all`)
├─ Day 4: Fix any failing tests
└─ Day 5: Setup CI/CD (GitHub Actions)
```

**Each day = ~2-3 hours of work** (not full-time)

---

### 🎯 Quick Reference: What to Test When

**Fix a bug?** → Write a test that would have caught it
**Add a feature?** → Write tests for the happy path + error cases
**Refactoring code?** → Run tests before & after (should pass both times)
**Before deploying?** → Run `npm run test:all`

---

## 📝 Detailed Test Specifications

### P0-1: Auth - Logout Clears Session (E2E)

**File:** `tests/e2e/critical/auth-logout.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Authentication - Logout', () => {
  test('should completely clear session on logout', async ({ page, context }) => {
    // Navigate to app
    await page.goto('/');

    // Click Google Sign In (or use stored auth state)
    // Note: For Google OAuth, you'll need to either:
    // 1. Use Playwright's auth storage
    // 2. Mock the OAuth callback
    // I'll show the mock approach for easier setup

    // Mock authenticated state by setting cookies/localStorage
    await context.addCookies([
      {
        name: 'sb-access-token',
        value: 'mock-jwt-token',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
      }));
    });

    // Reload to apply auth state
    await page.reload();

    // Verify user is logged in (button should show profile or logout)
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // Click logout button
    await page.click('[data-testid="logout-button"]');

    // Wait for logout to complete
    await page.waitForURL('/'); // Should redirect to home

    // CRITICAL CHECKS (These failed in your bug):

    // 1. Cookies should be cleared
    const cookies = await context.cookies();
    const authCookie = cookies.find(c => c.name.includes('sb-access-token'));
    expect(authCookie).toBeUndefined();

    // 2. LocalStorage should be cleared
    const authToken = await page.evaluate(() => {
      return localStorage.getItem('supabase.auth.token');
    });
    expect(authToken).toBeNull();

    // 3. UI should show logged-out state
    await expect(page.locator('[data-testid="sign-in-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();

    // 4. Trying to access protected routes should redirect
    await page.goto('/dashboard'); // Or any protected route
    await expect(page).toHaveURL('/'); // Should redirect to home

    // 5. Session should not restore on page reload
    await page.reload();
    await expect(page.locator('[data-testid="sign-in-button"]')).toBeVisible();
  });

  test('should clear session across all tabs', async ({ browser }) => {
    // Create two contexts (simulating two tabs)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Log in on both tabs (set auth state)
    for (const page of [page1, page2]) {
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: 'mock-token',
        }));
      });
      await page.reload();
    }

    // Logout on tab 1
    await page1.click('[data-testid="logout-button"]');
    await page1.waitForTimeout(1000); // Wait for potential broadcast

    // Tab 2 should also log out (if using Supabase's onAuthStateChange)
    await page2.reload();
    await expect(page2.locator('[data-testid="sign-in-button"]')).toBeVisible();

    await context1.close();
    await context2.close();
  });
});
```

**Why this test matters:**
- Your bug: Logout didn't clear session
- This test verifies: Cookies gone, localStorage gone, UI updated, can't access protected routes, persists across reload
- Catches: Session storage bugs, incomplete cleanup, state management issues

---

### P0-2: Profile - Credits Load After Sign-In (Integration)

**File:** `tests/integration/flows/profile-loading.test.js`

```javascript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Import your actual functions
import { getUserCredits } from '@/lib/credits';
import { createSupabaseClient } from '@/lib/supabase-client';

describe('Profile Loading - Credits', () => {
  let supabase;
  let testUserId;

  beforeEach(async () => {
    // Create Supabase client with service role (for test data setup)
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Create test user in database
    const { data: user, error } = await supabase
      .from('profiles')
      .insert({
        email: 'test@example.com',
        credits: 5,
      })
      .select()
      .single();

    if (error) throw error;
    testUserId = user.id;
  });

  afterEach(async () => {
    // Cleanup: Delete test user
    await supabase
      .from('profiles')
      .delete()
      .eq('id', testUserId);
  });

  it('should load user credits immediately after sign-in', async () => {
    // Mock auth session
    const mockSession = {
      user: { id: testUserId },
      access_token: 'mock-token',
    };

    // Call your actual function
    const credits = await getUserCredits(testUserId);

    // Verify credits loaded correctly
    expect(credits).toBe(5);
  });

  it('should handle new users with no profile yet', async () => {
    // Delete the profile we just created
    await supabase
      .from('profiles')
      .delete()
      .eq('id', testUserId);

    // Try to get credits for non-existent user
    const credits = await getUserCredits(testUserId);

    // Should return 0 or create profile with default credits
    // Adjust based on your actual logic
    expect(credits).toBe(0);
  });

  it('should not hang indefinitely on slow queries', async () => {
    // Set a timeout
    const timeout = 3000; // 3 seconds max

    const promise = getUserCredits(testUserId);

    const result = await Promise.race([
      promise,
      new Promise((resolve) => setTimeout(() => resolve('TIMEOUT'), timeout)),
    ]);

    expect(result).not.toBe('TIMEOUT');
    expect(typeof result).toBe('number');
  }, 5000); // Vitest timeout: 5 seconds

  it('should retry on temporary network errors', async () => {
    // Mock network failure on first call, success on retry
    let callCount = 0;
    const originalFetch = global.fetch;

    global.fetch = vi.fn(async (...args) => {
      callCount++;
      if (callCount === 1) {
        throw new Error('Network error');
      }
      return originalFetch(...args);
    });

    const credits = await getUserCredits(testUserId);

    expect(callCount).toBeGreaterThan(1); // Should have retried
    expect(credits).toBe(5);

    global.fetch = originalFetch; // Restore
  });

  it('should handle concurrent credit reads', async () => {
    // Simulate multiple components reading credits at once
    const promises = Array(5).fill(null).map(() =>
      getUserCredits(testUserId)
    );

    const results = await Promise.all(promises);

    // All should return same value
    results.forEach(credits => {
      expect(credits).toBe(5);
    });
  });
});
```

**Why this test matters:**
- Your bug: Profile/credits not loading after sign-in
- This test verifies: Credits load successfully, handles new users, doesn't hang, handles errors, handles concurrent requests
- Catches: Query timeouts, race conditions, missing error handling

---

### P1-1: Credits - Deduct on Generation (Integration)

**File:** `tests/integration/api/credits-deduction.test.js`

```javascript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('Credits - Deduction on Image Generation', () => {
  let supabase;
  let testUserId;

  beforeEach(async () => {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: user } = await supabase
      .from('profiles')
      .insert({ email: 'test@example.com', credits: 10 })
      .select()
      .single();

    testUserId = user.id;
  });

  afterEach(async () => {
    await supabase.from('profiles').delete().eq('id', testUserId);
  });

  it('should deduct 1 credit on successful generation', async () => {
    // Get initial credits
    const { data: before } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', testUserId)
      .single();

    expect(before.credits).toBe(10);

    // Mock API call to /api/generate (you'll need to call your actual endpoint)
    // For now, simulate the credit deduction logic
    const { error } = await supabase.rpc('deduct_credits', {
      user_id: testUserId,
      amount: 1,
    });

    expect(error).toBeNull();

    // Verify credits deducted
    const { data: after } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', testUserId)
      .single();

    expect(after.credits).toBe(9);
  });

  it('should NOT deduct credits if generation fails', async () => {
    // Mock a failed generation (e.g., Gemini API error)
    // Credits should remain unchanged

    const { data: before } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', testUserId)
      .single();

    // Simulate failed generation (don't call deduct_credits)
    // ... your error handling logic ...

    const { data: after } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', testUserId)
      .single();

    // Credits should be unchanged
    expect(after.credits).toBe(before.credits);
  });

  it('should prevent negative credit balance', async () => {
    // Set user to 0 credits
    await supabase
      .from('profiles')
      .update({ credits: 0 })
      .eq('id', testUserId);

    // Try to deduct credits
    const { error } = await supabase.rpc('deduct_credits', {
      user_id: testUserId,
      amount: 1,
    });

    // Should fail or return error
    expect(error).toBeDefined();
    // OR check that credits didn't go negative
    const { data } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', testUserId)
      .single();

    expect(data.credits).toBeGreaterThanOrEqual(0);
  });

  it('should handle concurrent generation attempts (race condition)', async () => {
    // Set user to 1 credit
    await supabase
      .from('profiles')
      .update({ credits: 1 })
      .eq('id', testUserId);

    // Try to deduct credits twice simultaneously
    const promises = [
      supabase.rpc('deduct_credits', { user_id: testUserId, amount: 1 }),
      supabase.rpc('deduct_credits', { user_id: testUserId, amount: 1 }),
    ];

    await Promise.allSettled(promises);

    // Only one should succeed, credits should be 0, not -1
    const { data } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', testUserId)
      .single();

    expect(data.credits).toBe(0);
  });
});
```

**Why this test matters:**
- Prevents users from generating images without credits
- Ensures credits don't go negative (critical for business)
- Catches race conditions (two clicks on generate button)

---

### P1-2: Stripe - Webhook Verification (Integration)

**File:** `tests/integration/api/stripe-webhook.test.js`

```javascript
import { describe, it, expect, vi } from 'vitest';
import Stripe from 'stripe';

describe('Stripe Webhook - Security & Credit Grant', () => {
  it('should reject webhooks with invalid signature', async () => {
    // Mock incoming webhook with WRONG signature
    const payload = JSON.stringify({
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test_123' } },
    });

    const invalidSignature = 'wrong-signature';

    // Call your webhook handler
    const response = await fetch('http://localhost:3000/api/stripe-webhook', {
      method: 'POST',
      headers: {
        'stripe-signature': invalidSignature,
      },
      body: payload,
    });

    // Should reject (400 or 401)
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
  });

  it('should grant credits on successful payment', async () => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Create a test checkout session event
    const event = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          client_reference_id: 'test-user-id', // Your user ID
          amount_total: 500, // $5.00
          metadata: {
            credits: '5',
          },
        },
      },
    };

    // Generate valid signature
    const payload = JSON.stringify(event);
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: process.env.STRIPE_WEBHOOK_SECRET,
    });

    // Send webhook
    const response = await fetch('http://localhost:3000/api/stripe-webhook', {
      method: 'POST',
      headers: {
        'stripe-signature': signature,
        'content-type': 'application/json',
      },
      body: payload,
    });

    expect(response.status).toBe(200);

    // Verify credits were added to user
    // (You'll need to query your database to verify)
  });

  it('should be idempotent (handle duplicate webhooks)', async () => {
    // Stripe may send the same webhook multiple times
    // Credits should only be granted once

    const event = {
      id: 'evt_unique_123', // Same event ID
      type: 'checkout.session.completed',
      data: {
        object: {
          client_reference_id: 'test-user-id',
          metadata: { credits: '5' },
        },
      },
    };

    // Send webhook twice
    const payload = JSON.stringify(event);
    // ... generate signature ...

    await fetch('http://localhost:3000/api/stripe-webhook', {
      method: 'POST',
      body: payload,
      // ... headers ...
    });

    await fetch('http://localhost:3000/api/stripe-webhook', {
      method: 'POST',
      body: payload,
      // ... same headers ...
    });

    // Check user credits - should only be +5, not +10
  });
});
```

**Why this test matters:**
- Prevents fraudulent credit grants (signature verification)
- Ensures customers get credits they paid for
- Prevents duplicate charges/credits

---

### P1-3: Image Generation - Full E2E Flow

**File:** `tests/e2e/critical/image-generation.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Image Generation - Complete Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authenticated state with credits
    await page.goto('/');

    // Mock auth + credits
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
      }));
      localStorage.setItem('user-credits', '5');
    });

    await page.reload();
  });

  test('should generate image from uploaded photo', async ({ page }) => {
    // 1. Upload photo
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/test-image.jpg');

    // 2. Wait for preview
    await expect(page.locator('[data-testid="image-preview"]')).toBeVisible();

    // 3. Select filter (optional)
    await page.click('[data-testid="filter-noir"]');

    // 4. Click generate button
    await page.click('[data-testid="generate-button"]');

    // 5. Wait for loading state
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();

    // 6. Wait for generated image (with timeout)
    await expect(page.locator('[data-testid="generated-image"]')).toBeVisible({
      timeout: 30000, // 30 seconds max
    });

    // 7. Verify image loaded
    const generatedImg = page.locator('[data-testid="generated-image"] img');
    const src = await generatedImg.getAttribute('src');
    expect(src).toBeTruthy();
    expect(src).toContain('data:image'); // Base64 or URL

    // 8. Verify credits deducted
    const creditsText = await page.locator('[data-testid="credits-badge"]').textContent();
    expect(creditsText).toContain('4'); // Was 5, now 4

    // 9. Verify download button appears
    await expect(page.locator('[data-testid="download-button"]')).toBeVisible();

    // 10. Verify share button appears
    await expect(page.locator('[data-testid="share-button"]')).toBeVisible();
  });

  test('should handle generation errors gracefully', async ({ page }) => {
    // Mock a failed generation (e.g., network error)
    await page.route('**/api/generate', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'AI service unavailable' }),
      });
    });

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/test-image.jpg');

    await page.click('[data-testid="generate-button"]');

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'generation failed'
    );

    // Credits should NOT be deducted
    const creditsText = await page.locator('[data-testid="credits-badge"]').textContent();
    expect(creditsText).toContain('5'); // Still 5

    // Should be able to retry
    await expect(page.locator('[data-testid="generate-button"]')).toBeEnabled();
  });

  test('should prevent generation with 0 credits', async ({ page }) => {
    // Set credits to 0
    await page.evaluate(() => {
      localStorage.setItem('user-credits', '0');
    });
    await page.reload();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/test-image.jpg');

    // Generate button should be disabled or show message
    const generateBtn = page.locator('[data-testid="generate-button"]');
    await expect(generateBtn).toBeDisabled();

    // OR should show "buy credits" message
    await expect(page.locator('text=/buy credits/i')).toBeVisible();
  });
});
```

**Why this test matters:**
- Tests the ENTIRE user journey (upload → generate → download)
- Catches UI bugs, API bugs, state management bugs
- Ensures error handling works end-to-end

---

## 🗄️ Database & Mocking Strategy

### Database Testing Approach

**Decision: Use same Supabase database with test data cleanup**

#### Why This Works for You:
- ✅ No extra cost (free tier is enough)
- ✅ Tests real RLS policies and triggers
- ✅ Simpler setup (one database to manage)
- ✅ Tests match production behavior exactly

#### How to Keep It Clean:

1. **Use unique test identifiers**
```javascript
const testEmail = `test-${Date.now()}@example.com`;
```

2. **Clean up in `afterEach`**
```javascript
afterEach(async () => {
  await supabase.from('profiles').delete().eq('email', testEmail);
  await supabase.from('generations').delete().eq('user_id', testUserId);
});
```

3. **Create helper functions**

**File:** `tests/helpers/db.js`

```javascript
import { createClient } from '@supabase/supabase-js';

export const createTestSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Bypasses RLS for test setup
  );
};

export const createTestUser = async (supabase, overrides = {}) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      email: `test-${Date.now()}@example.com`,
      credits: 5,
      ...overrides,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const cleanupTestUser = async (supabase, userId) => {
  // Delete related data first (foreign keys)
  await supabase.from('generations').delete().eq('user_id', userId);
  await supabase.from('profiles').delete().eq('id', userId);
};

export const setUserCredits = async (supabase, userId, credits) => {
  const { error } = await supabase
    .from('profiles')
    .update({ credits })
    .eq('id', userId);

  if (error) throw error;
};
```

**Usage:**
```javascript
import { createTestSupabase, createTestUser, cleanupTestUser } from '../helpers/db';

let supabase, testUser;

beforeEach(async () => {
  supabase = createTestSupabase();
  testUser = await createTestUser(supabase, { credits: 10 });
});

afterEach(async () => {
  await cleanupTestUser(supabase, testUser.id);
});
```

---

### Mocking External APIs

**Mock Stripe, Gemini, and other external services to:**
- ✅ Avoid API costs during testing
- ✅ Make tests fast and deterministic
- ✅ Test error scenarios (API down, rate limits, etc.)

#### Mock Setup

**File:** `tests/helpers/mocks.js`

```javascript
import { vi } from 'vitest';

// Mock Stripe API
export const mockStripe = {
  webhooks: {
    constructEvent: vi.fn((payload, signature, secret) => {
      // Return a valid event object for testing
      return JSON.parse(payload);
    }),
  },
  checkout: {
    sessions: {
      retrieve: vi.fn(async (sessionId) => {
        return {
          id: sessionId,
          payment_status: 'paid',
          client_reference_id: 'test-user-id',
          amount_total: 500,
          metadata: { credits: '5' },
        };
      }),
    },
  },
};

// Mock Gemini API
export const mockGemini = {
  generateContent: vi.fn(async (prompt) => {
    return {
      response: {
        text: () => 'data:image/png;base64,iVBORw0KGgoAAAANS...',
      },
    };
  }),

  // Simulate errors
  simulateError: () => {
    mockGemini.generateContent.mockRejectedValueOnce(
      new Error('API rate limit exceeded')
    );
  },

  // Simulate slow response
  simulateDelay: (ms) => {
    mockGemini.generateContent.mockImplementationOnce(
      () => new Promise(resolve =>
        setTimeout(() => resolve({
          response: { text: () => 'data:image/png;base64,...' }
        }), ms)
      )
    );
  },
};

// Mock Supabase Storage
export const mockStorage = {
  from: vi.fn(() => ({
    upload: vi.fn(async (path, file) => {
      return { data: { path }, error: null };
    }),
    getPublicUrl: vi.fn((path) => {
      return { data: { publicUrl: `https://mock.supabase.co/storage/${path}` } };
    }),
  })),
};
```

**Usage in tests:**
```javascript
import { mockGemini } from '../helpers/mocks';

it('should handle Gemini API errors', async () => {
  mockGemini.simulateError();

  const result = await generateImage(mockPrompt);

  expect(result.error).toBe('AI service unavailable');
});
```

---

## 🏃 Running Tests

### During Development (Watch Mode)

Start your dev server and tests side-by-side:

```bash
# Terminal 1: Start your app
npm run dev

# Terminal 2: Start tests in watch mode (with UI)
npm run test:watch
```

**What you'll see:**
- Beautiful UI at `http://localhost:51204/`
- Tests auto-run when you save files
- Click on tests to see details
- Filter by file, test name, or status

**Best Practice:** Keep test:watch running while coding. It's like a co-pilot catching bugs instantly.

---

### Before Pushing (Manual)

Run all tests to verify everything works:

```bash
# Run all unit/integration tests
npm test

# If tests pass, run E2E tests
npm run test:e2e

# Or run everything at once
npm run test:all
```

**Expected output:**
```
✓ tests/unit/lib/credits.test.js (5 tests)
✓ tests/integration/api/stripe-webhook.test.js (3 tests)
✓ tests/e2e/critical/auth-logout.spec.js (2 tests)

Test Files  12 passed (12)
     Tests  47 passed (47)
  Start at  10:23:45
  Duration  8.42s
```

---

### In CI (GitHub Actions)

Tests run automatically on every push. You'll see:
- ✅ Green check if tests pass
- ❌ Red X if tests fail (prevents merge/deploy)

**Note:** Husky will run `npm test` before push anyway, so CI is a safety net.

---

### Viewing Coverage

See which code is tested:

```bash
npm run test:coverage
```

**Output:**
```
File                  | % Stmts | % Branch | % Funcs | % Lines
----------------------|---------|----------|---------|--------
lib/credits.js        |   95.23 |    88.88 |     100 |   95.23
lib/supabase-client.js|   87.50 |    75.00 |     100 |   87.50
app/api/generate.js   |   80.00 |    66.66 |   85.71 |   80.00
----------------------|---------|----------|---------|--------
All files             |   85.42 |    76.32 |   92.30 |   85.42
```

**Goal:** Aim for 80%+ overall, 100% on critical paths (auth, credits, payments).

---

## 🔍 How to Verify Tests Work

### The Problem: "How do I know my tests actually catch bugs?"

**Answer:** Tests should fail when code breaks. Here's how to verify:

---

### Method 1: Test-Driven Development (TDD) - Red → Green → Refactor

**The gold standard for knowing tests work.**

#### Step-by-Step Example:

**Scenario:** Testing credit deduction

```javascript
// ❌ Step 1: Write test FIRST (before implementing feature)
// File: tests/unit/lib/credits.test.js
describe('Credit System', () => {
  it('should deduct 1 credit on image generation', () => {
    const user = { credits: 10 };

    deductCredit(user); // Function doesn't exist yet!

    expect(user.credits).toBe(9);
  });
});

// Run: npm test
// Result: ❌ TEST FAILS (red)
// Error: "deductCredit is not defined"
// ✅ Good! Test is working correctly - it detected missing code
```

```javascript
// ✅ Step 2: Implement minimal code to make test pass
// File: src/lib/credits.js
export function deductCredit(user) {
  user.credits -= 1;
}

// Run: npm test
// Result: ✅ TEST PASSES (green)
// ✅ Good! Feature is implemented correctly
```

```javascript
// 🔧 Step 3: Refactor (improve code quality)
export function deductCredit(user, amount = 1) {
  if (user.credits < amount) {
    throw new Error('Insufficient credits');
  }
  user.credits -= amount;
}

// Run: npm test
// Result: ✅ TEST STILL PASSES
// ✅ Good! Refactoring didn't break anything
```

**Why this proves tests work:**
- You SAW the test fail (proves it can detect problems)
- You made it pass (proves it validates correct code)
- It stayed green after refactoring (proves it's reliable)

---

### Method 2: Break Your Code Intentionally (Mutation Testing)

**After a test passes, temporarily break the code to verify the test catches it.**

#### Example:

```javascript
// ✅ Test is passing
it('should prevent negative credits', () => {
  const user = { credits: 0 };

  expect(() => deductCredit(user)).toThrow('Insufficient credits');
});
```

```javascript
// 🔨 Temporarily break the code
export function deductCredit(user) {
  // if (user.credits < 1) {  // COMMENTED OUT
  //   throw new Error('Insufficient credits');
  // }
  user.credits -= 1;
}

// Run: npm test
// Result: ❌ TEST FAILS
// Error: "Expected function to throw an error, but it didn't"
// ✅ Perfect! Test caught the bug
```

```javascript
// ✅ Fix the code
export function deductCredit(user) {
  if (user.credits < 1) {  // RESTORED
    throw new Error('Insufficient credits');
  }
  user.credits -= 1;
}

// Run: npm test
// Result: ✅ TEST PASSES
// ✅ Verified: Test is reliable
```

**Do this for every critical test to verify it's actually protecting your code.**

---

### Method 3: Check Test Output & Coverage

#### A. Run Tests and Read Output

```bash
npm test
```

**Good output (tests working):**
```
✓ tests/unit/lib/credits.test.js (5 tests) 234ms
  ✓ should deduct 1 credit (12ms)
  ✓ should prevent negative credits (8ms)
  ✓ should handle concurrent deductions (45ms)
  ✓ should validate user object (5ms)
  ✓ should throw on invalid amount (3ms)

Test Files  1 passed (1)
     Tests  5 passed (5)
   Duration  234ms
```

**Bad output (test found a problem):**
```
✗ tests/unit/lib/credits.test.js (5 tests) 234ms
  ✗ should prevent negative credits (8ms)

    AssertionError: expected function to throw an error

      user.credits -= 1;  // This line allowed negative credits!

  at tests/unit/lib/credits.test.js:23:45
```

#### B. Check Coverage Report

```bash
npm run test:coverage
```

**Good coverage (80%+ on critical files):**
```
File                     | Stmts | Branch | Funcs | Lines
-------------------------|-------|--------|-------|-------
lib/credits.js           | 100%  | 100%   | 100%  | 100%  ← Critical: Fully tested
lib/file-validation.js   | 95.5% | 87.5%  | 100%  | 95.5% ← Critical: Well tested
lib/logger.js            | 78.3% | 66.7%  | 83.3% | 78.3% ← Medium: Decent
components/Button.jsx    | 45.0% | 33.3%  | 50.0% | 45.0% ← Low: Needs tests
```

**Coverage doesn't mean tests are good, but it shows what's NOT tested at all.**

---

### Method 4: Real-World Verification Checklist

**Before trusting your test suite, verify these:**

#### ✅ Checklist: "My Tests Actually Work"

- [ ] **Did I see at least one test fail?**
  - If all tests pass on first run, they might be too permissive
  - Temporarily break code to verify tests catch it

- [ ] **Do tests fail for the right reason?**
  - Test should fail when feature breaks, not for unrelated reasons
  - Error message should be clear

- [ ] **Can I fix a failing test by fixing the code?**
  - Fix the bug → Test should pass
  - If test still fails, test is broken

- [ ] **Do tests pass consistently?**
  - Run `npm test` 5 times → All should pass
  - Flaky tests (sometimes pass/fail) are unreliable

- [ ] **Can tests run in any order?**
  - Each test should be independent
  - Test A shouldn't rely on Test B running first

- [ ] **Do tests clean up after themselves?**
  - Check database after tests → No leftover test data
  - Run tests twice → Second run should also pass

---

### Common Testing Mistakes (and How to Avoid Them)

#### ❌ Mistake 1: Test Always Passes (False Positive)

```javascript
// BAD: This test will always pass!
it('should validate email', () => {
  const result = validateEmail('notanemail');
  expect(result).toBe(result); // Always true, even if validation is broken!
});
```

```javascript
// GOOD: Test actual behavior
it('should reject invalid email', () => {
  const result = validateEmail('notanemail');
  expect(result).toBe(false); // Will fail if validation is broken
});
```

**How to catch:** If test passes on first run without implementing code, it's probably wrong.

---

#### ❌ Mistake 2: Testing the Wrong Thing

```javascript
// BAD: Testing implementation details
it('should call fetch function', () => {
  const spy = vi.spyOn(global, 'fetch');
  getUserData();
  expect(spy).toHaveBeenCalled(); // Fragile: Breaks if you switch to axios
});
```

```javascript
// GOOD: Test behavior users care about
it('should return user data', async () => {
  const user = await getUserData();
  expect(user).toEqual({ id: 1, name: 'Alice' }); // Works regardless of implementation
});
```

---

#### ❌ Mistake 3: Tests Depend on Each Other

```javascript
// BAD: Test B depends on Test A
it('should create user', () => {
  createUser({ id: 1, name: 'Alice' });
});

it('should find user', () => {
  const user = findUser(1); // Fails if first test didn't run!
  expect(user.name).toBe('Alice');
});
```

```javascript
// GOOD: Each test is independent
it('should find user', () => {
  // Setup data in THIS test
  createUser({ id: 1, name: 'Alice' });

  const user = findUser(1);
  expect(user.name).toBe('Alice');

  // Cleanup in afterEach hook
});
```

---

### Quick Daily Verification Routine

**Every time you write/modify a test:**

1. **Run test** → Should pass ✅
2. **Break code** → Test should fail ❌
3. **Fix code** → Test should pass again ✅
4. **Run all tests** → Everything green ✅

**Takes 30 seconds, gives you confidence.**

---

### Summary: 3 Levels of Test Confidence

| Level | What You Know | How to Achieve |
|-------|---------------|----------------|
| ⚠️ **Low** | "Tests exist" | Tests written but never seen failing |
| ✅ **Medium** | "Tests catch obvious bugs" | Saw tests fail when code broken |
| 🚀 **High** | "Tests catch subtle bugs" | Used TDD, mutation testing, verified edge cases |

**Aim for High confidence on critical features (auth, payments, credits).**

---

## 🤖 CI/CD Setup (GitHub Actions)

### Step 1: Create Workflow File

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    name: Unit & Integration Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
          STRIPE_WEBHOOK_SECRET: ${{ secrets.STRIPE_WEBHOOK_SECRET }}

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: always()

  e2e-tests:
    name: End-to-End Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

**What this does:**
- Runs on every push to `main` and on pull requests
- Runs unit/integration tests first (fast)
- Runs E2E tests second (slower)
- Uses your secrets (configured in GitHub settings)
- Uploads test reports if tests fail

---

### Step 2: Add Secrets to GitHub

1. Go to your GitHub repo
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `SUPABASE_URL` | Your Supabase URL |
| `SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key |
| `GEMINI_API_KEY` | Your Gemini API key |
| `STRIPE_SECRET_KEY` | Your Stripe test secret key |
| `STRIPE_WEBHOOK_SECRET` | Your Stripe webhook secret |

**Important:** Use your **test/development** keys, not production keys!

---

### Step 3: Verify It Works

```bash
# Commit the workflow file
git add .github/workflows/test.yml
git commit -m "ci: add GitHub Actions workflow"
git push

# Go to GitHub → Actions tab
# You should see the workflow running!
```

**What success looks like:**
- ✅ Green checkmark on your commit
- ✅ Tests passed badge in PR

**What failure looks like:**
- ❌ Red X on your commit
- ❌ Email notification from GitHub
- ❌ Can see which test failed in the Actions tab

---

## 🔧 Maintenance & Best Practices

### When to Write Tests

**Always write tests for:**
- ✅ New features (write test first, then implement)
- ✅ Bug fixes (write failing test, then fix bug)
- ✅ Critical paths (auth, payments, data integrity)

**Don't write tests for:**
- ❌ Third-party library code (it's already tested)
- ❌ Simple utility functions (unless they have complex logic)
- ❌ One-off scripts or migrations

---

### Test-Driven Development (TDD) Flow

**Recommended workflow for new features:**

1. **Red** - Write a failing test
```javascript
it('should apply noir filter to image', async () => {
  const result = applyFilter(testImage, 'noir');
  expect(result).toMatchImageSnapshot(); // Fails (function doesn't exist yet)
});
```

2. **Green** - Implement minimal code to pass
```javascript
export function applyFilter(image, filter) {
  if (filter === 'noir') {
    return applyNoirFilter(image);
  }
}
```

3. **Refactor** - Clean up code, tests still pass
```javascript
export function applyFilter(image, filter) {
  const filters = {
    noir: applyNoirFilter,
    vintage: applyVintageFilter,
    // ...
  };
  return filters[filter]?.(image) ?? image;
}
```

**Benefits:**
- You know the test works (you saw it fail)
- You write only code that's needed
- Refactoring is safe (tests catch regressions)

---

### Keeping Tests Fast

**Slow tests = tests you won't run**

**Best practices:**
- ✅ Use unit tests for logic (fast)
- ✅ Use integration tests for API/DB (medium)
- ✅ Use E2E tests sparingly (slow, only critical paths)
- ✅ Mock external APIs (Gemini, Stripe)
- ✅ Parallelize when possible (Vitest does this automatically)

**Target speeds:**
- Unit tests: <5 seconds total
- Integration tests: <30 seconds total
- E2E tests: <2 minutes total

---

### Debugging Failed Tests

**When a test fails:**

1. **Read the error message**
```
AssertionError: expected 4 to equal 5
  at tests/integration/api/credits-deduction.test.js:23:27
```

2. **Add `console.log` to see values**
```javascript
console.log('Credits before:', before.credits);
console.log('Credits after:', after.credits);
```

3. **Run only that test**
```bash
npm run test:watch -- credits-deduction
```

4. **Use Playwright UI for E2E tests**
```bash
npm run test:e2e:ui
```
You can step through tests, see screenshots, and inspect the DOM.

---

### Updating Tests When Requirements Change

**Example:** You change credits from 1 per generation to 2 per generation.

**Update tests:**
```javascript
// Before
expect(after.credits).toBe(9); // Was 10, now 9

// After
expect(after.credits).toBe(8); // Was 10, now 8
```

**Pro tip:** If you change a feature, run tests first. They'll tell you exactly what to update!

---

### Common Pitfalls to Avoid

❌ **Testing implementation details**
```javascript
// Bad: Testing internal state
expect(component.state.isLoading).toBe(true);

// Good: Testing user-visible behavior
expect(screen.getByText('Loading...')).toBeInTheDocument();
```

❌ **Brittle selectors**
```javascript
// Bad: Breaks if HTML structure changes
page.locator('div > div > button:nth-child(3)');

// Good: Use test IDs
page.locator('[data-testid="generate-button"]');
```

❌ **Not cleaning up test data**
```javascript
// Bad: Leaves data in database
afterEach(() => {
  // Nothing
});

// Good: Clean up
afterEach(async () => {
  await cleanupTestUser(supabase, testUser.id);
});
```

❌ **Flaky tests (sometimes pass, sometimes fail)**
```javascript
// Bad: Race condition
await page.click('button');
expect(page.locator('.result')).toBeVisible(); // Might not be ready yet

// Good: Wait for element
await page.click('button');
await expect(page.locator('.result')).toBeVisible({ timeout: 5000 });
```

---

## 📈 Success Metrics

### How to Know If Your Tests Are Working

**Week 1:** P0 tests implemented
- ✅ Auth/logout tests pass
- ✅ Profile/credits loading tests pass
- ✅ Can push code with confidence

**Week 2:** P1 tests implemented
- ✅ Credits/payments tested
- ✅ Image generation flow tested
- ✅ Caught at least 1 bug before production

**Month 1:** Full test suite
- ✅ 80%+ code coverage
- ✅ All critical paths covered
- ✅ Tests run in <3 minutes total
- ✅ Zero production bugs from untested code

**Long-term:**
- ✅ Tests become your safety net for refactoring
- ✅ You deploy multiple times/day with confidence
- ✅ New features come with tests by default

---

## 🎓 Learning Resources

### Official Docs
- **Vitest:** https://vitest.dev/
- **Playwright:** https://playwright.dev/
- **Testing Library:** https://testing-library.com/

### Recommended Reading
- "Test-Driven Development" by Kent Beck
- "Growing Object-Oriented Software, Guided by Tests" by Freeman & Pryce

### When You're Stuck
1. Read the error message carefully
2. Check the tool's docs (they're excellent)
3. Search GitHub issues (likely someone had same problem)
4. Ask me! (I'm here to help)

---

## 🚦 Next Steps

### Ready to Implement?

**Phase 1: Setup (Do this first)**
1. [ ] Install dependencies (`npm install --save-dev ...`)
2. [ ] Create config files (`vitest.config.js`, `playwright.config.js`)
3. [ ] Set up Husky pre-push hook
4. [ ] Create test directories
5. [ ] Add GitHub Actions workflow
6. [ ] Run `npm test` to verify setup works

**Phase 2: P0 Tests (Week 1)**
1. [ ] Auth logout test (E2E)
2. [ ] Profile/credits loading test (Integration)
3. [ ] Supabase client test (Unit)

**Phase 3: P1 Tests (Week 2)**
1. [ ] Credits deduction test (Integration)
2. [ ] Stripe webhook test (Integration)
3. [ ] Image generation E2E test

**Phase 4: Continue with P2 and P3**

---

## 💬 Final Thoughts

Testing isn't about perfect coverage or following rules. It's about **confidence**.

After implementing these tests, you'll:
- Deploy without fear
- Refactor without breaking things
- Sleep better knowing your app is solid

The initial setup takes time, but **every test you write saves you 10x the time debugging production issues**.

You've got this! 🚀

---

**Questions? Stuck on something? Let me know and I'll help you implement step by step!**
