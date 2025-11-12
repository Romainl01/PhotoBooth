/**
 * Production-Safe Logger
 *
 * Environment-aware logging utility that:
 * - Suppresses debug logs in production
 * - Sanitizes sensitive data (user IDs, emails, payment IDs)
 * - Maintains structured logging format
 * - Provides consistent interface across the app
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *
 *   logger.debug('User authenticated', { userId: user.id });
 *   logger.info('Payment processed', { amount: 100 });
 *   logger.error('API failed', { error: err.message });
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Sensitive field patterns to redact
const SENSITIVE_PATTERNS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'api_key',
  'creditCard',
  'credit_card',
  'ssn',
  'apikey'
];

// ============================================================================
// DATA SANITIZATION
// ============================================================================

/**
 * Redacts sensitive user identifiers in production
 * In dev: Shows full data for debugging
 * In prod: Shows only last 4 chars for tracking
 */
function redactUserId(userId) {
  if (!userId) return null;
  if (isDevelopment) return userId;

  const id = String(userId);
  if (id.length <= 8) return '****';
  return `****${id.slice(-4)}`;
}

/**
 * Redacts email addresses
 * In dev: Shows full email
 * In prod: Shows u***@domain.com
 */
function redactEmail(email) {
  if (!email) return null;
  if (isDevelopment) return email;

  const [local, domain] = email.split('@');
  if (!domain) return '***@***.com';

  return `${local[0]}***@${domain}`;
}

/**
 * Redacts Stripe payment IDs
 * In dev: Shows full ID
 * In prod: Shows pi_****last4
 */
function redactPaymentId(paymentId) {
  if (!paymentId) return null;
  if (isDevelopment) return paymentId;

  const id = String(paymentId);
  if (id.length <= 8) return '****';
  return `${id.slice(0, 3)}****${id.slice(-4)}`;
}

/**
 * Recursively sanitizes an object, redacting sensitive fields
 */
function sanitizeData(data) {
  if (!data) return data;

  // Handle primitives
  if (typeof data !== 'object') return data;

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }

  // Handle objects
  const sanitized = {};

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();

    // Redact sensitive fields
    if (SENSITIVE_PATTERNS.some(pattern => lowerKey.includes(pattern))) {
      sanitized[key] = '***REDACTED***';
      continue;
    }

    // Special handling for known fields
    if (key === 'userId' || key === 'user_id' || key === 'id' && typeof value === 'string' && value.length > 20) {
      sanitized[key] = redactUserId(value);
      continue;
    }

    if (key === 'email' || key === 'user_email') {
      sanitized[key] = redactEmail(value);
      continue;
    }

    if (key === 'paymentId' || key === 'payment_id' || key === 'stripe_payment_id' || key === 'payment_intent') {
      sanitized[key] = redactPaymentId(value);
      continue;
    }

    // Recursively sanitize nested objects
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// ============================================================================
// LOGGER INTERFACE
// ============================================================================

/**
 * Formats log message with timestamp and context
 */
function formatMessage(level, message, data) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (data) {
    const sanitizedData = isProduction ? sanitizeData(data) : data;
    return [prefix, message, sanitizedData];
  }

  return [prefix, message];
}

/**
 * Logger instance with environment-aware methods
 */
export const logger = {
  /**
   * Debug logs (development only)
   * Use for verbose logging, detailed traces, debugging info
   */
  debug(message, data) {
    if (isDevelopment) {
      console.log(...formatMessage('debug', message, data));
    }
    // Silent in production
  },

  /**
   * Info logs (all environments)
   * Use for important application events, state changes
   */
  info(message, data) {
    console.log(...formatMessage('info', message, data));
  },

  /**
   * Warning logs (all environments)
   * Use for recoverable errors, deprecations, edge cases
   */
  warn(message, data) {
    console.warn(...formatMessage('warn', message, data));
  },

  /**
   * Error logs (all environments)
   * Use for exceptions, failures, critical issues
   */
  error(message, data) {
    console.error(...formatMessage('error', message, data));
  },

  /**
   * Security-sensitive logs (development only, fully redacted in production)
   * Use for authentication events, authorization checks
   */
  security(message, data) {
    if (isDevelopment) {
      console.log(...formatMessage('security', message, data));
    } else if (data) {
      // In production, only log that event occurred, no details
      console.log(...formatMessage('security', message, { event: 'occurred' }));
    }
  },
};

// ============================================================================
// CONVENIENCE METHODS
// ============================================================================

/**
 * Logs API request details (sanitized in production)
 */
export function logApiRequest(endpoint, userId, metadata = {}) {
  logger.debug(`API Request: ${endpoint}`, {
    userId,
    ...metadata,
  });
}

/**
 * Logs API response with timing
 */
export function logApiResponse(endpoint, statusCode, durationMs) {
  logger.info(`API Response: ${endpoint}`, {
    statusCode,
    durationMs,
  });
}

/**
 * Logs payment events with automatic sanitization
 */
export function logPaymentEvent(event, data) {
  logger.info(`Payment Event: ${event}`, {
    ...data,
    // Force sanitization even in development for payment data
    _sanitized: isProduction,
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export default logger;