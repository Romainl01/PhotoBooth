# Logging Improvement Plan for Image Generation API

## Current Problem
Production logs show `Error: No image data in response` but don't reveal WHY the Google Gemini API isn't returning image data. The current implementation doesn't inspect critical response fields before attempting to extract the image.

---

## What to Check on Google's Side (Per Documentation)

Based on Google Gemini API docs, failures can occur through:

### 1. **Prompt Blocking**
- **Field:** `response.promptFeedback.blockReason`
- **Cause:** Input prompt violates content policies
- **Result:** No candidates returned, empty response

### 2. **Safety Filtering**
- **Field:** `response.candidates[].safetyRatings`
- **Categories Evaluated:**
  - `HARM_CATEGORY_HATE_SPEECH`
  - `HARM_CATEGORY_SEXUALLY_EXPLICIT`
  - `HARM_CATEGORY_DANGEROUS_CONTENT`
  - `HARM_CATEGORY_HARASSMENT`
  - `HARM_CATEGORY_CIVIC_INTEGRITY`

### 3. **Finish Reason**
- **Field:** `response.candidates[].finishReason`
- **Possible Values:** Could indicate truncation, safety stops, or other termination reasons

### 4. **Missing Candidates**
- **Field:** `response.candidates` (array length)
- **Cause:** Request rejected before generation attempt

---

## Proposed Logging Strategy

### Phase 1: Request Logging (Entry Point)
**Location:** Start of POST handler

**Log:**
```
Request initiated
├─ Timestamp
├─ Style requested
├─ Input image size (bytes)
├─ Input image type (parsed from data URL)
└─ Request ID (generated UUID for tracing)
```

**Purpose:** Correlation between request and outcome

---

### Phase 2: Pre-Generation Validation Logging
**Location:** After parsing request body

**Log:**
```
Request validation
├─ Has image data: true/false
├─ Has style parameter: true/false
├─ Style mapped to prompt: true/false
├─ Base64 cleanup successful: true/false
└─ Final prompt length (chars)
```

**Purpose:** Catch client-side issues before API call

---

### Phase 3: API Response Inspection Logging (CRITICAL - HIGHEST PRIORITY)

**What This Does:**
Right now, your code immediately tries to access `response.candidates[0].content.parts` without checking if Google actually generated any candidates or if the request was blocked. This phase adds logging RIGHT AFTER Google responds and BEFORE trying to extract the image.

**Location:** Immediately after `ai.models.generateContent()` call (line 41-44 in route.js)

**Why This Matters:**
When Google blocks a request (like "Star Wars" triggering trademark filters), they return a response object that LOOKS successful, but contains either:
- An empty `candidates` array
- A `promptFeedback.blockReason` explaining why it was rejected
- Safety ratings showing which filters triggered

Your current code crashes trying to read `candidates[0]` when the array is empty, giving you the unhelpful "No image data in response" error.

**What To Log:**
```
API Response Structure
├─ Response received: true
├─ Candidates array exists: true/false
├─ Candidates count: N (could be 0!)
│
├─ [IF candidates exist AND count > 0]
│   ├─ Candidate[0] finish reason: "STOP" | "SAFETY" | etc
│   ├─ Candidate[0] has content: true/false
│   ├─ Candidate[0] content parts count: N
│   ├─ Candidate[0] safety ratings:
│   │   ├─ HARM_CATEGORY_HATE_SPEECH: NEGLIGIBLE | LOW | MEDIUM | HIGH
│   │   ├─ HARM_CATEGORY_SEXUALLY_EXPLICIT: ...
│   │   └─ [etc for each category]
│   └─ Has inlineData in parts: true/false
│
├─ Prompt Feedback (Google's input analysis):
│   ├─ Block reason: null | "SAFETY" | "OTHER" (null = not blocked)
│   └─ Safety ratings: [same structure as above]
│
└─ Full prompt sent: <actual text of STYLE_PROMPTS[style]>
```

**Example Real Output:**
```json
{
  "phase": "api_response_inspection",
  "candidatesCount": 0,
  "promptFeedback": {
    "blockReason": "SAFETY",
    "safetyRatings": [
      {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "probability": "MEDIUM"}
    ]
  },
  "promptSent": "Create a professional headshot in Star Wars style..."
}
```

**What You'll Learn:**
- If `candidatesCount: 0` → Request was rejected before generation started
- If `blockReason` is not null → See exactly why (safety, policy, etc)
- If `finishReason: "SAFETY"` → Generation started but was stopped mid-way
- Safety ratings → Which specific filters triggered (hate speech, violence, etc)

**Purpose:** This is the MOST IMPORTANT phase because it tells you exactly why Google didn't return an image, instead of just "no image data".

---

### Phase 4: Image Extraction Logging
**Location:** Inside the loop checking for inlineData

**Log:**
```
Image extraction
├─ Parts iterated: N
├─ Parts with inlineData: N
├─ Image data size (if found): N bytes
└─ Image data mime type (if found): <string>
```

**Purpose:** Verify extraction logic is working

---

### Phase 5: Error Logging (Enhanced)
**Location:** Catch block

**Log:**
```
Error occurred
├─ Error type: <error.constructor.name>
├─ Error message: <error.message>
├─ Error stack: <first 3 lines>
├─ Request ID: <from phase 1>
├─ Style attempted: <style>
└─ Full API response (JSON stringified, max 5000 chars)
```

**Purpose:** Complete diagnostic information

---

### Phase 6: Success Logging
**Location:** Before returning success response

**Log:**
```
Generation successful
├─ Request ID
├─ Style: <style>
├─ Generation time: <ms elapsed>
├─ Output image size: N bytes
└─ Output format: <extracted from data URL>
```

**Purpose:** Performance metrics and success rate tracking

---

## Implementation Structure

### Log Format Recommendation
Use **structured JSON logs** for Vercel's log aggregation:

```json
{
  "timestamp": "2025-10-28T21:18:06.629Z",
  "level": "info|warn|error",
  "phase": "request|validation|api_call|extraction|error|success",
  "requestId": "uuid",
  "style": "Star Wars",
  "data": {
    // Phase-specific fields
  }
}
```

### Log Levels
- **INFO:** Phases 1, 2, 6
- **WARN:** Phase 3 when candidates missing or blocked
- **ERROR:** Phase 5

---

## Key Metrics to Track

After implementing, monitor:

1. **Block Rate:** `promptFeedback.blockReason` occurrences
2. **Safety Trigger Rate:** Which safety categories are most commonly flagged
3. **Empty Candidate Rate:** Requests with 0 candidates
4. **Generation Time:** P50, P95, P99 latencies
5. **Success Rate by Style:** Which prompts fail most often

---

## Configuration Decisions

### 1. **What to Log** ✅ DECIDED
**Decision:** Log prompts and metadata
- ✅ Log full prompt text (to understand which phrases trigger filters)
- ✅ Log image metadata (size, type, dimensions)
- ❌ Do NOT log actual base64 image data (too large, privacy concerns)

---

### 2. **How Much to Log** ✅ DECIDED

**Decision:** Option B - Smart Sampling Strategy

**Implementation:**
- ✅ **100% of FAILED requests:** Log ALL phases (1-6) for complete error diagnostics
- ✅ **10% of SUCCESSFUL requests:** Randomly sample for performance metrics
- ✅ **Local environment:** Always log everything (100% of all requests)
- ✅ **Production environment:** Apply sampling strategy

**How Sampling Works:**
```javascript
// Generate random number at request start
const shouldLogSuccess = Math.random() < 0.1; // 10% chance

// For successful requests
if (success && !shouldLogSuccess && isProduction) {
  // Skip verbose logging, only log minimal success metric
} else {
  // Log all phases (always log in local, always log errors, 10% of prod success)
}
```

**Benefits:**
- ✅ All errors fully diagnosed (Phase 1-6)
- ✅ 90% reduction in success logs (cost savings)
- ✅ Still get representative performance metrics
- ✅ Complete debugging visibility in local environment

**Estimated Log Volume:**
- If 1000 requests/day with 5% error rate:
  - Errors: 50 requests × 6 phases = 300 log lines
  - Successes: 950 requests × 10% × 6 phases = 570 log lines
  - **Total: ~870 lines/day** (vs 6000 with Option A)

---

### 3. **Environment Handling** ✅ DECIDED
**Decision:** You have local and production only
- Local: Can be more verbose for debugging
- Production: Focus on actionable errors
- Use environment variable check to adjust verbosity

---

### 4. **Full API Response Logging** ✅ DECIDED
**Decision:** Log complete Google API response ONLY when errors occur
- On success: Log only key fields (candidatesCount, finishReason, tokens used)
- On error: Log ENTIRE response object as JSON string (truncated to 5000 chars max)

---

### 5. **Future: Alerting** (Optional - Not Blocking Implementation)
Consider setting up alerts for:
- Error rate > 20% over 10 minutes
- Specific `blockReason` values appearing (indicates Google policy changes)
- Response time > 15 seconds (performance degradation)

Requires: Vercel integration or external monitoring tool (Datadog, Sentry, etc.)

---

## Success Criteria

After implementation, we should be able to answer:

✅ "Which style prompts trigger content filters most often?"
✅ "Is the API returning responses but with empty candidates?"
✅ "What safety categories are blocking generations?"
✅ "How long does successful generation take on average?"
✅ "Are we hitting any rate limits or quota issues?"
✅ "What's the exact API response structure when failures occur?"

---

## Implementation Priority

### Ready to Implement Now:
1. ✅ **Phase 3** (API response inspection) - Will immediately show why "Star Wars" fails
2. ✅ **Phase 5** (Enhanced error logging with full API response)
3. ✅ **Phase 1** (Request logging with prompt + metadata)

### Quick Wins (Can Add After Phase 3):
4. ⚡ **Phase 2** (Validation logging)
5. ⚡ **Phase 6** (Success metrics)
6. ⚡ **Phase 4** (Image extraction logging)

### Still Need Your Decision:
- **Log volume strategy** (Option A, B, or C from section 2 above)

## Next Steps

1. ✅ ~~Answer clarification questions~~ - DONE (except log volume)
2. **Choose log volume strategy** (Option A, B, or C)
3. **Implement Phase 3 first** - Highest diagnostic value for current prod issue
4. **Test with "Star Wars" style locally** to see what Google returns
5. **Deploy and monitor Vercel logs** for the new diagnostic info
6. **Add remaining phases** incrementally based on what you learn
