/**
 * File Validation Utility
 *
 * Provides validation functions for uploaded files.
 * Validates file format (MIME type) and file size before processing.
 */

// ============================================================================
// CONSTANTS - Single Source of Truth
// ============================================================================

/**
 * Maximum allowed file size in bytes (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB = 10,485,760 bytes

/**
 * Allowed MIME types for image uploads
 * Includes common variants across different browsers and operating systems
 */
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',   // Standard JPEG
  'image/jpg',    // Windows variant
  'image/pjpeg',  // Progressive JPEG
  'image/png',    // PNG
  'image/webp',   // WebP
]

/**
 * Allowed file extensions (fallback validation)
 */
export const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
]

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates file format based on MIME type
 *
 * @param {File} file - The file to validate
 * @returns {boolean} - True if file format is allowed, false otherwise
 *
 * @example
 * const file = new File([''], 'photo.jpg', { type: 'image/jpeg' })
 * validateFileFormat(file) // returns true
 */
export function validateFileFormat(file) {
  if (!file) {
    return false
  }

  // Primary validation: MIME type
  if (file.type) {
    const normalizedType = file.type.toLowerCase()
    return ALLOWED_MIME_TYPES.includes(normalizedType)
  }

  // Fallback validation: File extension (if MIME type is missing)
  const extension = getFileExtension(file.name)
  return ALLOWED_EXTENSIONS.includes(extension)
}

/**
 * Validates file size against maximum allowed size
 *
 * @param {File} file - The file to validate
 * @returns {boolean} - True if file size is within limit, false otherwise
 *
 * @example
 * const file = new File([new ArrayBuffer(1024 * 1024)], 'photo.jpg')
 * validateFileSize(file) // returns true (1MB < 10MB)
 */
export function validateFileSize(file) {
  if (!file) {
    return false
  }

  return file.size <= MAX_FILE_SIZE
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extracts file extension from filename
 *
 * @param {string} filename - The filename to extract extension from
 * @returns {string} - The file extension in lowercase (including the dot)
 *
 * @example
 * getFileExtension('photo.JPG') // returns '.jpg'
 * getFileExtension('image.test.png') // returns '.png'
 */
export function getFileExtension(filename) {
  if (!filename || typeof filename !== 'string') {
    return ''
  }

  const lastDotIndex = filename.lastIndexOf('.')

  if (lastDotIndex === -1) {
    return '' // No extension
  }

  return filename.substring(lastDotIndex).toLowerCase()
}

/**
 * Formats file size in bytes to human-readable format
 *
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size (e.g., "5.23 MB")
 *
 * @example
 * formatFileSize(5242880) // returns '5.00 MB'
 * formatFileSize(1536) // returns '0.00 MB'
 */
export function formatFileSize(bytes) {
  if (typeof bytes !== 'number' || bytes < 0) {
    return '0.00 MB'
  }

  const megabytes = bytes / (1024 * 1024)
  return megabytes.toFixed(2) + ' MB'
}
