import { forwardRef } from 'react';
import { colors, borderRadius, spacing, typography } from '../../styles/design-tokens';
import { useTheme } from '../../contexts/ThemeContext';

/* ─── BADGE COMPONENT ───────────────────────────────────────────
   Status badges and indicators with multiple styles
──────────────────────────────────────────────────────────────── */
export const Badge = forwardRef(({
  children,
  variant = 'default',   // 'default', 'success', 'warning', 'error', 'info', 'purple', 'blue', 'cyan', 'pink'
  size = 'md',           // 'sm', 'md', 'lg'
  dot = false,           // Show colored dot
  icon = null,           // Icon element
  pill = false,          // Pill shape (fully rounded)
  outline = false,       // Outline style
  className = '',
  style = {},
  ...props
}, ref) => {
  const { isDarkMode } = useTheme();

  // Variant colors
  const variants = {
    default: {
      bg: isDarkMode ? 'rgba(161, 161, 170, 0.15)' : 'rgba(100, 116, 139, 0.1)',
      color: isDarkMode ? colors.dark.textSecondary : colors.light.textSecondary,
      border: isDarkMode ? 'rgba(161, 161, 170, 0.3)' : 'rgba(100, 116, 139, 0.2)',
    },
    success: {
      bg: outline ? 'transparent' : 'rgba(34, 197, 94, 0.15)',
      color: colors.semantic.success,
      border: outline ? colors.semantic.success : 'rgba(34, 197, 94, 0.3)',
    },
    warning: {
      bg: outline ? 'transparent' : 'rgba(245, 158, 11, 0.15)',
      color: colors.semantic.warning,
      border: outline ? colors.semantic.warning : 'rgba(245, 158, 11, 0.3)',
    },
    error: {
      bg: outline ? 'transparent' : 'rgba(239, 68, 68, 0.15)',
      color: colors.semantic.error,
      border: outline ? colors.semantic.error : 'rgba(239, 68, 68, 0.3)',
    },
    info: {
      bg: outline ? 'transparent' : 'rgba(59, 130, 246, 0.15)',
      color: colors.semantic.info,
      border: outline ? colors.semantic.info : 'rgba(59, 130, 246, 0.3)',
    },
    purple: {
      bg: outline ? 'transparent' : 'rgba(139, 92, 246, 0.15)',
      color: colors.accent.purple,
      border: outline ? colors.accent.purple : 'rgba(139, 92, 246, 0.3)',
    },
    blue: {
      bg: outline ? 'transparent' : 'rgba(59, 130, 246, 0.15)',
      color: colors.accent.blue,
      border: outline ? colors.accent.blue : 'rgba(59, 130, 246, 0.3)',
    },
    cyan: {
      bg: outline ? 'transparent' : 'rgba(6, 182, 212, 0.15)',
      color: colors.accent.cyan,
      border: outline ? colors.accent.cyan : 'rgba(6, 182, 212, 0.3)',
    },
    pink: {
      bg: outline ? 'transparent' : 'rgba(236, 72, 153, 0.15)',
      color: colors.accent.pink,
      border: outline ? colors.accent.pink : 'rgba(236, 72, 153, 0.3)',
    },
  };

  // Size styles
  const sizes = {
    sm: {
      padding: '2px 6px',
      fontSize: typography.fontSize.xs,
      height: '18px',
      dotSize: '4px',
      iconSize: '10px',
    },
    md: {
      padding: '4px 8px',
      fontSize: typography.fontSize.sm,
      height: '22px',
      dotSize: '5px',
      iconSize: '11px',
    },
    lg: {
      padding: '6px 10px',
      fontSize: typography.fontSize.base,
      height: '26px',
      dotSize: '6px',
      iconSize: '12px',
    },
  };

  const currentVariant = variants[variant] || variants.default;
  const currentSize = sizes[size];

  // Base styles
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    padding: currentSize.padding,
    fontSize: currentSize.fontSize,
    fontWeight: typography.fontWeight.medium,
    lineHeight: 1,
    height: currentSize.height,
    background: outline ? 'transparent' : currentVariant.bg,
    color: currentVariant.color,
    border: outline ? `1px solid ${currentVariant.border}` : 'none',
    borderRadius: pill ? '9999px' : borderRadius.md,
    whiteSpace: 'nowrap',
    transition: 'all 150ms ease',
    ...style,
  };

  return (
    <span
      ref={ref}
      className={`badge badge-${variant} badge-${size} ${outline ? 'outline' : ''} ${pill ? 'pill' : ''} ${className}`.trim()}
      style={baseStyle}
      {...props}
    >
      {dot && (
        <span
          style={{
            width: currentSize.dotSize,
            height: currentSize.dotSize,
            borderRadius: '50%',
            background: currentVariant.color,
            animation: variant === 'error' ? 'pulse 2s infinite' : 'none',
          }}
        />
      )}

      {icon && (
        <span style={{ fontSize: currentSize.iconSize, display: 'flex' }}>
          {icon}
        </span>
      )}

      {children && <span>{children}</span>}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </span>
  );
});

Badge.displayName = 'Badge';

/* ─── STATUS BADGE ─────────────────────────────────────────────── */
export const StatusBadge = ({ status, size = 'md', ...props }) => {
  const statusMap = {
    active: { variant: 'success', label: 'Faol' },
    inactive: { variant: 'default', label: 'Nofaol' },
    pending: { variant: 'warning', label: 'Kutilmoqda' },
    approved: { variant: 'success', label: 'Tasdiqlangan' },
    rejected: { variant: 'error', label: 'Rad etilgan' },
    paid: { variant: 'success', label: "To'langan" },
    unpaid: { variant: 'error', label: "To'lanmagan" },
    processing: { variant: 'info', label: 'Jarayonda' },
    completed: { variant: 'success', label: 'Tugatilgan' },
    cancelled: { variant: 'error', label: 'Bekor qilingan' },
  };

  const config = statusMap[status?.toLowerCase()] || {
    variant: 'default',
    label: status || 'Noma\'lum'
  };

  return (
    <Badge variant={config.variant} size={size} {...props}>
      {config.label}
    </Badge>
  );
};

/* ─── COUNTER BADGE ────────────────────────────────────────────── */
export const CounterBadge = ({
  count,
  max = 99,
  showZero = false,
  variant = 'error',
  size = 'sm',
  ...props
}) => {
  if (!showZero && count === 0) return null;

  const displayCount = count > max ? `${max}+` : count;

  return (
    <Badge variant={variant} size={size} pill {...props}>
      {displayCount}
    </Badge>
  );
};

/* ─── DOT BADGE ────────────────────────────────────────────────── */
export const DotBadge = ({
  variant = 'success',
  size = 'md',
  pulse = false,
  className = '',
  style = {},
}) => {
  const { isDarkMode } = useTheme();

  const variantColors = {
    success: colors.semantic.success,
    warning: colors.semantic.warning,
    error: colors.semantic.error,
    info: colors.semantic.info,
    default: isDarkMode ? colors.dark.textSecondary : colors.light.textSecondary,
  };

  const sizes = {
    sm: '6px',
    md: '8px',
    lg: '10px',
  };

  return (
    <span
      className={`dot-badge ${pulse ? 'pulse' : ''} ${className}`.trim()}
      style={{
        display: 'inline-block',
        width: sizes[size],
        height: sizes[size],
        borderRadius: '50%',
        background: variantColors[variant] || variantColors.default,
        animation: pulse ? 'pulse 2s infinite' : 'none',
        ...style,
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
      `}</style>
    </span>
  );
};

/* ─── AVATAR BADGE ─────────────────────────────────────────────── */
export const AvatarBadge = ({
  src,
  alt,
  fallback,
  size = 'md',
  badge,
  className = '',
  style = {},
}) => {
  const sizes = {
    sm: '24px',
    md: '32px',
    lg: '40px',
    xl: '48px',
  };

  const badgeSizes = {
    sm: '8px',
    md: '10px',
    lg: '12px',
    xl: '14px',
  };

  return (
    <div
      className={`avatar-badge ${className}`.trim()}
      style={{
        position: 'relative',
        display: 'inline-block',
        ...style,
      }}
    >
      {/* Avatar Image or Fallback */}
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{
            width: sizes[size],
            height: sizes[size],
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid',
            borderColor: 'currentColor',
          }}
        />
      ) : (
        <div
          style={{
            width: sizes[size],
            height: sizes[size],
            borderRadius: '50%',
            background: colors.brand.gradient,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `calc(${sizes[size]} * 0.4)`,
            fontWeight: 600,
          }}
        >
          {fallback || '?'}
        </div>
      )}

      {/* Status Badge */}
      {badge && (
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: badgeSizes[size],
            height: badgeSizes[size],
            borderRadius: '50%',
            background: badge === 'online' ? colors.semantic.success :
                      badge === 'offline' ? colors.semantic.error :
                      badge === 'away' ? colors.semantic.warning :
                      colors.semantic.info,
            border: '2px solid',
            borderColor: isDarkMode ? colors.dark.background : colors.light.background,
          }}
        />
      )}
    </div>
  );
};

export default Badge;
