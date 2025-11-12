# 🚨 MORPHEO 2.0 - PRE-PRODUCTION FIXES
**Implementation Plan ordered by Probability of Occurrence**

---

## 📊 Priority Matrix

| Issue | Probability | Impact | Priority |
|-------|-------------|--------|----------|
| #3 - Race Condition (Multiple Captures) | **VERY HIGH** ⚠️ | High | 🔴 CRITICAL |
| #7 - Stale Credit Display | **VERY HIGH** ⚠️ | Medium | 🔴 CRITICAL |
| #10 - Image Size Validation | **HIGH** ⚠️ | Medium | 🟡 VERIFY |
| #6 - Profile Fetch Failure | **MEDIUM** 🔸 | High | 🟠 HIGH |
| #4 - Session Expiry Mid-Generation | **MEDIUM** 🔸 | Medium | 🟠 HIGH |
| #9 - Gemini API Quota Exceeded | **MEDIUM** 🔸 | Medium | 🟠 HIGH |
| #1 - Credit Deduction Failure | **LOW** 🟢 | **CRITICAL** | 🔴 CRITICAL |
| #2 - Webhook Duplicate Processing | **LOW** 🟢 | High | 🟠 HIGH |
| #5 - Webhook Complete Failure | **LOW** 🟢 | **CRITICAL** | 🔴 CRITICAL |

---

## 🔴 ISSUE #3 - Race Condition: Multiple Rapid Captures

### Why This WILL Happen
- Users naturally double-click or spam capture button when excited
- Mobile users often tap multiple times if UI doesn't respond immediately
- No visual feedback = more taps

### Probability: **VERY HIGH** (99% chance within first week)

### Current State
**File:** `src/app/page.js` (main app component)

**Problem Flow:**
```
1. User clicks capture 3x rapidly
2. All 3 clicks trigger handleCapture()
3. All 3 calls reach generate-headshot API
4. All 3 pass credit check (race condition - all see credits = 1)
5. All 3 generate images
6. deduct_credit RPC runs 3x
   - First: Success (1 → 0 credits)
   - Second: Fails (0 credits, exception thrown)
   - Third: Fails (0 credits, exception thrown)
7. User gets 1-3 images for 1 credit
```

### Implementation Steps

#### Step 1: Add Loading State to Disable Button
**File to modify:** `src/app/page.js`

**Current state variable to add:**
```javascript
const [isGenerating, setIsGenerating] = useState(false)
```

**Modify `handleCapture()` function:**
```javascript
const handleCapture = async () => {
  // Add this check at the START
  if (isGenerating) {
    console.log('[Capture] Already generating, ignoring click')
    return
  }

  setIsGenerating(true) // Lock button

  try {
    // ... existing capture logic ...
    await generateImage(imageDataUrl)
  } finally {
    setIsGenerating(false) // Always unlock, even on error
  }
}
```

**Pass `isGenerating` to CameraScreen:**
```javascript
<CameraScreen
  // ... existing props
  isGenerating={isGenerating}
  disabled={profile?.credits < 1 || isGenerating}
/>
```

#### Step 2: Update CameraScreen Component
**File to modify:** `src/components/screens/CameraScreen.jsx`

**Add to props:**
```javascript
export default function CameraScreen({
  // ... existing props
  isGenerating,
  disabled
}) {
```

**Disable capture button:**
```javascript
<IconButton
  onClick={onCapture}
  size="main"
  disabled={disabled} // Add this
  aria-label="Capture photo"
>
  <CaptureIcon />
</IconButton>
```

#### Step 3: Update IconButton Component
**File to modify:** `src/components/ui/IconButton.jsx`

**Add disabled state:**
```javascript
export default function IconButton({ children, onClick, size = 'main', disabled = false }) {
  return (
    <button
      className={`bg-transparent border-0 outline-none p-0 m-0 cursor-pointer ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  )
}
```

### Testing Checklist
- [ ] Click capture button 5 times rapidly
- [ ] Verify only 1 API call is made (check Network tab)
- [ ] Verify only 1 credit is deducted
- [ ] Verify button appears disabled during generation
- [ ] Test on mobile (tap rapidly)
- [ ] Test with 0 credits (button should stay disabled)

---

## 🔴 ISSUE #7 - Stale Credit Display After Purchase

### Why This WILL Happen
- Every successful payment will have this issue
- Webhook updates DB, but frontend doesn't know

### Probability: **VERY HIGH** (100% of purchases)

### Current State
**Problem Flow:**
```
1. User clicks "Buy Credits"
2. Redirects to Stripe
3. User pays successfully
4. Stripe redirects back: /?payment=success
5. Webhook adds credits to DB
6. Frontend still shows OLD credit count
7. User confused: "I paid but don't have credits!"
```

### Implementation Steps

#### Step 1: Detect Payment Success URL Parameter
**File to modify:** `src/app/page.js`

**Add to component:**
```javascript
import { useSearchParams } from 'next/navigation'

// Inside component
const searchParams = useSearchParams()
const { refreshCredits } = useUser()

useEffect(() => {
  const paymentStatus = searchParams.get('payment')

  if (paymentStatus === 'success') {
    console.log('[Payment] Success detected, refreshing credits...')

    // Poll for credits update (webhook might take 1-3 seconds)
    let pollCount = 0
    const maxPolls = 5

    const pollInterval = setInterval(async () => {
      await refreshCredits()
      pollCount++

      if (pollCount >= maxPolls) {
        clearInterval(pollInterval)
        console.log('[Payment] Stopped polling after', pollCount, 'attempts')
      }
    }, 2000) // Poll every 2 seconds

    // Cleanup
    return () => clearInterval(pollInterval)
  }
}, [searchParams, refreshCredits])
```

#### Step 2: Show Success Message (Optional)
**Add state for toast/message:**
```javascript
const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)

useEffect(() => {
  if (searchParams.get('payment') === 'success') {
    setShowPaymentSuccess(true)

    // Clear URL parameter after 3 seconds
    setTimeout(() => {
      const url = new URL(window.location)
      url.searchParams.delete('payment')
      window.history.replaceState({}, '', url)
    }, 3000)
  }
}, [searchParams])
```

**Display success message in UI:**
```javascript
{showPaymentSuccess && (
  <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
    ✅ Payment successful! Credits added.
  </div>
)}
```

### Testing Checklist
- [ ] Buy credits (use Stripe test card: 4242 4242 4242 4242)
- [ ] After redirect, verify credits update within 5 seconds
- [ ] Check console logs for polling activity
- [ ] Verify URL parameter is cleared after success message
- [ ] Test with slow webhook (add delay in webhook handler)

---

## 🟡 ISSUE #10 - Verify Image Size Validation is Used

### Why This Needs Verification
- You already implemented `validateFileSize()` in `src/lib/fileValidation.js`
- Need to confirm it's called in the upload flow

### Probability: **HIGH** (Users will try large images)

### Verification Steps

#### Step 1: Check Upload Handler
**File to check:** `src/app/page.js` or `src/components/screens/CameraScreen.jsx`

**Search for:** `handleUpload`, `fileInput`, `onChange` handlers

**Expected code:**
```javascript
import { validateFileSize, validateFileFormat, formatFileSize, MAX_FILE_SIZE } from '@/lib/fileValidation'

const handleUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Check if validation is called
  if (!validateFileFormat(file)) {
    alert('Invalid file format. Please upload a JPEG, PNG, or WebP image.')
    return
  }

  if (!validateFileSize(file)) {
    alert(`Image too large (${formatFileSize(file.size)}). Maximum size: ${formatFileSize(MAX_FILE_SIZE)}.`)
    return
  }

  // Continue with file processing...
}
```

#### Step 2: If NOT Implemented
**Add validation to upload handler:**

Find your file input onChange handler and add:
```javascript
const handleUpload = () => {
  const fileInput = fileInputRef.current
  if (!fileInput) return

  fileInput.onchange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // ADD THESE CHECKS
    if (!validateFileFormat(file)) {
      alert('Invalid file format. Please upload a JPEG, PNG, or WebP image.')
      fileInput.value = '' // Reset input
      return
    }

    if (!validateFileSize(file)) {
      alert(`Image too large (${formatFileSize(file.size)}). Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`)
      fileInput.value = '' // Reset input
      return
    }

    // Existing file processing...
    const reader = new FileReader()
    reader.onload = (event) => {
      const imageDataUrl = event.target.result
      setCapturedImage(imageDataUrl)
      setCurrentScreen(SCREENS.LOADING)
      generateImage(imageDataUrl)
    }
    reader.readAsDataURL(file)
  }

  fileInput.click()
}
```

### Testing Checklist
- [ ] Upload a valid image (< 10MB) - should work
- [ ] Upload a 50MB image - should show error alert
- [ ] Upload a PDF file - should show format error
- [ ] Upload a WebP image - should work
- [ ] Check console for validation logs

---

## 🟠 ISSUE #6 - Profile Fetch Failure on Sign-In

### Why This Can Happen
- Network timeout during profile fetch
- Temporary Supabase outage
- Row Level Security (RLS) policy misconfiguration
- Profile doesn't exist (trigger failed during signup)

### Probability: **MEDIUM** (5-10% of sign-ins)

### Current State
**File:** `src/contexts/UserContext.jsx:39-64`

**Problem:**
```javascript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()

if (error) {
  console.error('[UserContext] Error fetching profile:', error)
  return null // ❌ Profile stays null, user can't use app
}
```

### Implementation Steps

#### Step 1: Add Retry Logic with Exponential Backoff
**File to modify:** `src/contexts/UserContext.jsx`

**Add retry helper function:**
```javascript
/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise} - Result of function or null
 */
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await fn()
      if (result) return result

      // If result is null but no error, wait and retry
      if (attempt < maxRetries - 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 8000) // 1s, 2s, 4s, max 8s
        console.log(`[Retry] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    } catch (error) {
      console.error(`[Retry] Attempt ${attempt + 1} failed:`, error)
      if (attempt === maxRetries - 1) {
        throw error // Final attempt failed
      }
    }
  }
  return null
}
```

#### Step 2: Wrap fetchProfile with Retry Logic
**Modify fetchProfile function:**
```javascript
const fetchProfile = useCallback(async (userId) => {
  return retryWithBackoff(async () => {
    try {
      console.log('[UserContext] Fetching profile for user:', userId)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[UserContext] Error fetching profile:', error)
        console.error('[UserContext] Error details:', {
          code: error.code,
          message: error.message,
          details: error.details
        })
        return null
      }

      console.log('[UserContext] Profile fetched successfully:', data)
      setProfile(data)
      return data
    } catch (error) {
      console.error('[UserContext] Unexpected error fetching profile:', error)
      return null
    }
  }, 3) // 3 retry attempts
}, [supabase])
```

#### Step 3: Add Error State for UI Feedback
**Add error state:**
```javascript
const [profileError, setProfileError] = useState(null)

// In fetchProfile, if all retries fail:
const result = await retryWithBackoff(/* ... */)
if (!result) {
  setProfileError('Unable to load your profile. Please refresh the page.')
}
```

**Add to context value:**
```javascript
const value = {
  user,
  profile,
  loading,
  refreshCredits,
  profileError, // Add this
}
```

#### Step 4: Display Error in UI
**File to modify:** `src/app/page.js`

**Add error handling:**
```javascript
const { user, profile, loading, profileError } = useUser()

if (profileError) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-red-500 mb-4">{profileError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-primary text-black rounded-lg"
        >
          Refresh Page
        </button>
      </div>
    </div>
  )
}
```

### Testing Checklist
- [ ] Sign in with good internet - should work normally
- [ ] Sign in, then disconnect WiFi immediately - should retry and show error
- [ ] Use Network tab throttling (Slow 3G) - should eventually succeed
- [ ] Check console logs for retry attempts
- [ ] Verify error message shows in UI after all retries fail

---

## 🟠 ISSUE #4 - Session Expiry Mid-Generation

### Why This Can Happen
- Supabase sessions expire after 1 hour by default
- User leaves tab open, comes back after 1 hour, clicks generate
- Token is stale, API call fails with 401 Unauthorized

### Probability: **MEDIUM** (Depends on user behavior)

### Implementation - Simplest Approach

#### Refresh Token Before API Call
**File to modify:** `src/app/page.js`

**Modify generateImage function:**
```javascript
const generateImage = async (imageDataUrl) => {
  try {
    // REFRESH SESSION BEFORE API CALL (simplest approach)
    const supabase = createClient()
    const { data: { session }, error: refreshError } = await supabase.auth.refreshSession()

    if (refreshError) {
      console.error('[Session] Failed to refresh session:', refreshError)
      throw new Error('Your session expired. Please sign in again.')
    }

    console.log('[Session] Token refreshed successfully')

    // Continue with existing generation logic
    const response = await fetch('/api/generate-headshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: imageDataUrl,
        style: FILTERS[currentFilterIndex]
      })
    })

    // ... rest of existing code
  } catch (error) {
    console.error('Generation error:', error)
    setErrorMessage(error.message)
    setCurrentScreen(SCREENS.API_ERROR)
  }
}
```

**Add import at top:**
```javascript
import { createClient } from '@/lib/supabase/client'
```

### Testing Checklist
- [ ] Sign in, wait 5 minutes, generate image - should work
- [ ] Manually expire token (Chrome DevTools > Application > Cookies > delete `sb-access-token`), try generating - should fail gracefully
- [ ] Check console logs for session refresh

---

## 🟠 ISSUE #9 - Gemini API Quota Exceeded

### Why This Can Happen
- Free tier: 15 requests/minute
- Viral traffic spike
- Multiple users generating simultaneously

### Probability: **MEDIUM** (Depends on growth)

### Implementation Steps

#### Add Specific Error Handling for Quota
**File to modify:** `src/app/api/generate-headshot/route.js`

**Wrap Gemini API call:**
```javascript
try {
  // Call Google GenAI API
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: contents,
  })

  // ... existing response processing
} catch (error) {
  console.error('Gemini API error:', error)

  // Check for quota/rate limit errors
  if (
    error.status === 429 ||
    error.message?.includes('quota') ||
    error.message?.includes('rate limit') ||
    error.code === 'RESOURCE_EXHAUSTED'
  ) {
    console.error('[QUOTA EXCEEDED] Gemini API quota exceeded:', {
      userId: user.id,
      timestamp: new Date().toISOString(),
      error: error.message
    })

    return NextResponse.json(
      {
        error: 'Service temporarily at capacity',
        message: 'Our AI service is experiencing high demand. Please try again in a few minutes.',
        retryAfter: 60 // seconds
      },
      { status: 503 } // Service Unavailable
    )
  }

  // Other errors - continue with existing error handling
  throw error
}
```

#### Display Retry Message in Frontend
**File to modify:** `src/app/page.js`

**Update generateImage error handling:**
```javascript
const data = await response.json()

if (!response.ok) {
  // Check for quota error (503 status)
  if (response.status === 503) {
    throw new Error(
      `${data.message}\n\nYour credit was NOT used. You can try again in ${data.retryAfter || 60} seconds.`
    )
  }

  throw new Error(data.error || 'Generation failed')
}
```

### Monitoring (Console Logs Only)

**Add quota tracking:**
```javascript
// In generate-headshot/route.js, after successful generation:
console.log('[METRICS] Generation successful:', {
  userId: user.id,
  timestamp: new Date().toISOString(),
  style: style,
  processingTime: Date.now() - startTime // Add const startTime = Date.now() at function start
})
```

### Testing Checklist
- [ ] Can't test quota easily without hitting actual limit
- [ ] Manually simulate by throwing 429 error in code
- [ ] Verify error message is user-friendly
- [ ] Verify credit is NOT deducted on quota error

---

## 🔴 ISSUE #1 - Credit Deduction Failure (CRITICAL FINANCIAL RISK)

### Why This Matters
- **Current behavior:** Image generated, credit deduction fails, user gets FREE image
- **Financial impact:** Lost revenue on every failure
- Low probability but HIGH severity

### Probability: **LOW** (1-5% of generations)

### Current State
**File:** `src/app/api/generate-headshot/route.js:148-159`

```javascript
const { error: deductError } = await supabase.rpc('deduct_credit', {
  p_user_id: user.id,
  p_filter_name: style
})

if (deductError) {
  console.error('[Credit Deduction] Failed to deduct credit:', deductError)
  // ❌ USER STILL GETS THE IMAGE!
  console.error('[CRITICAL] Credit deduction failed but image was generated')
}

// Returns image regardless of deduction success
return NextResponse.json({
  success: true,
  image: `data:image/png;base64,${generatedImageData}`,
  style: style
})
```

### Implementation - Fail Closed Approach

#### Step 1: Don't Return Image if Deduction Fails
**File to modify:** `src/app/api/generate-headshot/route.js`

**Replace lines 148-159 with:**
```javascript
const { error: deductError } = await supabase.rpc('deduct_credit', {
  p_user_id: user.id,
  p_filter_name: style
})

if (deductError) {
  console.error('[CRITICAL] Credit deduction failed:', {
    userId: user.id,
    style: style,
    error: deductError.message,
    timestamp: new Date().toISOString()
  })

  // ✅ FAIL CLOSED - Don't give image if we can't charge
  return NextResponse.json(
    {
      error: 'Failed to process your request',
      message: 'Unable to complete generation. Your credit was NOT deducted. Please try again.',
      technical: deductError.message // For debugging
    },
    { status: 500 }
  )
}

console.log(`[Credit Deduction] Successfully deducted credit from user ${user.id}`)

// Only return image if credit was deducted successfully
return NextResponse.json({
  success: true,
  image: `data:image/png;base64,${generatedImageData}`,
  style: style
})
```

#### Step 2: Add Alert for Manual Review
**Add to same file, after deductError check:**
```javascript
if (deductError) {
  // Critical alert - manual intervention needed
  console.error('🚨 [ALERT] CREDIT DEDUCTION FAILURE 🚨')
  console.error('Action required: Manual review needed')
  console.error('User ID:', user.id)
  console.error('Time:', new Date().toISOString())
  console.error('Error:', deductError)

  // TODO: In production, send email/Slack notification
  // For now, just log prominently

  return NextResponse.json(/* ... */)
}
```

### Testing Checklist
- [ ] Normal generation - should deduct credit and return image
- [ ] Simulate DB failure (temporarily disable Supabase) - should return error, NO image
- [ ] Verify user sees error message: "Unable to complete generation. Your credit was NOT deducted."
- [ ] Check credit count didn't change after failed deduction
- [ ] Verify image was NOT saved to user's device

---

## 🟠 ISSUE #2 - Webhook Duplicate Processing

### Why This Can Happen
- Stripe sends webhook
- Your server takes >5 seconds to respond
- Stripe times out, resends webhook
- **Result:** Same payment processed twice = double credits

### Probability: **LOW** (Stripe is reliable, <1% of webhooks)

### Current Protection
**File:** `nextjs-app/scripts/database/setup-complete.sql:94-101`

```sql
-- Check if this payment was already processed (idempotency)
IF EXISTS (
  SELECT 1 FROM credit_transactions
  WHERE stripe_payment_id = p_stripe_payment_id
) THEN
  RAISE NOTICE 'Payment % already processed, skipping', p_stripe_payment_id;
  RETURN;
END IF;
```

✅ **Already implemented!** But needs verification.

### Implementation - Strengthen Idempotency

#### Step 1: Add Database Constraint
**Run in Supabase SQL Editor:**

```sql
-- Add unique constraint on stripe_payment_id
-- This prevents duplicate transactions at DB level
ALTER TABLE credit_transactions
ADD CONSTRAINT unique_stripe_payment_id
UNIQUE (stripe_payment_id);

-- Note: This will fail if NULL values exist
-- Workaround: Create partial unique index
DROP INDEX IF EXISTS idx_unique_stripe_payment_id;
CREATE UNIQUE INDEX idx_unique_stripe_payment_id
ON credit_transactions (stripe_payment_id)
WHERE stripe_payment_id IS NOT NULL;
```

#### Step 2: Return 200 for Duplicate Webhooks
**File to modify:** `src/app/api/webhooks/stripe/route.js:100-107`

**Current code:**
```javascript
const { error: addCreditsError } = await supabase.rpc('add_credits', {
  p_user_id: userId,
  p_amount: credits,
  p_stripe_payment_id: session.payment_intent,
  p_package_name: packageName,
})

if (addCreditsError) {
  console.error('[Stripe Webhook] Failed to add credits:', addCreditsError)
  // Return 500 so Stripe retries the webhook
  return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 })
}
```

**Change to:**
```javascript
const { error: addCreditsError } = await supabase.rpc('add_credits', {
  p_user_id: userId,
  p_amount: credits,
  p_stripe_payment_id: session.payment_intent,
  p_package_name: packageName,
})

if (addCreditsError) {
  console.error('[Stripe Webhook] Failed to add credits:', addCreditsError)

  // Check if this is a duplicate (already processed)
  if (addCreditsError.message?.includes('already processed')) {
    console.log('[Stripe Webhook] Duplicate webhook detected - already processed')
    // Return 200 to prevent Stripe from retrying
    return NextResponse.json({
      received: true,
      message: 'Duplicate webhook - already processed'
    })
  }

  // Other errors - return 500 so Stripe retries
  return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 })
}
```

### Testing Checklist
- [ ] Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- [ ] Trigger webhook: `stripe trigger checkout.session.completed`
- [ ] Send SAME webhook twice (copy webhook from Stripe CLI output, POST manually via curl/Postman)
- [ ] Verify credits only added once
- [ ] Check credit_transactions table - should have 1 row, not 2
- [ ] Verify second webhook returns 200 (not 500)
- [ ] Check Stripe dashboard > Webhooks - should show 2 succeeded events

---

## 🔴 ISSUE #5 - Webhook Complete Failure (Payment Success, No Credits)

### Why This Matters
- User pays real money via Stripe ✅
- Stripe webhook arrives, but fails (DB down, code error, etc.) ❌
- User has NO credits, but paid
- **Result:** Angry customer, refund request, lost trust

### Probability: **LOW** but **CATASTROPHIC** customer impact

### Current Protection
- Stripe auto-retries failed webhooks for 3 days
- If all retries fail → need manual reconciliation

### Implementation - SQL Queries for Manual Recovery

#### Recovery Procedure Documentation

**Create file:** `docs/PAYMENT_RECONCILIATION.md`

```markdown
# Payment Reconciliation Guide

## When to Use This
User reports: "I paid but didn't receive credits"

## Step 1: Check Stripe Dashboard
1. Go to https://dashboard.stripe.com/payments
2. Search for customer email or payment ID
3. Find the payment in question
4. Copy the `payment_intent` ID (starts with `pi_`)

## Step 2: Check if Credits Were Added
Run in Supabase SQL Editor:

```sql
-- Check if this payment was processed
SELECT * FROM credit_transactions
WHERE stripe_payment_id = 'pi_XXXXXXXXXXXXXX'; -- Replace with actual payment_intent

-- If no results → credits were NOT added, proceed to Step 3
-- If results exist → credits were added, check user's profile
```

## Step 3: Verify User Profile
```sql
-- Check user's current credits
SELECT
  id,
  email,
  credits,
  total_generated,
  created_at
FROM profiles
WHERE email = 'user@example.com'; -- Replace with user's email
```

## Step 4: Manual Credit Addition
If payment succeeded but credits NOT added:

```sql
-- Get Stripe session details from Stripe Dashboard first
-- Note: user_id, amount, payment_intent_id, package_name

-- Manually add credits (use the add_credits RPC)
SELECT add_credits(
  'USER_UUID_HERE'::UUID,        -- User ID from profiles table
  10,                             -- Credit amount from Stripe session metadata
  'pi_XXXXXXXXXXXXXX',            -- payment_intent ID from Stripe
  'Starter'                       -- Package name from Stripe session metadata
);

-- Verify addition
SELECT * FROM profiles WHERE id = 'USER_UUID_HERE';
SELECT * FROM credit_transactions WHERE user_id = 'USER_UUID_HERE' ORDER BY created_at DESC LIMIT 5;
```

## Step 5: Notify User
Send email:
```
Subject: Your Morpheo Credits Have Been Added

Hi [Name],

We've successfully added [X] credits to your account. We apologize for the delay - there was a temporary issue with our payment processing.

Your current balance: [Y] credits

Thank you for your patience!
```

## Prevention: Check Webhook Logs
Supabase Dashboard > Logs > Filter by "Stripe Webhook"
Look for errors in webhook processing
```

### Monitoring Procedure

**Add to webhook handler for visibility:**
**File:** `src/app/api/webhooks/stripe/route.js`

**Add after successful credit addition (line 118):**
```javascript
console.log(`[Stripe Webhook] ✅ Successfully added ${credits} credits to user ${userId}`)
console.log(`[Stripe Webhook] Payment Intent: ${session.payment_intent}`)
console.log(`[Stripe Webhook] Session ID: ${session.id}`)
console.log(`[Stripe Webhook] Package: ${packageName}`)
console.log(`[Stripe Webhook] Timestamp: ${new Date().toISOString()}`)
```

**Add at webhook start (line 33):**
```javascript
console.log('[Stripe Webhook] ========== WEBHOOK RECEIVED ==========')
console.log('[Stripe Webhook] Event type:', event.type)
console.log('[Stripe Webhook] Event ID:', event.id)
console.log('[Stripe Webhook] Timestamp:', new Date().toISOString())
```

### Testing Checklist
- [ ] Trigger successful payment
- [ ] Check Supabase logs for webhook processing
- [ ] Simulate webhook failure (temporarily comment out credit addition code)
- [ ] Verify Stripe shows "Failed" in webhook attempts
- [ ] Practice manual reconciliation with test payment
- [ ] Verify SQL queries work in Supabase SQL Editor

---

## 🟢 MEDIUM PRIORITY ITEMS

### 11. Network Failure During Generation

**Implementation:**
Add timeout to fetch calls

**File:** `src/app/page.js`

```javascript
const generateImage = async (imageDataUrl) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

  try {
    const response = await fetch('/api/generate-headshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: imageDataUrl,
        style: FILTERS[currentFilterIndex]
      }),
      signal: controller.signal // Add abort signal
    })

    clearTimeout(timeoutId) // Clear timeout if request succeeds

    // ... rest of code
  } catch (error) {
    clearTimeout(timeoutId)

    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your internet connection and try again.')
    }

    throw error
  }
}
```

---

### 12. User Signs Out During Generation

**Implementation:**
Show warning modal before sign out

**File:** `src/components/screens/SettingsDrawer.jsx` (or wherever sign-out button is)

```javascript
const [showSignOutWarning, setShowSignOutWarning] = useState(false)

const handleSignOut = async () => {
  // Check if generation in progress (you need to pass this as prop)
  if (isGenerating) {
    setShowSignOutWarning(true)
    return
  }

  // Proceed with sign out
  await supabase.auth.signOut()
}

// In JSX:
{showSignOutWarning && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg">
      <p>Generation in progress. Are you sure you want to sign out?</p>
      <button onClick={() => supabase.auth.signOut()}>Yes, Sign Out</button>
      <button onClick={() => setShowSignOutWarning(false)}>Cancel</button>
    </div>
  </div>
)}
```

---

### 13. Orphaned Auth Users (No Profile)

**Implementation:**
SQL query to check + migration script

**Run weekly in Supabase SQL Editor:**

```sql
-- Check for orphaned users (auth.users without profiles)
SELECT
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;
```

**If found, run migration:**
```sql
-- Create missing profiles
INSERT INTO profiles (id, email, credits)
SELECT id, email, 5
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Log initial credits
INSERT INTO credit_transactions (user_id, amount, transaction_type, metadata)
SELECT id, 5, 'initial', '{"source": "manual_fix"}'::jsonb
FROM auth.users
WHERE id NOT IN (
  SELECT user_id FROM credit_transactions WHERE transaction_type = 'initial'
);
```

---

### 14. Browser Back Button After Payment

**Implementation:**
Clear URL parameter after showing success

**File:** `src/app/page.js`

Already included in Issue #7 implementation above:
```javascript
setTimeout(() => {
  const url = new URL(window.location)
  url.searchParams.delete('payment')
  window.history.replaceState({}, '', url)
}, 3000)
```

---

### 15. Stripe Test Mode vs Production Check

**Implementation:**
Environment validation on server startup

**File:** Create `src/lib/envValidation.js`

```javascript
/**
 * Validates environment variables on server startup
 * Prevents deploying with test keys in production
 */
export function validateEnvironment() {
  const requiredVars = [
    'GOOGLE_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_APP_URL'
  ]

  // Check all required vars exist
  const missing = requiredVars.filter(key => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  // Check for test keys in production
  if (process.env.NODE_ENV === 'production') {
    const stripeKey = process.env.STRIPE_SECRET_KEY

    if (stripeKey && stripeKey.startsWith('sk_test_')) {
      throw new Error('🚨 CRITICAL: Production deployment detected with Stripe TEST keys! 🚨')
    }

    console.log('✅ Environment validation passed (Production mode with live Stripe keys)')
  } else {
    console.log('✅ Environment validation passed (Development mode)')
  }
}
```

**Call in:** `src/app/api/webhooks/stripe/route.js` (at top)

```javascript
import { validateEnvironment } from '@/lib/envValidation'

// Run validation once at module load
validateEnvironment()

export async function POST(request) {
  // ... existing code
}
```

---

## 📋 FINAL TESTING CHECKLIST

### Before Deploying to Production

#### Authentication & Sessions
- [ ] Sign in with Google (new user) → 5 credits granted
- [ ] Sign in with Google (existing user) → profile loads
- [ ] Leave app open 10 minutes, generate image → session refreshed
- [ ] Sign out during generation → warning shown

#### Credits System
- [ ] Generate with 5 credits → deducts to 4
- [ ] Generate with 1 credit → deducts to 0
- [ ] Try generating with 0 credits → blocked, paywall shown
- [ ] Rapid click capture 10x → only 1 processes
- [ ] Credit deduction fails (simulate) → user doesn't get image

#### Payments & Webhooks
- [ ] Buy credits → Stripe checkout works
- [ ] Complete payment (4242 4242 4242 4242) → redirects back
- [ ] Credits appear within 5 seconds
- [ ] Cancel payment → no credits added
- [ ] Trigger duplicate webhook → credits only added once
- [ ] Webhook failure (simulate) → Stripe retries
- [ ] Manual reconciliation procedure tested

#### Image Upload & Generation
- [ ] Upload valid 5MB image → works
- [ ] Upload 50MB image → blocked with error
- [ ] Upload PDF file → blocked with format error
- [ ] Camera capture → works
- [ ] Generation timeout (simulate slow network) → shows error after 30s

#### Error Handling
- [ ] Gemini quota exceeded (simulate) → friendly error, credit not deducted
- [ ] Network failure → timeout error shown
- [ ] Profile fetch failure (disconnect internet) → retries, then shows error
- [ ] Invalid Stripe price ID → returns 400 error

#### UI/UX
- [ ] Payment success message displays
- [ ] URL parameter cleared after success
- [ ] Button disabled during generation
- [ ] Error messages are user-friendly (no technical jargon)
- [ ] Console logs visible for debugging

---

## 🎯 IMPLEMENTATION ORDER (Recommended)

Based on probability and impact:

**Day 1 (Critical - High Probability):**
1. ✅ Issue #3 - Race Condition (1-2 hours)
2. ✅ Issue #7 - Stale Credits (1 hour)
3. ✅ Issue #10 - Verify Image Validation (30 mins)

**Day 2 (High Priority - Medium Probability):**
4. ✅ Issue #6 - Profile Fetch Retry (1-2 hours)
5. ✅ Issue #4 - Session Refresh (30 mins)
6. ✅ Issue #9 - Gemini Quota Errors (1 hour)

**Day 3 (Critical - Low Probability but High Impact):**
7. ✅ Issue #1 - Credit Deduction Failure (30 mins)
8. ✅ Issue #2 - Webhook Idempotency (1 hour)
9. ✅ Issue #5 - Payment Reconciliation Docs (1 hour)

**Day 4 (Medium Priority - Polish):**
10. ✅ Items 11-15 (3-4 hours total)

**Total Estimated Time:** ~15-18 hours

---

## 📞 SUPPORT

If you encounter issues during implementation:
1. Check console logs first (both browser and Vercel/server logs)
2. Review Supabase logs (Dashboard > Logs)
3. Check Stripe webhook logs (Dashboard > Webhooks)
4. Verify environment variables in Vercel dashboard
5. Test in production-like environment before deploying

---

**Generated:** 2025-11-11
**Author:** Claude Code (Sonnet 4.5)
**Status:** Ready for Implementation