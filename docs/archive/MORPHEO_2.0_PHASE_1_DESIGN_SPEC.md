# Morpheo 2.0 Phase 1 - Design Specification

## User Flow Overview

### Authentication Flow (Google OAuth)
```
1. User lands on app
   ↓
2. Sign-in screen (unauthenticated state)
   ↓
3. User clicks "Sign in with Google"
   ↓
4. Redirect to Google OAuth (SAME TAB - standard OAuth behavior)
   ↓
5. User signs in on Google's page
   ↓
6. Google redirects back to Morpheo (/auth/callback)
   ↓
7. Loading state (while session is established)
   ↓
8. Redirect to Camera Screen (authenticated state)
```

**Important:** OAuth happens in the **SAME TAB** (not popup). This is standard practice and required for mobile browsers.

---

## Design Checklist

### 🎨 Screens to Design

#### 1. Sign-In Screen
- [ ] **Layout**: Full screen, centered content
- [ ] **Logo**: Morpheo logo (top center)
- [ ] **Tagline**: 1 line value prop (e.g., "Transform your photos with AI")
- [ ] **CTA Button**: "Sign in with Google" (follow [Google branding guidelines](https://developers.google.com/identity/branding-guidelines))
- [ ] **Footer**: Small text with privacy/terms link (optional)
- [ ] **Background**: Consistent with Morpheo v1.0 aesthetic

**States:**
- [ ] Default state
- [ ] Button hover state (desktop)
- [ ] Button pressed state (mobile)

---

#### 2. Authentication Loading State
**When shown:** After Google redirects back, while establishing session (2-3 seconds)

- [ ] **Visual**: Spinner/loading indicator
- [ ] **Text**: "Signing you in..." or "Welcome back..."
- [ ] **Background**: Same as sign-in screen or white/branded
- [ ] **No user interaction** (just visual feedback)

**Note:** This is a transition screen, not a full design - can be simple.

---

#### 3. Camera Screen - Authenticated Header
**Additions to existing Camera Screen:**

- [ ] **Credits Widget** (new element)
  - Position: Top-right corner (or specify preferred location)
  - Display: Credit count + icon (e.g., "5 ⚡")
  - Tappable: Opens Account Screen
  - Alert state: Visual change when credits < 3 (e.g., red color, pulsing)

**States:**
- [ ] Normal credits (5+)
- [ ] Low credits (1-2) - warning visual
- [ ] Zero credits - disabled/greyed state

---

#### 4. Account/Profile Screen
**When shown:** User taps credits widget

**Layout:** Modal overlay OR slide-in panel (choose one)

**Elements:**
- [ ] **User Info Section**
  - Profile picture (from Google)
  - Name (from Google)
  - Email (from Google)
- [ ] **Credits Section**
  - Large, prominent credit count (e.g., "15 Credits")
  - Icon/visual emphasis
- [ ] **Sign Out Button**
  - Clear, accessible
  - Confirmation? (optional)
- [ ] **Close Button** (X icon top-right)
- [ ] **Optional**: Usage stats ("You've generated 23 images")

**States:**
- [ ] Default state
- [ ] Sign-out button hover/pressed

---

### ⚠️ Error States to Design

#### Error 1: OAuth Failed
**Trigger:** Google OAuth fails, user cancels, or network error

**Screen:** Sign-In Screen with error message

- [ ] **Error message**: "Sign-in failed. Please try again."
- [ ] **Retry button**: "Try Again" (same as "Sign in with Google")
- [ ] **Visual**: Red error banner/text above button
- [ ] **Dismissible**: Error clears on retry

---

#### Error 2: Session Expired
**Trigger:** User's session expires while using the app

**Screen:** Modal overlay on current screen OR redirect to sign-in

- [ ] **Error message**: "Your session expired. Please sign in again."
- [ ] **CTA**: "Sign In" button
- [ ] **Visual**: Modal with semi-transparent backdrop

---

#### Error 3: Network Error During Sign-In
**Trigger:** Network drops during OAuth flow

**Screen:** Sign-In Screen with error message

- [ ] **Error message**: "Connection error. Check your internet and try again."
- [ ] **Retry button**: "Try Again"
- [ ] **Visual**: Red error banner

---

### 📱 Responsive Considerations

#### Mobile (Primary)
- [ ] Sign-in button: Large, thumb-friendly (min 44px height)
- [ ] Credits widget: Visible but not obstructive
- [ ] Account screen: Full-screen modal (easier on mobile)

#### Desktop (Secondary)
- [ ] Sign-in button: Medium size, centered
- [ ] Credits widget: Top-right corner
- [ ] Account screen: Centered modal overlay (not full screen)

---

## Design Specifications Needed

### Typography
- [ ] Sign-in tagline font size/weight
- [ ] Error message font size/color
- [ ] Credits widget font size
- [ ] Account screen heading/body text

### Colors
- [ ] Error state color (red variant)
- [ ] Low credits warning color (orange/yellow)
- [ ] Button colors (use Google's official colors for OAuth button)
- [ ] Modal overlay background (semi-transparent)

### Spacing
- [ ] Sign-in screen: padding around content
- [ ] Credits widget: distance from screen edges
- [ ] Account screen: internal padding

### Animations (Optional)
- [ ] Loading spinner animation
- [ ] Account screen slide-in/fade-in
- [ ] Error message fade-in
- [ ] Credits widget alert pulse (when low)

---

## Assets to Export

### Icons
- [ ] Credits icon (lightning bolt or coin)
- [ ] Close icon (X) for account screen
- [ ] Google logo (use official asset from Google)
- [ ] Loading spinner (or use CSS animation)

### Images
- [ ] Morpheo logo (if not already available)
- [ ] Background image/gradient (if applicable)

---

## Edge Cases to Consider

### Happy Path
✅ User clicks "Sign in with Google" → Signs in successfully → Sees camera screen with credits widget

### Edge Cases

1. **User Cancels OAuth**
   - User clicks "Sign in with Google" → Goes to Google → Clicks "Cancel"
   - **Result:** Redirect back to sign-in screen with error message
   - **Design:** Error state #1

2. **User Already Signed In**
   - User visits app with active session
   - **Result:** Skip sign-in, go straight to camera screen
   - **Design:** No additional design needed (just camera screen)

3. **User Signs Out**
   - User taps credits widget → Opens account screen → Clicks "Sign out"
   - **Result:** Session cleared, redirect to sign-in screen
   - **Design:** Confirmation modal? (optional: "Are you sure?")

4. **Network Drops During Sign-In**
   - User clicks button → Network error before redirect
   - **Result:** Show error message
   - **Design:** Error state #3

5. **Session Expires Mid-Use**
   - User is on camera screen → Session expires (e.g., 24 hours later)
   - **Result:** Show session expired modal
   - **Design:** Error state #2

6. **First-Time User vs. Returning User**
   - First-time: Create profile in database automatically
   - Returning: Load existing profile
   - **Design:** No visual difference (backend handles this)

---

## Priority Levels

### Must-Have (Phase 1 Launch)
1. ✅ Sign-in screen (default state)
2. ✅ "Sign in with Google" button (all states)
3. ✅ Loading state (simple spinner)
4. ✅ Credits widget on camera screen (default)
5. ✅ Account screen (basic layout)
6. ✅ Error state #1 (OAuth failed)

### Nice-to-Have (Can refine later)
- Error state #2 (session expired modal)
- Error state #3 (network error)
- Credits widget alert state (low credits)
- Sign-out confirmation modal
- Animations/transitions

### Can Skip for Phase 1
- Usage stats in account screen
- Advanced error recovery flows
- Complex animations

---

## Design Deliverables Summary

### Screens (6 total)
1. Sign-in screen (default)
2. Sign-in screen (error state)
3. Auth loading state
4. Camera screen with credits widget
5. Account/profile screen
6. Session expired modal (optional)

### Component States (3 total)
1. Credits widget: normal, low, zero
2. Sign-in button: default, hover, pressed
3. Account screen: open, closed

---

## Questions for Designer

- [ ] **Account screen format:** Modal overlay or slide-in panel?
- [ ] **Credits widget position:** Top-right, top-left, or other?
- [ ] **Sign-out confirmation:** Yes or no?
- [ ] **Error message style:** Banner, toast, or inline?
- [ ] **Loading spinner:** Custom design or use standard?

---

## Reference Links

- [Google Sign-In Branding Guidelines](https://developers.google.com/identity/branding-guidelines)
- [Morpheo v1.0 Design Tokens](../nextjs-app/src/lib/designTokens.js)
- [Current Morpheo UI Style](../UI_IMPLEMENTATION_BRIEF.md)

---

**Once designs are complete, share Figma links or export PNGs for each screen/state!**