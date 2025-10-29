# Morpheo

**AI-powered creative photo transformation web application**

Transform your photos into themed visual styles instantly using Google's Gemini AI. Morpheo enables you to reimagine yourself in cinematic, artistic, and cultural contexts through a seamless mobile-first interface.

🔗 **Live App:** [morpheo-phi.vercel.app](https://morpheo-phi.vercel.app/)

---

## ✨ Features

- **Live Camera Capture** - Real-time video feed with instant photo capture
- **Photo Upload** - Support for existing photos from device gallery
- **13 Themed Filters** - Curated styles from cinematic to cultural themes
- **AI Generation** - Google Gemini 2.5 Flash image transformation
- **Camera Switching** - Toggle between front/rear cameras (mobile)
- **Watermark Protection** - Automatic branding on shared images
- **Web Share API** - Native mobile sharing to social platforms
- **Error Recovery** - Graceful error handling with retry options

---

## 🎨 Available Filters

### Creative & Cinematic
- **Executive** - Dramatic black & white editorial photography
- **Wes Anderson** - 1960s-70s symmetrical cinematic aesthetic
- **Kill Bill** - Beatrix Kiddo warrior-inspired style
- **Matrix** - Cyberpunk leather aesthetic with digital atmosphere

### Fantasy & Pop Culture
- **Star Wars** - Jedi/Sith robes in galaxy far, far away
- **Harry Potter** - Hogwarts student wizard aesthetic
- **Lord** - Renaissance royal portrait style

### Horror & Halloween
- **Halloween** - Human-like costume character transformation
- **Chucky** - Horror doll costume aesthetic
- **Zombie** - The Walking Dead practical makeup effects

### Fashion & Urban
- **Runway** - High-fashion editorial photography
- **Urban** - Blue-hour street photography aesthetic
- **Marseille** - Olympique de Marseille scooter culture

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18.0.0 or higher
- npm v9.0.0 or higher
- Google Cloud Account (for Gemini API access)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NanoBananaTutorial
   ```

2. **Navigate to Next.js app**
   ```bash
   cd nextjs-app
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

5. **Add your Google API key**

   Edit `.env.local`:
   ```bash
   GOOGLE_API_KEY=your_google_api_key_here
   ```

   Get your API key: [Google AI Studio](https://aistudio.google.com/app/apikey)

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open the app**

   Visit [http://localhost:3000](http://localhost:3000)

### Verify Installation

```bash
# Check API health
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

---

## 🏗️ Tech Stack

**Frontend**
- Next.js 15.5.5
- React 19.1.0
- Tailwind CSS 3.4.18
- HTML5 Canvas API
- MediaDevices Web API

**Backend**
- Next.js API Routes
- Google GenAI SDK (@google/genai 1.25.0)
- Gemini 2.5 Flash Image Model

**Deployment**
- Vercel
- Vercel Analytics

---

## 📱 Mobile Testing

Camera access requires HTTPS in production (localhost HTTP is allowed in development).

### Using ngrok for mobile testing:

```bash
# Install ngrok
npm install -g ngrok

# Start tunnel
ngrok http 3000
```

Access the provided HTTPS URL on your mobile device.

---

## 🏗️ Project Structure

```
nextjs-app/
├── src/
│   ├── app/
│   │   ├── page.js                      # Main entry point
│   │   ├── layout.js                    # Root layout
│   │   └── api/
│   │       ├── health/route.js          # Health check
│   │       └── generate-headshot/route.js  # AI generation API
│   │
│   ├── components/
│   │   ├── screens/                     # Screen components
│   │   ├── ui/                          # UI components
│   │   └── icons/                       # Icon components
│   │
│   ├── constants/
│   │   ├── filters.js                   # Filter names (13)
│   │   └── stylePrompts.js              # AI prompts per filter
│   │
│   └── lib/
│       ├── designTokens.js              # Design system
│       └── watermark.js                 # Watermark utility
│
├── public/                              # Static assets
├── tailwind.config.js                   # Tailwind config
├── next.config.mjs                      # Next.js config
└── package.json                         # Dependencies
```

---

## 🎯 API Reference

### Generate Headshot

**POST** `/api/generate-headshot`

Generates an AI-styled image based on uploaded photo and selected filter.

**Request:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "style": "Executive"
}
```

**Response:**
```json
{
  "success": true,
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
  "style": "Executive"
}
```

### Health Check

**GET** `/api/health`

Returns API status and configuration.

**Response:**
```json
{
  "status": "ok",
  "message": "AI Headshot Studio API is running",
  "apiKeyConfigured": "Yes"
}
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variable: `GOOGLE_API_KEY`
4. Deploy

### Production Build

```bash
npm run build
npm start
```

---

## 📚 Documentation

For comprehensive documentation, see:

- **[MORPHEO_DOCUMENTATION.md](MORPHEO_DOCUMENTATION.md)** - Complete technical documentation
- **[CAMERA_PERMISSION_PLAN.md](CAMERA_PERMISSION_PLAN.md)** - Camera permission implementation plan
- **[PROJECT_LEARNINGS.md](PROJECT_LEARNINGS.md)** - Best practices and patterns

---

## 🎨 Adding a New Filter

1. **Add filter name** to `src/constants/filters.js`:
   ```javascript
   export const FILTERS = [
     'Executive',
     // ... existing filters
     'Your New Filter'
   ]
   ```

2. **Add AI prompt** to `src/constants/stylePrompts.js`:
   ```javascript
   export const STYLE_PROMPTS = {
     'Your New Filter': `
       Create a [style description] portrait...

       Critical: Preserve exact facial features and identity.
     `
   }
   ```

3. **Test the filter:**
   ```bash
   npm run dev
   ```

---

## 👤 Creator

Made with 🫶 by Romain Lagrange

- LinkedIn: [Romain Lagrange](https://www.linkedin.com/in/romain-lagrange1/)
- Support: [Buy Me a Coffee](https://buymeacoffee.com/morpheo)

---

## 🙏 Acknowledgments

- **Google AI** - Gemini API
- **Vercel** - Next.js framework and hosting
- **Tailwind CSS** - Styling framework
- Open source community

---

**Version:** 1.0.0
**Last Updated:** October 29, 2025
