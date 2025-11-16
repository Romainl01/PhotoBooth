import { describe, it, expect } from 'vitest';
import {
  validateFileFormat,
  validateFileSize,
  getFileExtension,
  formatFileSize,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
} from '@/src/lib/fileValidation.js';

describe('File Validation - Valid Formats', () => {
  describe('validateFileFormat() - accepts valid image formats', () => {
    it('should accept standard JPEG (image/jpeg)', () => {
      const file = { type: 'image/jpeg', name: 'photo.jpg' };

      expect(validateFileFormat(file)).toBe(true);
    });

    it('should accept JPG variant (image/jpg)', () => {
      const file = { type: 'image/jpg', name: 'photo.jpg' };

      expect(validateFileFormat(file)).toBe(true);
    });

    it('should accept progressive JPEG (image/pjpeg)', () => {
      const file = { type: 'image/pjpeg', name: 'photo.jpg' };

      expect(validateFileFormat(file)).toBe(true);
    });

    it('should accept PNG (image/png)', () => {
      const file = { type: 'image/png', name: 'photo.png' };

      expect(validateFileFormat(file)).toBe(true);
    });

    it('should accept WebP (image/webp)', () => {
      const file = { type: 'image/webp', name: 'photo.webp' };

      expect(validateFileFormat(file)).toBe(true);
    });

    it('should handle case-insensitive MIME types', () => {
      const file1 = { type: 'IMAGE/JPEG', name: 'photo.jpg' };
      const file2 = { type: 'Image/Png', name: 'photo.png' };

      expect(validateFileFormat(file1)).toBe(true);
      expect(validateFileFormat(file2)).toBe(true);
    });

    it('should use file extension as fallback when MIME type is missing', () => {
      const file = { type: '', name: 'photo.jpg' };

      expect(validateFileFormat(file)).toBe(true);
    });

    it('should accept .jpeg extension as fallback', () => {
      const file = { type: '', name: 'photo.jpeg' };

      expect(validateFileFormat(file)).toBe(true);
    });

    it('should accept .png extension as fallback', () => {
      const file = { type: '', name: 'photo.png' };

      expect(validateFileFormat(file)).toBe(true);
    });

    it('should accept .webp extension as fallback', () => {
      const file = { type: '', name: 'photo.webp' };

      expect(validateFileFormat(file)).toBe(true);
    });

    it('should handle uppercase file extensions', () => {
      const file = { type: '', name: 'photo.JPG' };

      expect(validateFileFormat(file)).toBe(true);
    });
  });

  describe('validateFileFormat() - rejects invalid formats', () => {
    it('should reject PDF files', () => {
      const file = { type: 'application/pdf', name: 'document.pdf' };

      expect(validateFileFormat(file)).toBe(false);
    });

    it('should reject GIF files', () => {
      const file = { type: 'image/gif', name: 'animation.gif' };

      expect(validateFileFormat(file)).toBe(false);
    });

    it('should reject HEIC files', () => {
      const file = { type: 'image/heic', name: 'photo.heic' };

      expect(validateFileFormat(file)).toBe(false);
    });

    it('should reject SVG files', () => {
      const file = { type: 'image/svg+xml', name: 'icon.svg' };

      expect(validateFileFormat(file)).toBe(false);
    });

    it('should reject files with no type or extension', () => {
      const file = { type: '', name: 'file' };

      expect(validateFileFormat(file)).toBe(false);
    });

    it('should reject null file', () => {
      expect(validateFileFormat(null)).toBe(false);
    });

    it('should reject undefined file', () => {
      expect(validateFileFormat(undefined)).toBe(false);
    });
  });

  describe('validateFileSize() - accepts valid file sizes', () => {
    it('should accept file under 10MB', () => {
      const file = { size: 5 * 1024 * 1024 }; // 5MB

      expect(validateFileSize(file)).toBe(true);
    });

    it('should accept file exactly at 10MB limit', () => {
      const file = { size: MAX_FILE_SIZE }; // Exactly 10MB

      expect(validateFileSize(file)).toBe(true);
    });

    it('should accept very small files', () => {
      const file = { size: 1024 }; // 1KB

      expect(validateFileSize(file)).toBe(true);
    });

    it('should accept zero-byte files', () => {
      const file = { size: 0 };

      expect(validateFileSize(file)).toBe(true);
    });
  });

  describe('validateFileSize() - rejects files over limit', () => {
    it('should reject file over 10MB', () => {
      const file = { size: 11 * 1024 * 1024 }; // 11MB

      expect(validateFileSize(file)).toBe(false);
    });

    it('should reject file just 1 byte over limit', () => {
      const file = { size: MAX_FILE_SIZE + 1 };

      expect(validateFileSize(file)).toBe(false);
    });

    it('should reject null file', () => {
      expect(validateFileSize(null)).toBe(false);
    });

    it('should reject undefined file', () => {
      expect(validateFileSize(undefined)).toBe(false);
    });
  });

  describe('getFileExtension() - utility function', () => {
    it('should extract .jpg extension', () => {
      expect(getFileExtension('photo.jpg')).toBe('.jpg');
    });

    it('should extract .jpeg extension', () => {
      expect(getFileExtension('photo.jpeg')).toBe('.jpeg');
    });

    it('should extract .png extension', () => {
      expect(getFileExtension('photo.png')).toBe('.png');
    });

    it('should extract .webp extension', () => {
      expect(getFileExtension('photo.webp')).toBe('.webp');
    });

    it('should handle uppercase extensions', () => {
      expect(getFileExtension('PHOTO.JPG')).toBe('.jpg');
    });

    it('should handle filenames with multiple dots', () => {
      expect(getFileExtension('my.photo.final.jpg')).toBe('.jpg');
    });

    it('should return empty string for files without extension', () => {
      expect(getFileExtension('file')).toBe('');
    });

    it('should return empty string for null', () => {
      expect(getFileExtension(null)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(getFileExtension('')).toBe('');
    });
  });

  describe('formatFileSize() - utility function', () => {
    it('should format 5MB correctly', () => {
      expect(formatFileSize(5 * 1024 * 1024)).toBe('5.00 MB');
    });

    it('should format 10MB correctly', () => {
      expect(formatFileSize(10 * 1024 * 1024)).toBe('10.00 MB');
    });

    it('should format bytes with decimals', () => {
      expect(formatFileSize(5242880)).toBe('5.00 MB');
    });

    it('should handle zero bytes', () => {
      expect(formatFileSize(0)).toBe('0.00 MB');
    });

    it('should handle negative numbers', () => {
      expect(formatFileSize(-100)).toBe('0.00 MB');
    });

    it('should handle non-number input', () => {
      expect(formatFileSize('not a number')).toBe('0.00 MB');
    });
  });

  describe('Constants', () => {
    it('should have correct MAX_FILE_SIZE (10MB)', () => {
      expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
      expect(MAX_FILE_SIZE).toBe(10485760);
    });

    it('should have all allowed MIME types defined', () => {
      expect(ALLOWED_MIME_TYPES).toContain('image/jpeg');
      expect(ALLOWED_MIME_TYPES).toContain('image/jpg');
      expect(ALLOWED_MIME_TYPES).toContain('image/pjpeg');
      expect(ALLOWED_MIME_TYPES).toContain('image/png');
      expect(ALLOWED_MIME_TYPES).toContain('image/webp');
    });

    it('should have exactly 5 allowed MIME types', () => {
      expect(ALLOWED_MIME_TYPES).toHaveLength(5);
    });
  });
});
