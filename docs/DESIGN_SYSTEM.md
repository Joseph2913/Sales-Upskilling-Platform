# Design System

## Colour Tokens

All colours referenced by token name in code comments. Never hard-code hex values without noting the token.

```ts
const colors = {
  // Primary
  navy: '#1A202C',        // sidebar bg, headings, dark text
  navyMid: '#2D3748',     // secondary dark elements, sidebar hover
  teal: '#38B2AC',        // primary CTA, active states, progress fills
  tealDark: '#2C9A94',    // teal hover/pressed state
  tealLight: '#E6FFFA',   // active tint backgrounds, selected states
  mint: '#A8F0E0',        // badges, accents, success highlights

  // Neutrals
  border: '#E2E8F0',      // all card borders (1px solid), dividers
  bg: '#F7FAFC',          // page background
  white: '#FFFFFF',       // card backgrounds, topbar
  body: '#4A5568',        // body copy
  light: '#718096',       // secondary text, labels
  muted: '#A0AEC0',       // placeholders, disabled states

  // Feedback
  success: '#38A169',     // passed, complete
  warning: '#D69E2E',     // needs attention
  error: '#E53E3E',       // failed, error states
}
```

## Objective Accent System

Each of the 6 sales objectives has an accent triplet used for badges, borders, progress rings, and active states within that objective's context.

```ts
const objectiveAccents = {
  1: { accent: '#38B2AC', accentDark: '#2C9A94', accentLight: '#E6FFFA' },  // Consultative Selling
  2: { accent: '#4299E1', accentDark: '#3182CE', accentLight: '#EBF8FF' },  // Selling Strategies
  3: { accent: '#9F7AEA', accentDark: '#805AD5', accentLight: '#FAF5FF' },  // Objection Handling
  4: { accent: '#ED8936', accentDark: '#DD6B20', accentLight: '#FFFAF0' },  // Account Management
  5: { accent: '#48BB78', accentDark: '#38A169', accentLight: '#F0FFF4' },  // Change Management
  6: { accent: '#FC8181', accentDark: '#E53E3E', accentLight: '#FFF5F5' },  // Data-Driven Sales
}
```

## Typography

Both fonts loaded via Google Fonts `@import` at the App component level (not per-component).

### DM Sans (headings, nav, labels)
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extra-bold)
- Usage: page titles (24px/700), section headers (18px/600), sidebar nav items (14px/500), card titles (16px/600), badges/tags (12px/600)

### Plus Jakarta Sans (body, buttons, captions)
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Usage: body text (14px/400), button labels (14px/600), form inputs (14px/400), captions (12px/400), table cells (13px/400)

### Heading Accent Pattern
Key words in headings get a teal underline (not coloured text). Implemented via `<span>` with `borderBottom: '2px solid #38B2AC'` and `paddingBottom: '2px'`.

## Spacing Scale

```
4px   — tight (icon gaps, badge padding-x)
8px   — compact (between inline elements)
12px  — standard (card padding-y, form field gap)
16px  — comfortable (between card sections)
20px  — spacious (between major sections)
24px  — section gap
32px  — page section gap
40px  — horizontal page padding
```

## Card Pattern

The standard content container used everywhere:

```ts
const cardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: 12,
  padding: 24,
  // No box-shadow by default. Add on hover if interactive:
  // boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
}
```

## Button Patterns

### Primary (teal)
```ts
{ background: '#38B2AC', color: '#FFFFFF', border: 'none', borderRadius: 8,
  padding: '10px 20px', fontFamily: 'Plus Jakarta Sans', fontWeight: 600, fontSize: 14,
  cursor: 'pointer' }
// Hover: background → '#2C9A94'
```

### Secondary (outline)
```ts
{ background: 'transparent', color: '#38B2AC', border: '1px solid #38B2AC',
  borderRadius: 8, padding: '10px 20px', fontFamily: 'Plus Jakarta Sans',
  fontWeight: 600, fontSize: 14, cursor: 'pointer' }
// Hover: background → '#E6FFFA'
```

### Ghost (text only)
```ts
{ background: 'transparent', color: '#718096', border: 'none', padding: '8px 12px',
  fontFamily: 'Plus Jakarta Sans', fontWeight: 500, fontSize: 14, cursor: 'pointer' }
// Hover: color → '#4A5568', background → '#F7FAFC'
```

## Animations

### fadeSlideUp (page/card entrance)
```ts
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
// Usage: animation: 'fadeSlideUp 0.3s ease-out'
```

### skeletonPulse (loading placeholder)
```ts
@keyframes skeletonPulse {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.25; }
}
// Usage: animation: 'skeletonPulse 1.5s ease-in-out infinite'
```

## Icons
Lucide React (`lucide-react` package). 20px default size. Stroke width 1.5. Colour matches adjacent text unless used as a status indicator.

## Responsive Behaviour
Desktop-first. Minimum supported width: 1024px. Sidebar collapses to icon-only (60px) on narrow viewports. Content area adjusts `marginLeft` accordingly. No mobile breakpoints in initial build.
