# 8. Best Practices

## 8.1 Critical Development Patterns

These patterns are **essential** for maintaining code quality and consistency. Deviation from these patterns has historically caused bugs and rework.

### Pattern 1: Icon Component Structure

**Rule:** Icons own their complete visual design. Wrapper components only handle sizing and interaction.

**Correct:**
```jsx
// Icon component includes all visual elements
export default function CaptureIcon() {
  return (
    <svg width="88" height="88">
      <circle cx="44" cy="44" r="43" fill="#232323" stroke="#000"/>
      <circle cx="44" cy="44" r="41" fill="none" stroke="url(#grad)"/>
      {/* Icon content */}
    </svg>
  )
}

// Wrapper only handles interaction
<IconButton onClick={handleClick} size="main">
  <CaptureIcon />
</IconButton>
```

**Incorrect:**
```jsx
// ❌ Don't add visual styling in wrapper
<div className="rounded-full border-2 shadow-lg">
  <CaptureIcon />
</div>
```

**Why:** Prevents double-ring effects, maintains consistency, simplifies debugging.

### Pattern 2: Button Reset Styles

**Rule:** All button elements must include comprehensive reset styles.

**Required Styles:**
```jsx
<button className="bg-transparent border-0 outline-none p-0 m-0">
  {/* Button content */}
</button>
```

**Why:**
- Prevents browser default styling
- Essential for mobile Safari compatibility
- Eliminates blue focus rings and tap highlights
- Ensures consistent cross-browser appearance

### Pattern 3: Responsive Design Application

**Rule:** Apply flexbox centering to ALL breakpoints, not just desktop.

**Correct:**
```jsx
<div className="flex items-center justify-center">
  {/* Content centered on all devices */}
</div>
```

**Incorrect:**
```jsx
// ❌ Don't use desktop-only centering
<div className="md:flex md:items-center md:justify-center">
  {/* Content not centered on mobile */}
</div>
```

**Why:** Mobile is primary platform; desktop is enhancement.

### Pattern 4: Component Consistency

**Rule:** Replicate established patterns. Don't invent new structures for similar components.

**Approach:**
1. Identify existing similar component
2. Copy structure and styling approach
3. Modify content, not architecture
4. Verify against design tokens

**Example:**
```jsx
// If UploadIcon exists, model SwitchCameraIcon after it
// Both are secondary action buttons with similar structure
```

### Pattern 5: React Dependency Management

**Rule:** Pure utility functions should be defined at module level, not inside components.

**Correct:**
```jsx
// Module-level pure function (stable reference)
const retryWithBackoff = async (fn, maxRetries = 3) => {
  // Implementation that only uses parameters
}

export function MyComponent() {
  const [data, setData] = useState(null)

  const fetchData = useCallback(async (id) => {
    const result = await retryWithBackoff(async () => {
      // Fetch logic using setData
    })
  }, []) // retryWithBackoff not in deps (stable module reference)

  useEffect(() => {
    fetchData(userId)
  }, [fetchData, userId])
}
```

**Incorrect:**
```jsx
// ❌ Function defined inside component (recreated every render)
export function MyComponent() {
  const [data, setData] = useState(null)

  const retryWithBackoff = async (fn, maxRetries = 3) => {
    // Same implementation
  }

  const fetchData = useCallback(async (id) => {
    const result = await retryWithBackoff(async () => {
      // Fetch logic
    })
  }, [retryWithBackoff]) // Unstable dependency!

  useEffect(() => {
    fetchData(userId)
  }, [fetchData, userId]) // Effect runs every render → infinite loop
}
```

**Why:**
- Functions defined inside components get new references every render
- Including them in dependency arrays causes effects/callbacks to recreate
- This creates infinite loops: render → new function → effect runs → setState → render
- Pure functions (no component state/props) should live at module level
- **Real impact:** 10-20x database queries per page load → 1 query (95% reduction)

**Identification Checklist:**
- ✅ Function uses only its parameters → move to module level
- ✅ Function uses browser APIs only (setTimeout, console) → module level
- ❌ Function uses component state (setState) → keep in component with useCallback
- ❌ Function uses props → keep in component with useCallback

## 8.2 Common Pitfalls

### Pitfall 1: Wrapper Div Proliferation

**Problem:** Adding unnecessary wrapper divs for styling.

**Solution:** Use existing structure or extend component properly.

```jsx
// ❌ Bad: Extra wrapper
<div className="flex justify-center">
  <div className="rounded-full">
    <IconButton>
      <Icon />
    </IconButton>
  </div>
</div>

// ✅ Good: Minimal structure
<IconButton>
  <Icon />
</IconButton>
```

### Pitfall 2: Inline Styles

**Problem:** Using inline styles instead of design tokens.

**Solution:** Always use design tokens via Tailwind classes.

```jsx
// ❌ Bad: Inline styles
<button style={{ backgroundColor: '#232323', borderRadius: '16px' }}>
  Click
</button>

// ✅ Good: Design tokens
<button className="bg-button-bg rounded-2xl">
  Click
</button>
```

### Pitfall 3: Inconsistent State Management

**Problem:** Managing similar state in different ways.

**Solution:** Use consistent patterns across components.

```jsx
// ✅ Good: Consistent useState pattern
const [currentScreen, setCurrentScreen] = useState(SCREENS.CAMERA)
const [currentFilterIndex, setCurrentFilterIndex] = useState(0)

// ❌ Bad: Mixing state management approaches
const [currentScreen, setCurrentScreen] = useState(SCREENS.CAMERA)
let filterIndex = 0  // Don't mix let with useState
```

### Pitfall 4: Forgetting Mobile Testing

**Problem:** Testing only on desktop during development.

**Solution:** Test on mobile device regularly, especially for camera features.

**Testing Checklist:**
- [ ] Camera access on mobile
- [ ] Touch interactions
- [ ] Screen rotations
- [ ] Share functionality
- [ ] Upload from gallery

## 8.3 Pre-Development Checklist

Before implementing any new feature, verify:

### Design Review
- [ ] Design tokens identified (colors, spacing, fonts)
- [ ] Existing similar components reviewed
- [ ] Responsive breakpoints planned
- [ ] Mobile-first approach confirmed

### Component Planning
- [ ] Component hierarchy sketched
- [ ] State management planned
- [ ] Props interface defined
- [ ] Reusable patterns identified

### Implementation Standards
- [ ] Button reset styles planned
- [ ] Icon visual ownership clarified
- [ ] Accessibility attributes identified
- [ ] Error handling approach defined

### Testing Strategy
- [ ] Desktop testing plan
- [ ] Mobile testing plan
- [ ] Error scenarios identified
- [ ] Performance considerations noted

## 8.4 Code Review Standards

### Reviewer Checklist

**Design System Compliance:**
- [ ] Uses design tokens (no magic numbers)
- [ ] Follows skeumorphic patterns
- [ ] Consistent with existing components
- [ ] Responsive design applied correctly

**Code Quality:**
- [ ] No unnecessary wrapper divs
- [ ] Button reset styles present
- [ ] Proper state management
- [ ] Error handling implemented

**Performance:**
- [ ] No unnecessary re-renders
- [ ] Proper cleanup (useEffect returns)
- [ ] Canvas memory management
- [ ] Blob URL revocation

**Accessibility:**
- [ ] Semantic HTML used
- [ ] ARIA labels on icon buttons
- [ ] Focus states visible
- [ ] Touch targets ≥ 44px

## 8.5 Git Commit Standards

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build process or auxiliary tool changes

**Examples:**
```bash
feat(filters): add Halloween themed filter

docs(readme): update setup instructions

fix(camera): resolve mobile Safari permission issue

refactor(watermark): improve performance with canvas optimization
```
