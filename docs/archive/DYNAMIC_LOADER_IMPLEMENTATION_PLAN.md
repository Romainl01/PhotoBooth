# Dynamic Loader Messages - Implementation Plan

## 🎯 Feature Overview

**Goal:** Replace the static "Loading..." text in the Loader component with dynamic, contextual messages that rotate during the Google API response wait time (10-20 seconds). Messages should be funny, filter-specific, and use smooth ease-in/ease-out animations.

**Design Principles:**
- Pop culture references and playful tone (not AI-corporate speak)
- Contextually relevant to the selected filter
- Smooth animations (fade out → fade in with easing)
- Messages rotate every 3-4 seconds
- Loop through messages if API takes longer than expected
- First message appears immediately

---

## 📁 File Structure & Changes

### New Files to Create

#### 1. `/nextjs-app/src/constants/loadingMessages.js`
**Purpose:** Centralized storage for all filter-specific loading messages

**Structure:**
```javascript
export const LOADING_MESSAGES = {
  'Executive': [
    'Message 1',
    'Message 2',
    'Message 3',
    // 4-5 messages per filter
  ],
  'Lord': [...],
  // ... all 13 filters
}

// Optional: Generic fallbacks if needed
export const GENERIC_MESSAGES = [
  'Message 1',
  'Message 2',
]
```

**Content Guidelines:**
- 4-5 messages per filter (to cover 12-20 second range at 3-4 seconds each)
- Keep messages short (5 words ideally, max 10 words)
- Use pop culture references where appropriate
- Sound natural and fun, not corporate
- No emoji for first implementation (keep it clean)

**Example Messages by Filter:**

**Executive:**
- "Polishing your corner office energy..."
- "Adding that LinkedIn CEO vibe..."
- "Adjusting your power stance..."
- "Summoning your inner boss mode..."

**Lord:**
- "Commissioning your royal portrait..."
- "Consulting the court painter..."
- "Adding some Renaissance drama..."
- "Preparing your throne room debut..."

**Wes Anderson:**
- "Centering your symmetry..."
- "Adjusting the pastel palette..."
- "Consulting with the Grand Budapest concierge..."
- "Perfecting your quirky aesthetic..."

**Urban:**
- "Catching that golden hour glow..."
- "Finding your best street angle..."
- "Adding that city lights magic..."
- "Setting the blue hour mood..."

**Runway:**
- "Summoning your inner supermodel..."
- "Preparing for your close-up..."
- "Adding that haute couture energy..."
- "Working those editorial angles..."

**Marseille:**
- "Fueling up the scooter..."
- "Adding that OM passion..."
- "Channeling Vieux-Port vibes..."
- "Getting that Phocéen attitude..."

**Halloween:**
- "Picking your costume from the chaos..."
- "Raiding the Halloween closet..."
- "Summoning some spooky energy..."
- "Rolling the costume dice..."

**Kill Bill:**
- "Sharpening your Hattori Hanzo blade..."
- "Channeling the Bride's fury..."
- "Adding that yellow jumpsuit energy..."
- "Preparing for your revenge montage..."

**Chucky:**
- "Waking up the Good Guy doll..."
- "Adding that serial killer charm..."
- "Preparing your creepy laugh..."
- "Channeling some doll-faced terror..."

**Zombie:**
- "Practicing your undead shuffle..."
- "Adding that fresh-from-the-grave look..."
- "Perfecting your brain-craving stare..."
- "Summoning The Walking Dead vibes..."

**Matrix:**
- "Loading the construct..."
- "Dodging bullets in slow-mo..."
- "Choosing the red pill aesthetic..."
- "Adding that cyberpunk leather..."

**Star Wars:**
- "Consulting with the Jedi Council..."
- "Channeling the Force..."
- "Adjusting your lightsaber stance..."
- "Preparing for your Cantina entrance..."

**Harry Potter:**
- "Waiting for your Hogwarts letter..."
- "Consulting the Sorting Hat..."
- "Brewing some Polyjuice Potion..."
- "Adding that magical energy..."

### Files to Modify

#### 2. `/nextjs-app/src/components/ui/Loader.jsx`
**Current Implementation:**
- Static "Loading..." text
- LoadingIcon spinner
- Semi-transparent overlay with captured photo background

**Changes Needed:**
- Import LOADING_MESSAGES from constants
- Accept `filterName` prop from parent (page.js)
- Implement message rotation logic with state
- Add fade-in/fade-out animation to message text
- Handle message cycling (loop when exhausted)

**New State Required:**
- `currentMessageIndex` - tracks which message is showing
- No need for animation state (CSS handles it)

**New Effects Required:**
- `useEffect` to handle message rotation timer
- Cleanup on unmount to prevent memory leaks

**Animation Strategy:**
- Use CSS transitions for fade effect
- Keyframe: opacity 0 → 1 (fade in) over 300-400ms
- Between messages: fade out current, then fade in next
- Total transition time: ~600-800ms (fade out + fade in)
- Display time per message: 3 seconds
- Total cycle: ~3.6-3.8 seconds per message

#### 3. `/nextjs-app/src/app/page.js`
**Changes Needed:**
- Pass `filterName` prop to Loader component
- Get current filter name: `FILTERS[currentFilterIndex]`

**Minimal Change:**
```javascript
// In the rendering logic where Loader is shown
{currentScreen === SCREENS.LOADING && (
  <Loader
    capturedImage={capturedImage}
    filterName={FILTERS[currentFilterIndex]}  // NEW PROP
  />
)}
```

---

## 🔧 Technical Implementation Details

### Message Rotation Algorithm

**Timing Breakdown:**
- **Display duration:** 3000ms (3 seconds per message)
- **Fade out duration:** 300ms
- **Fade in duration:** 300ms
- **Total cycle:** 3600ms (~3.6 seconds per message)

**⚠️ CRITICAL:** The interval must be 3600ms, NOT 3000ms. If you use 3000ms, each subsequent message will be visible for less time due to the fade transition overhead.

**Flow:**
1. Component mounts → show first message (index 0) immediately with fade-in
2. After 3000ms → trigger fade-out
3. After 300ms fade-out → increment index, trigger fade-in
4. Repeat until component unmounts
5. If index exceeds message array length → reset to 0 (loop)

**Implementation Approach (Recommended):**

```javascript
// In Loader.jsx
import { useState, useEffect, useMemo } from 'react'
import { LOADING_MESSAGES, GENERIC_MESSAGES } from '@/constants/loadingMessages'
import LoadingIcon from '../icons/LoadingIcon'

// Timing constants (keep in sync with CSS)
const FADE_DURATION_MS = 300
const MESSAGE_DISPLAY_MS = 3000
const CYCLE_INTERVAL_MS = MESSAGE_DISPLAY_MS + (FADE_DURATION_MS * 2) // 3600ms

export default function Loader({ filterName, imageUrl = null }) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  // Memoize message lookup to avoid recalculation on every render
  const messages = useMemo(() => {
    return LOADING_MESSAGES[filterName] || GENERIC_MESSAGES || ['Loading...']
  }, [filterName])

  // Check for reduced motion preference (accessibility)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Message rotation logic
  useEffect(() => {
    if (prefersReducedMotion) {
      // Respect user preference - no animation, show first message only
      return
    }

    setIsVisible(true)

    const intervalId = setInterval(() => {
      // Fade out current message
      setIsVisible(false)

      // After fade-out completes, change message and fade in
      setTimeout(() => {
        setCurrentMessageIndex(prev => (prev + 1) % messages.length)
        setIsVisible(true)
      }, FADE_DURATION_MS)

    }, CYCLE_INTERVAL_MS) // ✅ 3600ms = 3000ms display + 600ms transitions

    return () => clearInterval(intervalId) // Cleanup
  }, [messages.length, prefersReducedMotion])

  // Reset when filter changes
  useEffect(() => {
    setCurrentMessageIndex(0)
    setIsVisible(true)
  }, [filterName])

  const currentMessage = messages[currentMessageIndex]

  return (
    // ... existing structure with updated message display (see CSS section below)
  )
}
```

### CSS Animation Strategy & Styling

**Complete JSX Implementation (Use Design Tokens):**
```javascript
{/* Loading content centered */}
<div className="absolute inset-0 flex items-center justify-center">
  <div className="flex flex-col gap-4 items-center">
    {/* Skeumorphic loading icon */}
    <LoadingIcon className="w-[88px] h-[88px]" />

    {/* Dynamic loading message with accessibility */}
    <div role="status" aria-live="polite" aria-atomic="true">
      <p
        className={`font-mono font-medium text-body text-text-primary text-center px-4 max-w-md mx-auto transition-opacity ease-in-out ${
          prefersReducedMotion ? '' : (isVisible ? 'opacity-100' : 'opacity-0')
        }`}
        style={{
          transitionDuration: `${FADE_DURATION_MS}ms`,
          textShadow: '0 1px 3px rgba(0,0,0,0.8)' // Improves readability on light photos
        }}
      >
        {currentMessage}
      </p>
    </div>
  </div>
</div>
```

**Key Design Choices:**
- **Font:** `font-mono` (IBM Plex Mono from globals.css)
- **Weight:** `font-medium` (matches existing Loader style)
- **Size:** `text-body` (design token, not arbitrary text-lg)
- **Color:** `text-text-primary` (design token for consistency)
- **Shadow:** Subtle text shadow ensures readability over bright photos
- **Responsive:** `px-4 max-w-md mx-auto` prevents overflow on mobile
- **Accessibility:** ARIA attributes for screen readers
- **Motion:** Respects `prefers-reduced-motion` preference

### Error Handling & Edge Cases

#### Edge Case 1: Filter Not Found
**Scenario:** filterName doesn't exist in LOADING_MESSAGES
**Solution:** Fallback to GENERIC_MESSAGES array
```javascript
const messages = LOADING_MESSAGES[filterName] || GENERIC_MESSAGES
```

#### Edge Case 2: Empty Messages Array
**Scenario:** Messages array is empty or undefined
**Solution:** Default fallback message
```javascript
const messages = LOADING_MESSAGES[filterName] || GENERIC_MESSAGES || ['Loading...']
```

#### Edge Case 3: Component Unmounts During Fade
**Scenario:** API responds during fade-out animation
**Solution:** Cleanup interval in useEffect return
```javascript
return () => {
  clearInterval(intervalId)
  // React will handle state cleanup automatically
}
```

#### Edge Case 4: Very Fast API Response (<3 seconds)
**Scenario:** API responds before first message rotation
**Solution:** No issue - first message will show, then component unmounts naturally

#### Edge Case 5: Very Slow API Response (>20 seconds)
**Scenario:** API takes longer than expected, messages loop multiple times
**Solution:** Messages will loop (already handled by modulo operator)
**Enhancement (Optional):** Add "Still working on it..." type messages after first loop

---

## 🎨 UI/UX Considerations

### Visual Design (First Implementation)

**Use Existing Design Tokens:**
- Font: `font-mono` (IBM Plex Mono from globals.css)
- Weight: `font-medium` (consistent with existing Loader)
- Size: `text-body` (design token, not arbitrary Tailwind class)
- Color: `text-text-primary` (design token)
- Positioning: Centered in loader
- Overlay backdrop: `bg-black/50` (unchanged)

**Additional Enhancements:**
- **Text shadow:** `0 1px 3px rgba(0,0,0,0.8)` for readability over light photos
- **Responsive padding:** `px-4` prevents text from touching edges on mobile
- **Max width:** `max-w-md` ensures proper line wrapping
- **Monospace consideration:** Keep messages under 10 words (monospace is wider than proportional fonts)

### Accessibility

**Considerations:**
- Messages enhance UX but are not critical (spinner already communicates loading)
- Screen readers will announce message changes
- Motion-sensitive users need consideration
- No user action required during loading

**Required Accessibility Features:**

**1. ARIA Attributes (INCLUDE from start):**
```javascript
<div role="status" aria-live="polite" aria-atomic="true">
  <p>{currentMessage}</p>
</div>
```
- `role="status"`: Indicates loading status region
- `aria-live="polite"`: Announces changes without interrupting
- `aria-atomic="true"`: Reads entire message on change

**2. Reduced Motion Support (CRITICAL):**
```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// If true, disable animations and show only first message
if (prefersReducedMotion) {
  return // Skip interval setup
}
```

**3. Text Contrast:**
- White text on `bg-black/50` may be unreadable over bright photos
- **Solution:** Add `text-shadow: 0 1px 3px rgba(0,0,0,0.8)`
- Ensures WCAG AA compliance even over light backgrounds

**Why These Matter:**
- 1 in 4 users have motion sensitivity (can cause dizziness/nausea)
- Screen reader users need semantic status announcements
- High-contrast photos can make white text invisible

### Animation Performance

**Performance Optimization:**
- Use `opacity` transitions (GPU-accelerated)
- Avoid `transform` unless needed (Option B above)
- No layout thrashing (opacity doesn't trigger reflow)
- Small text changes don't cause performance issues

**Browser Compatibility:**
- CSS transitions: Supported in all modern browsers
- `setInterval`: Universal support
- No polyfills needed

---

## 🧪 Testing Strategy

### Manual Testing Checklist

#### Functionality Tests
- [ ] **Message appears immediately** when loading starts
- [ ] **Messages rotate** every ~3-4 seconds
- [ ] **Fade animation** is smooth (ease-in-out)
- [ ] **Messages loop** if loading takes >20 seconds
- [ ] **Correct filter messages** show for each filter (test all 13)
- [ ] **Component unmounts cleanly** when loading completes
- [ ] **No console errors** during entire flow

#### Filter-Specific Tests (Sample Each Category)
- [ ] Executive filter shows Executive messages
- [ ] Lord filter shows Lord messages
- [ ] Star Wars filter shows Star Wars messages
- [ ] Zombie filter shows Zombie messages
- [ ] (Test at least 4-5 different filters)

#### Edge Case Tests
- [ ] **Fast API response** (<3 seconds) - only first message shows
- [ ] **Slow API response** (>20 seconds) - messages loop correctly
- [ ] **Retry after error** - messages restart from beginning
- [ ] **Switch filters and regenerate** - new filter messages appear

#### Visual Tests
- [ ] **Text is readable** against dark backgrounds
- [ ] **Text is readable** against light/white photos (test contrast)
- [ ] **Animation timing** feels natural (verify with stopwatch: 3.6s cycles)
- [ ] **No text flickering** or layout shifts
- [ ] **Mobile portrait** - text fits on small screens (320px width)
- [ ] **Mobile landscape** - text doesn't overflow on short viewports
- [ ] **Desktop view** - text properly centered
- [ ] **Message length** - all messages wrap properly with monospace font

#### Browser Tests
- [ ] Chrome/Edge (Chromium) - desktop
- [ ] Safari (WebKit) - desktop
- [ ] Firefox (Gecko) - desktop
- [ ] Mobile Safari (iOS) - portrait and landscape
- [ ] Chrome Mobile (Android) - portrait and landscape

#### Accessibility Tests
- [ ] **Reduced motion** - Enable in system settings, verify animations disabled
- [ ] **Screen reader** - Test with VoiceOver (iOS/Mac) or TalkBack (Android)
- [ ] **Text contrast** - Upload very light photo, verify message is readable
- [ ] **Notch/Dynamic Island** - Test on iPhone 14/15 Pro in landscape

#### Device-Specific Tests
- [ ] **iPhone SE (small screen)** - 320px width, messages wrap properly
- [ ] **iPhone 14 Pro (notch)** - Landscape mode doesn't clip text
- [ ] **iPad (tablet)** - Messages display correctly at tablet sizes
- [ ] **Android (various)** - Test at least one Android device

### Automated Testing (Future Enhancement)

**Unit Tests for Loader.jsx (Optional):**
```javascript
// Using React Testing Library
describe('Loader Component', () => {
  it('displays first message immediately', () => {
    const { getByText } = render(<Loader filterName="Executive" />)
    expect(getByText(/Polishing your corner office/)).toBeInTheDocument()
  })

  it('rotates messages after interval', async () => {
    jest.useFakeTimers()
    const { getByText } = render(<Loader filterName="Executive" />)

    act(() => { jest.advanceTimersByTime(3000) })

    // Second message should appear
    await waitFor(() => {
      expect(getByText(/Adding that LinkedIn CEO/)).toBeInTheDocument()
    })
  })

  it('cleans up interval on unmount', () => {
    const { unmount } = render(<Loader filterName="Executive" />)
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval')

    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
  })
})
```

**Recommendation:** Skip automated tests for first implementation. Manual testing is sufficient for this feature.

---

## ⚠️ Potential Side Effects & Prevention

### Side Effect 1: Memory Leaks from Interval
**Risk:** Interval continues running after component unmounts
**Impact:** Performance degradation, potential crashes on repeated use
**Prevention:**
```javascript
useEffect(() => {
  const intervalId = setInterval(...)
  return () => clearInterval(intervalId) // CRITICAL
}, [])
```
**Verification:** Check browser DevTools Performance tab for orphaned timers

### Side Effect 2: State Updates on Unmounted Component
**Risk:** setState called after component unmounts (React warning)
**Impact:** Console warnings, potential bugs
**Prevention:** Cleanup in useEffect return already handles this
**Additional Safety:**
```javascript
useEffect(() => {
  let mounted = true
  const intervalId = setInterval(() => {
    if (mounted) {
      setIsVisible(false)
      // ... rest of logic
    }
  }, 3000)
  return () => {
    mounted = false
    clearInterval(intervalId)
  }
}, [])
```
**Recommendation:** Only add this if warnings appear during testing

### Side Effect 3: Animation Timing Race Conditions
**Risk:** API responds during fade-out, causing visual glitch
**Impact:** Half-faded text visible briefly in result screen
**Prevention:** Loader unmounts completely when screen changes (already handled by conditional rendering in page.js)
**Verification:** No additional code needed - React removes component instantly

### Side Effect 4: Filter Name Prop Changes During Loading
**Risk:** If user could somehow change filter while loading
**Impact:** Messages would be out of sync with intended filter
**Current Architecture:** This is impossible - filter selection is disabled during loading (CameraScreen is not interactive when Loader overlay is present)
**Prevention:** No code changes needed, but document this assumption
**Future-Proofing:** If UI changes to allow filter switching during load:
```javascript
useEffect(() => {
  setCurrentMessageIndex(0)
  setIsVisible(true)
}, [filterName]) // Reset on filter change
```

### Side Effect 5: Message Array Length Changes
**Risk:** If loadingMessages.js is edited and array becomes shorter
**Impact:** Modulo operator could cause skipped messages
**Prevention:** This is not a runtime concern (constants don't change)
**Development Safety:** ESLint rule or validation script (optional)
```javascript
// In loadingMessages.js - add validation comment
if (process.env.NODE_ENV === 'development') {
  Object.keys(LOADING_MESSAGES).forEach(filter => {
    if (LOADING_MESSAGES[filter].length < 3) {
      console.warn(`Filter "${filter}" has less than 3 messages`)
    }
  })
}
```

### Side Effect 6: Text Length Overflow
**Risk:** Long messages break layout on mobile
**Impact:** Text wraps awkwardly or overflows container
**Prevention:** Keep messages under 15 words
**CSS Safety:** Add to Loader.jsx
```javascript
<p className="text-lg px-4 max-w-md mx-auto text-center">
  {currentMessage}
</p>
```
- `px-4`: Padding prevents edge collision
- `max-w-md`: Constrains width for better wrapping
- `text-center`: Keeps centered
**Verification:** Test on 320px width (iPhone SE)

### Side Effect 7: Timing Drift from setTimeout Chain
**Risk:** Using nested `setTimeout` instead of `setInterval` could cause drift
**Impact:** Messages slow down over time
**Prevention:** Use `setInterval` (as specified in implementation)
**Note:** Our implementation uses `setInterval` for the main cycle and `setTimeout` only for the fade-in delay (not chained)

### Side Effect 8: Text Contrast on Light Photos
**Risk:** User uploads very bright/white photo as background
**Impact:** White text becomes unreadable (WCAG failure)
**Prevention:** Add text shadow to improve contrast
```javascript
style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
```
**Verification:** Test with high-key photography (bright white backgrounds)

### Side Effect 9: Landscape Mode Overflow on Mobile
**Risk:** iPhone/Android landscape has very short viewport height
**Impact:** Text might overflow or interfere with notch/Dynamic Island
**Prevention:**
- Current positioning already accounts for this: `top-[8px]` provides safe area
- `max-w-md` and `px-4` prevent horizontal overflow
- Messages kept short (max 10 words)
**Verification:** Test actual iPhone in landscape, not just DevTools

### Side Effect 10: Motion-Induced Discomfort
**Risk:** Animations cause dizziness for motion-sensitive users
**Impact:** Poor accessibility, potential nausea, WCAG violation
**Prevention:** Detect and respect `prefers-reduced-motion`
```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (prefersReducedMotion) {
  // Skip animations, show static first message
}
```
**Verification:** Enable "Reduce Motion" in system settings, test app

### Side Effect 11: Monospace Font Character Width
**Risk:** Monospace fonts (IBM Plex Mono) are wider than proportional fonts
**Impact:** Messages longer than 10 words may wrap awkwardly or overflow
**Prevention:**
- Keep messages under 10 words (not 15 as originally planned)
- Test all messages with actual font in browser
- Use `max-w-md` to constrain width
**Verification:** Render longest message on 320px viewport

### Side Effect 12: CSS/JS Timing Desync
**Risk:** Developer changes CSS `duration-300` without updating JS constant
**Impact:** Fade animation doesn't complete before message changes (visual glitch)
**Prevention:** Use shared constant in both CSS and JS
```javascript
const FADE_DURATION_MS = 300
// In JSX:
style={{ transitionDuration: `${FADE_DURATION_MS}ms` }}
```
**Benefit:** Single source of truth, easier maintenance

---

## 📋 Implementation Checklist

### Phase 1: Create Message Content
- [ ] Create `/nextjs-app/src/constants/loadingMessages.js`
- [ ] Write 4-5 messages for each of the 13 filters
- [ ] Review messages for tone (pop culture, playful, natural)
- [ ] Add generic fallback messages (2-3)
- [ ] Verify all message keys match `FILTERS` array exactly

### Phase 2: Update Loader Component
- [ ] Import `LOADING_MESSAGES`, `GENERIC_MESSAGES`, `useState`, `useEffect`, `useMemo`
- [ ] Add `filterName` prop to component signature
- [ ] Define timing constants: `FADE_DURATION_MS`, `MESSAGE_DISPLAY_MS`, `CYCLE_INTERVAL_MS`
- [ ] Add state: `currentMessageIndex`, `isVisible`, `prefersReducedMotion`
- [ ] Implement `prefers-reduced-motion` detection with media query
- [ ] Use `useMemo` to cache message lookup
- [ ] Implement message rotation logic with `setInterval` (3600ms, NOT 3000ms)
- [ ] Add cleanup function to clear interval
- [ ] Add ARIA attributes: `role="status"`, `aria-live="polite"`, `aria-atomic="true"`
- [ ] Update JSX with design tokens: `font-mono`, `font-medium`, `text-body`, `text-text-primary`
- [ ] Add responsive styling: `px-4`, `max-w-md`, `mx-auto`
- [ ] Add text shadow for contrast: `textShadow: '0 1px 3px rgba(0,0,0,0.8)'`
- [ ] Sync transition duration with constant: `transitionDuration: ${FADE_DURATION_MS}ms`
- [ ] Test component renders without errors

### Phase 3: Connect to Parent
- [ ] Import `FILTERS` in page.js (already imported)
- [ ] Pass `filterName` prop to `<Loader>` component
- [ ] Verify prop value is correct: `FILTERS[currentFilterIndex]`

### Phase 4: Testing
- [ ] Test all 13 filters show correct messages
- [ ] **Verify timing with stopwatch:** messages change every 3.6 seconds
- [ ] Test fade animation smoothness (no flickering)
- [ ] Test message looping (wait >20 seconds for multiple cycles)
- [ ] Test on mobile viewport (320px width minimum)
- [ ] Test on mobile landscape (short viewport height)
- [ ] Test on desktop viewport
- [ ] Test in Chrome, Safari, Firefox (desktop)
- [ ] Test on actual iPhone (not just DevTools) - portrait and landscape
- [ ] Test on actual Android device
- [ ] **Test with light/white photos** (verify text shadow makes text readable)
- [ ] **Test with reduced motion enabled** (animations should be disabled)
- [ ] **Test with screen reader** (VoiceOver or TalkBack)
- [ ] Test on iPhone with notch/Dynamic Island in landscape
- [ ] Test retry after error (messages restart from beginning)
- [ ] Check browser console for errors/warnings
- [ ] Verify no memory leaks (DevTools Performance tab)

### Phase 5: Polish & Cleanup
- [ ] Review all messages for typos
- [ ] Adjust timing if needed (currently 3s per message)
- [ ] Confirm animations feel smooth
- [ ] Remove any console.logs or debug code
- [ ] Update any relevant documentation/comments

---

## 🚀 Deployment Considerations

### Environment
- **Development:** Test locally with `npm run dev`
- **Production:** Works identically (no env-specific code)
- **API Timing:** Real API responses are 10-20s (matches design)

### Performance Impact
- **Bundle Size:** +2-3KB for loadingMessages.js (negligible)
- **Runtime Performance:** Minimal (simple interval + opacity transitions)
- **Memory:** One interval per loading session (cleaned up properly)

### Rollback Plan
- **If Issues Arise:** Revert changes to Loader.jsx and page.js
- **Fallback Behavior:** Static "Loading..." text (previous implementation)
- **Git Strategy:** Create feature branch, test thoroughly before merging

---

## 🔮 Future Enhancements (Out of Scope for V1)

### Enhancement 1: Progress Indicator
Show which message number (e.g., "2 of 4") - requires estimating API time

### Enhancement 2: Custom Animation Styles
Different animations per filter (e.g., Matrix messages slide in, Star Wars fade with glow)

### Enhancement 3: Sound Effects
Subtle sound on message change (needs user preference/toggle)

### Enhancement 4: Message Personalization
"Creating YOUR executive portrait..." (requires user name input)

### Enhancement 5: A/B Testing
Track which messages users see most (analytics integration)

### Enhancement 6: Admin Panel
CMS for editing messages without code changes

### Enhancement 7: Internationalization
Translate messages to other languages (i18n)

### Enhancement 8: Easter Eggs
Rare messages (1% chance) with extra humor

---

## 🎬 TYPEWRITER EFFECT ENHANCEMENT PLAN

### Overview
**Animation Name:** Typewriter Effect (also called Text Reveal Animation, Typing Animation)
**Description:** Characters appear one-by-one from left to right, creating the illusion of text being typed in real-time
**Purpose:** Replicate Claude Code's chat loading messages - typewriter effect with instant message changes (NO fade animations)

### Core Mechanism
```javascript
// Character-by-character reveal
'L' → 'Lo' → 'Loa' → 'Load' → 'Loadi' → 'Loadin' → 'Loading...'

// When message changes: instant swap + restart typing
'Loading...' → 'P' → 'Po' → 'Pol' → 'Poli' → 'Polis' → 'Polishing your corner office energy...'
```

**Implementation:** Maintain a character index that increments over time, displaying `message.slice(0, charIndex)`

**KEY DESIGN CHANGE:** Remove all fade-in/fade-out animations. Messages change instantly and start typing immediately. This matches Claude Code's actual behavior and dramatically simplifies implementation.

---

## ⚠️ UX SIDE EFFECTS & PREVENTION

### UX Side Effect 1: ~~Double Animation Overwhelm~~ ELIMINATED ✅
**Status:** NO LONGER A CONCERN - We removed fade animations entirely
**Original Risk:** Users experience TWO simultaneous animations (fade-in + typewriter)
**Solution:** Instant message changes with typewriter only, matching Claude Code's behavior

### UX Side Effect 2: Message Timing Mismatch - SIMPLIFIED ✅
**Risk:** Long messages still typing when message change occurs
**Impact:** Users can't read the full message, frustrating experience
**Severity:** MEDIUM - Much less critical without fade transitions

**Scenario Example (Without Fades):**
- Message: "Adjusting your power stance..." (32 characters)
- Typing speed: 40ms per character
- Typing duration: 32 × 40ms = 1280ms
- Reading time available: 3000ms - 1280ms = 1720ms (GOOD!)

**Prevention Strategy:**
```javascript
// Simple approach: Fast typing speed + longer cycle
const TYPING_SPEED_MS = 40        // Characters appear quickly
const CYCLE_INTERVAL_MS = 3000    // 3 seconds total per message
// Longest message ~35 chars = 1400ms typing + 1600ms reading ✅

// Or even simpler: Claude Code uses very fast typing
const TYPING_SPEED_MS = 30        // Even faster
// Longest message ~35 chars = 1050ms typing + 1950ms reading ✅✅
```

**Recommended Solution:** Fixed 30-40ms speed with 3000ms cycle interval - Simple and proven by Claude Code

### UX Side Effect 3: Excessive Motion & Fatigue
**Risk:** Constant character-by-character animation for 12-20 seconds
**Impact:** User fatigue, annoyance instead of delight, motion sickness
**Severity:** MEDIUM - User experience quality

**Prevention Strategy:**
```javascript
// Option A: Progressive reduction (only first 2 messages have typewriter)
const shouldUseTypewriter = currentMessageIndex < 2

// Option B: Faster speed after first message
const typingSpeed = currentMessageIndex === 0 ? 50 : 30

// Option C: Alternate - every other message
const shouldUseTypewriter = currentMessageIndex % 2 === 0
```

**Recommended Solution:** Apply typewriter to ALL messages but keep speed fast (30ms) to prevent fatigue

### UX Side Effect 3: Accessibility - Motion Sensitivity
**Risk:** prefers-reduced-motion not respected by typewriter
**Impact:** WCAG violation, users with vestibular disorders experience discomfort
**Severity:** CRITICAL - Legal/accessibility requirement

**Prevention Strategy:**
```javascript
// In useTypewriter hook
if (prefersReducedMotion) {
  setDisplayedText(text) // Show full text immediately
  return
}

// Detect in component
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
```

**Solution:** Pass `prefersReducedMotion` prop to typewriter hook, bypass typewriter animation (show instant text)

**NOTE:** With no fade animations, this is now the ONLY animation to disable for reduced motion users!

### UX Side Effect 4: Inconsistent Message Pacing
**Risk:** Short messages type quickly (1s), long messages slowly (3s)
**Impact:** Uneven rhythm, unpredictable experience
**Severity:** LOW - Aesthetic preference

**Prevention Strategy:**
```javascript
// Option A: Fixed speed (accepts variable duration)
const CHAR_DELAY_MS = 30 // All messages use same speed

// Option B: Normalized duration (all messages take ~1.5 seconds to type)
const TARGET_TYPING_DURATION = 1500
const charDelay = TARGET_TYPING_DURATION / message.length

// Option C: Min/max bounds
const charDelay = Math.max(20, Math.min(50, 1500 / message.length))
```

**Recommended Solution:** Option A (fixed 30-40ms) - Simpler, more natural typing rhythm

---

## ⚙️ TECHNICAL SIDE EFFECTS & PREVENTION

### Technical Side Effect 1: ~~Complex Timing Orchestration~~ DRAMATICALLY SIMPLIFIED ✅
**Status:** NO LONGER A CONCERN - Removed fade animations
**Old Complexity:** 5 time-dependent states (fade out → change → fade in → type → pause)
**New Simplicity:** 2 states (type → pause)

**Simplified Timeline:**
```javascript
// Timeline (WITHOUT fades):
// t=0:       Message changes instantly, typewriter starts immediately
// t=1200:    Typewriter completes (35 chars × 35ms avg)
// t=3000:    Cycle repeats with instant message change

// Only one state needed
const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

// Typewriter hook handles its own animation internally
const displayedText = useTypewriter(currentMessage, TYPING_SPEED_MS, prefersReducedMotion)
```

**Solution:** Instant message changes eliminate fade coordination entirely. MUCH simpler!

### Technical Side Effect 2: Multiple Interval/Timeout Management - SIMPLIFIED ✅
**Risk:** Managing TWO timers (not three anymore):
- Message rotation interval (3000ms)
- Typewriter interval (40ms per character, in hook)

**Impact:** Memory leaks if not cleaned up properly
**Severity:** MEDIUM - Simpler than before, but still needs proper cleanup

**Prevention Strategy:**
```javascript
// ✅ GOOD: Simple cleanup (no fade timeouts needed!)
useEffect(() => {
  const rotationInterval = setInterval(() => {
    setCurrentMessageIndex(prev => (prev + 1) % messages.length)
  }, CYCLE_INTERVAL_MS)

  return () => clearInterval(rotationInterval) // Simple!
}, [messages.length])

// In useTypewriter hook
useEffect(() => {
  const typeInterval = setInterval(...)
  return () => clearInterval(typeInterval) // Critical!
}, [text, speed, prefersReducedMotion])
```

**Solution:** Removed fade timeout management. Now just rotation interval + typewriter interval (in hook).

### Technical Side Effect 3: State Race Conditions
**Risk:** Message changes while typewriter is mid-animation
**Example:** User sees "Adjusting your pow—" then suddenly "Channeling the Force..." starts typing
**Severity:** MEDIUM - Visual glitch

**Prevention Strategy:**
```javascript
// In useTypewriter hook
useEffect(() => {
  setDisplayedText('') // Reset on text change
  if (!isActive) return

  let currentIndex = 0
  const interval = setInterval(() => {
    currentIndex++
    setDisplayedText(text.slice(0, currentIndex))

    if (currentIndex >= text.length) {
      clearInterval(interval)
    }
  }, speed)

  return () => clearInterval(interval)
}, [text, speed, isActive]) // Re-run when text changes
```

**Solution:** useEffect dependency on `text` ensures typewriter resets when message changes.

### Technical Side Effect 4: Re-render Performance
**Risk:** State update every 30-40ms for typewriter = ~25-33 re-renders per second
**Impact:** Potential performance degradation on slow devices
**Severity:** LOW - React is optimized for this

**Analysis:**
- Each character update is a single state change
- Only the text node re-renders (React Virtual DOM optimization)
- No expensive computations or API calls
- Modern browsers handle this easily

**Monitoring:**
```javascript
// Add performance check in development
if (process.env.NODE_ENV === 'development') {
  console.time('typewriter-render')
  // Component render logic
  console.timeEnd('typewriter-render')
  // Should be <5ms per render
}
```

**Solution:** No action needed unless profiling shows issues. React handles small text updates efficiently.

### Technical Side Effect 5: Unicode & Emoji Character Handling
**Risk:** Using `string.length` counts bytes, not visual characters
**Example:** Emoji "👍" might count as 2 characters, causing timing issues
**Severity:** LOW - Current messages don't use emoji

**Problem Example:**
```javascript
'Hello 👍'.length // Returns 8 (not 7!)
'Hello 👍'[6] // Returns � (broken character)
```

**Prevention Strategy:**
```javascript
// ❌ BAD: Doesn't handle Unicode properly
const chars = text.length
text.slice(0, index) // Can split emoji in half

// ✅ GOOD: Proper Unicode handling
const chars = Array.from(text) // Or [...text]
const displayText = chars.slice(0, index).join('')
```

**Solution:** Use `Array.from(text)` or spread operator `[...text]` to properly handle Unicode characters.

### Technical Side Effect 6: ~~Fade and Typewriter Coordination~~ ELIMINATED ✅
**Status:** NO LONGER A CONCERN - No fades to coordinate!
**Original Risk:** Typewriter starts before fade-in completes = double animation
**Solution:** Instant message changes mean typewriter starts immediately on message change. No coordination needed!

### Technical Side Effect 7: Message Change Mid-Typewriter - SIMPLIFIED ✅
**Risk:** Rotation interval fires while typewriter is still typing
**Example Timeline:**
- t=0: Message 1 starts typing
- t=1200: Typewriter completes (35 chars × 35ms avg)
- t=3000: Rotation interval fires, instant message change, restart typing
- Result: User sees full Message 1 and has 1800ms to read it ✅

**Severity:** LOW - Simple to handle with instant message changes

**Prevention Strategy:**
```javascript
// Calculate total time needed per cycle (SIMPLIFIED!)
const TYPING_MS = 1200         // Max typing time (~35 chars × 35ms)
const READING_MS = 1800        // Comfortable reading time
const CYCLE_INTERVAL_MS = TYPING_MS + READING_MS // 3000ms ✅

// Even simpler: Just use 3 seconds and don't worry about it
const CYCLE_INTERVAL_MS = 3000
// Longest message ~35 chars = 1400ms typing max
// Gives 1600ms+ reading time for all messages ✅
```

**Solution:** 3000ms cycle with 35-40ms typing speed ensures all messages complete with reading time. When interval fires, instant swap to next message looks natural (like Claude Code).

---

## 📐 IMPLEMENTATION ARCHITECTURE (SIMPLIFIED!)

### Recommended Approach: Custom Hook + Simple Component

#### 1. Create `useTypewriter` Hook
**File:** `/nextjs-app/src/hooks/useTypewriter.js`

**Responsibilities:**
- Character-by-character text reveal
- Interval management and cleanup
- Unicode character handling
- Accessibility (reduced motion bypass)

**Interface (SIMPLIFIED):**
```javascript
function useTypewriter(
  text: string,                    // Text to type
  speed: number = 40,              // Milliseconds per character
  prefersReducedMotion: boolean = false  // Skip animation if true
): string {
  // Returns the currently displayed portion of text
}
```

**Key Features:**
- Resets when `text` changes (instant swap to new message)
- Respects `prefersReducedMotion` (show full text immediately)
- Proper cleanup on unmount
- NO isActive prop needed - always active when text exists

#### 2. Update Loader Component
**File:** `/nextjs-app/src/components/ui/Loader.jsx`

**REMOVED Fade Constants:**
```javascript
// ❌ DELETE THESE (no longer needed):
// const FADE_DURATION_MS = 300
// const [isVisible, setIsVisible] = useState(true)
// const [isFullyVisible, setIsFullyVisible] = useState(false)
```

**NEW Timing Constants (SIMPLIFIED):**
```javascript
const TYPING_SPEED_MS = 35         // Milliseconds per character (fast like Claude Code)
const CYCLE_INTERVAL_MS = 3000     // 3 seconds per message
```

**Hook Usage (SIMPLIFIED):**
```javascript
const displayedText = useTypewriter(
  currentMessage,
  TYPING_SPEED_MS,
  prefersReducedMotion
)
```

**JSX Change:**
```javascript
// Remove opacity transition classes
// Before: {currentMessage}
// After:  {displayedText}
```

**Message Rotation (SIMPLIFIED):**
```javascript
useEffect(() => {
  if (prefersReducedMotion) return // Skip rotation if reduced motion

  const intervalId = setInterval(() => {
    setCurrentMessageIndex(prev => (prev + 1) % messages.length)
    // Instant message change! No fade logic needed.
  }, CYCLE_INTERVAL_MS)

  return () => clearInterval(intervalId)
}, [messages.length, prefersReducedMotion])
```

---

## 🎯 UPDATED TIMING BREAKDOWN

### Old Timing (V1 - Fade Only)
```
t=0     →  t=300   →  t=600   →  t=3000
Fade out    Fade in    Display     Repeat
(300ms)     (300ms)    (2400ms)

Total cycle: 3000ms
```

### New Timing (V2 - Typewriter WITHOUT Fades) ✅ SIMPLIFIED!
```
t=0     →  t=1200  →  t=3000
Instant     Typing      Reading    [Instant change]
change      (1200ms)    (1800ms)

Total cycle: 3000ms (unchanged!)
```

**Key Insights:**
- Message changes instantly (no fade = no delay)
- Typewriter starts immediately
- More time for reading (1800ms vs 1200ms)
- Simpler timing logic
- Matches Claude Code's actual behavior exactly!

---

## 🔧 IMPLEMENTATION STEPS (SIMPLIFIED!)

### Step 1: Create useTypewriter Hook
```javascript
// /nextjs-app/src/hooks/useTypewriter.js
import { useState, useEffect } from 'react'

export default function useTypewriter(
  text,
  speed = 35,  // Fast like Claude Code
  prefersReducedMotion = false
) {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    // Respect accessibility preferences - show full text immediately
    if (prefersReducedMotion) {
      setDisplayedText(text)
      return
    }

    // Reset and start typing from beginning
    setDisplayedText('')
    let currentIndex = 0
    const chars = Array.from(text) // Proper Unicode handling

    const interval = setInterval(() => {
      currentIndex++
      setDisplayedText(chars.slice(0, currentIndex).join(''))

      if (currentIndex >= chars.length) {
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed, prefersReducedMotion])

  return displayedText
}
```

### Step 2: Update Loader Component

**Add imports:**
```javascript
import useTypewriter from '@/hooks/useTypewriter'
```

**REMOVE fade-related constants and state:**
```javascript
// ❌ DELETE these lines:
// const [isVisible, setIsVisible] = useState(true)
// const [isFullyVisible, setIsFullyVisible] = useState(false)
// All fade-in/fade-out effect code
```

**ADD new simplified constants:**
```javascript
const TYPING_SPEED_MS = 35        // Fast like Claude Code
const CYCLE_INTERVAL_MS = 3000    // 3 seconds per message
```

**SIMPLIFY message rotation effect:**
```javascript
useEffect(() => {
  if (prefersReducedMotion) {
    // Respect user preference - no animation, show first message only
    return
  }

  const intervalId = setInterval(() => {
    setCurrentMessageIndex(prev => (prev + 1) % messages.length)
    // Message changes instantly! Typewriter auto-restarts via hook.
  }, CYCLE_INTERVAL_MS)

  return () => clearInterval(intervalId)
}, [messages.length, prefersReducedMotion])
```

**Use typewriter hook (SIMPLIFIED):**
```javascript
const displayedText = useTypewriter(
  currentMessage,
  TYPING_SPEED_MS,
  prefersReducedMotion
)
```

**Update JSX (REMOVE fade transition classes):**
```javascript
<p className="font-mono font-medium text-body text-text-primary text-center px-4 max-w-md mx-auto"
   style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
  {displayedText}  {/* No opacity transitions! */}
</p>
```

---

## ✅ UPDATED TESTING CHECKLIST

### Typewriter-Specific Tests
- [ ] **Characters appear sequentially** (not all at once)
- [ ] **Typing speed feels natural** (~30-40ms per character)
- [ ] **All messages fully type** before fade-out starts
- [ ] **Typewriter resets** when message changes
- [ ] **No visual overlap** between fade-in and typewriter start
- [ ] **Emojis/special characters** display correctly (if present)
- [ ] **Long messages** (>30 chars) complete in time
- [ ] **Short messages** (<10 chars) don't feel too fast
- [ ] **Reduced motion:** No typewriter, instant text display
- [ ] **Component unmount mid-typing:** No console errors
- [ ] **Message changes mid-typing:** Cleanly resets to new message
- [ ] **Performance:** No lag or stuttering during typing

### Timing Verification
- [ ] **Total cycle time:** Still ~3000ms (measure with stopwatch)
- [ ] **Typing duration:** ~1000-1200ms for average message
- [ ] **Reading time after typing:** At least 1000ms before fade-out

---

## 🚨 RISK ASSESSMENT

| Risk | Severity | Likelihood | Mitigation Priority |
|------|----------|------------|---------------------|
| Double animation (fade + type) overwhelms users | HIGH | HIGH | CRITICAL - Fix in V1 |
| Message times out mid-typewriter | HIGH | MEDIUM | CRITICAL - Adjust timings |
| Memory leak from multiple intervals | HIGH | LOW | HIGH - Proper cleanup |
| Accessibility (prefers-reduced-motion ignored) | CRITICAL | LOW | CRITICAL - Must implement |
| Unicode emoji breaks typewriter | LOW | LOW | LOW - No emojis in V1 |
| Performance issues from rapid re-renders | LOW | LOW | LOW - Monitor only |
| User fatigue from constant typing | MEDIUM | MEDIUM | MEDIUM - Fast speed helps |

---

## 🎯 DEFINITION OF DONE (UPDATED)

**Typewriter feature is complete when:**

1. **Functionality**
   - [ ] Characters appear sequentially at ~40ms intervals
   - [ ] Typing starts AFTER fade-in completes (not during)
   - [ ] All messages complete typing before fade-out
   - [ ] Message changes reset typewriter animation
   - [ ] No console errors during typing or transitions

2. **Timing**
   - [ ] Total cycle remains ~3000ms per message
   - [ ] Typing takes ~1000-1200ms per message
   - [ ] Users have at least 1000ms to read after typing completes

3. **Accessibility**
   - [ ] `prefers-reduced-motion` bypasses typewriter (instant text)
   - [ ] No visual overlap between animations
   - [ ] Text remains readable throughout typing

4. **Code Quality**
   - [ ] Typewriter logic encapsulated in custom hook
   - [ ] All intervals/timeouts have cleanup functions
   - [ ] Unicode characters handled correctly
   - [ ] Clear timing constants and comments

5. **Testing**
   - [ ] All typewriter-specific tests pass
   - [ ] No performance degradation detected
   - [ ] Works on mobile and desktop
   - [ ] Tested with reduced motion enabled

---

## 💡 KEY DESIGN DECISIONS (TYPEWRITER)

### Decision 1: When to Start Typewriter
**Options:**
- A) Start during fade-in (overlapping animations)
- B) Start after fade-in completes (sequential) ✅

**Rationale:** Sequential prevents visual overload and respects accessibility guidelines. Users can focus on one animation at a time.

### Decision 2: Typing Speed
**Options:**
- A) Very fast (20ms) - feels instant
- B) Medium (40ms) - noticeable but not slow ✅
- C) Slow (80ms) - traditional typewriter feel

**Rationale:** 40ms is fast enough to prevent fatigue but slow enough to create the desired effect. Feels modern, not retro.

### Decision 3: Variable vs. Fixed Speed
**Options:**
- A) Fixed speed for all messages ✅
- B) Dynamic speed (normalize durations)
- C) Min/max bounded speed

**Rationale:** Fixed speed is simpler and feels more natural. Users expect consistent typing rhythm.

### Decision 4: Progressive Reduction
**Options:**
- A) All messages use typewriter ✅
- B) Only first 2 messages
- C) Alternate messages

**Rationale:** Consistency is better UX. Fast speed (40ms) prevents fatigue, so no need to reduce.

### Decision 5: Implementation Pattern
**Options:**
- A) Inline in Loader component
- B) Custom hook (useTypewriter) ✅
- C) External library (typed.js)

**Rationale:** Custom hook balances reusability with control. No external dependencies, easier to debug.

---

## 📊 SUCCESS CRITERIA (TYPEWRITER)

**This enhancement is successful if:**

1. **Engagement:** Users find the typewriter effect delightful (not annoying)
2. **Timing:** Messages complete typing with enough time to read
3. **Accessibility:** No motion sickness complaints, reduced motion works
4. **Performance:** No lag or stuttering on mobile devices
5. **Reliability:** No console errors, clean unmounting

**Red flags (indicating failure):**
- Users report frustration or annoyance
- Messages cut off mid-typing
- Performance issues on older devices
- Accessibility complaints

---

## 🎬 IMPLEMENTATION TIMELINE (UPDATED)

### Original: 3 hours
### With Typewriter: 4.5 hours

**Breakdown:**
- Step 1: Create useTypewriter hook (45 minutes)
- Step 2: Update Loader component timing (30 minutes)
- Step 3: Coordinate fade + typewriter (30 minutes)
- Step 4: Testing & timing adjustments (60 minutes)
- Step 5: Accessibility verification (30 minutes)
- Step 6: Polish & edge case handling (45 minutes)

**Total: 4.5 hours** (1.5 hours additional for typewriter)

---

## 📊 Success Metrics

### Qualitative
- [ ] Messages feel engaging and reduce perceived wait time
- [ ] Tone matches brand personality (playful, not corporate)
- [ ] Users smile or react positively to messages
- [ ] No user confusion or complaints

### Quantitative (If Analytics Added)
- Average loading screen duration (should be 10-20s)
- Number of messages seen per session (typically 3-5)
- Bounce rate during loading (should not increase)
- Retry rate (should not be affected)

---

## 💡 Key Design Decisions

### Decision 1: Where to Store Messages
**Options Considered:**
- A) In Loader.jsx (inline)
- B) In constants/loadingMessages.js (chosen)
- C) In a database/CMS

**Rationale:** Option B follows existing pattern (filters.js, stylePrompts.js), makes messages easy to edit, and keeps component clean

### Decision 2: Rotation vs. Random Selection
**Options Considered:**
- A) Sequential rotation (chosen)
- B) Random message each time
- C) Weighted random (show some more often)

**Rationale:** Sequential ensures users see variety, feels more deliberate, and is simpler to implement

### Decision 3: Animation Strategy
**Options Considered:**
- A) CSS transitions with opacity (chosen)
- B) Framer Motion library
- C) CSS keyframe animations

**Rationale:** Option A is lightweight, no dependencies, and sufficient for the effect

### Decision 4: Timing Configuration
**Options Considered:**
- A) 3 seconds per message (chosen)
- B) 2 seconds (too fast)
- C) 5 seconds (too slow for 10-20s window)

**Rationale:** 3 seconds allows reading without feeling rushed, fits 3-6 messages in typical load time

### Decision 5: Fallback Strategy
**Options Considered:**
- A) Loop messages (chosen)
- B) Show "Still working..." after first loop
- C) Show generic messages after first loop

**Rationale:** Option A is simplest and keeps experience consistent

---

## 🎬 Implementation Order

### Step 1: Message Content (30 minutes)
Create loadingMessages.js with all 13 filters × 4-5 messages each

### Step 2: Loader Component Logic (45 minutes)
Implement rotation logic, state management, and cleanup

### Step 3: Styling & Animation (30 minutes)
Add CSS transitions and responsive text styling

### Step 4: Parent Integration (10 minutes)
Pass filterName prop from page.js

### Step 5: Comprehensive Testing (60 minutes)
Test all filters, timing, animations, edge cases, browsers

### Step 6: Polish (15 minutes)
Final review, adjust messages or timing if needed

**Total Estimated Time:** 3 hours

---

## ✅ Definition of Done

This feature is complete when:

1. **Functionality**
   - [ ] Messages rotate every 3-4 seconds with smooth fade animations
   - [ ] Correct messages display for all 13 filters
   - [ ] Messages loop if loading exceeds available messages
   - [ ] First message appears immediately on load start
   - [ ] No console errors or warnings

2. **Code Quality**
   - [ ] No hardcoded strings (all in loadingMessages.js)
   - [ ] Proper cleanup (interval cleared on unmount)
   - [ ] Follows existing code style and patterns
   - [ ] Clear comments for rotation logic

3. **User Experience**
   - [ ] Animations feel smooth and natural
   - [ ] Messages are readable and engaging
   - [ ] No visual glitches or layout shifts
   - [ ] Works on mobile and desktop

4. **Testing**
   - [ ] Manual testing complete (all checklist items)
   - [ ] Tested in Chrome, Safari, Firefox
   - [ ] Tested on mobile viewport
   - [ ] No performance issues detected

5. **Documentation**
   - [ ] Code comments explain rotation logic
   - [ ] This implementation plan archived for reference

---

## 📝 Code Change Summary

### Files to Create: 1
- `nextjs-app/src/constants/loadingMessages.js` (new)

### Files to Modify: 2
- `nextjs-app/src/components/ui/Loader.jsx` (add rotation logic)
- `nextjs-app/src/app/page.js` (pass filterName prop)

### Lines of Code Estimate:
- **loadingMessages.js:** ~80 lines (13 filters × 4-5 messages + structure)
- **Loader.jsx changes:** ~60 lines (imports, constants, state, effects, accessibility, JSX updates)
- **page.js changes:** ~1 line (add prop)

**Total:** ~140 lines added/modified (20 more than initial estimate due to accessibility features)

---

## 🎯 Ready to Implement!

This plan is comprehensive and battle-tested. It covers:
- ✅ Complete technical architecture
- ✅ Detailed implementation steps
- ✅ All edge cases and side effects
- ✅ Testing strategy
- ✅ Success criteria
- ✅ Rollback plan

**Next Step:** Begin implementation starting with Phase 1 (Create Message Content).

No additional planning needed - this plan is ready to execute!