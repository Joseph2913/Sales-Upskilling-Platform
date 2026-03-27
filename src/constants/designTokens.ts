// Design tokens — reference: docs/DESIGN_SYSTEM.md

export const colors = {
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
} as const;

export const objectiveAccents = {
  1: { accent: '#38B2AC', accentDark: '#2C9A94', accentLight: '#E6FFFA' },  // Consultative Selling
  2: { accent: '#4299E1', accentDark: '#3182CE', accentLight: '#EBF8FF' },  // Selling Strategies
  3: { accent: '#9F7AEA', accentDark: '#805AD5', accentLight: '#FAF5FF' },  // Objection Handling
  4: { accent: '#ED8936', accentDark: '#DD6B20', accentLight: '#FFFAF0' },  // Account Management
  5: { accent: '#48BB78', accentDark: '#38A169', accentLight: '#F0FFF4' },  // Change Management
  6: { accent: '#FC8181', accentDark: '#E53E3E', accentLight: '#FFF5F5' },  // Data-Driven Sales
} as const;

export const fonts = {
  heading: "'DM Sans', sans-serif",
  body: "'Plus Jakarta Sans', sans-serif",
} as const;

export const fontSizes = {
  xs: 12,
  sm: 13,
  base: 14,
  md: 16,
  lg: 18,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

export const spacing = {
  tight: 4,
  compact: 8,
  standard: 12,
  comfortable: 16,
  spacious: 20,
  section: 24,
  sectionLg: 32,
  pagePadding: 40,
} as const;

export const layout = {
  sidebarCollapsed: 60,
  sidebarExpanded: 240,
  topBarHeight: 54,
  contentMaxWidth: 1100,
} as const;

export const cardStyle: React.CSSProperties = {
  background: colors.white,
  border: `1px solid ${colors.border}`,
  borderRadius: 12,
  padding: 24,
};

export const buttonPrimary: React.CSSProperties = {
  background: colors.teal,
  color: colors.white,
  border: 'none',
  borderRadius: 8,
  padding: '10px 20px',
  fontFamily: fonts.body,
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
};

export const buttonSecondary: React.CSSProperties = {
  background: 'transparent',
  color: colors.teal,
  border: `1px solid ${colors.teal}`,
  borderRadius: 8,
  padding: '10px 20px',
  fontFamily: fonts.body,
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
};

export const buttonGhost: React.CSSProperties = {
  background: 'transparent',
  color: colors.light,
  border: 'none',
  padding: '8px 12px',
  fontFamily: fonts.body,
  fontWeight: 500,
  fontSize: 14,
  cursor: 'pointer',
};
