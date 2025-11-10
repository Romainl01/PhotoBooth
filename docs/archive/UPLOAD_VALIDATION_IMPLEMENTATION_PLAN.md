# File Upload Validation - Implementation Plan

**Feature Branch:** `feat/upload-validation`
**Date:** November 5, 2025
**Status:** Planning Complete, Ready for Implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Requirements](#requirements)
3. [Technical Strategy](#technical-strategy)
4. [Clean Architecture Design](#clean-architecture-design)
5. [Implementation Phases](#implementation-phases)
6. [File Changes Summary](#file-changes-summary)
7. [Testing Strategy](#testing-strategy)
8. [Edge Cases & Risk Mitigation](#edge-cases--risk-mitigation)
9. [Rollback Plan](#rollback-plan)

---

## Overview

### Problem Statement
The current upload feature (`handleUpload` in `page.js`) accepts any file type and has no size validation, potentially causing:
- Processing errors with unsupported formats
- Performance issues with large files
- Poor user experience with unclear error messages
- Unnecessary API calls with invalid data

### Solution
Implement client-side validation for:
1. **File Format**: Only accept JPEG, JPG, PNG, WebP
2. **File Size**: Reject files > 10MB

### Success Criteria
- ✅ Invalid format files are rejected before processing
- ✅ Oversized files are rejected before FileReader
- ✅ Clear, actionable error messages displayed
- ✅ Retry functionality returns user to camera screen
- ✅ No breaking changes to existing upload flow
- ✅ Consistent with existing error handling patterns

---

## Requirements

### Functional Requirements

**FR1: File Format Validation**
- Accept: JPEG (.jpg, .jpeg), PNG (.png), WebP (.webp)
- Reject: All other formats (GIF, BMP, TIFF, SVG, etc.)
- Validation method: MIME type checking with fallback to extension
- Error screen: Full-screen error with retry button

**FR2: File Size Validation**
- Maximum size: 10MB (10,485,760 bytes)
- Validation timing: Before FileReader processes file
- Error screen: Full-screen error with retry button

**FR3: Error Handling**
- Format error: Display supported formats in error message
- Size error: Display maximum allowed size and rejected file size
- Retry action: Return to camera screen, allow new upload

**FR4: User Experience**
- Fail fast: Validate before resource-intensive operations
- Clear feedback: Specific error messages
- Easy recovery: Single-click retry

### Non-Functional Requirements

**NFR1: Performance**
- Validation completes in < 10ms
- No UI blocking during validation

**NFR2: Browser Compatibility**
- Works in all browsers supporting File API
- Graceful degradation if needed

**NFR3: Maintainability**
- Validation logic in separate utility module
- Constants defined in single location
- Easy to add new formats or adjust limits

**NFR4: Consistency**
- Follows existing error screen patterns
- Uses existing ErrorLayout component
- Matches design system tokens

---

## Technical Strategy

### Core Principles

1. **Validate Early, Fail Fast**
   - Validate File object before FileReader
   - Return early on validation failure
   - Prevent unnecessary resource usage

2. **Separation of Concerns**
   - Validation logic: `lib/fileValidation.js`
   - UI components: `components/screens/*Error.jsx`
   - Business logic: `app/page.js`

3. **Single Source of Truth**
   - Constants defined once in validation utility
   - Reused across validation and error messages

4. **Progressive Enhancement**
   - Works with existing upload flow
   - No breaking changes
   - Additive implementation

5. **Defensive Programming**
   - Handle null/undefined files
   - Normalize MIME types (lowercase)
   - Fallback validation strategies

### Architecture Pattern

```
┌─────────────────────────────────────────────────────────┐
│                    User Action                          │
│              (Clicks Upload Button)                     │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              File Input Selection                       │
│           (Browser file picker opens)                   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              handleUpload(file)                         │
│                  page.js                                │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │  File Format Validation     │
         │  validateFileFormat(file)   │
         │  lib/fileValidation.js      │
         └────────┬────────────┬───────┘
                  │            │
              Valid?          Invalid?
                  │            │
                  │            └──────────────────┐
                  ▼                               ▼
         ┌─────────────────────────┐   ┌──────────────────────┐
         │  File Size Validation   │   │ FILE_FORMAT_ERROR    │
         │  validateFileSize(file) │   │  Screen State        │
         │  lib/fileValidation.js  │   │                      │
         └────────┬────────┬───────┘   │  FileFormatError.jsx │
                  │        │            └──────────────────────┘
              Valid?      Invalid?
                  │        │
                  │        └────────────────────┐
                  ▼                             ▼
         ┌─────────────────────┐     ┌──────────────────────┐
         │   FileReader        │     │  FILE_SIZE_ERROR     │
         │   Process File      │     │   Screen State       │
         │                     │     │                      │
         │   (Existing Flow)   │     │  FileSizeError.jsx   │
         └─────────────────────┘     └──────────────────────┘
```

---

## Clean Architecture Design

### Layer 1: Domain/Validation Logic

**File:** `nextjs-app/src/lib/fileValidation.js`

**Responsibilities:**
- Define validation rules (constants)
- Implement pure validation functions
- Provide formatting utilities

**Design Principles:**
- Pure functions (no side effects)
- Testable in isolation
- Framework-agnostic
- Clear function signatures

**Module Structure:**
```javascript
// Constants (Single Source of Truth)
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_MIME_TYPES = [...]
export const ALLOWED_EXTENSIONS = [...]

// Validation Functions (Pure)
export function validateFileFormat(file: File): boolean
export function validateFileSize(file: File): boolean

// Utility Functions
export function formatFileSize(bytes: number): string
export function getFileExtension(filename: string): string
```

### Layer 2: Presentation Components

**Files:**
- `nextjs-app/src/components/screens/FileFormatError.jsx`
- `nextjs-app/src/components/screens/FileSizeError.jsx`

**Responsibilities:**
- Display error UI
- Compose ErrorLayout with specific content
- Handle retry button clicks

**Design Principles:**
- Stateless functional components
- Single responsibility (display only)
- Reuse existing ErrorLayout
- Consistent with design system

**Component Structure:**
```jsx
export default function FileFormatError({ onRetry }) {
  return (
    <ErrorLayout
      icon={<ErrorIcon />}
      heading="Unsupported file format"
      message="Please upload JPEG, PNG, or WebP images only."
      onRetry={onRetry}
      buttonText="Upload Another"
    />
  )
}
```

### Layer 3: Application Logic

**File:** `nextjs-app/src/app/page.js`

**Responsibilities:**
- Orchestrate validation flow
- Manage screen state transitions
- Handle user interactions
- Coordinate error recovery

**Design Principles:**
- Declarative state management
- Clear control flow
- Early returns for validation failures
- Comprehensive error handling

**Integration Pattern:**
```javascript
const handleUpload = async (file) => {
  // Guard clause: no file selected
  if (!file) return

  // Validation step 1: Format
  if (!validateFileFormat(file)) {
    setCurrentScreen(SCREENS.FILE_FORMAT_ERROR)
    return
  }

  // Validation step 2: Size
  if (!validateFileSize(file)) {
    setCurrentScreen(SCREENS.FILE_SIZE_ERROR)
    return
  }

  // Proceed with existing flow
  processFile(file)
}
```

---

## Implementation Phases

### Phase 1: Validation Utility (Foundation)

**Objective:** Create reusable validation logic

**Tasks:**
1. Create `nextjs-app/src/lib/fileValidation.js`
2. Define constants (size, formats, MIME types)
3. Implement `validateFileFormat(file)`
4. Implement `validateFileSize(file)`
5. Implement `formatFileSize(bytes)` helper
6. Test validation functions with sample files

**Acceptance Criteria:**
- ✅ Validation functions return correct boolean
- ✅ Constants match requirements (10MB, JPEG/PNG/WebP)
- ✅ Helper functions format data correctly
- ✅ No external dependencies

**Estimated Time:** 20 minutes

---

### Phase 2: Error Screen Components

**Objective:** Create error UI components

**Tasks:**
1. Create `nextjs-app/src/components/screens/FileFormatError.jsx`
2. Create `nextjs-app/src/components/screens/FileSizeError.jsx`
3. Import ErrorLayout component
4. Define error messages and icons
5. Verify responsive design
6. Test with mock onRetry handlers

**FileFormatError.jsx Content:**
```jsx
import ErrorLayout from '../ui/ErrorLayout'
import CaptureIcon from '../icons/CaptureIcon'

export default function FileFormatError({ onRetry }) {
  return (
    <ErrorLayout
      icon={<CaptureIcon className="w-full h-full" iconType="no-camera" />}
      heading="Unsupported file format"
      message="Please upload JPEG, PNG, or WebP images only."
      onRetry={onRetry}
      buttonText="Upload Another"
    />
  )
}
```

**FileSizeError.jsx Content:**
```jsx
import ErrorLayout from '../ui/ErrorLayout'
import CaptureIcon from '../icons/CaptureIcon'

export default function FileSizeError({ onRetry }) {
  return (
    <ErrorLayout
      icon={<CaptureIcon className="w-full h-full" iconType="no-camera" />}
      heading="File too large"
      message="Maximum file size is 10MB. Please choose a smaller image."
      onRetry={onRetry}
      buttonText="Upload Another"
    />
  )
}
```

**Acceptance Criteria:**
- ✅ Components render without errors
- ✅ Follow existing ErrorLayout pattern
- ✅ Match design system styling
- ✅ Responsive on mobile and desktop

**Estimated Time:** 30 minutes

---

### Phase 3: State Management

**Objective:** Add new screen states and handlers

**File:** `nextjs-app/src/app/page.js`

**Tasks:**
1. Add `FILE_FORMAT_ERROR` to SCREENS constant
2. Add `FILE_SIZE_ERROR` to SCREENS constant
3. Import validation functions from `lib/fileValidation`
4. Import error components
5. Create `handleFileFormatRetry()` handler
6. Create `handleFileSizeRetry()` handler

**Changes to SCREENS:**
```javascript
const SCREENS = {
  CAMERA: 'camera',
  LOADING: 'loading',
  RESULT: 'result',
  CAMERA_ERROR: 'camera_error',
  API_ERROR: 'api_error',
  FILE_FORMAT_ERROR: 'file_format_error',  // NEW
  FILE_SIZE_ERROR: 'file_size_error',      // NEW
}
```

**New Handlers:**
```javascript
const handleFileFormatRetry = () => {
  setCurrentScreen(SCREENS.CAMERA)
}

const handleFileSizeRetry = () => {
  setCurrentScreen(SCREENS.CAMERA)
}
```

**Acceptance Criteria:**
- ✅ New screen states defined
- ✅ Retry handlers return to camera screen
- ✅ No state management conflicts

**Estimated Time:** 15 minutes

---

### Phase 4: Upload Function Modification

**Objective:** Integrate validation into upload flow

**File:** `nextjs-app/src/app/page.js` (handleUpload function, lines 135-157)

**Current Code:**
```javascript
const handleUpload = async (file) => {
  // Validate file
  if (!file || !file.type.startsWith('image/')) {
    console.error('Invalid file type')
    return
  }

  const reader = new FileReader()
  reader.onload = async (e) => {
    const imageData = e.target.result

    if (!imageData || imageData === 'data:,' || imageData.length < 100) {
      console.error('Failed to read image file - empty or invalid data')
      setCurrentScreen(SCREENS.CAMERA_ERROR)
      return
    }

    setCapturedImage(imageData)
    await generateImage(imageData, currentFilterIndex)
  }
  reader.readAsDataURL(file)
}
```

**New Code:**
```javascript
const handleUpload = async (file) => {
  // Guard: No file selected
  if (!file) {
    console.error('No file selected')
    return
  }

  // Validation Step 1: File Format
  if (!validateFileFormat(file)) {
    console.error('Invalid file format:', file.type)
    setCurrentScreen(SCREENS.FILE_FORMAT_ERROR)
    return
  }

  // Validation Step 2: File Size
  if (!validateFileSize(file)) {
    console.error('File too large:', formatFileSize(file.size))
    setCurrentScreen(SCREENS.FILE_SIZE_ERROR)
    return
  }

  // Proceed with existing flow (validation passed)
  const reader = new FileReader()

  reader.onload = async (e) => {
    const imageData = e.target.result

    // Validate FileReader output
    if (!imageData || imageData === 'data:,' || imageData.length < 100) {
      console.error('Failed to read image file - empty or invalid data')
      setCurrentScreen(SCREENS.CAMERA_ERROR)
      return
    }

    setCapturedImage(imageData)
    await generateImage(imageData, currentFilterIndex)
  }

  reader.onerror = () => {
    console.error('FileReader error')
    setCurrentScreen(SCREENS.API_ERROR)
  }

  reader.readAsDataURL(file)
}
```

**Key Changes:**
1. ✅ Replace generic `file.type.startsWith('image/')` with strict `validateFileFormat()`
2. ✅ Add size validation before FileReader
3. ✅ Add specific error screens for each failure type
4. ✅ Add FileReader error handler
5. ✅ Keep existing flow intact after validation

**Acceptance Criteria:**
- ✅ Invalid formats trigger format error screen
- ✅ Large files trigger size error screen
- ✅ Valid files proceed to existing flow
- ✅ No regression in existing upload functionality

**Estimated Time:** 20 minutes

---

### Phase 5: Render Integration

**Objective:** Display error screens in UI

**File:** `nextjs-app/src/app/page.js` (render section, lines 241-279)

**Tasks:**
1. Add FileFormatError screen rendering
2. Add FileSizeError screen rendering
3. Connect retry handlers to components

**Code Addition:**
```javascript
{currentScreen === SCREENS.FILE_FORMAT_ERROR && (
  <FileFormatError onRetry={handleFileFormatRetry} />
)}

{currentScreen === SCREENS.FILE_SIZE_ERROR && (
  <FileSizeError onRetry={handleFileSizeRetry} />
)}
```

**Location:** Add after existing error screens, before loading overlay

**Acceptance Criteria:**
- ✅ Error screens render when state changes
- ✅ Retry buttons trigger correct handlers
- ✅ Screens follow existing layout patterns
- ✅ No z-index or overlay conflicts

**Estimated Time:** 10 minutes

---

### Phase 6: Testing & Refinement

**Objective:** Comprehensive testing and bug fixes

**Tasks:**
1. Desktop browser testing (Chrome, Firefox, Safari)
2. Mobile browser testing (iOS Safari, Chrome Mobile)
3. Edge case testing (see Testing Strategy section)
4. Performance validation
5. UX review
6. Bug fixes if needed

**Acceptance Criteria:**
- ✅ All test cases pass (see Testing Strategy)
- ✅ No performance degradation
- ✅ Error messages are clear and helpful
- ✅ Retry flow works smoothly

**Estimated Time:** 40 minutes

---

## File Changes Summary

### Files to Create (3)

1. **`nextjs-app/src/lib/fileValidation.js`**
   - Purpose: Validation logic and constants
   - Type: Utility module
   - Lines: ~60

2. **`nextjs-app/src/components/screens/FileFormatError.jsx`**
   - Purpose: Format error screen
   - Type: React component
   - Lines: ~20

3. **`nextjs-app/src/components/screens/FileSizeError.jsx`**
   - Purpose: Size error screen
   - Type: React component
   - Lines: ~20

### Files to Modify (1)

1. **`nextjs-app/src/app/page.js`**
   - Changes:
     - Import validation functions (line ~10)
     - Import error components (line ~8)
     - Add SCREENS constants (lines ~12-18, +2 lines)
     - Add retry handlers (lines ~220, +8 lines)
     - Modify handleUpload (lines ~135-157, replace ~22 lines)
     - Add error screen rendering (lines ~270, +8 lines)
   - Total impact: ~40 lines changed/added

### Files Reviewed (No Changes)

1. **`nextjs-app/src/components/ui/ErrorLayout.jsx`**
   - Review: Understand error component pattern
   - Action: No changes needed

2. **`nextjs-app/src/lib/designTokens.js`**
   - Review: Verify error styling tokens exist
   - Action: No changes needed

---

## Testing Strategy

### Unit Testing (Manual)

**Test Validation Functions:**

```javascript
// Test in browser console or Node
import { validateFileFormat, validateFileSize, formatFileSize } from './lib/fileValidation'

// Valid JPEG
const validFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
console.assert(validateFileFormat(validFile) === true)

// Invalid GIF
const invalidFile = new File([''], 'test.gif', { type: 'image/gif' })
console.assert(validateFileFormat(invalidFile) === false)

// Small file (1MB)
const smallFile = new File([new ArrayBuffer(1024 * 1024)], 'small.jpg', { type: 'image/jpeg' })
console.assert(validateFileSize(smallFile) === true)

// Large file (15MB)
const largeFile = new File([new ArrayBuffer(15 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
console.assert(validateFileSize(largeFile) === false)
```

### Integration Testing

**Test Cases:**

| # | Test Case | File Type | File Size | Expected Result |
|---|-----------|-----------|-----------|-----------------|
| 1 | Valid JPEG small | image/jpeg | 2MB | ✅ Process normally |
| 2 | Valid PNG small | image/png | 3MB | ✅ Process normally |
| 3 | Valid WebP small | image/webp | 1MB | ✅ Process normally |
| 4 | Invalid GIF | image/gif | 1MB | ❌ Format error screen |
| 5 | Invalid BMP | image/bmp | 2MB | ❌ Format error screen |
| 6 | Invalid SVG | image/svg+xml | 500KB | ❌ Format error screen |
| 7 | Valid JPEG large | image/jpeg | 15MB | ❌ Size error screen |
| 8 | Valid PNG large | image/png | 12MB | ❌ Size error screen |
| 9 | Edge: Exactly 10MB | image/jpeg | 10MB | ✅ Process normally |
| 10 | Edge: 10MB + 1 byte | image/jpeg | 10485761B | ❌ Size error screen |
| 11 | Retry format error | - | - | ✅ Return to camera |
| 12 | Retry size error | - | - | ✅ Return to camera |

### Browser Compatibility Testing

**Desktop:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Mobile:**
- [ ] iOS Safari (iPhone)
- [ ] Chrome Mobile (Android)
- [ ] Samsung Internet (Android)

### User Experience Testing

**Flow Testing:**
1. Click upload button → Select invalid format → See error → Click retry → Back to camera ✅
2. Click upload button → Select large file → See error → Click retry → Back to camera ✅
3. Click upload button → Select valid file → Process normally ✅
4. Rapid clicking upload button → No crashes ✅
5. Cancel file picker → No errors ✅

---

## Edge Cases & Risk Mitigation

### Edge Case 1: MIME Type Inconsistencies

**Problem:** Different browsers/OS report MIME types differently
- Windows might report 'image/jpg' instead of 'image/jpeg'
- Some browsers might report 'image/pjpeg' for progressive JPEGs

**Mitigation:**
```javascript
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',      // Windows variant
  'image/pjpeg',    // Progressive JPEG
  'image/png',
  'image/webp'
]

export function validateFileFormat(file) {
  const normalizedType = file.type.toLowerCase()
  return ALLOWED_MIME_TYPES.includes(normalizedType)
}
```

### Edge Case 2: Missing File Extension

**Problem:** File named "image" with no extension but valid MIME type

**Mitigation:**
- Primary validation: MIME type (more reliable)
- Fallback validation: Extension check (if MIME type missing)

```javascript
export function validateFileFormat(file) {
  // Primary: MIME type validation
  if (file.type) {
    return ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())
  }

  // Fallback: Extension validation
  const extension = getFileExtension(file.name)
  return ALLOWED_EXTENSIONS.includes(extension)
}
```

### Edge Case 3: Misleading File Extension

**Problem:** File named "image.jpg" but actually a PDF

**Mitigation:**
- Trust MIME type over extension
- MIME type is set by browser based on file content analysis
- Our validation uses MIME type as primary check

### Edge Case 4: Corrupt Image File

**Problem:** Valid JPEG but corrupt/unreadable

**Mitigation:**
- File format/size validation only checks metadata
- FileReader will catch corrupt files
- Existing error handling in reader.onload catches this:
  ```javascript
  if (!imageData || imageData === 'data:,' || imageData.length < 100) {
    setCurrentScreen(SCREENS.CAMERA_ERROR)
  }
  ```

### Edge Case 5: Extremely Small Files

**Problem:** Valid format but suspiciously small (e.g., 100 bytes)

**Mitigation:**
- Keep existing FileReader validation
- `imageData.length < 100` check catches empty/tiny files
- No minimum size validation needed at upload stage

### Edge Case 6: File Input Reset

**Problem:** After error, file input might retain previous selection

**Mitigation:**
- Current implementation reopens file picker on retry
- Browser handles file input reset automatically
- If needed, add explicit reset:
  ```javascript
  const handleFileFormatRetry = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setCurrentScreen(SCREENS.CAMERA)
  }
  ```

### Edge Case 7: Concurrent Uploads

**Problem:** User clicks upload multiple times rapidly

**Mitigation:**
- React state updates handle this naturally
- Each upload replaces previous state
- No race conditions (single-threaded)
- If needed, add upload-in-progress flag

### Edge Case 8: Offline Mode

**Problem:** File validation works, but API call fails

**Mitigation:**
- Validation is client-side only
- API errors handled by existing error screens
- No changes needed

---

## Rollback Plan

### If Critical Bug Found

**Immediate Rollback:**
```bash
git checkout main
git branch -D feat/upload-validation
```

**Partial Rollback (Keep utility, remove UI):**
1. Keep `lib/fileValidation.js` for future use
2. Revert `page.js` changes
3. Remove error screen components

### If Feature Needs Refinement

**Iterative Fixes:**
1. Create new branch from `feat/upload-validation`
2. Apply fixes
3. Test thoroughly
4. Merge when ready

### Deployment Strategy

**Staged Rollout:**
1. Deploy to staging/preview environment
2. Test with real users
3. Monitor error rates
4. Deploy to production if stable

**Feature Flag (Future Enhancement):**
```javascript
const ENABLE_UPLOAD_VALIDATION = process.env.NEXT_PUBLIC_ENABLE_UPLOAD_VALIDATION === 'true'

if (ENABLE_UPLOAD_VALIDATION) {
  // New validation logic
} else {
  // Old logic
}
```

---

## Clean Code Principles Applied

### 1. **Single Responsibility Principle**
- Each file has one clear purpose
- Validation utility: only validation
- Error components: only display
- Page.js: only orchestration

### 2. **Open/Closed Principle**
- Easy to add new formats: add to ALLOWED_MIME_TYPES array
- Easy to change size limit: modify MAX_FILE_SIZE constant
- No need to modify validation logic

### 3. **DRY (Don't Repeat Yourself)**
- Constants defined once in validation utility
- Reused across validation, error messages, logs
- Error screen pattern reused from ErrorLayout

### 4. **KISS (Keep It Simple, Stupid)**
- Straightforward validation logic
- No over-engineering
- Clear function names
- Minimal abstractions

### 5. **YAGNI (You Aren't Gonna Need It)**
- No premature optimization
- No complex error state tracking
- No analytics tracking (can add later)
- Focus on core requirements

### 6. **Fail Fast**
- Validate before FileReader
- Return early on failure
- Don't waste resources on invalid files

### 7. **Defensive Programming**
- Handle null/undefined files
- Normalize MIME types
- Validate FileReader output
- Comprehensive error handling

---

## Success Metrics

### Technical Metrics
- [ ] 0 regressions in existing upload flow
- [ ] < 10ms validation time
- [ ] 100% test case pass rate
- [ ] 0 console errors in production

### User Experience Metrics
- [ ] Clear error messages (user testing)
- [ ] Smooth retry flow (user testing)
- [ ] No confusion about supported formats (user testing)

### Code Quality Metrics
- [ ] Functions < 30 lines
- [ ] Components < 50 lines
- [ ] No code duplication
- [ ] Clear naming conventions

---

## Implementation Timeline

| Phase | Estimated Time | Cumulative |
|-------|---------------|------------|
| Phase 1: Validation Utility | 20 min | 20 min |
| Phase 2: Error Components | 30 min | 50 min |
| Phase 3: State Management | 15 min | 1h 5min |
| Phase 4: Upload Function | 20 min | 1h 25min |
| Phase 5: Render Integration | 10 min | 1h 35min |
| Phase 6: Testing | 40 min | 2h 15min |

**Total Estimated Time:** 2 hours 15 minutes

---

## Next Steps

1. ✅ Create feature branch: `feat/upload-validation`
2. ✅ Create implementation plan document
3. ⏳ Phase 1: Implement validation utility
4. ⏳ Phase 2: Create error components
5. ⏳ Phase 3: Add state management
6. ⏳ Phase 4: Modify upload function
7. ⏳ Phase 5: Integrate error screens
8. ⏳ Phase 6: Test thoroughly
9. ⏳ Create pull request
10. ⏳ Code review
11. ⏳ Merge to main

---

## References

- **Google Docs Source**: MORPHEO_DOCUMENTATION.md (lines 1701-1706) - 10MB size limit
- **Existing Error Pattern**: ErrorLayout.jsx, CameraAccessError.jsx, GenericError.jsx
- **Current Upload Logic**: nextjs-app/src/app/page.js (lines 135-157)
- **Design Tokens**: nextjs-app/src/lib/designTokens.js

---

**Document Version:** 1.0
**Last Updated:** November 5, 2025
**Author:** Claude Code
**Status:** Ready for Implementation
