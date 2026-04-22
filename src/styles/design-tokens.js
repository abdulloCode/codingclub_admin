/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS SYSTEM
   Centralized design tokens for consistent styling across the app
──────────────────────────────────────────────────────────── */

/* ─── COLORS ───────────────────────────────────────────────── */
export const colors = {
  /* Brand Colors */
  brand: {
    primary: '#427A43',
    secondary: '#5a9e5b',
    dark: '#2d5630',
    light: '#7dc382',
    gradient: 'linear-gradient(135deg, #427A43 0%, #5a9e5b 100%)',
    gradientDark: 'linear-gradient(135deg, #2d5630 0%, #427A43 100%)',
  },

  /* Accent Colors */
  accent: {
    purple: '#8b5cf6',
    blue: '#3b82f6',
    cyan: '#06b6d4',
    pink: '#ec4899',
    orange: '#f97316',
  },

  /* Semantic Colors */
  semantic: {
    success: '#22c55e',
    successLight: '#4ade80',
    successDark: '#16a34a',
    warning: '#f59e0b',
    warningLight: '#fbbf24',
    warningDark: '#d97706',
    error: '#ef4444',
    errorLight: '#f87171',
    errorDark: '#dc2626',
    info: '#3b82f6',
    infoLight: '#60a5fa',
    infoDark: '#2563eb',
  },

  /* Neutral Colors - Dark Theme */
  dark: {
    background: '#0a0a0c',
    backgroundSecondary: '#0f0f12',
    backgroundTertiary: '#141419',
    card: '#141419',
    cardHover: '#1a1a1f',
    cardActive: '#1f1f26',
    border: 'rgba(255, 255, 255, 0.06)',
    borderHover: 'rgba(255, 255, 255, 0.10)',
    borderFocus: 'rgba(255, 255, 255, 0.15)',
    text: '#f4f4f5',
    textSecondary: '#a1a1aa',
    textTertiary: '#71717a',
    textInverse: '#0a0a0c',
    overlay: 'rgba(0, 0, 0, 0.5)',
    glass: 'rgba(20, 20, 25, 0.8)',
  },

  /* Neutral Colors - Light Theme */
  light: {
    background: '#f8fafc',
    backgroundSecondary: '#f1f5f9',
    backgroundTertiary: '#e2e8f0',
    card: '#ffffff',
    cardHover: '#f8fafc',
    cardActive: '#f1f5f9',
    border: 'rgba(0, 0, 0, 0.06)',
    borderHover: 'rgba(0, 0, 0, 0.10)',
    borderFocus: 'rgba(0, 0, 0, 0.15)',
    text: '#0f172a',
    textSecondary: '#475569',
    textTertiary: '#94a3b8',
    textInverse: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.3)',
    glass: 'rgba(255, 255, 255, 0.8)',
  },
};

/* ─── TYPOGRAPHY ─────────────────────────────────────────────── */
export const typography = {
  /* Font Families */
  fontFamily: {
    sans: "'Plus Jakarta Sans', 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
    display: "'Plus Jakarta Sans', sans-serif",
  },

  /* Font Sizes */
  fontSize: {
    xs: '11px',
    sm: '12px',
    base: '14px',
    md: '15px',
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '24px',
    '4xl': '28px',
    '5xl': '32px',
    '6xl': '40px',
    '7xl': '48px',
  },

  /* Font Weights */
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  /* Line Heights */
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  /* Letter Spacing */
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
    wider: '0.05em',
  },
};

/* ─── SPACING ────────────────────────────────────────────────── */
export const spacing = {
  /* Base spacing unit */
  unit: 4,

  /* Spacing scale */
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
  40: '160px',
  48: '192px',
  56: '224px',
  64: '256px',
};

/* ─── BORDER RADIUS ──────────────────────────────────────────── */
export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
  full: '9999px',
};

/* ─── SHADOWS ────────────────────────────────────────────────── */
export const shadows = {
  /* Elevation-based shadows */
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  /* Colored shadows */
  brand: '0 8px 20px -6px rgba(66, 122, 67, 0.4)',
  brandLight: '0 8px 20px -6px rgba(66, 122, 67, 0.2)',
  success: '0 8px 20px -6px rgba(34, 197, 94, 0.3)',
  error: '0 8px 20px -6px rgba(239, 68, 68, 0.3)',
  warning: '0 8px 20px -6px rgba(245, 158, 11, 0.3)',

  /* Inner shadow */
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',

  /* No shadow */
  none: 'none',
};

/* ─── Z-INDEX ─────────────────────────────────────────────────── */
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

/* ─── TRANSITIONS ─────────────────────────────────────────────── */
export const transitions = {
  /* Duration */
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  /* Easing functions */
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  /* Complete transition strings */
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
};

/* ─── LAYOUT ──────────────────────────────────────────────────── */
export const layout = {
  /* Container widths */
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  /* Sidebar widths */
  sidebar: {
    full: '280px',
    collapsed: '72px',
    mobile: '100%',
  },

  /* Header heights */
  header: {
    sm: '56px',
    md: '64px',
    lg: '72px',
  },

  /* Content spacing */
  content: {
    padding: '24px',
    gap: '24px',
  },
};

/* ─── BREAKPOINTS ─────────────────────────────────────────────── */
export const breakpoints = {
  xs: '375px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

/* ─── GLASSMORPHISM ───────────────────────────────────────────── */
export const glassmorphism = {
  /* Blur amounts */
  blur: {
    sm: 'blur(8px)',
    md: 'blur(12px)',
    lg: 'blur(16px)',
    xl: 'blur(24px)',
  },

  /* Opacity levels */
  opacity: {
    subtle: 0.6,
    medium: 0.8,
    strong: 0.95,
  },
};

/* ─── GRADIENTS ───────────────────────────────────────────────── */
export const gradients = {
  /* Brand gradients */
  brand: {
    primary: 'linear-gradient(135deg, #427A43 0%, #5a9e5b 100%)',
    dark: 'linear-gradient(135deg, #2d5630 0%, #427A43 100%)',
    light: 'linear-gradient(135deg, #5a9e5b 0%, #7dc382 100%)',
    subtle: 'linear-gradient(135deg, rgba(66, 122, 67, 0.1) 0%, rgba(90, 158, 91, 0.1) 100%)',
  },

  /* Accent gradients */
  purple: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
  blue: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
  cyan: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
  pink: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',

  /* Semantic gradients */
  success: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  error: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',

  /* Mesh gradients */
  mesh: {
    brand: 'radial-gradient(at 0% 0%, rgba(66, 122, 67, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(90, 158, 91, 0.15) 0px, transparent 50%)',
    purple: 'radial-gradient(at 0% 0%, rgba(139, 92, 246, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(167, 139, 250, 0.15) 0px, transparent 50%)',
  },
};

/* ─── UTILITY FUNCTIONS ───────────────────────────────────────── */
export const utils = {
  /* Get color based on theme */
  getColor: (lightColor, darkColor, isDark) =>
    isDark ? darkColor : lightColor,

  /* Get responsive value */
  responsive: (values, breakpoint = 'md') => {
    const bp = breakpoints[breakpoint];
    return {
      '@media (min-width: ${bp})': values,
    };
  },

  /* Create glassmorphism effect */
  glass: (blur = 'md', opacity = 0.8) => ({
    backdropFilter: glassmorphism.blur[blur],
    backgroundColor: `rgba(20, 20, 25, ${opacity})`,
  }),

  /* Create gradient text */
  gradientText: (gradient) => ({
    background: gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  }),
};

/* ─── COMPLETE THEME EXPORT ────────────────────────────────────── */
export const createTheme = (isDark = false) => {
  const theme = isDark ? colors.dark : colors.light;
  const semantic = colors.semantic;
  const brand = colors.brand;

  return {
    ...theme,
    ...semantic,
    brand: brand.primary,
    brandSecondary: brand.secondary,
    brandDark: brand.dark,
    brandLight: brand.light,
    brandGradient: brand.gradient,
    purple: colors.accent.purple,
    blue: colors.accent.blue,
    cyan: colors.accent.cyan,
    pink: colors.accent.pink,
    orange: colors.accent.orange,
  };
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  transitions,
  layout,
  breakpoints,
  glassmorphism,
  gradients,
  utils,
  createTheme,
};
