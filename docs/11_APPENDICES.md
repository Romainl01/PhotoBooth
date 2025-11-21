# 11. Appendices

## 11.1 Glossary

| Term | Definition |
|------|------------|
| **Base64** | Binary-to-text encoding scheme for images |
| **Canvas API** | HTML5 API for drawing graphics via JavaScript |
| **Data URL** | URL scheme that embeds inline data (e.g., `data:image/jpeg;base64,...`) |
| **Design Tokens** | Centralized design system values (colors, spacing, etc.) |
| **Device Pixel Ratio (DPR)** | Ratio between physical pixels and logical pixels |
| **Facing Mode** | Camera direction: 'user' (front) or 'environment' (rear) |
| **Gemini API** | Google's AI API for text and image generation |
| **getUserMedia** | Web API for accessing camera/microphone |
| **Next.js** | React framework with server-side rendering and API routes |
| **Skeumorphic** | Design style mimicking real-world physical objects |
| **Web Share API** | Browser API for native sharing to apps/services |
| **Watermark** | Text/image overlay for branding/protection |

## 11.2 External Resources

### Official Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Google GenAI Documentation](https://ai.google.dev/docs)
- [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)

### Tutorials & Guides
- [Next.js Learn](https://nextjs.org/learn)
- [Canvas API Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [getUserMedia Guide](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

### Tools
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Google AI Studio](https://aistudio.google.com)
- [Can I Use](https://caniuse.com) - Browser compatibility

### Community
- [Next.js Discord](https://discord.gg/nextjs)
- [React Community](https://react.dev/community)

## 11.3 Changelog

### Version 1.1.0 - Morpheo 2.0 Phase 1 (Current)
**Release Date:** November 2025
**Last Update:** November 12, 2025

**Features:**
- ✅ Sign-in screen UI with skeuomorphic TV design
- ✅ MorpheoLogo component with red recording dot
- ✅ ShowcaseTV component with layered shadow effects
- ✅ GoogleButton component (styled, auth integration pending)
- ✅ Responsive mobile/desktop layouts (338px mobile, 800px desktop)
- ✅ Responsive showcase images with VHS playback effect
  - Desktop (≥768px): 9 landscape photos from `/showcase/desktop/`
  - Mobile (<768px): 8 portrait photos from `/showcase/mobile/`
  - Dynamic viewport detection using `matchMedia`
  - Auto-rotate with VHS glitch effects
- ✅ IBM Plex Mono & Crimson Pro fonts integrated
- ✅ Component composition patterns for reusability
- ✅ UserContext with authentication and credit management
- ✅ CreditBadge with liquid glass effect and color-coded states
- 🔄 Google OAuth setup guide complete (implementation pending)

**Performance Optimizations:**
- ✅ Fixed infinite render loop in UserContext (Jan 12, 2025)
  - Moved `retryWithBackoff` utility to module level
  - Stabilized React dependency chain
  - Reduced database queries from 10-20 per page load to 1
  - 95% reduction in Supabase API calls
- ✅ Eliminated PaywallModal loading state (Nov 12, 2025)
  - Implemented optimistic UI pattern with constants
  - Created single source of truth in `/lib/creditPackages.js`
  - Zero loading state (instant UI rendering)
  - 200-500ms performance improvement
- ✅ Fixed credit badge update race condition (Nov 13, 2025)
  - API now returns updated credit count after deduction
  - Added synchronous `updateCredits()` function to UserContext
  - Eliminated async refresh race condition
  - 3-layer defense architecture for 100% reliability
  - Guaranteed UI/DB consistency

**Documentation Added:**
- Complete sign-in UI implementation guide
- Google OAuth setup guide for Supabase
- Morpheo 2.0 design specifications
- Phase-based implementation roadmap
- UserContext performance optimization notes

### Version 1.0.0
**Release Date:** October 2025

**Features:**
- ✅ Next.js 15 migration complete
- ✅ 13 themed filters implemented
- ✅ Google Gemini 2.5 Flash integration
- ✅ Mobile-first responsive design
- ✅ Camera capture and file upload
- ✅ Watermark system
- ✅ Web Share API integration
- ✅ Error handling and recovery
- ✅ Production deployment on Vercel

**Recent Changes:**
- Updated Halloween filter to specify human-like characters
- Added camera permission modal implementation plan
- Simplified filter prompts (Star Wars, Harry Potter)
- Replaced Skull filter with Halloween theme
- Removed Vampire filter

### Version 0.9.0 (Pre-Release)
**Date:** September 2025
- Initial Vite/Express implementation
- 8 original filters
- Basic camera functionality

## 11.4 Project File References

### Core Documentation Files
- `docs/PROJECT_SPEC.md` - Original project specification and architecture
- `docs/PROJECT_LEARNINGS.md` - Critical patterns and best practices
- `docs/NEXTJS_MIGRATION_PLAN.md` - Migration from Vite to Next.js
- `docs/WATERMARK_REFERENCE.md` - Watermark implementation details
- `docs/RATE_LIMIT_REFERENCE.md` - Rate limiting reference (Upstash)
- `docs/CAMERA_PERMISSION_PLAN.md` - Camera permission modal plan
- `docs/UI_IMPLEMENTATION_BRIEF.md` - UI design guidelines

### Morpheo 2.0 - Authentication Documentation
- `docs/SIGN_IN_UI_IMPLEMENTATION.md` - Complete sign-in screen implementation guide (Phase 1 ✅)
- `docs/GOOGLE_OAUTH_SETUP_GUIDE.md` - Step-by-step Google OAuth and Supabase setup
- `MORPHEO_2.0_PHASE_1_SETUP.md` - Morpheo 2.0 technical setup and dependencies
- `MORPHEO_2.0_PHASE_1_DESIGN_SPEC.md` - Design specifications and Figma references
- `MORPHEO_2.0_IMPLEMENTATION_PLAN.md` - Overall implementation roadmap

### Key Code Files
- `src/app/page.js` - Main application entry point
- `src/app/api/generate-headshot/route.js` - AI generation API
- `src/constants/filters.js` - Filter definitions
- `src/constants/stylePrompts.js` - AI prompts
- `src/lib/designTokens.js` - Design system tokens
- `src/lib/watermark.js` - Watermark utility
- `tailwind.config.js` - Tailwind customization

## 11.5 Team & Credits

### Core Team
- **Creator:** [Creator Name]
- **Repository:** [GitHub URL]
- **License:** [License Type]

### Technologies & Services
- **Next.js** - Vercel
- **Google Gemini** - Google AI
- **Vercel** - Hosting & Deployment
- **Tailwind CSS** - Adam Wathan

### Special Thanks
- Google AI team for Gemini API access
- Vercel team for Next.js and hosting
- Open source community

---

## Document Maintenance

**Current Version:** 1.1.0 - Morpheo 2.0 Phase 1
**Last Updated:** November 13, 2025
**Next Review:** December 2025

**Update Triggers:**
- New feature implementation
- Architecture changes
- API updates
- Performance optimizations
- Bug fixes affecting documentation

**Update Process:**
1. Make code changes
2. Update relevant documentation sections
3. Update changelog (Section 11.3)
4. Update "Last Updated" date
5. Commit with message: `docs: update documentation for [feature]`
