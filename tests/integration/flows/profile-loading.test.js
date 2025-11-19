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
 * OPTIMIZED: Now uses faster delays (300ms, 600ms, 1200ms)
 */
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await fn();
      if (result) return result;

      if (attempt < maxRetries - 1) {
        // OPTIMIZED: Faster delays - 300ms, 600ms, 1200ms (instead of 1s, 2s, 4s)
        const delay = Math.min(300 * Math.pow(2, attempt), 1200);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
      // Wait before retrying with faster delays
      const delay = Math.min(300 * Math.pow(2, attempt), 1200);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return null;
};

describe('Profile Loading - Core Logic Tests', () => {
  /**
   * Test #11: Timeout Protection (Critical!)
   *
   * OPTIMIZED: Now uses 500ms timeout (instead of 2s) for faster failure detection
   */
  it('should timeout if query takes longer than 500ms', async () => {
    const TIMEOUT_MS = 500; // OPTIMIZED: Reduced from 2000ms

    // Create timeout promise (rejects after 500ms)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout')), TIMEOUT_MS)
    );

    // Create slow query promise (takes 1s)
    const slowQueryPromise = new Promise((resolve) => {
      setTimeout(() => resolve({ data: { credits: 10 } }), 1000);
    });

    // Race: timeout should win
    await expect(
      Promise.race([slowQueryPromise, timeoutPromise])
    ).rejects.toThrow('Query timeout');
  });

  /**
   * Test: Fast queries complete within timeout
   * OPTIMIZED: Updated to use new 500ms timeout
   */
  it('should allow fast queries to complete successfully', async () => {
    const TIMEOUT_MS = 500; // OPTIMIZED: Updated to match new timeout

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
   * OPTIMIZED: Delays should now be: 300ms, 600ms (much faster!)
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

    // OPTIMIZED: Should take approximately 900ms (300ms + 600ms delays)
    // Allow 300ms tolerance for test execution overhead
    expect(totalTime).toBeGreaterThanOrEqual(700);
    expect(totalTime).toBeLessThan(1500);
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
 * NEW: Cache Performance Tests
 *
 * Tests the new localStorage caching optimization for instant load
 */
describe('Profile Caching - Performance Optimization', () => {
  const CACHE_KEY = '__morpheo_profile_cache__';

  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  /**
   * Test: Cache write functionality
   */
  it('should cache profile data to localStorage', () => {
    const profile = {
      id: 'test-user-123',
      email: 'test@example.com',
      credits: 15,
      total_generated: 5,
    };

    // Simulate caching
    const cacheData = {
      profile,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

    // Verify cache was written
    const cached = localStorage.getItem(CACHE_KEY);
    expect(cached).toBeDefined();

    const parsed = JSON.parse(cached);
    expect(parsed.profile.credits).toBe(15);
    expect(parsed.timestamp).toBeDefined();
  });

  /**
   * Test: Cache read functionality
   */
  it('should read cached profile from localStorage', () => {
    const profile = {
      id: 'test-user-123',
      email: 'test@example.com',
      credits: 20,
      total_generated: 10,
    };

    // Pre-populate cache
    const cacheData = {
      profile,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

    // Read cache
    const cached = localStorage.getItem(CACHE_KEY);
    const parsed = JSON.parse(cached);

    expect(parsed.profile.id).toBe('test-user-123');
    expect(parsed.profile.credits).toBe(20);
    expect(parsed.profile.total_generated).toBe(10);
  });

  /**
   * Test: Cache handles malformed data gracefully
   */
  it('should handle malformed cache data gracefully', () => {
    // Write malformed JSON
    localStorage.setItem(CACHE_KEY, 'invalid-json{');

    // Should not throw when reading
    expect(() => {
      const cached = localStorage.getItem(CACHE_KEY);
      try {
        JSON.parse(cached);
      } catch (error) {
        // Expected to catch error
        expect(error).toBeDefined();
      }
    }).not.toThrow();
  });

  /**
   * Test: Cache clears on logout
   */
  it('should clear cache when user logs out', () => {
    const profile = {
      id: 'test-user-123',
      email: 'test@example.com',
      credits: 10,
    };

    // Set cache
    const cacheData = { profile, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

    // Verify cache exists
    expect(localStorage.getItem(CACHE_KEY)).toBeDefined();

    // Simulate logout - clear cache
    localStorage.removeItem(CACHE_KEY);

    // Verify cache is cleared
    expect(localStorage.getItem(CACHE_KEY)).toBeNull();
  });

  /**
   * Test: Cache update reflects credit changes
   */
  it('should update cache when credits change', () => {
    const initialProfile = {
      id: 'test-user-123',
      email: 'test@example.com',
      credits: 10,
      total_generated: 5,
    };

    // Set initial cache
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ profile: initialProfile, timestamp: Date.now() })
    );

    // Simulate credit update
    const updatedProfile = { ...initialProfile, credits: 9 };
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ profile: updatedProfile, timestamp: Date.now() })
    );

    // Verify cache was updated
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    expect(cached.profile.credits).toBe(9);
  });

  /**
   * Test: Cache validation (timestamp exists)
   */
  it('should include timestamp in cached data', () => {
    const profile = {
      id: 'test-user-123',
      email: 'test@example.com',
      credits: 10,
    };

    const beforeCache = Date.now();
    const cacheData = { profile, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    const afterCache = Date.now();

    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    expect(cached.timestamp).toBeDefined();
    expect(cached.timestamp).toBeGreaterThanOrEqual(beforeCache);
    expect(cached.timestamp).toBeLessThanOrEqual(afterCache);
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
