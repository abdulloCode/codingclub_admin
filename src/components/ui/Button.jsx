import { forwardRef } from 'react';
import { colors, borderRadius, shadows, transitions, spacing, gradients } from '../../styles/design-tokens';
import { useTheme } from '../../contexts/ThemeContext';

/* ─── BUTTON COMPONENT ──────────────────────────────────────────
   A comprehensive button component with multiple variants and sizes
──────────────────────────────────────────────────────────────── */
export const Button = forwardRef(({
  children,
  variant = 'primary',     // 'primary', 'secondary', 'ghost', 'danger', 'success'
  size = 'md',             // 'sm', 'md', 'lg', 'icon'
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  iconOnly = false,
  className = '',
  style = {},
  onClick,
  ...props
}, ref) => {
  const { isDarkMode } = useTheme();

  // Variant styles
  const variants = {
    primary: {
      background: colors.brand.gradient,
      color: '#ffffff',
      border: 'none',
      boxShadow: shadows.brand,
    },
    secondary: {
      background: isDarkMode ? colors.dark.card : colors.light.card,
      color: isDarkMode ? colors.dark.text : colors.light.text,
      border: `1px solid ${isDarkMode ? colors.dark.border : colors.light.border}`,
      boxShadow: 'none',
    },
    ghost: {
      background: 'transparent',
      color: isDarkMode ? colors.dark.text : colors.light.text,
      border: 'none',
      boxShadow: 'none',
    },
    danger: {
      background: gradients.error,
      color: '#ffffff',
      border: 'none',
      boxShadow: shadows.error,
    },
    success: {
      background: gradients.success,
      color: '#ffffff',
      border: 'none',
      boxShadow: shadows.success,
    },
  };

  // Size styles
  const sizes = {
    sm: {
      padding: '6px 12px',
      fontSize: '12px',
      height: '28px',
      gap: '6px',
    },
    md: {
      padding: '8px 16px',
      fontSize: '14px',
      height: '36px',
      gap: '8px',
    },
    lg: {
      padding: '10px 20px',
      fontSize: '15px',
      height: '42px',
      gap: '10px',
    },
    icon: {
      padding: '8px',
      fontSize: '14px',
      height: '36px',
      width: '36px',
      gap: '0',
    },
  };

  const currentSize = sizes[size];
  const currentVariant = variants[variant];

  // Base styles
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: currentSize.gap,
    borderRadius: borderRadius.md,
    border: currentVariant.border,
    background: currentVariant.background,
    color: currentVariant.color,
    boxShadow: currentVariant.boxShadow,
    padding: iconOnly ? '8px' : currentSize.padding,
    fontSize: currentSize.fontSize,
    fontWeight: 500,
    height: currentSize.height,
    width: fullWidth || iconOnly ? (iconOnly ? currentSize.width : '100%') : 'auto',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: `all ${transitions.base}`,
    position: 'relative',
    overflow: 'hidden',
    outline: 'none',
    ...style,
  };

  // Hover and focus styles
  const interactiveStyles = !disabled && !loading ? {
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: variant === 'ghost'
        ? 'none'
        : (variant === 'primary' ? shadows.brandLight : shadows.md),
      filter: variant === 'secondary' ? 'brightness(0.95)' : 'brightness(1.05)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
    '&:focus-visible': {
      outline: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(66, 122, 67, 0.5)'}`,
      outlineOffset: '2px',
    },
  } : {};

  return (
    <button
      ref={ref}
      className={`btn btn-${variant} btn-${size} ${loading ? 'loading' : ''} ${iconOnly ? 'icon-only' : ''} ${className}`.trim()}
      style={baseStyle}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {/* Loading Spinner */}
      {loading && (
        <span
          style={{
            position: 'absolute',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              animation: 'spin 1s linear infinite',
            }}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              strokeOpacity="0.3"
            />
            <path
              d="M12 2C17.5228 2 22 6.47715 22 12"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </span>
      )}

      {/* Content */}
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: currentSize.gap,
          opacity: loading ? 0 : 1,
          transition: `opacity ${transitions.fast}`,
        }}
      >
        {leftIcon && <span className="btn-icon-left">{leftIcon}</span>}
        {children && !iconOnly && <span>{children}</span>}
        {rightIcon && <span className="btn-icon-right">{rightIcon}</span>}
      </span>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .btn:hover:not(:disabled):not(.loading) {
          transform: translateY(-1px);
          box-shadow: ${variant === 'ghost'
            ? 'none'
            : (variant === 'primary' ? shadows.brandLight : shadows.md)};
          filter: ${variant === 'secondary' ? 'brightness(0.95)' : 'brightness(1.05)'};
        }

        .btn:active:not(:disabled):not(.loading) {
          transform: translateY(0);
        }

        .btn:focus-visible {
          outline: 2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(66, 122, 67, 0.5)'};
          outline-offset: 2px;
        }

        .btn.loading {
          cursor: not-allowed;
        }

        .btn.loading .btn-icon-left,
        .btn.loading .btn-icon-right,
        .btn.loading span:not(:first-child) {
          opacity: 0;
        }
      `}</style>
    </button>
  );
});

Button.displayName = 'Button';

/* ─── BUTTON GROUP ─────────────────────────────────────────────── */
export const ButtonGroup = ({
  children,
  orientation = 'horizontal', // 'horizontal' | 'vertical'
  gap = 'sm',
  className = '',
  style = {},
}) => {
  const gaps = {
    none: '0',
    xs: spacing[1],
    sm: spacing[2],
    md: spacing[3],
    lg: spacing[4],
  };

  return (
    <div
      className={`btn-group ${orientation} ${className}`.trim()}
      style={{
        display: 'flex',
        flexDirection: orientation === 'vertical' ? 'column' : 'row',
        gap: gaps[gap],
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ─── ICON BUTTON ─────────────────────────────────────────────── */
export const IconButton = forwardRef(({
  icon,
  variant = 'ghost',
  size = 'md',
  tooltip,
  className = '',
  style = {},
  ...props
}, ref) => {
  const button = (
    <Button
      ref={ref}
      variant={variant}
      size={size === 'sm' ? 'icon' : size}
      iconOnly
      className={className}
      style={style}
      {...props}
    >
      {icon}
    </Button>
  );

  if (tooltip) {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {button}
        <span
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '6px',
            padding: '4px 8px',
            fontSize: '11px',
            whiteSpace: 'nowrap',
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            borderRadius: borderRadius.sm,
            opacity: 0,
            pointerEvents: 'none',
            transition: `opacity ${transitions.fast}`,
          }}
          className="tooltip"
        >
          {tooltip}
          <style>{`
            .tooltip {
              visibility: hidden;
            }
            div:hover > .tooltip {
              visibility: visible;
              opacity: 1;
            }
          `}</style>
        </span>
      </div>
    );
  }

  return button;
});

IconButton.displayName = 'IconButton';

export default Button;
