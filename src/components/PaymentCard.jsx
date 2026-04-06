import { useState, useEffect } from 'react';
import { CreditCard, DollarSign, TrendingUp, TrendingDown, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Shield, Activity, Star, User, Package, Download, Play, Pause, Eye, Edit3, Trash2, RefreshCw, Wallet, Banknote, AlertTriangle, ArrowUpRight, MoreHorizontal, Receipt } from 'lucide-react';

function PaymentCard({
  icon: Icon,
  label,
  value,
  sub,
  change,
  color,
  pale,
  D,
  onClick,
  payment,
  status,
  amount,
  date,
  method,
  student,
  course,
  period,
  discount,
  tax,
  total,
  paymentItems,
  activities,
  actions
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseFloat(value) || 0;
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

  const getPaymentStatusColor = (status) => {
    if (status === 'completed' || status === 'paid') return { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', label: 'To\'langan', icon: CheckCircle };
    if (status === 'pending' || status === 'unpaid') return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Kutilmoqda', icon: Clock };
    if (status === 'failed' || status === 'rejected') return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'Bekor qilingan', icon: XCircle };
    if (status === 'processing') return { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Jarayonda', icon: RefreshCw };
    if (status === 'overdue') return { color: '#dc2626', bg: 'rgba(220,38,38,0.12)', label: 'Muddati o\'tgan', icon: AlertTriangle };
    return { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', label: 'Noma\'lum', icon: AlertCircle };
  };

  const getStatusConfig = getPaymentStatusColor(status);

  const getMethodColor = (method) => {
    if (method === 'cash') return '#22c55e';
    if (method === 'card') return '#3b82f6';
    if (method === 'transfer') return '#8b5cf6';
    if (method === 'click') return '#f59e0b';
    if (method === 'payme') return '#ec4899';
    return '#6b7280';
  };

  const getMethodLabel = (method) => {
    if (method === 'cash') return 'Naqd';
    if (method === 'card') return 'Karta';
    if (method === 'transfer') return 'O\'tkazma';
    if (method === 'click') return 'Click';
    if (method === 'payme') return 'Payme';
    return method || '—';
  };

  const lineCount = (value || '').split('\n').length;
  const editorHeight = '280px';

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
        borderRadius: '50%', background: pale || getStatusConfig(status).bg, opacity: 0.3, pointerEvents: 'none',
      }}/>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 12, background: pale || getStatusConfig(status).bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${color || getStatusConfig(status).color}22`,
        }}>
          {Icon ? (
            <Icon size={18} color={color || getStatusConfig(status).color} strokeWidth={2}/>
          ) : (
            <CreditCard size={18} color={color || getStatusConfig(status).color} strokeWidth={2}/>
          )}
        </div>

        {/* Status badge */}
        {status && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {getStatusConfig(status).icon && <getStatusConfig(status).icon size={12} color={getStatusConfig(status).color}/>}
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 99,
              background: getStatusConfig(status).bg, color: getStatusConfig(status).color,
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              {getStatusConfig(status).label}
            </span>
          </div>
        )}
      </div>

      {/* Main content */}
      <p style={{ fontSize: 32, fontWeight: 700, color: tx, lineHeight: 1, letterSpacing: '-0.02em' }}>
        {typeof n === 'number' && !isNaN(n) ? n.toLocaleString() : n}
      </p>
      <p style={{ fontSize: 12, fontWeight: 600, color: tx, marginTop: 4 }}>{label}</p>
      <p style={{ fontSize: 11, color: mu, marginTop: 2 }}>{sub}</p>

      {/* Payment info */}
      {payment && (
        <div style={{ marginTop: 12, padding: '12px', borderRadius: 12, background: D ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: `1px solid ${bord}` }}>
          {/* Amount */}
          {amount && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: mu }}>Summa</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <DollarSign size={14} color={getStatusConfig(status).color}/>
                <span style={{ fontSize: 16, fontWeight: 700, color: tx }}>{amount.toLocaleString()} so'm</span>
              </div>
            </div>
          )}

          {/* Date */}
          {date && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: mu }}>Sana</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={14} color={mu}/>
                <span style={{ fontSize: 12, color: tx }}>{date}</span>
              </div>
            </div>
          )}

          {/* Payment method */}
          {method && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: mu }}>To'lov turi</span>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 99,
                background: getMethodColor(method) + '15', border: `1px solid ${getMethodColor(method)}30`,
              }}>
                <Wallet size={14} color={getMethodColor(method)}/>
                <span style={{ fontSize: 11, fontWeight: 600, color: getMethodColor(method) }}>{getMethodLabel(method)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Student info */}
      {student && (
        <div style={{ marginTop: 12, padding: '12px', borderRadius: 12, background: D ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: `1px solid ${bord}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 50, background: color || getStatusConfig(status).color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700, color: '#fff',
            }}>
              {(student.name || student.user?.name || '?')[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: tx, marginBottom: 2 }}>
                {student.name || student.user?.name || 'O\'quvchi'}
              </p>
              <p style={{ fontSize: 11, color: mu }}>
                {student.group?.name || student.course || 'Guruh belgilanmagan'}
              </p>
            </div>
          </div>
          <button style={{
            padding: '6px 12px', borderRadius: 8, background: D ? 'rgba(66,122,67,0.15)' : 'rgba(66,122,67,0.08)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 11, fontWeight: 600,
          }}>
            {student.phone || student.user?.phone || '📞'}
          </button>
        </div>
      )}

      {/* Course info */}
      {course && (
        <div style={{ marginTop: 12, padding: '12px', borderRadius: 12, background: D ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: `1px solid ${bord}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={14} color={mu}/>
            <span style={{ fontSize: 12, color: tx }}>{course.title || course.name || 'Kurs'}</span>
          </div>
        </div>
      )}

      {/* Payment breakdown */}
      {(discount !== undefined || tax !== undefined || total !== undefined) && (
        <div style={{ marginTop: 12, padding: '12px', borderRadius: 12, background: D ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: `1px solid ${bord}` }}>
          {amount && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: mu }}>Asosiy summa</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: tx }}>{amount.toLocaleString()} so'm</span>
            </div>
          )}
          {discount !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: mu }}>Chegirma</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#22c55e' }}>-{discount.toLocaleString()} so'm</span>
            </div>
          )}
          {tax !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: mu }}>Soliq</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: tx }}>+{tax.toLocaleString()} so'm</span>
            </div>
          )}
          {total !== undefined && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingTop: 8, marginTop: 8, borderTop: `1px solid ${D?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)'`,
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: mu }}>Jami</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: getStatusConfig(status).color }}>{total.toLocaleString()} so'm</span>
            </div>
          )}
        </div>
      )}

      {/* Payment items */}
      {paymentItems && paymentItems.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: mu, marginBottom: 4 }}>To'lov tarkibi</p>
          {paymentItems.slice(0, 3).map((item, index) => (
            <div key={index} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 10px', borderRadius: 8,
              background: D ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${D?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: color || getStatusConfig(status).color, opacity: 0.7,
                }}/>
                <span style={{ fontSize: 11, color: mu }}>{item.name}</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: tx }}>{item.amount.toLocaleString()} so'm</span>
            </div>
          ))}
          {paymentItems.length > 3 && (
            <div style={{ fontSize: 10, color: mu, textAlign: 'center', paddingTop: 8 }}>
              +{paymentItems.length - 3} ta boshqa xizmatlar
            </div>
          )}
        </div>
      )}

      {/* Change indicator */}
      {change && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: mu }}>Batafsil</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 99, background: 'rgba(34,197,94,0.09)', border: '1px solid rgba(34,197,94,0.18)' }}>
            {change >= 0 ? (
              <>
                <TrendingUp size={10} color="#22c55e" />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e' }}>{change}%</span>
              </>
            ) : (
              <>
                <TrendingDown size={10} color="#ef4444" />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444' }}>{change}%</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Recent activities */}
      {activities && activities.length > 0 && (
        <div style={{ marginTop: 12, padding: '12px', borderRadius: 12, background: D ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: `1px solid ${bord}` }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: mu, marginBottom: 8 }}>So'nggi faoliyatlar</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {activities.slice(0, 3).map((activity, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: tx }}>
                <Activity size={12} color={color || getStatusConfig(status).color}/>
                <span>{activity}</span>
              </div>
            ))}
          </div>
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
              <action.icon size={14} color={color || getStatusConfig(status).color} strokeWidth={2}/>
              {action.label && <span style={{ marginLeft: 4 }}>{action.label}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Default action button */}
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
export function PaymentCardSmall({ icon: Icon, label, value, color, D, onClick, status }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseFloat(value) || 0;
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

  const getPaymentStatusColor = (status) => {
    if (status === 'completed' || status === 'paid') return '#22c55e';
    if (status === 'pending' || status === 'unpaid') return '#f59e0b';
    if (status === 'failed' || status === 'rejected') return '#ef4444';
    if (status === 'processing') return '#3b82f6';
    if (status === 'overdue') return '#dc2626';
    return '#8b5cf6';
  };

  return (
    <div onClick={onClick} style={{
      background: card,
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
          width: 32, height: 32, borderRadius: 10, background: color ? color + '15' : getPaymentStatusColor(status) + '15',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {Icon ? (
            <Icon size={16} color={color || getPaymentStatusColor(status)} strokeWidth={2}/>
          ) : (
            <CreditCard size={16} color={color || getPaymentStatusColor(status)} strokeWidth={2}/>
          )}
        </div>
        <p style={{ fontSize: 24, fontWeight: 700, color: D ? '#f5f5f7' : '#18181b', lineHeight: 1 }}>
          {typeof n === 'number' && !isNaN(n) ? n.toLocaleString() : n}
        </p>
      </div>
      <p style={{ fontSize: 12, fontWeight: 600, color: D ? 'rgba(245,245,247,0.42)' : 'rgba(0,0,0,0.40)' }}>{label}</p>
      {status && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: getPaymentStatusColor(status) }}/>
          <span style={{ fontSize: 10, color: D ? 'rgba(245,245,247,0.42)' : 'rgba(0,0,0,0.40)' }}>
            {status}
          </span>
        </div>
      )}
    </div>
  );
}

export default PaymentCard;