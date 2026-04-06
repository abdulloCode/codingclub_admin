import { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Users, Calendar, Clock, CheckCircle, XCircle, TrendingUp, Award, Star, Zap, Target, Crown, Sparkles, ChevronRight, Edit3, Trash2, Activity, BarChart3, Mail, Phone, FileText, Trophy, Medal, Flame, Shield, RefreshCw, Download, Play, Pause, Eye, UserCheck, AlertCircle } from 'lucide-react';

function StudentCard({ icon: Icon, label, value, sub, change, color, pale, D, onClick, student, homeworks, grades, attendance, coins, rank, level, progress, activities }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    const dur = 900;
    const s = performance.now();
    const run = now => {
      const p = Math.min((now-s)/dur,1);
      setN(Math.round((1-Math.pow(1-p,3))*end));
      if(p<1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }, [value]);

  const card = D ? 'rgba(26,26,29,0.95)' : '#fff';
  const bord = D ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const mu   = D ? 'rgba(245,245,247,0.42)' : 'rgba(0,0,0,0.40)';
  const tx   = D ? '#f5f5f7' : '#18181b';

  const getLevelColor = (level) => {
    if (level === 'beginner') return '#22c55e';
    if (level === 'intermediate') return '#f59e0b';
    if (level === 'advanced') return '#ef4444';
    return '#8b5cf6';
  };

  const getLevelLabel = (level) => {
    if (level === 'beginner') return 'Boshlang\'ich';
    if (level === 'intermediate') return 'O\'rtacha';
    if (level === 'advanced') return 'Tajribali';
    return 'Boshlan\'ich';
  };

  return (
    <div onClick={onClick} style={{
      background: card, border:`1px solid ${bord}`, borderRadius:18,
      padding:'20px 22px', cursor:'pointer', position:'relative', overflow:'hidden',
      boxShadow: D ? 'none' : '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
      transition:'transform .2s, box-shadow .2s',
    }}
    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,0.10)'}}
    onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow= D?'none':'0 1px 3px rgba(0,0,0,0.06)'}}>
      {/* Decorative bg circle */}
      <div style={{
        position:'absolute', right:-18, top:-18, width:80, height:80,
        borderRadius:'50%', background:pale, opacity:0.7, pointerEvents:'none',
      }}/>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{
          width:38, height:38, borderRadius:12, background:pale,
          display:'flex', alignItems:'center', justifyContent:'center',
          border:`1px solid ${color}22`,
        }}>
          <Icon size={18} color={color} strokeWidth={2}/>
        </div>

        {/* Rank badge */}
        {rank && (
          <div style={{
            position:'absolute', left:-12, top:-8,
            fontSize:14, fontWeight:700, color:'#fff',
            background: rank <= 3 ? '#fbbf24' : color,
            padding:'4px 10px', borderRadius:20,
            boxShadow:'0 2px 8px rgba(0,0,0,0.2)',
          }}>
            {rank <= 3 && (
              rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'
            )}
            {' #' + rank}
          </div>
        )}

        {/* Level badge */}
        {level && (
          <span style={{
            fontSize:10, fontWeight:600, padding:'3px 8px', borderRadius:99,
            background: getLevelColor(level) + '15', color:getLevelColor(level),
          }}>
            {getLevelLabel(level)}
          </span>
        )}
      </div>

      {/* Main content */}
      <p style={{ fontSize:32, fontWeight:700, color:tx, lineHeight:1, letterSpacing:'-0.02em' }}>{n}</p>
      <p style={{ fontSize:12, fontWeight:600, color:tx, marginTop:4 }}>{label}</p>
      <p style={{ fontSize:11, color:mu, marginTop:2 }}>{sub}</p>

      {/* Progress bar */}
      {progress !== undefined && (
        <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ flex:1, height:6, background:'rgba(0,0,0,0.06)', borderRadius:99, overflow:'hidden' }}>
            <div style={{
              height:'100%', width:`${progress}%`,
              background:`linear-gradient(90deg,${color},${color})`,
              borderRadius:99, transition:'width 1s ease',
            }}/>
          </div>
          <span style={{ fontSize:11, fontWeight:600, color:mu }}>{progress}%</span>
        </div>
      )}

      {/* Student info */}
      {student && (
        <div style={{ marginTop:12, padding:'12px', borderRadius:12, background:D?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.02)', border:`1px solid ${bord}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
            <div style={{ width:40, height:40, borderRadius:50, background:color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'#fff' }}>
              {(student.name || student.user?.name || '?')[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize:14, fontWeight:600, color:tx, marginBottom:2 }}>
                {student.name || student.user?.name || 'O\'quvchi'}
              </p>
              <p style={{ fontSize:11, color:mu }}>
                {student.group?.name || student.group || 'Guruh belgilanmagan'}
              </p>
            </div>
          </div>
          <button style={{
            padding:'6px 12px', borderRadius:8, background:D?'rgba(66,122,67,0.15)':'rgba(66,122,67,0.08)', border:'none', cursor:'pointer', color:'#fff', fontSize:11, fontWeight:600,
          }}>
            {student.phone || student.user?.phone || '📞'}
          </button>
        </div>
      )}

      {/* Stats */}
      {(homeworks !== undefined || grades !== undefined || attendance !== undefined || coins !== undefined) && (
        <div style={{ marginTop:12, display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px,1fr))', gap:10 }}>
          {homeworks !== undefined && (
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <FileText size={14} color={mu}/>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:tx }}>{homeworks}</p>
                <p style={{ fontSize:10, color:mu }}>Vazifalar</p>
              </div>
            </div>
          )}
          {grades !== undefined && (
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <Award size={14} color={mu}/>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:tx }}>{grades}</p>
                <p style={{ fontSize:10, color:mu }}>Baholar</p>
              </div>
            </div>
          )}
          {attendance !== undefined && (
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <Calendar size={14} color={mu}/>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:tx }}>{attendance}</p>
                <p style={{ fontSize:10, color:mu }}>Davomat</p>
              </div>
            </div>
          )}
          {coins !== undefined && (
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <Crown size={14} color={color}/>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:tx }}>{coins}</p>
                <p style={{ fontSize:10, color:mu }}>Tangalar</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent activities */}
      {activities && activities.length > 0 && (
        <div style={{ marginTop:12, padding:'12px', borderRadius:12, background:D?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.02)', border:`1px solid ${bord}` }}>
          <p style={{ fontSize:11, fontWeight:600, color:mu, marginBottom:8 }}>So'nggi faoliyatlar</p>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {activities.slice(0, 3).map((activity, index) => (
              <div key={index} style={{ display:'flex', alignItems:'center', gap:8, fontSize:11, color:tx }}>
                <Activity size={12} color={color}/>
                <span>{activity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ marginTop:12, display:'flex', gap:8 }}>
        <button style={{
          flex:1, padding:'10px 14px', borderRadius:12,
          border:`1px solid ${bord}`, background:'transparent',
          fontSize:12, fontWeight:600, color:mu, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          transition:'all .15s',
        }}
        onMouseEnter={e=>{e.currentTarget.style.background=D?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.03)'}}
        onMouseLeave={e=>{e.currentTarget.style.background='transparent'}}
        >
          <UserCheck size={14} color={color} strokeWidth={2}/>
          Davomat
        </button>
        <button style={{
          flex:1, padding:'10px 14px', borderRadius:12,
          border:`1px solid ${bord}`, background:'transparent',
          fontSize:12, fontWeight:600, color:mu, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          transition:'all .15s',
        }}
        onMouseEnter={e=>{e.currentTarget.style.background=D?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.03)'}}
        onMouseLeave={e=>{e.currentTarget.style.background='transparent'}}
        >
          <Trophy size={14} color={color} strokeWidth={2}/>
          Baholar
        </button>
      </div>
    </div>
  );
}

export default StudentCard;