# 9. Deployment & Production

## 9.1 Production Build

### Build Process

```bash
cd nextjs-app
npm run build
```

**Build Output:**
```
Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB         92.3 kB
├ ○ /api/generate-headshot
└ ○ /api/health

○  (Static)  prerendered as static content
```

### Build Verification

```bash
# Start production server
npm start

# Test health endpoint
curl http://localhost:3000/api/health

# Test in browser
open http://localhost:3000
```

## 9.2 Vercel Deployment

Morpheo is optimized for **Vercel** deployment with zero configuration.

### Initial Deployment

**Via GitHub:**
1. Push code to GitHub repository
2. Import project in Vercel dashboard
3. Configure environment variables
4. Deploy

**Via Vercel CLI:**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel
```

### Production Environment Variables

In Vercel dashboard, add:

```
GOOGLE_API_KEY=your_production_api_key
```

**Optional (for future features):**
```
KV_REST_API_URL=your_upstash_redis_url
KV_REST_API_TOKEN=your_upstash_redis_token
```

### Deployment Configuration

**File:** `vercel.json` (optional, uses defaults)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

### Automatic Deployments

- **Production:** Push to `main` branch
- **Preview:** Push to feature branches
- **PR Previews:** Automatic preview URLs for pull requests

## 9.3 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_API_KEY` | Google GenAI API key | `AIzaSyD...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGc...` |
| `STRIPE_SECRET_KEY` | Stripe secret key (live) | `sk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (live) | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PRICE_STARTER` | Stripe price ID for Starter package | `price_...` |
| `NEXT_PUBLIC_STRIPE_PRICE_CREATOR` | Stripe price ID for Creator package | `price_...` |
| `NEXT_PUBLIC_STRIPE_PRICE_PRO` | Stripe price ID for Pro package | `price_...` |
| `NEXT_PUBLIC_APP_URL` | Production app URL | `https://morpheo-phi.vercel.app` |

### Optional Variables

| Variable | Description | Usage |
|----------|-------------|-------|
| `KV_REST_API_URL` | Upstash Redis URL | Rate limiting |
| `KV_REST_API_TOKEN` | Upstash Redis token | Rate limiting |

### Environment-Based Configuration

Morpheo uses environment variables to support different configurations for local development (test mode) and production (live mode):

- **Local Development:** Uses test Stripe keys and test price IDs from `.env.local`
- **Production/Preview:** Uses live Stripe keys and production price IDs from Vercel environment variables

**See:** [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for complete production deployment guide.

### Security Best Practices

1. **Never Commit Secrets:** Keep `.env.local` in `.gitignore`
2. **Rotate Keys Regularly:** Update API keys every 90 days
3. **Use Vercel Secrets:** Store sensitive data in Vercel dashboard
4. **Restrict API Keys:** Limit Google API key to specific domains
5. **Separate Test/Live Keys:** Never use production Stripe keys in development
6. **Webhook Security:** Verify webhook signatures using `STRIPE_WEBHOOK_SECRET`

## 9.4 SEO & Social Sharing

Morpheo includes comprehensive Open Graph and Twitter Card metadata for optimal social sharing experiences.

### Metadata Configuration

**File:** `nextjs-app/src/app/layout.js`

```javascript
export const metadata = {
  title: "Morpheo - AI Photobooth",
  description: "Transform your photos with AI-powered creative filters",
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/logo.svg',
    shortcut: '/logo.svg',
  },
  openGraph: {
    title: "Morpheo - AI Photobooth",
    description: "Transform your photos with AI-powered creative filters",
    url: 'https://morpheo-phi.vercel.app',
    siteName: 'Morpheo',
    images: [
      {
        url: 'https://morpheo-phi.vercel.app/logo.svg',
        width: 1200,
        height: 630,
        alt: 'Morpheo Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Morpheo - AI Photobooth",
    description: "Transform your photos with AI-powered creative filters",
    images: ['https://morpheo-phi.vercel.app/logo.svg'],
  },
};
```

### Social Sharing Features

**Platforms Optimized For:**
- **Notion:** Rich preview cards with logo
- **Slack:** Unfurled links with metadata
- **Discord:** Embedded previews
- **Facebook:** Open Graph integration
- **Twitter/X:** Large image cards
- **LinkedIn:** Professional link previews

**Meta Tags Generated:**
- `og:title` - Page title for social platforms
- `og:description` - Brief description of the app
- `og:image` - Preview image (1200x630px recommended)
- `og:url` - Canonical URL
- `twitter:card` - Twitter card type (large image)
- `twitter:image` - Twitter preview image

### Best Practices

1. **Image Requirements:**
   - Recommended size: 1200x630px (1.91:1 ratio)
   - Format: PNG or JPG preferred over SVG for compatibility
   - Absolute URLs required for external platforms

2. **Testing Social Previews:**
   - [OpenGraph.xyz](https://www.opengraph.xyz/) - Test all platforms
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
   - [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

3. **Cache Invalidation:**
   - Social platforms cache meta tags for 24-48 hours
   - Use validators with cache-busting after updates
   - Notion may require re-pasting the URL

## 9.5 Performance Monitoring

### Vercel Analytics

Morpheo includes `@vercel/analytics` for performance tracking.

**Implementation:**
```javascript
// src/app/layout.js
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

**Metrics Tracked:**
- Page load times
- API response times
- Core Web Vitals (LCP, FID, CLS)
- User interactions

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | < 1.5s | ✅ ~1.2s |
| Largest Contentful Paint | < 2.5s | ✅ ~2.0s |
| Time to Interactive | < 3.0s | ✅ ~2.5s |
| API Generation Time | < 10s | ✅ ~7s |

### Optimization Strategies

1. **Next.js Image Optimization:** Auto-optimized images
2. **Font Optimization:** Next.js font loading
3. **Code Splitting:** Automatic via Next.js
4. **Canvas Optimization:** Device pixel ratio handling
5. **Lazy Loading:** Defer non-critical components

## 9.5 Error Tracking

### Recommended: Sentry Integration

```bash
npm install @sentry/nextjs
```

**Configuration:**
```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

**Error Boundaries:**
```jsx
import { ErrorBoundary } from '@sentry/nextjs'

<ErrorBoundary fallback={<ErrorScreen />}>
  <App />
</ErrorBoundary>
```

## 9.6 Backup & Recovery

### Database (Future)
Currently no database. When implemented:
- Daily automated backups
- Point-in-time recovery
- Backup retention: 30 days

### Git Repository
- Protected main branch
- Required PR reviews
- Automated backups via GitHub

### Vercel Deployments
- Automatic deployment history
- One-click rollback to previous version
- Deployment logs retained for 30 days
