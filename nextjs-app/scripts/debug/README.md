# Debug & Testing Scripts

Utility scripts for debugging and testing the Morpheo credit system.

## Available Scripts

### `check-db-state.mjs`
Displays current database state including credits, transactions, and packages.

**Usage:**
```bash
cd nextjs-app
node scripts/debug/check-db-state.mjs
```

**Output:**
- ✅ Tables existence check
- 👥 User profiles with credit counts
- 💰 Recent credit transactions
- 🎁 Available credit packages

**When to use:**
- After a purchase to verify credits were added
- When debugging credit issues
- To quickly check your current credit balance

---

### `test-webhook.mjs`
Tests the Stripe webhook endpoint directly (bypasses Stripe CLI).

**Usage:**
```bash
cd nextjs-app
node scripts/debug/test-webhook.mjs
```

**What it does:**
- Creates a mock Stripe webhook event
- Sends it to your local webhook endpoint
- Shows if credits were added

**Note:** This will fail signature verification (expected), but helps test if the endpoint is accessible.

---

## Requirements

Both scripts require:
- `.env.local` with Supabase credentials
- `npm install` completed (requires @supabase/supabase-js)
- Next.js dev server running on port 3003 (for test-webhook.mjs)
