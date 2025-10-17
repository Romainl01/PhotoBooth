// Grain Design System Tokens
// Extracted from Figma designs (excluding status bar - immersive mockup only)

export const colors = {
  // Primary colors
  primary: '#FAB617',           // Yellow/Gold - filter selector active state

  // Background colors
  background: '#242424',        // Main app background
  cameraBg: '#1C1C1E',         // Camera preview area
  buttonBg: '#232323',         // Button backgrounds

  // Border & outline colors
  borderPrimary: '#666666',    // Button borders
  borderOuter: '#000000',      // Outer border (skeumorphic depth)

  // Text colors
  textPrimary: '#FFFFFF',      // White text
  textAccent: '#FAB617',       // Accent text (filter name)

  // Semantic colors
  error: '#FF0000',            // Error indicator dot

  // Shadows & depth (skeumorphic)
  shadowLight: 'rgba(255, 255, 255, 0.15)',  // Outer highlight shadow
  shadowDark: 'rgba(0, 0, 0, 0.4)',          // Inner depth shadow
}

export const shadows = {
  // Skeumorphic depth effects
  cameraView: '0px 4px 4px 0px rgba(255, 255, 255, 0.15)',
  cameraInner: '0px 2px 6px 0px inset rgba(0, 0, 0, 0.4)',
}

export const borderRadius = {
  button: '16px',
  buttonOuter: '19px',
  camera: '32px',
  cameraOuter: '48px',
  controls: '16px',
}

export const spacing = {
  // Screen padding
  screenPadding: '12px',
  screenPaddingY: '8px',

  // Button spacing
  buttonPadding: '16px',
  buttonPaddingSmall: '12px',
  buttonBarPaddingX: '32px',
  buttonBarPaddingY: '16px',
  buttonGap: '73px',          // Gap between 3 buttons on result screen

  // Filter selector
  filterGap: '24px',          // Gap around filter selector
  filterBorder: '3px',        // Border thickness for outer skeumorphic effect
}

export const typography = {
  // Font families
  fontMono: '"IBM Plex Mono", monospace',
  fontDMMono: '"DM Mono", monospace',

  // Font sizes
  sizeHeading: '24px',        // Error screen heading
  sizeBody: '16px',           // Error message body, button text

  // Line heights
  lineHeightNormal: '22px',
}

export const sizes = {
  // Button sizes
  buttonMain: '88px',          // Main capture/retry button (circular)
  buttonSecondary: '64px',     // Side buttons (upload, camera switch, share, download)
  buttonNav: '48px',           // Filter navigation arrows

  // Filter selector
  filterWidth: '140px',

  // Error screen
  errorIcon: '88px',
  errorMessageWidth: '334px',
}

export const breakpoints = {
  mobile: '0px',
  desktop: '768px',
}
