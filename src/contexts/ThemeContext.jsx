import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme } from '../styles/design-tokens';

const ThemeContext = createContext(undefined);

/* ─── THEME PROVIDER ─────────────────────────────────────────── */
export const ThemeProvider = ({ children }) => {
  // Theme mode: 'light', 'dark', or 'auto' (system preference)
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem('themeMode');
    return saved || 'light';
  });

  // Computed dark mode state
  const isDarkMode = useMemo(() => {
    if (themeMode === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return themeMode === 'dark';
  }, [themeMode]);

  // Apply theme to document and localStorage
  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);

    // Remove existing theme classes
    document.documentElement.classList.remove('light', 'dark');

    // Add current theme class
    document.documentElement.classList.add(isDarkMode ? 'dark' : 'light');

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDarkMode ? '#0a0a0c' : '#f8fafc');
    }
  }, [themeMode, isDarkMode]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (themeMode !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // Force re-render to update isDarkMode
      setThemeMode('auto'); // This triggers the memo to recompute
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  // Toggle between light and dark
  const toggleDarkMode = () => {
    setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Set specific theme mode
  const setTheme = (mode) => {
    if (['light', 'dark', 'auto'].includes(mode)) {
      setThemeMode(mode);
    }
  };

  // Create theme object with all colors based on current mode
  const theme = useMemo(() => createTheme(isDarkMode), [isDarkMode]);

  const value = {
    // Theme state
    isDarkMode,
    themeMode,
    theme,

    // Theme actions
    toggleDarkMode,
    setTheme,
    setLightMode: () => setTheme('light'),
    setDarkMode: () => setTheme('dark'),
    setAutoMode: () => setTheme('auto'),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/* ─── USE THEME HOOK ───────────────────────────────────────────── */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/* ─── HELPER HOOKS ────────────────────────────────────────────── */
// Hook to get colors with automatic theme switching
export const useColors = () => {
  const { theme } = useTheme();
  return theme;
};

// Hook to get responsive styles
export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = useState('md');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('xs');
      else if (width < 768) setBreakpoint('sm');
      else if (width < 1024) setBreakpoint('md');
      else if (width < 1280) setBreakpoint('lg');
      else setBreakpoint('xl');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return { breakpoint, isMobile: breakpoint === 'xs' || breakpoint === 'sm' };
};

export default ThemeContext;
