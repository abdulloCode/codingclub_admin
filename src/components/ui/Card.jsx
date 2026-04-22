import { forwardRef } from 'react';
import { colors, borderRadius, shadows, transitions, spacing } from '../../styles/design-tokens';
import { useTheme } from '../../contexts/ThemeContext';

/* ─── CARD COMPONENT ────────────────────────────────────────────
   A versatile card component with multiple variants and styles
──────────────────────────────────────────────────────────────── */
export const Card = forwardRef(({
  children,
  variant = 'elevated', // 'elevated', 'outlined', 'flat', 'glass'
  padding = 'md',        // 'none', 'sm', 'md', 'lg', 'xl'
  hoverable = false,
  clickable = false,
  className = '',
  style = {},
  onClick,
  ...props
}, ref) => {
  const { isDarkMode } = useTheme();

  // Variant styles
  const variants = {
    elevated: {
      background: isDarkMode ? colors.dark.card : colors.light.card,
      border: 'none',
      boxShadow: shadows.md,
    },
    outlined: {
      background: isDarkMode ? colors.dark.card : colors.light.card,
      border: `1px solid ${isDarkMode ? colors.dark.border : colors.light.border}`,
      boxShadow: 'none',
    },
    flat: {
      background: isDarkMode ? colors.dark.backgroundSecondary : colors.light.backgroundSecondary,
      border: 'none',
      boxShadow: 'none',
    },
    glass: {
      background: isDarkMode ? 'rgba(20, 20, 25, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
      boxShadow: isDarkMode ? '0 8px 32px rgba(0, 0, 0, 0.4)' : '0 8px 32px rgba(0, 0, 0, 0.08)',
      backdropFilter: 'blur(12px)',
    },
  };

  // Padding sizes
  const paddings = {
    none: '0',
    sm: spacing[3],
    md: spacing[5],
    lg: spacing[6],
    xl: spacing[8],
  };

  // Base styles
  const baseStyle = {
    borderRadius: borderRadius.xl,
    padding: paddings[padding],
    transition: `all ${transitions.base}`,
    cursor: (hoverable || clickable) ? 'pointer' : 'default',
    position: 'relative',
    overflow: 'hidden',
    ...variants[variant],
    ...style,
  };

  // Hover state
  const hoverStyle = (hoverable || clickable) ? {
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: variant === 'glass'
        ? (isDarkMode ? '0 12px 40px rgba(0, 0, 0, 0.5)' : '0 12px 40px rgba(0, 0, 0, 0.12)')
        : shadows.lg,
      borderColor: isDarkMode ? colors.dark.borderHover : colors.light.borderHover,
    },
    '&:active': {
      transform: 'translateY(-2px)',
    },
  } : {};

  return (
    <div
      ref={ref}
      className={`card ${variant} ${hoverable ? 'hoverable' : ''} ${clickable ? 'clickable' : ''} ${className}`.trim()}
      style={baseStyle}
      onClick={onClick}
      {...props}
    >
      {children}

      <style>{`
        .card.hoverable:hover,
        .card.clickable:hover {
          transform: translateY(-4px);
          box-shadow: ${variant === 'glass'
            ? (isDarkMode ? '0 12px 40px rgba(0, 0, 0, 0.5)' : '0 12px 40px rgba(0, 0, 0, 0.12)')
            : shadows.lg};
          border-color: ${isDarkMode ? colors.dark.borderHover : colors.light.borderHover};
        }
        .card.clickable:active {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
});

Card.displayName = 'Card';

/* ─── CARD SUB-COMPONENTS ─────────────────────────────────────── */
export const CardHeader = ({ children, className = '', style = {} }) => (
  <div
    className={`card-header ${className}`.trim()}
    style={{
      marginBottom: spacing[4],
      ...style,
    }}
  >
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', style = {} }) => (
  <h3
    className={`card-title ${className}`.trim()}
    style={{
      fontSize: '18px',
      fontWeight: 600,
      margin: 0,
      ...style,
    }}
  >
    {children}
  </h3>
);

export const CardSubtitle = ({ children, className = '', style = {} }) => (
  <p
    className={`card-subtitle ${className}`.trim()}
    style={{
      fontSize: '13px',
      marginTop: spacing[1],
      margin: 0,
      opacity: 0.7,
      ...style,
    }}
  >
    {children}
  </p>
);

export const CardBody = ({ children, className = '', style = {} }) => (
  <div
    className={`card-body ${className}`.trim()}
    style={{
      flex: 1,
      ...style,
    }}
  >
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', style = {} }) => (
  <div
    className={`card-footer ${className}`.trim()}
    style={{
      marginTop: spacing[4],
      paddingTop: spacing[4],
      borderTop: '1px solid rgba(0, 0, 0, 0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing[3],
      ...style,
    }}
  >
    {children}
  </div>
);

export const CardActions = ({ children, align = 'right', className = '', style = {} }) => (
  <div
    className={`card-actions ${className}`.trim()}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      justifyContent: align === 'left' ? 'flex-start' : align === 'center' ? 'center' : 'flex-end',
      marginLeft: align === 'left' ? 'auto' : align === 'center' ? 'auto' : '0',
      ...style,
    }}
  >
    {children}
  </div>
);

export default Card;
