import { useState, useEffect, useRef } from 'react';
import { Card } from './Card';
import { colors, spacing, typography, transitions } from '../../styles/design-tokens';
import { useTheme } from '../../contexts/ThemeContext';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/* ─── STATS CARD COMPONENT ──────────────────────────────────────
   Enhanced statistics card with animations and trend indicators
──────────────────────────────────────────────────────────────── */
export const StatsCard = ({
  title,
  value,
  unit = '',
  subtitle = '',
  icon: Icon,
  trend,
  trendValue,
  previousValue,
  color = 'brand',
  size = 'md',           // 'sm', 'md', 'lg'
  variant = 'elevated',  // 'elevated', 'outlined', 'flat', 'glass'
  loading = false,
  animate = true,
  sparkline = null,
  className = '',
  style = {},
  onClick,
}) => {
  const { isDarkMode } = useTheme();
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  // Color scheme
  const colorSchemes = {
    brand: {
      main: colors.brand.primary,
      light: colors.brand.light,
      bg: isDarkMode ? 'rgba(66, 122, 67, 0.15)' : 'rgba(66, 122, 67, 0.1)',
      bgLight: isDarkMode ? 'rgba(66, 122, 67, 0.05)' : 'rgba(66, 122, 67, 0.05)',
    },
    success: {
      main: colors.semantic.success,
      light: colors.semantic.successLight,
      bg: isDarkMode ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
      bgLight: isDarkMode ? 'rgba(34, 197, 94, 0.05)' : 'rgba(34, 197, 94, 0.05)',
    },
    warning: {
      main: colors.semantic.warning,
      light: colors.semantic.warningLight,
      bg: isDarkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
      bgLight: isDarkMode ? 'rgba(245, 158, 11, 0.05)' : 'rgba(245, 158, 11, 0.05)',
    },
    error: {
      main: colors.semantic.error,
      light: colors.semantic.errorLight,
      bg: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
      bgLight: isDarkMode ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.05)',
    },
    info: {
      main: colors.semantic.info,
      light: colors.semantic.infoLight,
      bg: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
      bgLight: isDarkMode ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.05)',
    },
    purple: {
      main: colors.accent.purple,
      light: 'rgba(139, 92, 246, 0.8)',
      bg: isDarkMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
      bgLight: isDarkMode ? 'rgba(139, 92, 246, 0.05)' : 'rgba(139, 92, 246, 0.05)',
    },
  };

  const colorScheme = colorSchemes[color] || colorSchemes.brand;

  // Size styles
  const sizes = {
    sm: {
      padding: spacing[4],
      iconSize: '32px',
      titleSize: typography.fontSize.sm,
      valueSize: typography.fontSize['2xl'],
      gap: spacing[3],
    },
    md: {
      padding: spacing[5],
      iconSize: '40px',
      titleSize: typography.fontSize.base,
      valueSize: typography.fontSize['5xl'],
      gap: spacing[4],
    },
    lg: {
      padding: spacing[6],
      iconSize: '48px',
      titleSize: typography.fontSize.md,
      valueSize: typography.fontSize['6xl'],
      gap: spacing[5],
    },
  };

  const currentSize = sizes[size];

  // Animate value counting
  useEffect(() => {
    if (!animate || loading) {
      setDisplayValue(value);
      return;
    }

    const duration = 1000;
    const steps = 60;
    const stepValue = (value - displayValue) / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(prev => prev + stepValue);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, animate, loading]);

  // Intersection observer for visibility animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Format value
  const formatValue = (val) => {
    if (typeof val === 'number') {
      return new Intl.NumberFormat('uz-UZ').format(Math.round(val * 100) / 100);
    }
    return val;
  };

  // Calculate trend
  const getTrendIcon = () => {
    if (!trend) return null;
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    return <TrendIcon size={14} />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return colors.semantic.success;
    if (trend === 'down') return colors.semantic.error;
    return isDarkMode ? colors.dark.textSecondary : colors.light.textSecondary;
  };

  return (
    <Card
      ref={cardRef}
      variant={variant}
      padding="none"
      hoverable={!!onClick}
      onClick={onClick}
      className={`stats-card ${size} ${isVisible ? 'visible' : ''} ${className}`.trim()}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity ${transitions.slow}, transform ${transitions.slow}`,
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          padding: currentSize.padding,
          display: 'flex',
          flexDirection: size === 'lg' ? 'row' : 'column',
          gap: currentSize.gap,
        }}
      >
        {/* Icon */}
        {Icon && (
          <div
            style={{
              width: currentSize.iconSize,
              height: currentSize.iconSize,
              borderRadius: '12px',
              background: colorScheme.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colorScheme.main,
              flexShrink: 0,
            }}
          >
            <Icon size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title */}
          {title && (
            <div
              style={{
                fontSize: currentSize.titleSize,
                fontWeight: 500,
                color: isDarkMode ? colors.dark.textSecondary : colors.light.textSecondary,
                marginBottom: spacing[2],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {title}
              {trend && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[1],
                    color: getTrendColor(),
                    fontSize: typography.fontSize.xs,
                    fontWeight: 600,
                  }}
                >
                  {getTrendIcon()}
                  {trendValue && <span>{trendValue}%</span>}
                </div>
              )}
            </div>
          )}

          {/* Value */}
          {loading ? (
            <div
              style={{
                height: currentSize.valueSize,
                width: '60%',
                background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                borderRadius: borderRadius.sm,
                animation: 'shimmer 1.5s infinite',
              }}
            />
          ) : (
            <div
              style={{
                fontSize: currentSize.valueSize,
                fontWeight: 700,
                color: isDarkMode ? colors.dark.text : colors.light.text,
                lineHeight: 1,
                marginBottom: subtitle ? spacing[2] : 0,
                display: 'flex',
                alignItems: 'baseline',
                gap: spacing[1],
              }}
            >
              <span>{formatValue(displayValue)}</span>
              {unit && (
                <span
                  style={{
                    fontSize: `calc(${currentSize.valueSize} * 0.5)`,
                    fontWeight: 500,
                    opacity: 0.7,
                  }}
                >
                  {unit}
                </span>
              )}
            </div>
          )}

          {/* Subtitle */}
          {subtitle && !loading && (
            <div
              style={{
                fontSize: typography.fontSize.sm,
                color: isDarkMode ? colors.dark.textTertiary : colors.light.textTertiary,
                marginTop: spacing[2],
              }}
            >
              {subtitle}
            </div>
          )}

          {/* Sparkline */}
          {sparkline && !loading && (
            <div style={{ marginTop: spacing[3], height: '32px' }}>
              {sparkline}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .stats-card:not(.visible) {
          opacity: 0;
          transform: translateY(20px);
        }

        .stats-card.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </Card>
  );
};

/* ─── STATS GRID ───────────────────────────────────────────────── */
export const StatsGrid = ({
  children,
  columns = 'auto',
  gap = 'md',
  className = '',
  style = {},
}) => {
  const gridColumns = {
    1: 'repeat(1, 1fr)',
    2: 'repeat(2, 1fr)',
    3: 'repeat(3, 1fr)',
    4: 'repeat(4, 1fr)',
    auto: 'repeat(auto-fit, minmax(240px, 1fr))',
  };

  const gaps = {
    sm: spacing[3],
    md: spacing[5],
    lg: spacing[6],
  };

  return (
    <div
      className={`stats-grid ${className}`.trim()}
      style={{
        display: 'grid',
        gridTemplateColumns: gridColumns[columns] || gridColumns.auto,
        gap: gaps[gap] || gaps.md,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ─── MINI STATS CARD ──────────────────────────────────────────── */
export const MiniStatsCard = ({
  label,
  value,
  color = 'brand',
  trend,
  className = '',
  style = {},
}) => {
  const { isDarkMode } = useTheme();

  const colorSchemes = {
    brand: colors.brand.primary,
    success: colors.semantic.success,
    warning: colors.semantic.warning,
    error: colors.semantic.error,
    info: colors.semantic.info,
    purple: colors.accent.purple,
  };

  return (
    <div
      className={`mini-stats-card ${className}`.trim()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[2],
        ...style,
      }}
    >
      <div
        style={{
          fontSize: typography.fontSize.xs,
          color: isDarkMode ? colors.dark.textSecondary : colors.light.textSecondary,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: typography.fontSize.xl,
          fontWeight: 700,
          color: isDarkMode ? colors.dark.text : colors.light.text,
        }}
      >
        {value}
      </div>
      {trend && (
        <div
          style={{
            fontSize: typography.fontSize.xs,
            color: trend === 'up' ? colors.semantic.success :
                   trend === 'down' ? colors.semantic.error :
                   isDarkMode ? colors.dark.textSecondary : colors.light.textSecondary,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: spacing[1],
          }}
        >
          {trend === 'up' && <TrendingUp size={12} />}
          {trend === 'down' && <TrendingDown size={12} />}
          {trend}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
