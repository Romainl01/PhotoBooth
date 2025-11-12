# Component Patterns & Standards

This document defines the standard patterns and sizing conventions for Morpheo components.

## Icon Components

### Standard Pattern
All icon components follow this structure:

```jsx
import SkeuomorphicCircleButton from '../ui/SkeuomorphicCircleButton'
import { IconName } from 'lucide-react' // Always use lucide-react

export default function IconNameIcon({ className = '' }) {
  return (
    <SkeuomorphicCircleButton
      diameter={64}
      gradientId="unique-gradient-id"
      className={className}
    >
      <foreignObject x="20" y="20" width="24" height="24">
        <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: '24px', height: '24px' }}>
          <IconName className="w-6 h-6 text-white" strokeWidth={2} />
        </div>
      </foreignObject>
    </SkeuomorphicCircleButton>
  )
}
```

**Rules:**
- ✅ Use lucide-react icons (we already have this dependency)
- ✅ Wrap in SkeuomorphicCircleButton (diameter: 64px)
- ✅ foreignObject at x="20" y="20" to center icon
- ❌ Don't create custom SVG paths
- ❌ Don't import raw SVG files unless absolutely necessary

**Examples:**
- ✅ SettingsIcon.jsx - Uses lucide-react `Settings`
- ✅ InfoIcon.jsx - Uses SVG paths (info icon not in lucide)
- ✅ UploadIcon.jsx - Uses lucide-react `Upload`

## Button Sizing Standards

### Core Button Dimensions

All buttons in Morpheo use these standardized sizes:

| Button Type | Width | Height | Use Case |
|------------|-------|--------|----------|
| **Primary Action** | 334px | 56px | Retry, Continue with Google, Settings drawer buttons |
| **Icon Button (Main)** | 88px | 88px | Capture button |
| **Icon Button (Secondary)** | 64px | 64px | Upload, Settings, Switch Camera |
| **Icon Button (Nav)** | 48px | 48px | Close button, Filter arrows |

### SkeuomorphicRectButton Usage

**Standard Implementation:**
```jsx
<div className="w-full max-w-[334px] h-[56px]">
  <SkeuomorphicRectButton
    width={334}
    height={56}
    gradientId="unique-gradient-id"
    onClick={handleClick}
    className="w-full"
  >
    <span className="font-ibm-plex-mono font-medium text-base text-white">
      Button Text
    </span>
  </SkeuomorphicRectButton>
</div>
```

**Why this pattern?**
- Wrapper div: `w-full max-w-[334px] h-[56px]` constrains size and makes responsive
- SVG props: `width={334} height={56}` defines SVG viewBox
- SVG className: `w-full` allows responsive scaling within wrapper

**Rules:**
- ✅ Always wrap SkeuomorphicRectButton in a constraining div
- ✅ Use `max-w-[334px]` not fixed `w-[334px]` for responsiveness
- ✅ Height is always fixed: `h-[56px]`
- ❌ Don't let SVG scale beyond design specs
- ❌ Don't use different heights for primary buttons

### Reference Components

Before creating new buttons, check these examples:
- **RetryButton.jsx** - Standard 334x56 pattern
- **Continue with Google** in SignInLayout.jsx - OAuth button pattern
- **SettingsDrawer.jsx** - Multiple buttons with correct sizing

## Font Standards

### Font Stack

| Font Family | CSS Variable | Tailwind Class | Usage |
|------------|--------------|----------------|-------|
| Crimson Pro | `--font-crimson-pro` | `font-crimson-pro` | Section headings |
| IBM Plex Mono | `--font-ibm-plex-mono` | `font-ibm-plex-mono` | Body text, buttons |
| DM Mono | `--font-dm-mono` | `font-dm-mono` | Credit badge, monospace data |

**Adding New Fonts:**
1. Import in `layout.js` from `next/font/google`
2. Add variable to body className
3. **Add to tailwind.config.js fontFamily** ⚠️ (Most commonly forgotten step)

## Pre-Flight Checklist

Before submitting a PR with new components:

### Icon Components
- [ ] Uses lucide-react or has justification for custom SVG
- [ ] Wrapped in SkeuomorphicCircleButton with diameter={64}
- [ ] Unique gradientId
- [ ] Follows naming convention: `{Name}Icon.jsx`

### Button Components
- [ ] Uses SkeuomorphicRectButton base
- [ ] Wrapped in constraining div: `w-full max-w-[334px] h-[56px]`
- [ ] Height is exactly 56px
- [ ] Uses IBM Plex Mono font for text
- [ ] Unique gradientId

### Font Usage
- [ ] Font imported in layout.js
- [ ] Variable added to body className
- [ ] **Added to tailwind.config.js fontFamily**
- [ ] Tested that className works (e.g., `font-crimson-pro`)

## Common Mistakes

### ❌ Wrong: Custom SVG for standard icons
```jsx
// Don't do this
<svg>
  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
</svg>
```

### ✅ Right: Use lucide-react
```jsx
import { Settings } from 'lucide-react'
<Settings className="w-6 h-6 text-white" strokeWidth={2} />
```

---

### ❌ Wrong: Button without wrapper
```jsx
<SkeuomorphicRectButton width={334} height={56}>
  Button
</SkeuomorphicRectButton>
```

### ✅ Right: With constraining wrapper
```jsx
<div className="w-full max-w-[334px] h-[56px]">
  <SkeuomorphicRectButton width={334} height={56} className="w-full">
    Button
  </SkeuomorphicRectButton>
</div>
```

---

### ❌ Wrong: Font without Tailwind config
```jsx
// tailwind.config.js - missing entry
fontFamily: {
  mono: ['var(--font-ibm-plex-mono)'],
  // Crimson Pro not added!
}
```

### ✅ Right: Font in config
```jsx
fontFamily: {
  mono: ['var(--font-ibm-plex-mono)'],
  'crimson-pro': ['var(--font-crimson-pro)', 'serif'],
}
```
