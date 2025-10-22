/**
 * Filter Names Configuration
 *
 * Defines the order in which filters appear in the UI.
 * This array must match the keys in STYLE_PROMPTS.
 */

import { STYLE_PROMPTS } from './stylePrompts';

// Ordered list of filters for UI navigation
export const FILTERS = [
  'Executive',
  'Lord',
  'Wes Anderson',
  'Urban',
  'Runway',
  'LinkedIn'
];

/**
 * Validates that all filters in the array exist in STYLE_PROMPTS
 * Throws an error in development if there's a mismatch
 */
if (process.env.NODE_ENV === 'development') {
  const promptKeys = Object.keys(STYLE_PROMPTS);
  const missingInPrompts = FILTERS.filter(f => !promptKeys.includes(f));
  const missingInFilters = promptKeys.filter(k => !FILTERS.includes(k));

  if (missingInPrompts.length > 0) {
    console.error(
      `[Filter Validation Error] The following filters are defined in FILTERS but missing in STYLE_PROMPTS:`,
      missingInPrompts
    );
  }

  if (missingInFilters.length > 0) {
    console.warn(
      `[Filter Validation Warning] The following styles exist in STYLE_PROMPTS but are not in FILTERS array:`,
      missingInFilters
    );
  }
}
