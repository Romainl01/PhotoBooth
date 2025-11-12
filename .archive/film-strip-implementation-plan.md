# Film Strip Animation Implementation Plan
## Morpheo Sign-In Page Enhancement

**Created:** 2025-11-11
**Status:** Pre-Implementation Analysis
**Goal:** Transform static photo showcase into animated film strip with analog camera aesthetics

---

## 1. EXECUTIVE SUMMARY

### Current State
- **Component:** `ShowcaseTV.jsx` displays single static hero image
- **Location:** Sign-in page (`SignInLayout.jsx`)
- **Design:** Skeuomorphic TV with dark container, shadows, glass effects
- **Images:** 7 photos in `/nextjs-app/public/showcase/mobile/`
- **Tech Stack:** Next.js 15, React 19, Tailwind CSS 3.4

### Target State
- **New Component:** `FilmStrip.jsx` with horizontal carousel
- **Animation:** Auto-advance every 3 seconds with smooth slide transition
- **Aesthetics:** Analog film perforations, grain, vignette
- **Compatibility:** Replace `ShowcaseTV` in `SignInLayout` without breaking layout

---

## 2. CODEBASE ANALYSIS

### 2.1 Current File Structure
```
nextjs-app/
├── src/
│   └── components/
│       └── auth/
│           ├── SignInLayout.jsx      # Parent component
│           ├── ShowcaseTV.jsx        # TO BE REPLACED
│           ├── MorpheoLogo.jsx       # Unchanged
│           └── GoogleButton.jsx      # Unchanged
├── public/
│   └── showcase/
│       ├── mobile/                   # 7 photos to use
│       │   ├── Mobile Kill Bill Emma.png (1.5MB)
│       │   ├── Mobile Kill Bill Thomas.png (1.5MB)
│       │   ├── Mobile Lord Romain.png (1.7MB)
│       │   ├── Mobile Matrix Romain.png (2.4MB)
│       │   ├── Mobile Star Wars Thomas.png (985KB)
│       │   ├── Mobile Star Wars Valentin.png (868KB)
│       │   └── Mobile Zombie Samy.png (779KB)
│       └── hero-photo.jpg            # Currently used (deprecated after)
└── tailwind.config.js                # Custom theme, no animations yet
```

### 2.2 Component Dependencies
```
SignInLayout.jsx
├── imports ShowcaseTV
├── imports MorpheoLogo
├── imports GoogleButton
├── imports createClient (Supabase)
└── passes children to ShowcaseTV
    └── children = <GoogleButton />
```

**Impact Analysis:**
- ✅ `MorpheoLogo` - No changes needed
- ✅ `GoogleButton` - No changes needed
- ⚠️ `ShowcaseTV` - Will be replaced with `FilmStrip`
- ⚠️ `SignInLayout` - Must update import and component usage

### 2.3 Current ShowcaseTV Props API
```jsx
<ShowcaseTV
  imageSrc="/showcase/hero-photo.jpg"  // Single image path
  alt="AI-generated showcase photo"    // Accessibility
>
  <GoogleButton />                      // Overlay content
</ShowcaseTV>
```

**New FilmStrip Props API (Proposed):**
```jsx
<FilmStrip
  images={[                             // Array of image objects
    { src: '/showcase/mobile/...', alt: '...' },
    // ...
  ]}
  intervalMs={3000}                     // Auto-advance interval
>
  <GoogleButton />                      // Overlay content (preserved)
</FilmStrip>
```

---

## 3. DETAILED IMPLEMENTATION STRATEGY

### 3.1 Component Architecture

#### FilmStrip.jsx Component Structure
```
<FilmStrip> (Outer container - maintains ShowcaseTV dimensions)
  │
  ├─ Film Container (overflow hidden)
  │  │
  │  ├─ Perforations Top (CSS pseudo-element ::before)
  │  │
  │  ├─ Film Track (horizontal sliding strip)
  │  │  └─ Photo Frames × 7 (each normalized with object-fit)
  │  │
  │  └─ Perforations Bottom (CSS pseudo-element ::after)
  │
  ├─ Film Grain Overlay (SVG filter or texture)
  │
  ├─ Vignette Overlay (radial gradient)
  │
  └─ Children Container (Google Button overlay)
```

#### State Management
```javascript
const [currentIndex, setCurrentIndex] = useState(0);
const [isAnimating, setIsAnimating] = useState(false);

useEffect(() => {
  const interval = setInterval(() => {
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % images.length);

    // Reset animation flag after transition
    setTimeout(() => setIsAnimating(false), 500);
  }, intervalMs);

  return () => clearInterval(interval);
}, [images.length, intervalMs]);
```

### 3.2 CSS Architecture & Animations

#### Film Perforations (CSS-only approach)
**Strategy:** Use `box-shadow` with multiple values to create repeating perforation holes

```css
/* Approach 1: Multiple box-shadows (most browser compatible) */
.perforation-top::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 24px;
  background: #1a1a1a; /* Dark film edge */
  box-shadow:
    20px 12px 0 -8px #000,  /* Hole 1 */
    60px 12px 0 -8px #000,  /* Hole 2 */
    100px 12px 0 -8px #000, /* ... */
    /* Repeat every 40px */;
}

/* Approach 2: Radial gradient (more flexible, better for responsiveness) */
.perforation-top::before {
  background:
    radial-gradient(circle at 20px 12px, transparent 6px, #1a1a1a 7px),
    radial-gradient(circle at 60px 12px, transparent 6px, #1a1a1a 7px),
    /* Repeat */
    #1a1a1a;
  background-size: 40px 24px;
  background-repeat: repeat-x;
}
```

**Decision:** Use radial gradient approach for:
- Better responsiveness (scales with container)
- Cleaner code (one background property vs. 20+ shadows)
- Easier maintenance

#### Sliding Animation
**Strategy:** CSS transform with transition for GPU acceleration

```css
.film-track {
  display: flex;
  transform: translateX(calc(-100% * currentIndex));
  transition: transform 500ms cubic-bezier(0.4, 0.0, 0.2, 1);
  will-change: transform; /* Hint to browser for optimization */
}

.photo-frame {
  flex: 0 0 100%;  /* Each photo takes full container width */
  width: 100%;
}
```

**Performance Optimization:**
- Use `transform` (GPU-accelerated) instead of `left`/`margin`
- Add `will-change: transform` to create compositing layer
- Use `cubic-bezier` for smooth easing (Material Design standard)

#### Film Grain Overlay
**Strategy:** SVG noise filter overlaid with CSS

```css
/* SVG filter definition in component */
<svg style={{ position: 'absolute', width: 0, height: 0 }}>
  <filter id="film-grain">
    <feTurbulence
      type="fractalNoise"
      baseFrequency="0.9"
      numOctaves="4"
      result="noise"
    />
    <feColorMatrix
      in="noise"
      type="saturate"
      values="0"
    />
    <feBlend
      in="SourceGraphic"
      in2="noise"
      mode="multiply"
    />
  </filter>
</svg>

/* Apply to overlay div */
.film-grain {
  filter: url(#film-grain);
  opacity: 0.15; /* Subtle effect */
}
```

#### Vignette Effect
```css
.vignette {
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    transparent 50%,
    rgba(0, 0, 0, 0.4) 100%
  );
  pointer-events: none;
}
```

### 3.3 Responsive Design

#### Dimensions (maintaining ShowcaseTV compatibility)
```javascript
// Mobile: 338px × 338px
// Desktop (md+): 800px × 456px

const dimensions = {
  mobile: {
    width: '338px',
    height: '338px',
    perforationSize: '6px',
    perforationSpacing: '30px',
  },
  desktop: {
    width: '800px',
    height: '456px',
    perforationSize: '8px',
    perforationSpacing: '40px',
  },
};
```

#### Tailwind Responsive Classes
```jsx
className="
  w-[338px] h-[338px]
  md:w-[800px] md:h-[456px]
  rounded-[32px]
  overflow-hidden
"
```

### 3.4 Image Handling & Optimization

#### Next.js Image Component Usage
```jsx
{images.map((img, idx) => (
  <div key={idx} className="photo-frame">
    <Image
      src={img.src}
      alt={img.alt}
      fill
      className="object-cover"  // Normalize different aspect ratios
      priority={idx === 0}      // Only first image priority load
      sizes="(max-width: 768px) 338px, 800px"
      quality={85}              // Balance quality vs. file size
    />
  </div>
))}
```

**Performance Considerations:**
- ✅ Use `fill` + `object-cover` to normalize 7 different image sizes
- ✅ Only set `priority` on first image (avoid LCP penalty)
- ✅ Lazy load remaining images (Next.js default)
- ✅ Set appropriate `sizes` for responsive srcset generation
- ⚠️ Total payload: ~10MB of images (acceptable for showcase, could optimize later)

---

## 4. IMPLEMENTATION SEQUENCE

### Phase 1: Create FilmStrip Component (No Audio)
**Estimated Time:** 2-3 hours
**Risk Level:** Low-Medium

#### Step 1.1: Create Component Shell
- [ ] Create `/nextjs-app/src/components/auth/FilmStrip.jsx`
- [ ] Set up basic structure with outer container
- [ ] Match ShowcaseTV dimensions for drop-in compatibility
- [ ] Accept `images` array and `children` props

#### Step 1.2: Implement Photo Carousel Logic
- [ ] Add state management (`currentIndex`, `isAnimating`)
- [ ] Create `useEffect` for auto-advance interval
- [ ] Build film track with horizontal layout
- [ ] Add transform-based sliding animation
- [ ] Test with 2 photos first, then all 7

#### Step 1.3: Add Film Perforations
- [ ] Create top perforation strip with radial gradient
- [ ] Create bottom perforation strip
- [ ] Test responsiveness (mobile vs. desktop)
- [ ] Ensure perforations don't overlap photo content

#### Step 1.4: Add Visual Effects
- [ ] Implement SVG film grain filter
- [ ] Add grain overlay div with opacity control
- [ ] Add vignette overlay with radial gradient
- [ ] Fine-tune opacity values for subtle authenticity

#### Step 1.5: Styling & Polish
- [ ] Add film strip border/frame
- [ ] Set background color (dark gray for film edge)
- [ ] Add subtle shadows for depth
- [ ] Ensure children (GoogleButton) renders correctly

### Phase 2: Integrate into SignInLayout
**Estimated Time:** 30 minutes
**Risk Level:** Low

#### Step 2.1: Prepare Image Array
- [ ] Create `filmStripImages` array in `SignInLayout.jsx`
- [ ] Map all 7 mobile photos with paths and alt text
- [ ] Verify paths are correct (`/showcase/mobile/...`)

#### Step 2.2: Replace ShowcaseTV
- [ ] Update import: `import FilmStrip from './FilmStrip'`
- [ ] Replace `<ShowcaseTV>` with `<FilmStrip>`
- [ ] Pass `images` array and `children` props
- [ ] Remove old `imageSrc` and `alt` props

#### Step 2.3: Layout Verification
- [ ] Check alignment on mobile (should center)
- [ ] Check alignment on desktop
- [ ] Verify GoogleButton still renders in correct position
- [ ] Test with different viewport widths (320px - 1920px)

### Phase 3: Testing & Refinement
**Estimated Time:** 1 hour
**Risk Level:** Low

#### Step 3.1: Cross-Browser Testing
- [ ] Chrome (desktop & mobile)
- [ ] Safari (iOS)
- [ ] Firefox
- [ ] Edge

#### Step 3.2: Performance Testing
- [ ] Check animation smoothness (60fps target)
- [ ] Verify no layout shifts (CLS score)
- [ ] Test with slow 3G throttling
- [ ] Check initial page load time

#### Step 3.3: Accessibility
- [ ] Verify all images have proper alt text
- [ ] Test keyboard navigation (if interactive)
- [ ] Check with screen reader (VoiceOver/NVDA)
- [ ] Ensure animations respect `prefers-reduced-motion`

### Phase 4: Audio Integration (Deferred to Step 2)
**Estimated Time:** 1-2 hours
**Risk Level:** Medium (browser autoplay restrictions)

#### Step 4.1: Source Audio File
- [ ] Download film advance sound from freesound.org or Pixabay
- [ ] Search terms: "film advance", "camera mechanical", "35mm film"
- [ ] Convert to MP3 (< 50KB target)
- [ ] Add to `/nextjs-app/public/sounds/film-advance.mp3`

#### Step 4.2: Implement Audio Hook
```javascript
const [audio] = useState(() => {
  if (typeof window !== 'undefined') {
    const sound = new Audio('/sounds/film-advance.mp3');
    sound.volume = 0.3; // Subtle volume
    return sound;
  }
  return null;
});

useEffect(() => {
  if (audio && currentIndex > 0) { // Don't play on initial load
    audio.currentTime = 0;
    audio.play().catch(err => {
      console.log('Audio autoplay prevented:', err);
      // Gracefully fail - no alert needed
    });
  }
}, [currentIndex, audio]);
```

#### Step 4.3: Handle Autoplay Restrictions
- [ ] Test on iOS Safari (strictest policy)
- [ ] Add user interaction requirement if needed
- [ ] Consider muting first play, enable after user clicks
- [ ] Document browser compatibility

---

## 5. POTENTIAL ISSUES & MITIGATION

### 5.1 Animation Performance

**Issue:** Janky animation on low-end devices
**Indicators:**
- Dropped frames during slide transition
- Stuttering on mobile devices
- High CPU usage

**Mitigation Strategies:**
1. **Use CSS transforms exclusively** (not `left`, `margin`, etc.)
   ```css
   transform: translateX(calc(-100% * currentIndex));
   ```
2. **Add will-change hint**
   ```css
   will-change: transform;
   ```
3. **Reduce concurrent effects**
   - Disable film grain on mobile if needed
   - Simplify vignette gradient
4. **Test on actual devices** (not just browser DevTools)

**Rollback Plan:** Disable animation, use instant transitions with fade effect

---

### 5.2 Layout Shifts & Reflows

**Issue:** Content jumps when component loads
**Indicators:**
- Google Button position shifts
- Sign-in page layout changes height
- Cumulative Layout Shift (CLS) score > 0.1

**Mitigation Strategies:**
1. **Fixed dimensions from start**
   ```jsx
   <div className="w-[338px] h-[338px] md:w-[800px] md:h-[456px]">
     {/* Content */}
   </div>
   ```
2. **Use `fill` prop on Next.js Image** (prevents aspect ratio reflow)
3. **Reserve space for perforations** (include in fixed height)
4. **Test with slow network** (Fast 3G throttling in DevTools)

**Rollback Plan:** Add explicit `min-height` to parent container

---

### 5.3 Image Loading Flicker

**Issue:** White flash or jump when images load
**Indicators:**
- Blank photo frames on first render
- Images pop in during carousel rotation
- FOUC (Flash of Unstyled Content)

**Mitigation Strategies:**
1. **Preload first image**
   ```jsx
   priority={idx === 0}
   ```
2. **Add placeholder background**
   ```jsx
   className="bg-neutral-800"
   ```
3. **Use blur placeholder** (Next.js built-in)
   ```jsx
   placeholder="blur"
   blurDataURL={generateBlurDataURL(img.src)}
   ```
4. **Show loading state** for slow connections
   ```jsx
   {!isImageLoaded && <Skeleton />}
   ```

**Rollback Plan:** Show static first image until all images loaded

---

### 5.4 Z-Index Stacking Issues

**Issue:** Overlays render in wrong order
**Indicators:**
- GoogleButton hidden behind film grain
- Perforations cover photo content
- Vignette blocks user interaction

**Mitigation Strategies:**
1. **Explicit z-index hierarchy**
   ```
   z-0: Photo frames (base layer)
   z-10: Film grain overlay
   z-20: Vignette overlay
   z-30: Perforations (top/bottom strips)
   z-40: Children container (GoogleButton)
   ```
2. **Use `pointer-events: none`** on overlays
   ```jsx
   className="absolute inset-0 pointer-events-none z-10"
   ```
3. **Test click interactions** on GoogleButton

**Rollback Plan:** Simplify stacking, remove decorative layers if conflicts persist

---

### 5.5 Browser Autoplay Restrictions (Audio)

**Issue:** Film advance sound doesn't play
**Indicators:**
- Silent carousel transitions
- Console errors: "DOMException: play() blocked"
- iOS Safari completely blocks autoplay

**Mitigation Strategies:**
1. **Accept autoplay failure gracefully** (no user-facing error)
   ```javascript
   audio.play().catch(() => {
     // Silent fail - audio is enhancement, not requirement
   });
   ```
2. **Require user interaction first**
   - Play sound only after user clicks GoogleButton
   - Or add "Tap to enable sound" prompt
3. **Test on real iOS device** (simulator behaves differently)

**Rollback Plan:** Remove audio entirely, make it opt-in feature for Phase 3

---

### 5.6 Existing Functionality Breakage

**Issue:** Sign-in flow stops working
**Indicators:**
- GoogleButton not clickable
- OAuth redirect fails
- Console errors in Supabase auth

**Mitigation Strategies:**
1. **Preserve children rendering exactly**
   ```jsx
   {children && (
     <div className="absolute bottom-4 left-0 right-0 z-40">
       {children}
     </div>
   )}
   ```
2. **Test auth flow after integration**
   - Click GoogleButton
   - Verify redirect to Google OAuth
   - Check callback handling
3. **Git branch protection**
   - Work on feature branch: `feature/film-strip-carousel`
   - Test thoroughly before merge

**Rollback Plan:**
```bash
git revert <commit-hash>
# Or restore ShowcaseTV component
```

---

### 5.7 Responsive Design Breakpoints

**Issue:** Film strip breaks at certain widths
**Indicators:**
- Photos cut off on narrow screens (< 320px)
- Perforations misaligned on iPad
- Desktop layout too wide on ultrawide monitors

**Mitigation Strategies:**
1. **Test at these breakpoints:**
   - 320px (iPhone SE)
   - 375px (iPhone 12/13/14)
   - 390px (iPhone 14 Pro)
   - 414px (iPhone 14 Plus)
   - 768px (iPad portrait)
   - 1024px (iPad landscape)
   - 1280px+ (Desktop)

2. **Use container queries if needed** (Tailwind 3.4 supports)
   ```jsx
   className="@container"
   ```

3. **Set min/max widths**
   ```jsx
   className="min-w-[320px] max-w-[800px]"
   ```

**Rollback Plan:** Use single breakpoint (mobile vs. desktop) instead of multiple

---

## 6. ROLLBACK STRATEGY

### 6.1 Immediate Rollback (If Critical Bug)
```bash
# Scenario: Production is broken, need instant fix

# Option 1: Revert commit
git log --oneline  # Find commit hash
git revert <commit-hash>
git push origin main

# Option 2: Restore ShowcaseTV temporarily
# In SignInLayout.jsx
- import FilmStrip from './FilmStrip';
+ import ShowcaseTV from './ShowcaseTV';

- <FilmStrip images={filmStripImages}>
+ <ShowcaseTV imageSrc="/showcase/hero-photo.jpg" alt="...">
    <GoogleButton />
- </FilmStrip>
+ </ShowcaseTV>
```

### 6.2 Partial Rollback (Keep Component, Disable Feature)
```javascript
// In FilmStrip.jsx, add feature flag
const ENABLE_ANIMATION = false; // Quick disable

useEffect(() => {
  if (!ENABLE_ANIMATION) return;
  // ... animation logic
}, []);

// Shows first image only, no carousel
```

### 6.3 Gradual Rollback (Remove Effects Incrementally)
1. Disable audio (least impactful)
2. Disable film grain/vignette (minor visual change)
3. Disable perforations (moderate visual change)
4. Disable animation (major UX change, but component still works)
5. Restore ShowcaseTV (complete rollback)

---

## 7. PERFORMANCE CONSIDERATIONS

### 7.1 Initial Page Load

**Current Baseline (with ShowcaseTV):**
- Hero photo: ~1.2MB (1 image)
- Total JS bundle: ~200KB (Next.js app)

**New with FilmStrip:**
- Mobile photos: ~10MB total (7 images)
- Additional JS: ~2KB (carousel logic)
- SVG filter: negligible (<1KB)

**Optimization Plan:**
1. **Lazy load images 2-7** (Next.js default behavior)
   - Only first image loads with `priority`
   - Others load as they come into viewport
2. **Use Next.js Image optimization**
   - Automatic WebP conversion
   - Responsive srcset generation
   - Quality reduction to 85%
3. **Preconnect to image CDN** (if using one)
   ```html
   <link rel="preconnect" href="https://cdn.example.com" />
   ```

**Expected Impact:**
- First Contentful Paint (FCP): +100ms (acceptable)
- Largest Contentful Paint (LCP): +200ms (within budget)
- Total Blocking Time (TBT): +5ms (negligible)

### 7.2 Runtime Performance

**Animation Budget:**
- Target: 60fps (16.67ms per frame)
- Carousel transition: GPU-accelerated transform (< 2ms per frame)
- Film grain SVG filter: ~1-2ms per frame on desktop, ~5ms on mobile

**Memory Budget:**
- 7 images in DOM: ~50MB decoded pixel data (acceptable for modern devices)
- Minimum device: iPhone 8 (2GB RAM) - should handle comfortably

**Battery Impact:**
- Auto-advance interval: minimal (every 3 seconds, not every frame)
- CSS transitions: hardware-accelerated, low power consumption
- Consider disabling on `low-power-mode` (future enhancement)

---

## 8. ACCESSIBILITY CONSIDERATIONS

### 8.1 Screen Reader Support
```jsx
// Add ARIA labels
<div
  role="region"
  aria-label="Photo showcase carousel"
  aria-live="polite"  // Announce photo changes
>
  <Image
    src={images[currentIndex].src}
    alt={images[currentIndex].alt}  // Descriptive alt text per photo
  />
  <div aria-live="polite" className="sr-only">
    Showing photo {currentIndex + 1} of {images.length}
  </div>
</div>
```

### 8.2 Reduced Motion Support
```javascript
// Respect prefers-reduced-motion
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

const transitionDuration = prefersReducedMotion ? '0ms' : '500ms';
```

```css
@media (prefers-reduced-motion: reduce) {
  .film-track {
    transition: none;
  }
}
```

### 8.3 Keyboard Navigation
```jsx
// Optional: Allow manual navigation (future enhancement)
<button
  aria-label="Previous photo"
  onClick={() => setCurrentIndex(prev => (prev - 1 + images.length) % images.length)}
>
  ←
</button>
```

---

## 9. FILE MODIFICATION CHECKLIST

### Files to CREATE:
- [ ] `/nextjs-app/src/components/auth/FilmStrip.jsx` (new component)
- [ ] `/nextjs-app/public/sounds/film-advance.mp3` (Phase 4 - audio)

### Files to MODIFY:
- [ ] `/nextjs-app/src/components/auth/SignInLayout.jsx`
  - Line 27: Change import from `ShowcaseTV` to `FilmStrip`
  - Lines 117-122: Replace `<ShowcaseTV>` with `<FilmStrip>`
  - Add `filmStripImages` array (lines 30-45)

### Files to PRESERVE (no changes):
- [x] `/nextjs-app/src/components/auth/MorpheoLogo.jsx`
- [x] `/nextjs-app/src/components/auth/GoogleButton.jsx`
- [x] `/nextjs-app/tailwind.config.js` (may add custom animations later)
- [x] `/nextjs-app/src/components/auth/ShowcaseTV.jsx` (keep as backup)

---

## 10. TESTING CHECKLIST

### Visual Testing
- [ ] **Film strip renders correctly**
  - [ ] Perforations visible on top and bottom edges
  - [ ] Perforations are evenly spaced
  - [ ] Perforations don't overlap photo content

- [ ] **Photo carousel works**
  - [ ] Auto-advances every 3 seconds
  - [ ] Smooth horizontal slide animation
  - [ ] Loops back to first photo after last
  - [ ] No white flashes or jumps

- [ ] **Visual effects applied**
  - [ ] Film grain visible (subtle, not overwhelming)
  - [ ] Vignette darkens edges
  - [ ] Overall analog film aesthetic achieved

- [ ] **Responsive design**
  - [ ] Correct size on mobile (338x338px)
  - [ ] Correct size on desktop (800x456px)
  - [ ] Smooth transition between breakpoints
  - [ ] No horizontal scroll on narrow screens

### Functional Testing
- [ ] **GoogleButton still works**
  - [ ] Clickable in all viewport sizes
  - [ ] OAuth redirect functions correctly
  - [ ] Button position doesn't shift during carousel

- [ ] **No layout breaks**
  - [ ] Sign-in page maintains vertical centering
  - [ ] Logo and text frame unaffected
  - [ ] Page doesn't jump when carousel advances

- [ ] **Performance**
  - [ ] Animation runs at 60fps (check DevTools Performance)
  - [ ] No janky scrolling on page
  - [ ] Fast initial render (< 2 seconds on 3G)

### Browser Testing
- [ ] Chrome (Desktop)
- [ ] Chrome (Mobile - Android)
- [ ] Safari (Desktop)
- [ ] Safari (iOS)
- [ ] Firefox (Desktop)
- [ ] Edge (Desktop)

### Accessibility Testing
- [ ] All images have descriptive alt text
- [ ] Screen reader announces photo changes
- [ ] Carousel respects `prefers-reduced-motion`
- [ ] No keyboard traps
- [ ] Sufficient color contrast (film effects don't obscure content)

### Audio Testing (Phase 4)
- [ ] Sound plays on photo transition (Chrome Desktop)
- [ ] Sound doesn't play on first load
- [ ] Graceful failure on iOS Safari (no errors)
- [ ] Volume level appropriate (not jarring)
- [ ] Sound file loads quickly (< 100ms)

---

## 11. SUCCESS CRITERIA

### Must-Have (MVP)
✅ Film strip displays all 7 photos in carousel
✅ Auto-advances every 3 seconds
✅ Smooth horizontal slide animation
✅ CSS-generated perforations on top/bottom
✅ Photos normalized with object-fit: cover
✅ GoogleButton remains functional
✅ No broken layouts on mobile or desktop
✅ 60fps animation performance

### Should-Have
✅ Film grain effect (subtle)
✅ Vignette effect (subtle)
✅ Respects prefers-reduced-motion
✅ Accessible to screen readers
✅ Works in all major browsers

### Nice-to-Have (Future Enhancements)
⚪ Audio on photo transition (Phase 4)
⚪ Manual navigation buttons
⚪ Pause on hover
⚪ Image optimization (WebP, smaller sizes)
⚪ Loading skeleton state

---

## 12. POST-IMPLEMENTATION REVIEW

### Questions to Answer After Coding:
1. Did we maintain 60fps animation on mobile devices?
2. Are there any edge cases we didn't anticipate?
3. Is the film grain effect too subtle or too strong?
4. Should we add user controls (pause, prev/next)?
5. Performance: Can we reduce the 10MB image payload?

### Metrics to Track:
- Page load time (before/after)
- Lighthouse scores (Performance, Accessibility)
- User engagement (time on sign-in page)
- Conversion rate (Google sign-ins)

---

## 13. TIMELINE ESTIMATE

| Phase | Task | Time | Cumulative |
|-------|------|------|------------|
| 1.1 | Create component shell | 30 min | 0.5h |
| 1.2 | Carousel logic & animation | 1 hour | 1.5h |
| 1.3 | Film perforations | 30 min | 2h |
| 1.4 | Visual effects (grain, vignette) | 30 min | 2.5h |
| 1.5 | Styling & polish | 30 min | 3h |
| 2 | Integrate into SignInLayout | 30 min | 3.5h |
| 3 | Testing & refinement | 1 hour | 4.5h |
| 4 | Audio (deferred to Phase 2) | 1-2h | 5.5-6.5h |

**Total Estimated Time: 4.5 hours (without audio), 5.5-6.5 hours (with audio)**

---

## 14. OPEN QUESTIONS FOR USER

Before proceeding with implementation, please confirm:

1. **Design Preference:**
   - Should the film strip have a dark border/frame like analog film?
   - Color preference for film edge: Black (#000), Dark Gray (#1a1a1a), or Brown (#2a1f1a)?

2. **Animation Timing:**
   - 3 seconds per photo confirmed, or would you like to test different intervals?
   - Transition speed: 500ms (current plan) or faster/slower?

3. **Visual Effects Intensity:**
   - Film grain: Subtle (15% opacity) or more pronounced (30%)?
   - Vignette: Light darkening or strong dramatic effect?

4. **GoogleButton Overlay:**
   - Should it remain visible at all times, or fade in on hover?
   - Current position (bottom center) or different placement?

5. **Accessibility:**
   - Auto-announce photo changes to screen readers? (can be distracting)
   - Add manual prev/next controls for keyboard users?

6. **Future Audio:**
   - Preferred sound aesthetic: Mechanical click, soft whir, or vintage camera sound?
   - Should sound be optional (user can mute)?

---

## 15. SUMMARY & NEXT STEPS

### What We Know:
✅ 7 mobile photos ready to use
✅ Current component structure (ShowcaseTV) well-documented
✅ Tech stack supports CSS animations and SVG filters
✅ No existing conflicts with auth or layout components

### What We'll Build:
🎬 FilmStrip component with auto-advancing carousel
🎞️ CSS-generated analog film perforations
✨ Film grain and vignette effects
🔄 Smooth 3-second interval slide transitions
📱 Fully responsive (mobile + desktop)

### Risk Assessment:
🟢 **Low Risk:** Component replacement, CSS animations, visual effects
🟡 **Medium Risk:** Audio autoplay (browser restrictions)
🔴 **High Risk:** None identified

### Immediate Next Action:
**Awaiting user confirmation on open questions (#14), then proceeding with Phase 1 implementation.**

---

**Document Version:** 1.0
**Last Updated:** 2025-11-11
**Author:** Claude Code
**Status:** ✅ Ready for Review