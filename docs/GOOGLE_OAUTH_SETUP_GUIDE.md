# Google OAuth Setup Guide for Supabase

## Overview
This guide walks you through configuring Google OAuth in your Supabase dashboard to enable "Continue with Google" authentication in Morpheo.

**Time Required:** ~10 minutes
**Prerequisites:**
- Supabase project (already set up)
- Google Cloud Console access (or ability to create account)

---

## Step 1: Get Google OAuth Credentials

### 1.1 Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account
3. Create a new project or select existing project

### 1.2 Enable Google+ API
1. In the sidebar, go to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click on it and press **Enable**

### 1.3 Create OAuth Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen first:
   - **User Type:** External (unless you have Google Workspace)
   - **App name:** Morpheo
   - **User support email:** Your email
   - **Developer contact:** Your email
   - Click **Save and Continue**
   - Skip **Scopes** (click Save and Continue)
   - Skip **Test users** (click Save and Continue)
   - Click **Back to Dashboard**

4. Return to **Credentials** > **+ CREATE CREDENTIALS** > **OAuth client ID**
5. **Application type:** Web application
6. **Name:** Morpheo Web Client
7. **Authorized JavaScript origins:**
   ```
   http://localhost:3001
   https://fzkpkpemufqocvzvubfg.supabase.co
   ```
8. **Authorized redirect URIs:**
   ```
   http://localhost:3001/auth/callback
   https://fzkpkpemufqocvzvubfg.supabase.co/auth/v1/callback
   ```

   **Note:** Replace `fzkpkpemufqocvzvubfg` with your actual Supabase project reference ID

9. Click **CREATE**
10. **Copy your credentials:**
    - **Client ID:** `AIzaSy...` (something like this)
    - **Client Secret:** `GOCSPX-...` (something like this)

    **⚠️ IMPORTANT:** Keep these secret! Don't commit them to GitHub.

---

## Step 2: Configure Supabase Dashboard

### 2.1 Open Supabase Authentication Settings
1. Go to your Supabase project: https://supabase.com/dashboard/project/fzkpkpemufqocvzvubfg
2. In the sidebar, click **Authentication**
3. Click **Providers** tab

### 2.2 Enable Google Provider
1. Find **Google** in the provider list
2. Toggle it **ON** (switch to enabled)
3. Enter your Google credentials:
   - **Client ID:** Paste from Step 1.3 (step 10)
   - **Client Secret:** Paste from Step 1.3 (step 10)
4. Leave **Skip nonce checks** unchecked (default)
5. Click **Save**

### 2.3 Configure Site URL and Redirect URLs
1. In the sidebar, go to **Authentication** > **URL Configuration**
2. Set **Site URL:**
   ```
   http://localhost:3001
   ```
   (Change to your production URL when deploying)

3. Set **Redirect URLs** (add both):
   ```
   http://localhost:3001/auth/callback
   http://localhost:3001/**
   ```

4. Click **Save**

---

## Step 3: Update Google Cloud Console with Supabase Callback

### 3.1 Get Supabase OAuth Callback URL
Your Supabase OAuth callback URL is:
```
https://fzkpkpemufqocvzvubfg.supabase.co/auth/v1/callback
```

### 3.2 Add to Google Cloud Console
1. Return to Google Cloud Console: https://console.cloud.google.com/
2. Go to **APIs & Services** > **Credentials**
3. Click on your **OAuth 2.0 Client ID** (created in Step 1.3)
4. Under **Authorized redirect URIs**, ensure you have:
   ```
   http://localhost:3001/auth/callback
   https://fzkpkpemufqocvzvubfg.supabase.co/auth/v1/callback
   ```
5. Click **Save**

---

## Step 4: Test Authentication Flow

### 4.1 Start Your Development Server
```bash
cd nextjs-app
npm run dev
```

### 4.2 Test Sign-In Flow
1. Open browser to: http://localhost:3001/sign-in
2. Click **"Continue with Google"** button
3. You should be redirected to Google OAuth consent screen
4. Select your Google account
5. Grant permissions
6. You should be redirected back to: http://localhost:3001/ (camera page)

### 4.3 Verify Session
1. Open browser DevTools (F12)
2. Go to **Application** tab > **Cookies**
3. You should see cookies like:
   - `sb-fzkpkpemufqocvzvubfg-auth-token`
   - `sb-fzkpkpemufqocvzvubfg-auth-token.0`
   - etc.

### 4.4 Check Supabase Dashboard
1. Go to **Authentication** > **Users** in Supabase
2. You should see your Google account listed
3. Email, provider (google), and created timestamp visible

---

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Cause:** Google redirect URI doesn't match what's in Google Cloud Console

**Fix:**
1. Check the error message for the exact redirect URI being used
2. Add that exact URI to Google Cloud Console **Authorized redirect URIs**
3. Make sure there are no typos, trailing slashes, or http vs https mismatches

### Error: "Error 400: invalid_request"
**Cause:** OAuth consent screen not configured properly

**Fix:**
1. Go to Google Cloud Console > **APIs & Services** > **OAuth consent screen**
2. Complete all required fields (app name, support email, etc.)
3. Add your email as a test user if app is in testing mode

### Error: "auth_failed" in URL after redirect
**Cause:** Supabase couldn't exchange code for session

**Fix:**
1. Check Supabase logs: **Logs** > **Auth Logs**
2. Verify Client ID and Secret are correct in Supabase
3. Ensure Google+ API is enabled in Google Cloud Console

### Sign-in button does nothing
**Cause:** JavaScript error or Supabase client misconfigured

**Fix:**
1. Open browser console (F12) and check for errors
2. Verify environment variables are loaded:
   ```js
   console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
   console.log(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
   ```
3. Restart dev server if you just added .env.local

### Redirects to /sign-in after successful OAuth
**Cause:** Session not being set properly

**Fix:**
1. Check middleware is running (add console.log to middleware.js)
2. Verify cookies are being set (DevTools > Application > Cookies)
3. Check Supabase Auth logs for session creation

---

## Production Deployment (Vercel)

When deploying to production:

### 1. Update Google Cloud Console
Add your production URLs:
```
Authorized JavaScript origins:
https://your-app.vercel.app

Authorized redirect URIs:
https://your-app.vercel.app/auth/callback
https://fzkpkpemufqocvzvubfg.supabase.co/auth/v1/callback
```

### 2. Update Supabase Site URL
```
Site URL: https://your-app.vercel.app
Redirect URLs: https://your-app.vercel.app/**
```

### 3. Environment Variables in Vercel
Ensure these are set in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (if using server-side features)

---

## Security Best Practices

1. **Never commit secrets to Git:**
   - Keep `.env.local` in `.gitignore`
   - Use Vercel environment variables for production

2. **Rotate credentials if exposed:**
   - Generate new Client Secret in Google Cloud Console
   - Update in Supabase dashboard

3. **Use HTTPS in production:**
   - Vercel automatically provides SSL
   - Ensure all redirect URIs use `https://`

4. **Monitor auth logs:**
   - Check Supabase Auth Logs regularly
   - Set up email alerts for suspicious activity

---

## Summary Checklist

- [ ] Google Cloud project created
- [ ] Google+ API enabled
- [ ] OAuth client ID created with correct redirect URIs
- [ ] Supabase Google provider enabled with credentials
- [ ] Supabase Site URL and Redirect URLs configured
- [ ] Test sign-in flow successful (local)
- [ ] User appears in Supabase Authentication > Users
- [ ] Session persists (cookies visible)
- [ ] Middleware redirects working correctly

**Once all checked → Phase 2 Authentication Complete! 🎉**

---

## Next Steps

After authentication is working:
- [ ] Replace hardcoded stats with real Supabase query
- [ ] Add user profile page
- [ ] Add sign-out functionality
- [ ] Add user session persistence
- [ ] Track user photos in database
