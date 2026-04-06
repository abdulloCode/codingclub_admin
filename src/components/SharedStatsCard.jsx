import { useState, useEffect } from 'react';

/**
 * Statistika karta komponenti - Barcha panellar uchun umumiy statistika tizimi
 */
export default function SharedStatsCard({
  title,
  value,
  icon: Icon,
  color = '#427A43',
  bgColor = 'rgba(66, 122, 67, 0.1)',
  borderColor = 'rgba(66, 122, 67, 0.2)',
  subtitle,
  trend,
  onClick,
  animate = true,
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startCount = 0;
    const duration = 1000;
    const increment = value / (duration / 16);

    const timer = setInterval(() => {
      startCount += increment;
      if (startCount >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(startCount));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div
      onClick={onClick}
      style={{
        background: '#18181b',
        borderRadius: 16,
        border: `1px solid ${borderColor}`,
        padding: '20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s',
        opacity: animate ? 0 : 1,
        transform: animate ? 'translateY(10px)' : 'translateY(0)',
      }}
      className={animate ? 'animate-fade-in' : ''}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = `0 8px 24px ${color}40`;
          e.currentTarget.style.borderColor = color;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = borderColor;
        }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: bgColor,
          border: `1px solid ${borderColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={color} />
        </div>
        {trend && (
          <span style={{
            fontSize: 11, fontWeight: 600,
            padding: '4px 10px', borderRadius: 20,
            background: trend > 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: trend > 0 ? '#22c55e' : '#ef4444',
          }}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>

      <h3 style={{ fontSize: 32, fontWeight: 700, color, lineHeight: 1, marginBottom: 4 }}>
        {count}
      </h3>

      <p style={{ fontSize: 11, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </p>

      {subtitle && (
        <p style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}