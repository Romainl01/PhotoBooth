# 3. Getting Started

## 3.1 Prerequisites

### Required
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: For version control
- **Google Cloud Account**: For Gemini API access

### Recommended
- **VS Code**: With ESLint and Prettier extensions
- **Modern Browser**: Chrome, Firefox, or Safari
- **HTTPS Development**: Use ngrok or similar for mobile testing

## 3.2 Installation

### 1. Clone Repository
```bash
cd /home/user/PhotoBooth
git status  # Verify you're in the correct directory
```

### 2. Navigate to Next.js App
```bash
cd nextjs-app
```

### 3. Install Dependencies
```bash
npm install
```

Expected output:
```
added 324 packages, and audited 325 packages in 15s
```

### 4. Verify Installation
```bash
npm list --depth=0
```

Should show:
```
nextjs-app@0.1.0
├── @google/genai@1.25.0
├── @vercel/analytics@1.5.0
├── dotenv@17.2.3
├── next@15.5.5
├── react@19.1.0
└── react-dom@19.1.0
```

## 3.3 Configuration

### 1. Create Environment File
```bash
cp .env.example .env.local
```

### 2. Obtain Google API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the generated key

### 3. Configure Environment Variables

Edit `.env.local`:
```bash
# Required
GOOGLE_API_KEY=your_google_api_key_here

# Optional (for future features)
KV_REST_API_URL=your_upstash_redis_url
KV_REST_API_TOKEN=your_upstash_redis_token
```

⚠️ **Security Note:** Never commit `.env.local` to version control. It's already in `.gitignore`.

## 3.4 Development Launch

### Start Development Server
```bash
npm run dev
```

Expected output:
```
   ▲ Next.js 15.5.5
   - Local:        http://localhost:3000
   - Experiments:  turbopack

 ✓ Ready in 2.3s
```

### Access Application
- **Main App**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

### Verify Health
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "AI Headshot Studio API is running",
  "apiKeyConfigured": "Yes"
}
```

## 3.5 Mobile Testing (Optional)

### Using ngrok for HTTPS
```bash
# Install ngrok
npm install -g ngrok

# Start tunnel
ngrok http 3000
```

Access via provided HTTPS URL on mobile device.

⚠️ **Note:** Camera access requires HTTPS in production (localhost HTTP is allowed in dev).

## 3.6 Production Build

### Build Application
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Test Production Build
```bash
curl http://localhost:3000/api/health
```
