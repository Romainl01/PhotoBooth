# Sign-In Screen UI Implementation Guide
## Phase 1: Visual Implementation Only (No Auth Logic)

**Branch:** `feature/morpheo-2.0`
**Goal:** Build pixel-perfect sign-in screen UI matching Figma designs without breaking existing functionality
**Auth Integration:** Phase 2 (separate implementation)

---

## Table of Contents
1. [Overview](#overview)
2. [Design Reference](#design-reference)
3. [File Structure](#file-structure)
4. [Implementation Steps](#implementation-steps)
5. [Component Breakdown](#component-breakdown)
6. [Styling Guide](#styling-guide)
7. [Responsive Behavior](#responsive-behavior)
8. [Asset Requirements](#asset-requirements)
9. [Testing Checklist](#testing-checklist)
10. [Potential Side Effects & Mitigation](#potential-side-effects--mitigation)

---

## Overview

### What We're Building
A visually complete sign-in screen at `/sign-in` route with:
- **Logo & Branding:** Morpheo logo + tagline
- **Stats Display:** Hardcoded "⚡ 1,576 photos created this week"
- **Showcase TV:** Skeuomorphic camera viewfinder displaying ONE static AI-generated photo
- **CTA Button:** "Continue with Google" button (visual only, non-functional)
- **Responsive:** Mobile-first design with desktop variant

### What We're NOT Building (Phase 2)
- ❌ Google OAuth integration
- ❌ Session management
- ❌ Database queries
- ❌ Route protection/middleware
- ❌ Dynamic stats (API tracking)
- ❌ Photo carousel/rotation
- ❌ Play/pause controls

### Success Criteria
✅ Sign-in page renders at `/sign-in`
✅ Pixel-perfect match to Figma designs (mobile + desktop)
✅ Button styled correctly but does nothing on click
✅ Existing camera page (`/`) remains 100% functional
✅ No console errors
✅ Fast page load (<1s)
✅ Accessible (keyboard navigation, screen reader friendly)

---

## Design Reference

### Figma Links
- **Mobile:** [View Design](https://www.figma.com/design/Y6r7dVmyhVVqfDUjuDIndn/Design-sandbox-%F0%9F%9A%A7?node-id=837-172)
- **Desktop:** [View Design](https://www.figma.com/design/Y6r7dVmyhVVqfDUjuDIndn/Design-sandbox-%F0%9F%9A%A7?node-id=843-1032)

### Key Design Elements

#### 1. **Logo Section**
- **Logo:** Use existing camera button SVG from `MainButton` component
- **Text:** "Morpheo" in Crimson Pro Bold, 40px
- **Red Dot:** Small red indicator dot on camera icon (recording indicator)
- **Layout:** Horizontal flex, 16px gap, centered

#### 2. **Text Frame**
- **Tagline:** "One selfie, infinite possibilities" - IBM Plex Mono SemiBold, 16px
- **Stats:** "⚡ 1,576 photos created this week" - IBM Plex Mono SemiBold, 12px
- **Color:** Black text on light gray background (#e3e3e3)
- **Layout:** Centered, 8px gap between lines

#### 3. **Skeuomorphic TV Component**
- **Outer Container:**
  - Background: #272727 (dark gray)
  - Border radius: 44px
  - Box shadow: `0px 4px 4px 0px rgba(0,0,0,0.25)`
  - Padding: 12px
  - Mobile: 338px width, auto height
  - Desktop: 800px width, 496px height

- **Inner Shadow Frame:**
  - Border radius: 32px
  - Outer shadow: `0px 4px 4px 0px rgba(255,255,255,0.15), 0px 4px 4px 0px rgba(0,0,0,0.25)`
  - Inner shadow: `0px 2px 40px 0px inset rgba(0,0,0,0.5)`
  - Contains showcase photo

- **Button Bar (Bottom):**
  - Background: #272727
  - Contains circular button with play/pause icons
  - Play/Pause icons: 16px, white color
  - Red recording light: 3.682px dot below button

#### 4. **"Continue with Google" Button**
- **Container:**
  - Black outer border: 3px padding with 19px border radius
  - Inner button: #232323 background, 2px #666666 border, 16px radius
  - Padding: 16px
  - Mobile: Full width
  - Desktop: 800px width

- **Content:**
  - Google icon: 20px × 20px (from Figma export)
  - Text: "Continue with Google" - IBM Plex Mono Medium, 16px, white
  - Layout: Horizontal flex, 10px gap, centered

- **Reuse:** Same styling as existing `RetryButton` component

---

## File Structure

```
nextjs-app/
├── src/
│   ├── app/
│   │   ├── sign-in/
│   │   │   └── page.jsx                # NEW - Main sign-in page
│   │   └── page.js                     # UNCHANGED - Existing camera page
│   ├── components/
│   │   ├── auth/                       # NEW DIRECTORY
│   │   │   ├── SignInLayout.jsx        # Full sign-in page layout
│   │   │   ├── ShowcaseTV.jsx          # Skeuomorphic TV component
│   │   │   ├── GoogleButton.jsx        # "Continue with Google" button
│   │   │   └── MorpheoLogo.jsx         # Logo + text component
│   │   └── ui/
│   │       └── Button.jsx              # EXISTING - May need variant
│   ├── lib/
│   │   └── designTokens.js             # EXISTING - May add new tokens
│   └── public/
│       ├── icons/
│       │   └── google.svg              # NEW - Google logo from Figma
│       └── showcase/
│           ├── desktop-1.png           # NEW - Desktop showcase photo
│           └── mobile-1.png            # NEW - Mobile showcase photo
```

---

## Implementation Steps

### Step 1: Create Feature Branch
```bash
git checkout main
git pull origin main
git checkout -b feature/morpheo-2.0
```

### Step 2: Install Dependencies
```bash
npm install lucide-react
```
*For Play/Pause icons (even though not interactive in Phase 1)*

### Step 3: Export Assets from Figma

#### 3a. Google Icon
1. Open Figma design
2. Select Google icon layer
3. Export as SVG
4. Save to `/public/icons/google.svg`

#### 3b. Showcase Photos (Placeholder)
*User will provide actual photos later*

**Temporary Solution:**
1. Find ONE high-quality Morpheo-generated photo from existing results
2. Resize to:
   - Desktop: 1600×900px (save as `desktop-1.png`)
   - Mobile: 676×676px (save as `mobile-1.png`)
3. Save to `/public/showcase/`

**Image Requirements:**
- Format: PNG or JPG
- Quality: High (90%+)
- Content: Impressive AI-generated portrait (Star Wars, Matrix, or Executive style)

### Step 4: Create Reusable Components

#### 4a. MorpheoLogo Component
**File:** `/src/components/auth/MorpheoLogo.jsx`

**Purpose:** Reusable logo + text component

**Implementation Notes:**
- Reuse existing camera button SVG (same component used in camera screen)
- Add red recording dot overlay (absolute positioned, top-right of camera icon)
- Red dot: 4px diameter, #FF0000, positioned at top-right quadrant
- Text: "Morpheo" in Crimson Pro Bold (already loaded in layout)

**Props:**
- `showRedDot` (boolean, default: true) - Toggle recording indicator

**Styling:**
- Horizontal flex container
- 16px gap between icon and text
- Centered alignment
- Icon: 72px × 72px
- Text: 40px, bold, black

---

#### 4b. ShowcaseTV Component
**File:** `/src/components/auth/ShowcaseTV.jsx`

**Purpose:** Skeuomorphic TV displaying showcase photo

**Implementation Notes:**
- Use existing camera modal shadow styles as reference (from `CameraScreen`)
- Three-layer structure:
  1. Outer container (dark gray, rounded, shadow)
  2. Shadow frame (inner + outer shadows)
  3. Image container (masked, rounded corners)

**Props:**
- `imageSrc` (string, required) - Path to showcase photo
- `showControls` (boolean, default: false) - Show play/pause button (Phase 2)

**Responsive Behavior:**
- Mobile: 338px width, square aspect ratio
- Desktop: 800px width, 16:9 aspect ratio (496px height)
- Image: `object-cover` with `object-position: center`

**Accessibility:**
- Image alt text: "AI-generated photo showcasing Morpheo's capabilities"
- Button (Phase 2): aria-label for play/pause

**Styling Details:**
```css
/* Outer Container */
background: #272727
border-radius: 44px
box-shadow: 0px 4px 4px 0px rgba(0,0,0,0.25)
padding: 12px

/* Shadow Frame (Inner div) */
border-radius: 32px
box-shadow:
  0px 4px 4px 0px rgba(255,255,255,0.15),  /* Outer light reflection */
  0px 4px 4px 0px rgba(0,0,0,0.25),         /* Outer depth */
  0px 2px 40px 0px inset rgba(0,0,0,0.5)   /* Inner depth */

/* Image */
border-radius: 32px
width: 100%
height: 100%
object-fit: cover
```

**Play/Pause Button (Static in Phase 1):**
- Circular button: 54px diameter
- Gradient background (same as main button)
- Play icon: 16px (Lucide `Play` component)
- Pause icon: 16px (Lucide `Pause` component) - hidden
- Red recording dot: 3.682px, positioned bottom-right of button
- Position: Centered in button bar at bottom

---

#### 4c. GoogleButton Component
**File:** `/src/components/auth/GoogleButton.jsx`

**Purpose:** "Continue with Google" CTA button

**Implementation Notes:**
- Reuse styling from existing `RetryButton` component
- Two-layer border effect:
  - Outer: Black container with 3px padding, 19px border radius
  - Inner: #232323 background, 2px solid #666666 border, 16px radius
- Google icon: SVG from `/public/icons/google.svg`
- Text: IBM Plex Mono Medium (already loaded)

**Props:**
- `onClick` (function, optional) - In Phase 1, can be empty or console.log
- `disabled` (boolean, default: false) - For Phase 2

**Accessibility:**
- Button element (not div)
- `aria-label="Sign in with Google"`
- Keyboard focusable
- Focus visible outline (blue ring)

**Styling Details:**
```css
/* Outer Container */
background: black
padding: 3px
border-radius: 19px
width: 100% (mobile) / 800px (desktop)

/* Inner Button */
background: #232323
border: 2px solid #666666
border-radius: 16px
padding: 16px
display: flex
align-items: center
justify-content: center
gap: 10px

/* Google Icon */
width: 20px
height: 20px

/* Text */
font-family: IBM Plex Mono
font-weight: 500
font-size: 16px
color: white
line-height: 22px
```

**Hover State (Phase 1 - Optional):**
- Subtle border color shift: #666666 → #888888
- Transition: 200ms ease

---

#### 4d. SignInLayout Component
**File:** `/src/components/auth/SignInLayout.jsx`

**Purpose:** Full sign-in page layout (composes all sub-components)

**Implementation Notes:**
- Mobile-first responsive design
- Uses existing design tokens from `/src/lib/designTokens.js`
- Matches Figma spacing exactly

**Layout Structure:**
```jsx
<div className="sign-in-container"> {/* Full viewport, centered */}
  <div className="sign-in-content">   {/* Max-width container */}

    {/* Logo Section */}
    <MorpheoLogo showRedDot={true} />

    {/* Text Frame */}
    <div className="text-frame">
      <p>One selfie, infinite possibilities</p>
      <p>⚡ 1,576 photos created this week</p>
    </div>

    {/* Showcase TV */}
    <ShowcaseTV
      imageSrc="/showcase/mobile-1.png"  {/* or desktop-1.png based on viewport */}
      showControls={false}
    />

    {/* CTA Button */}
    <GoogleButton onClick={() => console.log('Phase 2: Trigger OAuth')} />

  </div>
</div>
```

**Responsive Layout:**

**Mobile (0-767px):**
- Padding: 32px horizontal, 24px vertical gap
- Logo: Centered, full width
- Text: Centered, full width
- TV: 338px width (or 100% max 338px)
- Button: Full width
- Vertical stack with 24px gaps

**Desktop (768px+):**
- Centered container: max 800px width
- Logo: Centered
- Text: Centered
- TV: 800px width
- Button: 800px width
- Vertical stack with 24px gaps
- Background: #e3e3e3 (light gray)

**Accessibility:**
- Semantic HTML (`<main>`, `<section>`, `<button>`)
- Skip to main content link (optional)
- Reduced motion support (no animations in Phase 1)

---

### Step 5: Create Sign-In Page Route

**File:** `/src/app/sign-in/page.jsx`

**Implementation:**
```jsx
import SignInLayout from '@/components/auth/SignInLayout'

export const metadata = {
  title: 'Sign In - Morpheo',
  description: 'Sign in to Morpheo AI Photobooth with your Google account',
  openGraph: {
    title: 'Sign In - Morpheo',
    description: 'Transform your selfies with AI',
  },
}

export default function SignInPage() {
  return <SignInLayout />
}
```

**Notes:**
- Uses Next.js 15 App Router conventions
- Metadata for SEO + social sharing
- Client components for interactivity in Phase 2 (add `'use client'` to SignInLayout when needed)

---

### Step 6: Update Design Tokens (Optional)

**File:** `/src/lib/designTokens.js`

**Potential Additions:**
```javascript
export const COLORS = {
  // Existing colors...
  signIn: {
    background: '#e3e3e3',
    tvOuter: '#272727',
    tvShadowLight: 'rgba(255, 255, 255, 0.15)',
    tvShadowDark: 'rgba(0, 0, 0, 0.25)',
    tvShadowInner: 'rgba(0, 0, 0, 0.5)',
    buttonBg: '#232323',
    buttonBorder: '#666666',
    recordingDot: '#FF0000',
  }
}

export const SHADOWS = {
  // Existing shadows...
  tvOuter: '0px 4px 4px 0px rgba(0,0,0,0.25)',
  tvInner: [
    '0px 4px 4px 0px rgba(255,255,255,0.15)',
    '0px 4px 4px 0px rgba(0,0,0,0.25)',
    '0px 2px 40px 0px inset rgba(0,0,0,0.5)',
  ].join(', '),
}
```

**Decision:** Only add if reusing colors/shadows across multiple components. Otherwise, inline in components.

---

### Step 7: Testing & Validation

#### 7a. Visual Testing
- [ ] Navigate to `http://localhost:3001/sign-in`
- [ ] Compare mobile view (DevTools, iPhone 14 Pro size) to Figma
- [ ] Compare desktop view (1440px+ width) to Figma
- [ ] Check spacing, shadows, colors match exactly
- [ ] Verify fonts render correctly (IBM Plex Mono, Crimson Pro)

#### 7b. Responsive Testing
- [ ] Test breakpoint at 768px (should switch layouts smoothly)
- [ ] Test very small screens (320px width - iPhone SE)
- [ ] Test very large screens (2560px - 4K)
- [ ] Check horizontal scroll doesn't appear

#### 7c. Accessibility Testing
- [ ] Tab navigation works (can reach button)
- [ ] Screen reader announces button correctly
- [ ] Focus visible (blue outline on button)
- [ ] Color contrast meets WCAG AA (use Chrome DevTools audit)

#### 7d. Regression Testing
- [ ] Navigate to `/` - camera page still works 100%
- [ ] Upload flow unchanged
- [ ] Filter selection unchanged
- [ ] Generated results unchanged
- [ ] No console errors on any page

#### 7e. Performance Testing
- [ ] Lighthouse score >90 (Performance, Accessibility, Best Practices)
- [ ] Page load time <1 second
- [ ] Image optimized (Next.js Image component if possible)

---

## Component Breakdown

### Component Hierarchy
```
SignInPage (Route)
└── SignInLayout (Layout)
    ├── MorpheoLogo (Logo + Text)
    ├── TextFrame (Tagline + Stats) - Can be inline in SignInLayout
    ├── ShowcaseTV (Skeuomorphic TV)
    │   ├── Image (Showcase photo)
    │   └── ButtonBar (Play/Pause - static)
    └── GoogleButton (CTA)
```

### Props Interface (TypeScript-style documentation)

```typescript
// MorpheoLogo.jsx
interface MorpheoLogoProps {
  showRedDot?: boolean  // Default: true
}

// ShowcaseTV.jsx
interface ShowcaseTVProps {
  imageSrc: string           // Required - Path to image
  showControls?: boolean     // Default: false (Phase 2 feature)
  alt?: string               // Default: "AI-generated showcase photo"
}

// GoogleButton.jsx
interface GoogleButtonProps {
  onClick?: () => void       // Default: () => {}
  disabled?: boolean         // Default: false (Phase 2 feature)
}

// SignInLayout.jsx
interface SignInLayoutProps {
  // No props - fully self-contained
}
```

---

## Styling Guide

### Approach
**Tailwind CSS** (existing project standard)

### Mobile-First Breakpoints
```javascript
// Tailwind default breakpoints
sm: 640px   // Not used in this design
md: 768px   // Desktop breakpoint
lg: 1024px  // Not used
xl: 1280px  // Not used
```

### Font Loading
Fonts already loaded in `/src/app/layout.js`:
- IBM Plex Mono (400, 500, 600)
- Crimson Pro (700 - Bold)

**Usage:**
```jsx
<p className="font-['IBM_Plex_Mono'] font-semibold text-[16px]">
  One selfie, infinite possibilities
</p>

<h1 className="font-['Crimson_Pro'] font-bold text-[40px]">
  Morpheo
</h1>
```

### Shadow Implementation

**TV Outer Shadow:**
```jsx
className="shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
```

**TV Inner Shadows (Layered):**
```jsx
className="shadow-[0px_4px_4px_0px_rgba(255,255,255,0.15),0px_4px_4px_0px_rgba(0,0,0,0.25)]"

{/* Separate inner shadow div */}
<div className="absolute inset-0 pointer-events-none shadow-[0px_2px_40px_0px_inset_rgba(0,0,0,0.5)]" />
```

### Responsive Image Handling

**Option 1: Next.js Image Component (Recommended)**
```jsx
import Image from 'next/image'

<Image
  src="/showcase/desktop-1.png"
  alt="AI-generated showcase photo"
  fill
  className="object-cover rounded-[32px]"
  priority  // Above the fold
  sizes="(max-width: 768px) 338px, 800px"
/>
```

**Option 2: Standard img with srcset (Manual)**
```jsx
<img
  src="/showcase/desktop-1.png"
  srcSet="/showcase/mobile-1.png 338w, /showcase/desktop-1.png 800w"
  sizes="(max-width: 768px) 338px, 800px"
  alt="AI-generated showcase photo"
  className="w-full h-full object-cover rounded-[32px]"
/>
```

---

## Responsive Behavior

### Breakpoint Strategy
- **Mobile:** 0-767px (default styles)
- **Desktop:** 768px+ (use `md:` prefix)

### Layout Changes

| Element | Mobile | Desktop |
|---------|--------|---------|
| Container padding | 32px horizontal | 32px horizontal |
| Gap between elements | 24px | 24px |
| Logo size | 72px | 72px (same) |
| Tagline font | 16px | 16px (same) |
| Stats font | 12px | 12px (same) |
| TV width | 338px | 800px |
| TV height | ~338px (square) | 496px (16:9) |
| Button width | 100% | 800px |
| Background | #e3e3e3 | #e3e3e3 (same) |

### Example Responsive Classes
```jsx
{/* Container */}
<div className="
  flex flex-col gap-[24px] items-center
  px-[32px] py-[24px]
  w-full
  md:max-w-[864px] md:mx-auto
">

{/* TV Component */}
<div className="
  w-[338px] h-[338px]
  md:w-[800px] md:h-[496px]
  rounded-[44px]
  bg-[#272727]
">

{/* Button */}
<div className="
  w-full
  md:w-[800px]
  rounded-[19px]
">
```

---

## Asset Requirements

### Google Icon
- **Format:** SVG
- **Size:** 20×20px (native size)
- **Colors:** Multi-color (Google brand colors)
- **Location:** `/public/icons/google.svg`
- **Export from Figma:** Select icon → Export as SVG → Download

### Showcase Photos

**Desktop Photo:**
- **Dimensions:** 1600×900px (2x the display size for Retina)
- **Aspect Ratio:** 16:9
- **Format:** PNG or JPG
- **Quality:** 90%+
- **File Size:** <500KB (optimize with ImageOptim or TinyPNG)
- **Location:** `/public/showcase/desktop-1.png`

**Mobile Photo:**
- **Dimensions:** 676×676px (2x the display size for Retina)
- **Aspect Ratio:** 1:1 (square)
- **Format:** PNG or JPG
- **Quality:** 90%+
- **File Size:** <300KB
- **Location:** `/public/showcase/mobile-1.png`

**Content Guidelines:**
- High-quality AI-generated portrait
- Well-lit, impressive result
- Showcases Morpheo's best capabilities
- Appropriate for all audiences (professional)

**Temporary Placeholder:**
If photos not ready, use:
```jsx
imageSrc="https://via.placeholder.com/800x496/272727/ffffff?text=Showcase+Photo"
```

### Play/Pause Icons (Phase 1 - Static)
**Source:** Lucide React
```jsx
import { Play, Pause } from 'lucide-react'

<Play size={16} color="white" />
<Pause size={16} color="white" />  {/* Hidden in Phase 1 */}
```

---

## Testing Checklist

### Visual Regression
- [ ] Desktop matches Figma (1440px viewport)
- [ ] Mobile matches Figma (390px viewport - iPhone 14 Pro)
- [ ] Fonts render correctly (no fallback fonts)
- [ ] Colors match exactly (#e3e3e3 background, etc.)
- [ ] Shadows render correctly (no missing layers)
- [ ] Spacing matches (24px gaps, 32px padding)
- [ ] Border radius smooth (44px outer, 32px inner)

### Responsive Behavior
- [ ] Layout switches at 768px breakpoint
- [ ] No horizontal scroll at any size
- [ ] Images scale correctly (no distortion)
- [ ] Button stays centered on desktop
- [ ] Text remains readable at all sizes

### Functionality (Limited in Phase 1)
- [ ] Page loads without errors
- [ ] Images load successfully
- [ ] Button is clickable (even if console.log only)
- [ ] No JavaScript errors in console
- [ ] Fast load time (<1s)

### Accessibility
- [ ] Button is keyboard accessible (Tab key)
- [ ] Focus visible on button (blue outline)
- [ ] Screen reader announces: "Sign in with Google"
- [ ] Image has descriptive alt text
- [ ] Color contrast meets WCAG AA (text on #e3e3e3)
- [ ] Semantic HTML (button, main, etc.)

### Cross-Browser
- [ ] Chrome (primary)
- [ ] Safari (Mac + iOS)
- [ ] Firefox
- [ ] Edge

### Performance
- [ ] Lighthouse Performance score >90
- [ ] Lighthouse Accessibility score 100
- [ ] First Contentful Paint <1s
- [ ] Largest Contentful Paint <2s
- [ ] No layout shift (CLS = 0)

### Regression Testing
- [ ] Camera page (`/`) still works
- [ ] Upload flow unaffected
- [ ] Filter selection unaffected
- [ ] Generated results unaffected
- [ ] Info modal still opens (desktop)
- [ ] Share/download still works

---

## Potential Side Effects & Mitigation

### 🔴 High-Risk Side Effects

#### 1. **Breaking Existing Routes**
**Risk:** Adding `/sign-in` route conflicts with existing routing
**Likelihood:** Low (Next.js handles multiple routes)
**Mitigation:**
- ✅ Use `/sign-in` directory (not `/signin` or `/login`) - clear separation
- ✅ Test `/` route still loads after creating `/sign-in`
- ✅ No shared state between routes (isolated components)

---

#### 2. **Font Loading Issues**
**Risk:** Fonts not loading correctly on sign-in page
**Likelihood:** Medium (fonts loaded in root layout)
**Mitigation:**
- ✅ Fonts already loaded globally in `/src/app/layout.js`
- ✅ Use exact font names from layout: `font-['IBM_Plex_Mono']`
- ✅ Test in incognito mode (no cached fonts)
- ✅ Fallback fonts: `sans-serif` for Crimson Pro, `monospace` for IBM Plex Mono

---

#### 3. **Image Optimization Breaking Layout**
**Risk:** Next.js Image component causes unexpected sizing/cropping
**Likelihood:** Medium (Image component strict about sizing)
**Mitigation:**
- ✅ Use `fill` + `object-cover` for responsive scaling
- ✅ Specify `sizes` attribute for correct srcset
- ✅ Add `priority` for above-fold images
- ✅ Fallback: Use regular `<img>` if Image component issues persist
- ✅ Test with actual high-res images (not placeholders)

---

#### 4. **Shadow Rendering Issues**
**Risk:** Layered box-shadows not rendering correctly (especially inner shadow)
**Likelihood:** Medium (browser inconsistencies)
**Mitigation:**
- ✅ Test in Safari (WebKit rendering differences)
- ✅ Use separate `div` for inner shadow (`pointer-events-none` to avoid blocking clicks)
- ✅ Avoid combining too many shadow layers in one `box-shadow` declaration
- ✅ Use absolute positioning for inner shadow overlay

**Example Fix:**
```jsx
{/* Outer shadows on container */}
<div className="shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">

  {/* Inner shadow as separate overlay */}
  <div className="relative">
    <img src="..." />
    <div className="absolute inset-0 pointer-events-none shadow-[0px_2px_40px_0px_inset_rgba(0,0,0,0.5)]" />
  </div>

</div>
```

---

#### 5. **Mobile Viewport Height Issues**
**Risk:** Sign-in page cut off on mobile (address bar hides content)
**Likelihood:** Medium (mobile browser UI quirks)
**Mitigation:**
- ✅ Use `min-h-screen` not `h-screen` (allows scroll if needed)
- ✅ Add `pb-[safe-area-inset-bottom]` for iOS notch support
- ✅ Test on actual iOS device (not just Chrome DevTools)
- ✅ Ensure content doesn't require exact 100vh (flexible spacing)

---

### 🟡 Medium-Risk Side Effects

#### 6. **Google Icon SVG Rendering Issues**
**Risk:** SVG export from Figma has embedded styles/transforms that break
**Likelihood:** Medium (Figma exports can be messy)
**Mitigation:**
- ✅ Clean SVG with [SVGOMG](https://jakearchibald.github.io/svgomg/) before using
- ✅ Remove Figma-specific attributes (`data-*` attributes)
- ✅ Set explicit width/height in SVG: `<svg width="20" height="20">`
- ✅ Test in Firefox (strict SVG parsing)
- ✅ Fallback: Use PNG version if SVG issues persist

---

#### 7. **Tailwind Class Name Conflicts**
**Risk:** Custom class names conflict with existing Tailwind classes
**Likelihood:** Low (Tailwind scoped by design)
**Mitigation:**
- ✅ Use Tailwind arbitrary values: `bg-[#272727]` instead of custom classes
- ✅ Avoid global CSS for sign-in components
- ✅ No `!important` overrides
- ✅ Test existing pages after changes (check for unintended style bleed)

---

#### 8. **Responsive Breakpoint Mismatch**
**Risk:** TV component switches size at wrong viewport width
**Likelihood:** Medium (Tailwind `md:` is 768px, Figma might imply different)
**Mitigation:**
- ✅ Confirm breakpoint with designer (768px standard for "desktop")
- ✅ Test at exact breakpoint (767px vs 768px)
- ✅ Use `sm:` or custom breakpoint if needed: `@media (min-width: 640px)`
- ✅ Document actual breakpoint in code comments

---

#### 9. **Button Not Accessible**
**Risk:** Google button not keyboard/screen-reader friendly
**Likelihood:** Medium (easy to forget accessibility)
**Mitigation:**
- ✅ Use `<button>` element, not `<div onClick>`
- ✅ Add `aria-label="Sign in with Google"`
- ✅ Ensure focus visible (`:focus-visible` outline)
- ✅ Test with keyboard (Tab, Enter)
- ✅ Test with screen reader (VoiceOver on Mac/iOS)

---

### 🟢 Low-Risk Side Effects

#### 10. **Hardcoded Stats Out of Sync**
**Risk:** "1,576 photos created this week" becomes outdated
**Likelihood:** High (guaranteed - it's hardcoded!)
**Mitigation:**
- ✅ Add comment: `// TODO Phase 2: Replace with Supabase query`
- ✅ Document in Phase 2 implementation plan
- ✅ Not a blocker for UI-only Phase 1

---

#### 11. **Missing Hover States**
**Risk:** Button feels unresponsive (no visual feedback on hover)
**Likelihood:** Medium
**Mitigation:**
- ✅ Add subtle hover effect: border color shift (#666 → #888)
- ✅ Add transition: `transition-colors duration-200`
- ✅ Optional: Cursor change to pointer (`cursor-pointer`)

**Example:**
```jsx
<button className="
  border-2 border-[#666666]
  hover:border-[#888888]
  transition-colors duration-200
  cursor-pointer
">
```

---

#### 12. **Page Load Flash (FOUC)**
**Risk:** Unstyled content flashes before CSS loads
**Likelihood:** Low (Next.js 15 handles this well)
**Mitigation:**
- ✅ Next.js automatically inlines critical CSS
- ✅ Use Tailwind classes (processed at build time)
- ✅ No external stylesheets in sign-in components
- ✅ Test in slow 3G throttling (Chrome DevTools)

---

#### 13. **Showcase Photo Copyright Issues**
**Risk:** Using AI-generated photo with unclear rights
**Likelihood:** Low (user-provided photos)
**Mitigation:**
- ✅ Only use photos generated by Morpheo
- ✅ User provides photos from their own generations
- ✅ No third-party stock photos
- ✅ Add watermark if needed (use existing `/lib/watermark.js`)

---

## Phase 2 Preparation Notes

**When implementing auth in Phase 2, update these components:**

### 1. GoogleButton.jsx
- Add `onClick` handler to call Supabase OAuth
- Add loading state (spinner icon)
- Disable during auth flow

### 2. SignInLayout.jsx
- Add error state handling (OAuth failed)
- Add loading overlay (redirecting to Google)
- Add success redirect logic

### 3. New Middleware
- Create `/src/middleware.js`
- Protect `/` route (redirect to `/sign-in` if not authed)
- Allow `/sign-in` public access

### 4. Stats Display
- Replace hardcoded "1,576" with Supabase query
- Add loading skeleton while fetching
- Update number in real-time (optional)

### 5. ShowcaseTV.jsx
- Add carousel rotation (every 3 seconds)
- Wire up play/pause button
- Add film animation effect
- Add sound effects (optional)

---

## Implementation Checklist

### Pre-Implementation
- [ ] Read entire implementation guide
- [ ] Confirm Figma access and design understanding
- [ ] Review existing codebase structure
- [ ] Create feature branch: `feature/morpheo-2.0`
- [ ] Install `lucide-react` dependency

### Asset Preparation
- [ ] Export Google icon from Figma → Save to `/public/icons/google.svg`
- [ ] Obtain/create showcase photos (desktop + mobile sizes)
- [ ] Optimize images (<500KB each)
- [ ] Save to `/public/showcase/`

### Component Development
- [ ] Create `/src/components/auth/` directory
- [ ] Build `MorpheoLogo.jsx` component
- [ ] Build `ShowcaseTV.jsx` component (static photo)
- [ ] Build `GoogleButton.jsx` component (non-functional)
- [ ] Build `SignInLayout.jsx` (compose all components)

### Route Setup
- [ ] Create `/src/app/sign-in/page.jsx`
- [ ] Add metadata (title, description, OG tags)
- [ ] Import and render `SignInLayout`

### Visual Testing
- [ ] Mobile view matches Figma (390px viewport)
- [ ] Desktop view matches Figma (1440px viewport)
- [ ] Responsive transition at 768px works smoothly
- [ ] All shadows render correctly
- [ ] Fonts load correctly
- [ ] Images load and scale properly

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Focus visible on button
- [ ] Color contrast passes WCAG AA
- [ ] Semantic HTML structure

### Regression Testing
- [ ] Camera page (`/`) still works 100%
- [ ] Upload flow unaffected
- [ ] Filter selection unaffected
- [ ] Generated results unaffected
- [ ] No console errors anywhere

### Performance Testing
- [ ] Lighthouse Performance >90
- [ ] Lighthouse Accessibility 100
- [ ] Page load <1 second
- [ ] Images optimized (Next.js Image or manual)

### Code Review
- [ ] No hardcoded magic numbers (use variables/tokens)
- [ ] Components are reusable and documented
- [ ] Props have clear interfaces (comments)
- [ ] TODO comments for Phase 2 work
- [ ] No console.log statements left in
- [ ] Clean git history (meaningful commit messages)

### Documentation
- [ ] Update MORPHEO_2.0_IMPLEMENTATION_PLAN.md (mark Phase 1 UI complete)
- [ ] Document any deviations from Figma (with reasons)
- [ ] Add screenshots to `/docs/` folder (optional)
- [ ] Update README with new route (`/sign-in`)

### Deployment Prep (When Ready)
- [ ] Test in Vercel preview deployment
- [ ] Verify images load from `/public/` in production
- [ ] Check fonts load correctly (Google Fonts CDN)
- [ ] No hardcoded localhost URLs

---

## Success Criteria (Final Checklist)

**Phase 1 UI is complete when:**

✅ Sign-in page renders perfectly at `/sign-in`
✅ Mobile + desktop layouts match Figma pixel-perfectly
✅ All assets load correctly (Google icon, showcase photos)
✅ Button styled correctly (even if non-functional)
✅ Existing camera functionality 100% intact
✅ Zero console errors
✅ Lighthouse scores >90 (Performance, Accessibility)
✅ Keyboard accessible
✅ Screen reader friendly
✅ Tested in Chrome, Safari, Firefox
✅ Git commits clean and documented

**When all ✅ are checked → Phase 1 COMPLETE → Ready for Phase 2 (Auth Integration)**

---

## Questions to Resolve Before Starting

1. **Showcase Photos:** Do you have specific photos ready, or should I use a placeholder?
2. **Google Icon:** Can you export from Figma, or should I find Google's official asset?
3. **Red Recording Dot:** Exact size and position? (Estimated 4px diameter, top-right quadrant)
4. **Button Hover State:** Should there be a hover effect, or static only?
5. **Play/Pause Icons:** Visible but non-functional, or hidden entirely in Phase 1?
6. **Stats Number:** Is "1,576" the exact number to hardcode, or placeholder?

---

## File Size Estimates

**Total New Code:** ~400-600 lines (including comments)
- `MorpheoLogo.jsx`: ~50 lines
- `ShowcaseTV.jsx`: ~120 lines
- `GoogleButton.jsx`: ~80 lines
- `SignInLayout.jsx`: ~150 lines
- `page.jsx`: ~20 lines

**Total New Assets:**
- `google.svg`: ~2KB
- `desktop-1.png`: ~300-500KB (optimized)
- `mobile-1.png`: ~200-300KB (optimized)

**Bundle Impact:** +10-15KB (gzipped) - minimal

---

## Timeline Estimate

**Experienced Developer:**
- Asset prep: 30 minutes
- Component development: 2-3 hours
- Testing + refinement: 1-2 hours
- **Total: 3.5-5.5 hours**

**Learning/First-Time:**
- Asset prep: 30 minutes
- Component development: 4-6 hours
- Testing + refinement: 2-3 hours
- **Total: 6.5-9.5 hours**

---

## Phase 2 Preview (Auth Integration)

**Not in this guide, but coming next:**
1. Install `@supabase/ssr` and configure Supabase client
2. Create `/src/lib/supabase/` utilities (client, server, middleware)
3. Wire up `GoogleButton` onClick → `supabase.auth.signInWithOAuth({ provider: 'google' })`
4. Create `/auth/callback` route to handle OAuth redirect
5. Add middleware to protect `/` route (redirect to `/sign-in` if not authed)
6. Update `SignInLayout` to show loading states and error messages
7. Replace hardcoded stats with Supabase query

**This will be a separate implementation guide!**

---

## Contact & Support

**Questions during implementation?**
- Check Figma designs for exact measurements
- Review existing components in `/src/components/ui/` for patterns
- Test frequently (don't wait until the end!)
- Commit often (small, atomic commits)

**Issues?**
- Check console for errors
- Use React DevTools to inspect component tree
- Test in incognito mode (clear cache)
- Compare to Figma side-by-side

---

**Ready to start? Follow the Implementation Checklist step by step!** 🚀
