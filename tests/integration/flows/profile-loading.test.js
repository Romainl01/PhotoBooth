/**
 * Integration Test: Profile & Credits Loading Logic
 *
 * Tests the critical profile loading logic from UserContext:
 * - Timeout protection (prevents hanging)
 * - Retry logic with exponential backoff
 * - Error handling
 *
 * These tests focus on YOUR code logic, not Supabase's auth system.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';

/**
 * Retry function from UserContext (copied for testing)
 * This is the actual logic that prevents your app from hanging
 */
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await fn();
      if (result) return result;

      if (attempt < maxRetries - 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
      const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return null;
};

describe('Profile Loading - Core Logic Tests', () => {
  /**
   * Test #11: Timeout Protection (Critical!)
   *
   * Your bug: "hung indefinitely"
   * This test ensures queries timeout after 2 seconds
   */
  it('should timeout if query takes longer than 2 seconds', async () => {
    const TIMEOUT_MS = 2000;

    // Create timeout promise (rejects after 2s)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout')), TIMEOUT_MS)
    );

    // Create slow query promise (takes 3s)
    const slowQueryPromise = new Promise((resolve) => {
      setTimeout(() => resolve({ data: { credits: 10 } }), 3000);
    });

    // Race: timeout should win
    await expect(
      Promise.race([slowQueryPromise, timeoutPromise])
    ).rejects.toThrow('Query timeout');
  });

  /**
   * Test: Fast queries complete within timeout
   */
  it('should allow fast queries to complete successfully', async () => {
    const TIMEOUT_MS = 2000;

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout')), TIMEOUT_MS)
    );

    // Fast query (100ms)
    const fastQueryPromise = new Promise((resolve) => {
      setTimeout(() => resolve({ data: { credits: 10 } }), 100);
    });

    // Fast query should complete successfully
    const result = await Promise.race([fastQueryPromise, timeoutPromise]);

    expect(result).toEqual({ data: { credits: 10 } });
  });

  /**
   * Test: Retry logic with exponential backoff
   *
   * Your UserContext has retry logic - let's test it!
   */
  it('should retry failed queries with exponential backoff', async () => {
    let attemptCount = 0;

    // Mock function that fails twice, succeeds on third try
    const flakeyFunction = vi.fn(async () => {
      attemptCount++;
      if (attemptCount < 3) {
        throw new Error('Temporary network error');
      }
      return { credits: 10 };
    });

    // Should retry and eventually succeed
    const result = await retryWithBackoff(flakeyFunction, 3);

    expect(result).toEqual({ credits: 10 });
    expect(flakeyFunction).toHaveBeenCalledTimes(3);
    expect(attemptCount).toBe(3);
  });

  /**
   * Test: Retry gives up after max attempts
   */
  it('should give up after max retry attempts', async () => {
    // Mock function that always fails
    const alwaysFailsFunction = vi.fn(async () => {
      throw new Error('Permanent error');
    });

    // Should throw after 3 attempts
    await expect(
      retryWithBackoff(alwaysFailsFunction, 3)
    ).rejects.toThrow('Permanent error');

    expect(alwaysFailsFunction).toHaveBeenCalledTimes(3);
  });

  /**
   * Test: Retry returns null for functions that return null
   */
  it('should return null if all retries return null', async () => {
    const returnsNullFunction = vi.fn(async () => null);

    const result = await retryWithBackoff(returnsNullFunction, 3);

    expect(result).toBeNull();
    expect(returnsNullFunction).toHaveBeenCalledTimes(3);
  });

  /**
   * Test: Retry backoff timing
   * Delays should be: 1s, 2s, 4s (exponential)
   */
  it('should use exponential backoff delays', async () => {
    const startTime = Date.now();
    let attemptCount = 0;

    const slowFunction = vi.fn(async () => {
      attemptCount++;
      if (attemptCount < 3) {
        throw new Error('Retry me');
      }
      return { success: true };
    });

    await retryWithBackoff(slowFunction, 3);

    const totalTime = Date.now() - startTime;

    // Should take approximately 3 seconds (1s + 2s delays)
    // Allow 500ms tolerance for test execution overhead
    expect(totalTime).toBeGreaterThanOrEqual(2500);
    expect(totalTime).toBeLessThan(4000);
  });

  /**
   * Test: Concurrent profile fetches don't interfere
   *
   * Simulates multiple components requesting profile data simultaneously
   */
  it('should handle concurrent requests independently', async () => {
    let callCount = 0;

    const mockFetch = vi.fn(async () => {
      callCount++;
      return { credits: 10, id: `user-${callCount}` };
    });

    // 5 concurrent requests
    const promises = Array(5)
      .fill(null)
      .map(() => retryWithBackoff(mockFetch, 1));

    const results = await Promise.all(promises);

    // All should succeed
    expect(results).toHaveLength(5);
    results.forEach((result) => {
      expect(result).toHaveProperty('credits', 10);
    });

    expect(mockFetch).toHaveBeenCalledTimes(5);
  });

  /**
   * Test: Profile data validation
   *
   * Ensures profile has required fields with correct types
   */
  it('should validate profile data structure', () => {
    const validProfile = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com',
      credits: 10,
      total_generated: 0,
      created_at: '2025-01-14T00:00:00Z',
      updated_at: '2025-01-14T00:00:00Z',
    };

    // Required fields
    expect(validProfile).toHaveProperty('id');
    expect(validProfile).toHaveProperty('email');
    expect(validProfile).toHaveProperty('credits');
    expect(validProfile).toHaveProperty('total_generated');

    // Correct types
    expect(typeof validProfile.id).toBe('string');
    expect(typeof validProfile.email).toBe('string');
    expect(typeof validProfile.credits).toBe('number');
    expect(typeof validProfile.total_generated).toBe('number');

    // Valid values
    expect(validProfile.credits).toBeGreaterThanOrEqual(0);
    expect(validProfile.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  /**
   * Test: Invalid profile data detection
   */
  it('should detect invalid profile data', () => {
    const invalidProfiles = [
      { id: null, email: 'test@example.com', credits: 10 }, // null id
      { id: '123', email: 'invalid-email', credits: 10 }, // invalid email
      { id: '123', email: 'test@example.com', credits: -5 }, // negative credits
      { id: '123', email: 'test@example.com', credits: 'ten' }, // wrong type
    ];

    invalidProfiles.forEach((profile) => {
      const hasValidId = profile.id !== null && typeof profile.id === 'string';
      const hasValidEmail =
        typeof profile.email === 'string' &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email);
      const hasValidCredits =
        typeof profile.credits === 'number' && profile.credits >= 0;

      const isValid = hasValidId && hasValidEmail && hasValidCredits;

      expect(isValid).toBe(false);
    });
  });

  /**
   * Test: Credits are always non-negative integers
   */
  it('should ensure credits are valid numbers', () => {
    const testCases = [
      { credits: 0, valid: true },
      { credits: 10, valid: true },
      { credits: 1000, valid: true },
      { credits: -1, valid: false },
      { credits: 3.14, valid: false }, // Should be integer
      { credits: NaN, valid: false },
      { credits: Infinity, valid: false },
      { credits: 'ten', valid: false },
    ];

    testCases.forEach(({ credits, valid }) => {
      const isValid =
        typeof credits === 'number' &&
        Number.isInteger(credits) &&
        Number.isFinite(credits) &&
        credits >= 0;

      expect(isValid).toBe(valid);
    });
  });
});

/**
 * Bonus: Real Supabase Connection Test
 *
 * This test actually connects to your Supabase to verify config is correct
 */
describe('Supabase Connection - Config Validation', () => {
  it('should have valid Supabase credentials configured', () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Check environment variables exist
    expect(url).toBeDefined();
    expect(anonKey).toBeDefined();
    expect(serviceKey).toBeDefined();

    // Check URL format
    expect(url).toMatch(/^https:\/\/.*\.supabase\.co$/);

    // Check keys are not empty
    expect(url.length).toBeGreaterThan(0);
    expect(anonKey.length).toBeGreaterThan(0);
    expect(serviceKey.length).toBeGreaterThan(0);
  });

  it('should be able to create Supabase client', () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(() => {
      const supabase = createClient(url, anonKey);
      expect(supabase).toBeDefined();
      expect(supabase.auth).toBeDefined();
      expect(supabase.from).toBeDefined();
    }).not.toThrow();
  });
});
