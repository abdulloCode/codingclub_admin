import { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Users, CreditCard, TrendingUp, Activity, Award, Shield, Calendar, Mail, Phone, CheckCircle, XCircle, Clock, BarChart3, Star, Bell, RefreshCw, Search, Filter, MoreHorizontal, ChevronRight, Eye, Edit3, Trash2, UserPlus, Zap, Target, Crown, Sparkles, ArrowUpRight } from 'lucide-react';

function AdminCard({ icon: Icon, label, value, sub, change, color, pale, D, onClick, iconSize = 18, iconBg, iconBorder, badge, status, progress, items, actions }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    const dur = 900;
    const s = performance.now();
    const run = now => {
      const p = Math.min((now - s) / dur, 1);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }, [value]);

  const card = D ? 'rgba(26,26,29,0.95)' : '#fff';
  const bord = D ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const mu   = D ? 'rgba(245,245,247,0.42)' : 'rgba(0,0,0,0.40)';
  const tx   = D ? '#f5f5f7' : '#18181b';

  return (
    <div onClick={onClick} style={{
      background: card, border: `1px solid ${bord}`, borderRadius: 18,
      padding: '20px 22px', cursor: 'pointer', position: 'relative', overflow: 'hidden',
      boxShadow: D ? 'none' : '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
      transition: 'transform .2s, box-shadow .2s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.10)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = D ? 'none' : '0 1px 3px rgba(0,0,0,0.06)';
    }}>
      {/* Decorative background circle */}
      <div style={{
        position: 'absolute', right: -18, top: -18, width: 80, height: 80,
        borderRadius: '50%', background: pale, opacity: 0.7, pointerEvents: 'none',
      }}/>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 12, background: pale,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${color}22`,
        }}>
          <Icon size={iconSize} color={color} strokeWidth={2}/>
        </div>

        {/* Status badge */}
        {status && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
            background: status === 'active' ? 'rgba(34,197,94,0.12)' : status === 'inactive' ? 'rgba(107,114,128,0.10)' : 'rgba(0,0,0,0.05)',
            color: status === 'active' ? '#22c55e' : status === 'inactive' ? '#6b7280' : '#64748b',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {status}
          </span>
        )}
      </div>

      {/* Main content */}
      <p style={{ fontSize: 32, fontWeight: 700, color: tx, lineHeight: 1, letterSpacing: '-0.02em' }}>{n}</p>
      <p style={{ fontSize: 12, fontWeight: 600, color: tx, marginTop: 4 }}>{label}</p>
      <p style={{ fontSize: 11, color: mu, marginTop: 2 }}>{sub}</p>

      {/* Progress bar */}
      {progress !== undefined && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, height: 5, background: 'rgba(0,0,0,0.06)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: `linear-gradient(90deg,${color},${color})`,
              borderRadius: 99, transition: 'width 1s ease',
            }}/>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: mu }}>{progress}%</span>
        </div>
      )}

      {/* Change indicator */}
      {change && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: mu }}>Batafsil</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 99, background: 'rgba(34,197,94,0.09)', border: '1px solid rgba(34,197,94,0.18)' }}>
            <TrendingUp size={10} color="#22c55e" />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e' }}>{change}</span>
          </div>
        </div>
      )}

      {/* Items list */}
      {items && items.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.slice(0, 3).map((item, index) => (
            <div key={index} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
              background: D ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              borderRadius: 8, border: `1px solid ${D?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)'}`,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: color, opacity: 0.7,
              }}/>
              <span style={{ fontSize: 11, color: mu }}>{item}</span>
            </div>
          ))}
          {items.length > 3 && (
            <div style={{ fontSize: 10, color: mu, paddingLeft: 22 }}>
              +{items.length - 3} boshqa
            </div>
          )}
        </div>
      )}

      {/* Badge */}
      {badge && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 99,
          background: color, color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          {badge}
        </div>
      )}

      {/* Actions */}
      {actions && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          {actions.map((action, index) => (
            <button key={index} onClick={action.onClick} style={{
              flex: 1, padding: '8px 12px', borderRadius: 8,
              border: `1px solid ${bord}`, background: 'transparent',
              fontSize: 11, fontWeight: 600, color: mu, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all .15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = D ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
            }}>
              <action.icon size={14} color={color} strokeWidth={2}/>
              {action.label && <span style={{ marginLeft: 4 }}>{action.label}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Action button */}
      {!actions && onClick && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: mu }}>Batafsil</span>
          <ArrowUpRight size={12} color={mu}/>
        </div>
      )}
    </div>
  );
}

// Small version for compact displays
export function AdminCardSmall({ icon: Icon, label, value, color, D, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: D ? 'rgba(26,26,29,0.95)' : '#fff',
      border: `1px solid ${D?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.06)'}`,
      borderRadius: 14, padding: '16px 18px', cursor: 'pointer',
      transition: 'transform .2s, box-shadow .2s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10, background: color + '15',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={color} strokeWidth={2}/>
        </div>
        <p style={{ fontSize: 24, fontWeight: 700, color: D ? '#f5f5f7' : '#18181b', lineHeight: 1 }}>{value}</p>
      </div>
      <p style={{ fontSize: 12, fontWeight: 600, color: D ? 'rgba(245,245,247,0.42)' : 'rgba(0,0,0,0.40)' }}>{label}</p>
    </div>
  );
}

export default AdminCard;