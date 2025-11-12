/**
 * Rate Limiting Utility
 *
 * Serverless-compatible rate limiting using Upstash Redis.
 * Protects expensive endpoints from abuse and API quota exhaustion.
 *
 * Setup:
 * 1. Create free Upstash Redis database at https://console.upstash.com
 * 2. Add to .env.local:
 *    UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
 *    UPSTASH_REDIS_REST_TOKEN=your_token
 *
 * Usage:
 *   import { checkRateLimit } from '@/lib/ratelimit';
 *
 *   const { success, limit, remaining } = await checkRateLimit(userId, 'generation');
 *   if (!success) {
 *     return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
 *   }
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { logger } from '@/lib/logger';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Rate limit configurations for different endpoint types
 *
 * Limits are defined as: [requests, window]
 * - generation: 10 requests per hour (expensive Gemini API calls)
 * - checkout: 5 requests per hour (prevent Stripe session spam)
 * - credit-packages: 60 requests per hour (cheap, read-only)
 */
const RATE_LIMITS = {
  generation: {
    requests: 10,
    window: '1 h',
    description: 'AI image generation (expensive)',
  },
  checkout: {
    requests: 5,
    window: '1 h',
    description: 'Stripe checkout session creation',
  },
  'credit-packages': {
    requests: 60,
    window: '1 h',
    description: 'Credit packages listing',
  },
};

// ============================================================================
// RATE LIMITER INITIALIZATION
// ============================================================================

let redis;
let rateLimiters = {};
let isConfigured = false;

/**
 * Initialize Upstash Redis connection (lazy initialization)
 */
function initializeRateLimiter() {
  // Check if already initialized
  if (redis) return;

  // Check if Upstash is configured
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!upstashUrl || !upstashToken) {
    logger.warn('Rate Limiting - Upstash not configured, rate limiting disabled', {
      message: 'Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to enable',
      docs: 'https://console.upstash.com',
    });
    isConfigured = false;
    return;
  }

  try {
    // Initialize Redis client
    redis = new Redis({
      url: upstashUrl,
      token: upstashToken,
    });

    // Create rate limiters for each endpoint type
    for (const [key, config] of Object.entries(RATE_LIMITS)) {
      rateLimiters[key] = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(config.requests, config.window),
        analytics: true, // Track rate limit hits
        prefix: `morpheo:ratelimit:${key}`,
      });
    }

    isConfigured = true;
    logger.info('Rate Limiting - Upstash initialized successfully');
  } catch (error) {
    logger.error('Rate Limiting - Failed to initialize Upstash', {
      error: error.message,
    });
    isConfigured = false;
  }
}

// ============================================================================
// RATE LIMIT CHECKING
// ============================================================================

/**
 * Check if a user has exceeded their rate limit for a specific endpoint
 *
 * @param {string} userId - The user's unique identifier
 * @param {string} limitType - The type of limit to check ('generation', 'checkout', etc.)
 * @returns {Promise<Object>} Result object with success, limit, remaining, reset
 *
 * @example
 * const { success, limit, remaining, reset } = await checkRateLimit(user.id, 'generation');
 * if (!success) {
 *   return NextResponse.json(
 *     {
 *       error: 'Rate limit exceeded',
 *       limit,
 *       remaining,
 *       reset: new Date(reset).toISOString()
 *     },
 *     { status: 429 }
 *   );
 * }
 */
export async function checkRateLimit(userId, limitType) {
  // Initialize on first use
  if (!redis && !rateLimiters[limitType]) {
    initializeRateLimiter();
  }

  // If Upstash is not configured, allow all requests (log warning once)
  if (!isConfigured) {
    return {
      success: true,
      limit: 999,
      remaining: 999,
      reset: Date.now() + 3600000, // 1 hour from now
      bypassed: true,
    };
  }

  // Validate limit type
  if (!RATE_LIMITS[limitType]) {
    logger.error('Rate Limiting - Invalid limit type', { limitType });
    throw new Error(`Invalid rate limit type: ${limitType}`);
  }

  const ratelimiter = rateLimiters[limitType];

  try {
    // Check rate limit
    const { success, limit, remaining, reset } = await ratelimiter.limit(userId);

    // Log rate limit hits (not misses - those are debug only)
    if (!success) {
      logger.warn('Rate Limiting - Limit exceeded', {
        userId,
        limitType,
        limit,
        remaining,
        reset: new Date(reset).toISOString(),
      });
    } else {
      logger.debug('Rate Limiting - Check passed', {
        userId,
        limitType,
        remaining,
        limit,
      });
    }

    return {
      success,
      limit,
      remaining,
      reset,
      bypassed: false,
    };
  } catch (error) {
    // On error, fail open (allow request) but log the issue
    logger.error('Rate Limiting - Check failed, allowing request', {
      error: error.message,
      userId,
      limitType,
    });

    return {
      success: true,
      limit: -1,
      remaining: -1,
      reset: Date.now(),
      bypassed: true,
      error: error.message,
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get rate limit configuration for a specific type
 */
export function getRateLimitConfig(limitType) {
  return RATE_LIMITS[limitType] || null;
}

/**
 * Check if rate limiting is enabled
 */
export function isRateLimitingEnabled() {
  if (!redis) {
    initializeRateLimiter();
  }
  return isConfigured;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  checkRateLimit,
  getRateLimitConfig,
  isRateLimitingEnabled,
  RATE_LIMITS,
};
