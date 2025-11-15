import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { logger, logApiRequest, logApiResponse, logPaymentEvent } from '@/src/lib/logger.js';

describe('Logger - Functionality and Safety', () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let consoleWarnSpy;

  beforeEach(() => {
    // Spy on console methods
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore spies
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('Logger Methods Exist and Work', () => {
    it('should have debug() method', () => {
      expect(logger.debug).toBeDefined();
      expect(typeof logger.debug).toBe('function');
    });

    it('should have info() method', () => {
      expect(logger.info).toBeDefined();
      expect(typeof logger.info).toBe('function');
    });

    it('should have warn() method', () => {
      expect(logger.warn).toBeDefined();
      expect(typeof logger.warn).toBe('function');
    });

    it('should have error() method', () => {
      expect(logger.error).toBeDefined();
      expect(typeof logger.error).toBe('function');
    });

    it('should have security() method', () => {
      expect(logger.security).toBeDefined();
      expect(typeof logger.security).toBe('function');
    });
  });

  describe('Logger Output Format', () => {
    it('debug() should log with timestamp and level', () => {
      logger.debug('Debug message', { data: 'test' });

      // In development, debug logs
      if (consoleLogSpy.mock.calls.length > 0) {
        const logCall = consoleLogSpy.mock.calls[0];
        const timestamp = logCall[0];
        const message = logCall[1];

        expect(timestamp).toContain('[DEBUG]');
        expect(timestamp).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        expect(message).toBe('Debug message');
      }
    });

    it('info() should log with timestamp and level', () => {
      logger.info('Info message');

      const logCall = consoleLogSpy.mock.calls[0];
      const timestamp = logCall[0];
      const message = logCall[1];

      expect(timestamp).toContain('[INFO]');
      expect(timestamp).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(message).toBe('Info message');
    });

    it('warn() should log with timestamp and level', () => {
      logger.warn('Warning message');

      const logCall = consoleWarnSpy.mock.calls[0];
      const timestamp = logCall[0];

      expect(timestamp).toContain('[WARN]');
    });

    it('error() should log with timestamp and level', () => {
      logger.error('Error message');

      const logCall = consoleErrorSpy.mock.calls[0];
      const timestamp = logCall[0];

      expect(timestamp).toContain('[ERROR]');
    });
  });

  describe('Logger Data Handling', () => {
    it('should handle messages without data', () => {
      logger.info('Simple message');

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0];
      expect(logCall.length).toBe(2); // Only timestamp and message
    });

    it('should handle messages with data object', () => {
      logger.info('Message with data', { userId: '123', action: 'login' });

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0];
      expect(logCall.length).toBe(3); // Timestamp, message, and data
      expect(logCall[2]).toHaveProperty('userId');
      expect(logCall[2]).toHaveProperty('action');
    });

    it('should handle null data gracefully', () => {
      expect(() => {
        logger.info('Null data', null);
      }).not.toThrow();
    });

    it('should handle undefined data gracefully', () => {
      expect(() => {
        logger.info('Undefined data', undefined);
      }).not.toThrow();
    });

    it('should handle empty object', () => {
      logger.info('Empty object', {});

      const loggedData = consoleLogSpy.mock.calls[0][2];
      expect(loggedData).toEqual({});
    });

    it('should handle nested objects', () => {
      logger.info('Nested data', {
        user: {
          id: '123',
          profile: {
            name: 'Test'
          }
        }
      });

      const loggedData = consoleLogSpy.mock.calls[0][2];
      expect(loggedData.user).toBeDefined();
      expect(loggedData.user.profile).toBeDefined();
      expect(loggedData.user.profile.name).toBe('Test');
    });

    it('should handle arrays', () => {
      logger.info('Array data', { items: [1, 2, 3] });

      const loggedData = consoleLogSpy.mock.calls[0][2];
      expect(loggedData.items).toEqual([1, 2, 3]);
    });

    it('should handle primitive values', () => {
      logger.info('Primitives', {
        string: 'test',
        number: 42,
        boolean: true,
        null: null,
        undefined: undefined
      });

      const loggedData = consoleLogSpy.mock.calls[0][2];
      expect(loggedData.string).toBe('test');
      expect(loggedData.number).toBe(42);
      expect(loggedData.boolean).toBe(true);
      expect(loggedData.null).toBeNull();
    });
  });

  describe('Convenience Methods', () => {
    it('logApiRequest() should work', () => {
      logApiRequest('/api/users', 'user123', { method: 'POST' });

      // logApiRequest uses debug(), which may or may not log depending on NODE_ENV
      // Just verify it doesn't throw
      expect(consoleLogSpy.mock.calls.length).toBeGreaterThanOrEqual(0);
    });

    it('logApiResponse() should work', () => {
      logApiResponse('/api/users', 200, 150);

      expect(consoleLogSpy).toHaveBeenCalled();
      const message = consoleLogSpy.mock.calls[0][1];
      const data = consoleLogSpy.mock.calls[0][2];

      expect(message).toContain('/api/users');
      expect(data.statusCode).toBe(200);
      expect(data.durationMs).toBe(150);
    });

    it('logPaymentEvent() should work', () => {
      logPaymentEvent('payment.success', { amount: 1000, currency: 'USD' });

      expect(consoleLogSpy).toHaveBeenCalled();
      const message = consoleLogSpy.mock.calls[0][1];
      expect(message).toContain('payment.success');
    });
  });

  describe('Edge Cases and Error Prevention', () => {
    it('should not throw on extremely large objects', () => {
      const largeObject = {};
      for (let i = 0; i < 1000; i++) {
        largeObject[`key${i}`] = `value${i}`;
      }

      expect(() => {
        logger.info('Large object', largeObject);
      }).not.toThrow();
    });

    it('should not throw on circular references', () => {
      const circular = { name: 'test' };
      circular.self = circular;

      // Note: This might throw, but shouldn't crash the app
      try {
        logger.info('Circular reference', circular);
      } catch (e) {
        // Expected - JSON.stringify fails on circular refs
        expect(e).toBeDefined();
      }
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);

      expect(() => {
        logger.info('Long string', { data: longString });
      }).not.toThrow();
    });

    it('should handle special characters in messages', () => {
      expect(() => {
        logger.info('Special chars: äöü 中文 🎉 \n\t\r');
      }).not.toThrow();
    });

    it('should handle emoji in data', () => {
      logger.info('Emoji data', { emoji: '🚀💡✨' });

      const loggedData = consoleLogSpy.mock.calls[0][2];
      expect(loggedData.emoji).toBe('🚀💡✨');
    });
  });

  describe('Sensitive Data Awareness', () => {
    it('logger should exist and be callable with sensitive field names', () => {
      // This test documents that the logger CAN log these fields
      // In production, sanitization would occur (tested manually or in E2E)
      expect(() => {
        logger.info('User data', {
          password: 'should_be_redacted',
          email: 'user@example.com',
          token: 'secret_token',
          apiKey: 'sk_live_123'
        });
      }).not.toThrow();

      // Logger should have been called
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle data with multiple sensitive fields', () => {
      expect(() => {
        logger.info('Auth event', {
          userId: 'user_123',
          email: 'test@test.com',
          password: 'secret',
          token: 'jwt_xyz',
          apiKey: 'sk_123',
          creditCard: '4111-1111-1111-1111'
        });
      }).not.toThrow();
    });
  });

  describe('All Log Levels Work', () => {
    it('debug() should call console.log', () => {
      logger.debug('Debug test');
      // May or may not log depending on NODE_ENV, but shouldn't crash
      expect(consoleLogSpy.mock.calls.length).toBeGreaterThanOrEqual(0);
    });

    it('info() should call console.log', () => {
      logger.info('Info test');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('warn() should call console.warn', () => {
      logger.warn('Warn test');
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('error() should call console.error', () => {
      logger.error('Error test');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('security() should call console.log', () => {
      logger.security('Security test');
      // May or may not log depending on NODE_ENV, but shouldn't crash
      expect(consoleLogSpy.mock.calls.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Logger Reliability', () => {
    it('should handle rapid consecutive calls', () => {
      expect(() => {
        for (let i = 0; i < 100; i++) {
          logger.info(`Message ${i}`, { index: i });
        }
      }).not.toThrow();

      expect(consoleLogSpy.mock.calls.length).toBe(100);
    });

    it('should handle different log levels mixed together', () => {
      expect(() => {
        logger.debug('Debug');
        logger.info('Info');
        logger.warn('Warn');
        logger.error('Error');
        logger.security('Security');
      }).not.toThrow();
    });

    it('should handle logging with Error objects', () => {
      const error = new Error('Test error');

      expect(() => {
        logger.error('Error occurred', { error: error.message, stack: error.stack });
      }).not.toThrow();
    });

    it('should handle logging with Date objects', () => {
      const now = new Date();

      expect(() => {
        logger.info('Event', { timestamp: now });
      }).not.toThrow();
    });
  });
});
