# 6. Design System

## 6.1 Design Tokens

All design values are centralized in `src/lib/designTokens.js` and mirrored in `tailwind.config.js`.

### Color Palette

```javascript
// Primary Brand
primary: '#FAB617'          // Yellow/Gold - Active filters, accents

// Backgrounds
background: '#242424'       // Main app background
cameraBackground: '#1C1C1E' // Camera view (slightly darker)
buttonBackground: '#232323' // Button backgrounds

// Borders
borderPrimary: '#666666'    // Subtle element borders
borderOuter: '#000000'      // Outer skeumorphic borders

// Text
textPrimary: '#FFFFFF'      // Primary white text
textAccent: '#FAB617'       // Yellow accent text

// Semantic
error: '#FF0000'            // Error states and messages
```

### Typography

**Font Families:**
```javascript
primary: 'IBM Plex Mono'    // Main UI text (buttons, labels)
secondary: 'DM Mono'        // Filter badges
body: 'Geist'               // Body text (minimal usage)
```

**Font Sizes:**
```javascript
heading: '24px'             // Screen titles
body: '16px'                // Button text, labels
badge: '14px'               // Filter badges
```

**Font Weights:**
```javascript
bold: 900                   // Buttons, headings
regular: 400                // Body text
```

### Spacing

```javascript
screenPadding: '32px'       // Screen edge padding
buttonSpacing: '73px'       // Horizontal gap between buttons
filterGap: '24px'           // Gap between filter elements
```

### Sizing

```javascript
// Buttons
button.main: '88px'         // Capture button
button.secondary: '64px'    // Upload, switch camera
button.nav: '48px'          // Filter navigation arrows

// Components
filter.width: '226px'       // Filter badge width
error.messageWidth: '327px' // Error message max width
```

### Border Radius

```javascript
button: '16px'              // Standard button corners
camera: '32px'              // Camera view corners (mobile)
controls: '16px'            // Control container corners
```

### Shadows

```javascript
skeumorphic: {
  light: '0 2px 4px rgba(255, 255, 255, 0.1)',
  dark: '0 4px 8px rgba(0, 0, 0, 0.5)'
}
```

## 6.2 Skeumorphic Design Pattern

The application uses a **double-border skeumorphic design** to create depth and tactile feel.

### Visual Structure

```
┌─────────────────────────────┐
│  Outer Black Border (#000)  │
│  ┌───────────────────────┐  │
│  │ Inner Gradient Border │  │
│  │  ┌─────────────────┐  │  │
│  │  │  Button Content │  │  │
│  │  └─────────────────┘  │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

### Implementation Example

```jsx
<div className="relative">
  {/* Outer border */}
  <div className="absolute inset-0 rounded-2xl bg-black" />

  {/* Inner gradient border */}
  <div className="relative rounded-2xl bg-gradient-to-br from-border-primary to-background">
    {/* Content */}
    <button className="w-full h-full bg-button-bg rounded-2xl">
      Button Text
    </button>
  </div>
</div>
```

### Key Principles

1. **Icons Own Their Design**
   - Icons include complete visual elements (circles, borders, gradients)
   - No external wrapper styling needed
   - Self-contained SVG structure

2. **Button Reset Styles**
   - Always include: `bg-transparent border-0 outline-none p-0 m-0`
   - Prevents browser default styles
   - Critical for mobile Safari compatibility

3. **Consistent Structure**
   - Similar components use identical patterns
   - No unnecessary wrapper divs
   - Reuse established patterns, don't reinvent

## 6.3 Component Guidelines

### Buttons

**Standard Button Pattern:**
```jsx
<button
  className="bg-transparent border-0 outline-none p-0 m-0 cursor-pointer"
  onClick={handleClick}
>
  {/* Button content */}
</button>
```

**Text Button Pattern (with skeumorphic effect):**
```jsx
<Button onClick={handleClick}>
  Button Text
</Button>
```

**Icon Button Pattern:**
```jsx
<IconButton onClick={handleClick} size="main">
  <CaptureIcon />
</IconButton>
```

### Icons

**Self-Contained Icon Structure:**
```jsx
export default function CustomIcon() {
  return (
    <svg width="88" height="88" viewBox="0 0 88 88">
      {/* Outer circle with border */}
      <circle cx="44" cy="44" r="43" fill="#232323" stroke="#000" strokeWidth="2"/>

      {/* Inner gradient border */}
      <circle cx="44" cy="44" r="41" fill="none" stroke="url(#grad)" strokeWidth="1"/>

      {/* Icon content */}
      <path d="..." fill="#FAB617"/>

      {/* Gradient definition */}
      <defs>
        <linearGradient id="grad">
          <stop offset="0%" stopColor="#666" />
          <stop offset="100%" stopColor="#333" />
        </linearGradient>
      </defs>
    </svg>
  )
}
```

**Usage:**
```jsx
// Correct: Icon used with IconButton wrapper
<IconButton onClick={handleClick} size="main">
  <CustomIcon />
</IconButton>

// Incorrect: Don't add extra styling wrappers
<div className="rounded-full border-2"> {/* ❌ */}
  <CustomIcon />
</div>
```

## 6.4 Responsive Design

### Mobile-First Approach

All layouts are designed mobile-first with desktop enhancements.

**Breakpoints:**
```javascript
mobile: '0px'     // Default (320px+)
desktop: '768px'  // md: prefix
```

### Layout Patterns

**Center Alignment (ALL Breakpoints):**
```jsx
// Correct: Apply to all breakpoints
<div className="flex items-center justify-center">
  {/* Content */}
</div>

// Incorrect: Desktop-only centering
<div className="md:flex md:items-center md:justify-center"> {/* ❌ */}
  {/* Content */}
</div>
```

**Responsive Component Visibility:**
```jsx
// Hide on mobile, show on desktop
<div className="hidden md:block">
  <InfoModal />
</div>

// Show on mobile, hide on desktop
<div className="block md:hidden">
  <SwitchCameraIcon />
</div>
```

**Responsive Spacing:**
```jsx
<div className="px-4 md:px-8 py-6 md:py-12">
  {/* Content with responsive padding */}
</div>
```

## 6.5 Accessibility

### Focus States

All interactive elements include focus styles:
```css
focus:outline-none focus:ring-2 focus:ring-primary
```

### Touch Targets

Minimum touch target size: 44x44px (following iOS guidelines)

### Semantic HTML

- Use semantic elements (`<button>`, `<nav>`, etc.)
- Provide `aria-label` for icon buttons
- Use `alt` text for images

#### Example:
```jsx
<button
  aria-label="Capture photo"
  className="..."
  onClick={handleCapture}
>
  <CaptureIcon />
</button>
```
