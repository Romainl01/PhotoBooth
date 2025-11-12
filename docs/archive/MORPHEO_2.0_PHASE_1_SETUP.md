# Morpheo 2.0 - Phase 1: Authentication Setup
## Your Action Items Checklist

---

## 🎨 Design Needed

You need to design **2 new screens** + **1 UI element**:

### 1. Sign-In Screen (Pre-Camera)
**When shown:** First screen users see (replaces current camera screen for unauthenticated users)

**Required elements:**
- Morpheo logo/branding
- Value prop text (e.g., "Transform your photos with AI")
- **"Sign in with Google" button** (follow Google's brand guidelines)
- Optional: Preview carousel of example transformations
- Optional: "How it works" quick explainer

**Design considerations:**
- Should feel cohesive with current skeumorphic style
- Mobile-first (80% of users)
- Fast load time (minimal assets)

---

### 2. Account/Profile Screen
**When shown:** Accessible from camera screen (new button in UI)

**Required elements:**
- User info display (name, email, profile pic from Google)
- **Credits balance** (large, prominent - e.g., "15 credits remaining")
- **Sign out button**
- Optional: Usage stats (total images generated)
- Optional: "My Images" link (for Phase 3)

**Design considerations:**
- Quick access (modal or slide-in panel, not full screen)
- Credits should be impossible to miss
- Clear visual hierarchy

---

### 3. Credits Display Widget (In-Camera UI)
**Where:** Add to existing camera screen (top-right corner?)

**Required elements:**
- Credits count (e.g., "5 ⚡" or icon + number)
- Tappable to open profile/account screen
- Visual alert when credits low (<3)

**Design considerations:**
- Non-intrusive (don't block camera view)
- Consistent with existing filter selector style
- High contrast for readability

---

## 🛠️ Tools Setup (You Need To Do This)

### 1. Create Supabase Account & Project ✅
**Steps:**
1. Go to [supabase.com](https://supabase.com)
2. Sign up (can use your Google account)
3. Create new project:
   - Choose a **project name** (e.g., "morpheo-prod")
   - Choose a **database password** (save it securely)
   - Choose region closest to your users (EU/US)
   - Select **Free tier**
4. Wait ~2 minutes for provisioning

**What I need from you after setup:** ✅
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
(Found in: Project Settings → API → Project URL and API Keys)

---

### 2. Enable Google OAuth in Supabase ✅
**Steps:**
1. In Supabase Dashboard → Authentication → Providers
2. Enable "Google" provider
3. Supabase will show you **temporary redirect URIs** to use

**You need to create Google OAuth credentials:** ✅
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or use existing
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials:
   - Application type: **Web application**
   - Authorized redirect URIs (copy from Supabase):
     - `https://xxxxx.supabase.co/auth/v1/callback`
5. Copy **Client ID** and **Client Secret**
6. Paste them back into Supabase Google provider settings
7. Save

**What I need from you:** ✅
✅ Confirmation that Google OAuth is enabled in Supabase (just tell me "OAuth configured")

---

### 3. Domain Configuration (For Production) ✅
**For local development:** Works immediately with `localhost:3000`

**For production (morpheo-phi.vercel.app):** ✅
1. In Supabase → Authentication → URL Configuration
2. Add to **Redirect URLs**:
   - `https://morpheo-phi.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for dev)
3. Set **Site URL**: `https://morpheo-phi.vercel.app`

**What I need from you:**
Just confirm: "Production URLs configured"

---

## 📋 Inputs I Need From You

### Before I Start Coding:

#### 1. Environment Variables (from Supabase setup above): ✅
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

#### 2. Design Assets (share Figma links or export):
- [ ] Sign-in screen design
- [ ] Account/profile screen design
- [ ] Credits widget design
- [ ] Any new icons needed

#### 3. Design Decisions:
- [ ] Where should credits widget go in camera UI? (top-right? top-left?)
- [ ] Should sign-in screen show example transformations or be minimal?
- [ ] Account screen: modal overlay or full screen?

#### 4. Business Logic Confirmation:
- [ ] Confirm: New users start with **5 free credits**?
- [ ] Confirm: Each successful generation costs **1 credit**?
- [ ] What happens when user has 0 credits and tries to generate?
  - Block with paywall immediately? ✅ (Recommended)
  - Allow generation, then show paywall after?

---

## 📝 Optional But Helpful

- **Branding**: Any specific Google Sign-In button style preference? (Google provides multiple official variants)
- **Analytics**: Want to track sign-ups? (I can add events for analytics)
- **Error messages**: Any specific tone/voice for error states? (e.g., playful vs. professional)

---

## ⏱️ Timeline Estimate

Once I have the above:
- **Supabase + auth flow code**: 2-3 hours
- **UI integration**: 1-2 hours (depends on design complexity)
- **Testing**: 1 hour
- **Total**: ~1 day of focused work

---

## 🚀 What Happens Next

### Your workflow:
1. ✅ Set up Supabase (15 min)
2. ✅ Configure Google OAuth (10 min)
3. ✅ Design 2 screens + widget (2-4 hours?)
4. ✅ Send me env vars + designs
5. 🚀 I build Phase 1

### My workflow:
1. Install `@supabase/ssr` package
2. Set up Supabase client + middleware
3. Build sign-in screen
4. Build account screen
5. Add credits widget to camera
6. Create `profiles` table with SQL
7. Set up RLS policies
8. Test auth flow end-to-end
9. Deploy to Vercel

---

## ⚠️ Common Gotchas

1. **OAuth Redirect URIs**: One typo = "Invalid redirect" errors. Copy-paste exactly from Supabase.
2. **RLS Policies**: Forgetting to set these = users see empty data or errors.
3. **Environment Variables**: Must be prefixed with `NEXT_PUBLIC_` for client-side access.
4. **Google OAuth Domain Verification**: Required in production but not for localhost.
5. **Session Cookies**: Next.js 15 requires specific middleware setup for SSR.

---

## 📚 Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Next.js 15 + Supabase SSR](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Google Sign-In Branding Guidelines](https://developers.google.com/identity/branding-guidelines)

---

**Ready to start?** Check off the items above and ping me with your Supabase env vars + design specs!