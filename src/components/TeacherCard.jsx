import { useState, useEffect } from 'react';
import { BookOpen, Users, Calendar, Clock, CheckCircle, XCircle, TrendingUp, Award, Star, Zap, Target, Crown, Sparkles, ChevronRight, Edit3, Trash2, UserPlus, Activity, BarChart3, Shield, Search, Filter, MoreHorizontal, Bell, RefreshCw, Mail, Phone, GraduationCap, FileText } from 'lucide-react';

function TeacherCard({ icon: Icon, label, value, sub, change, color, pale, D, onClick, teacher, groups, students, rating, courses, income, activities }) {
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

        {/* Rating stars */}
        {rating && (
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            {[1,2,3,4,5].map((star) => (
              <Star
                key={star}
                size={14}
                fill={star <= rating ? color : 'none'}
                stroke={star <= rating ? color : 'rgba(0,0,0,0.2)'}
                strokeWidth={2}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <p style={{ fontSize:32, fontWeight:700, color:tx, lineHeight:1, letterSpacing:'-0.02em' }}>{n}</p>
      <p style={{ fontSize:12, fontWeight:600, color:tx, marginTop:4 }}>{label}</p>
      <p style={{ fontSize:11, color:mu, marginTop:2 }}>{sub}</p>

      {/* Teacher info */}
      {teacher && (
        <div style={{ marginTop:12, padding:'12px', borderRadius:12, background:D?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.02)', border:`1px solid ${bord}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <GraduationCap size={14} color={color}/>
            <span style={{ fontSize:12, fontWeight:600, color:tx }}>{teacher.name || teacher.user?.name || 'O\'qituvchi'}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:16, fontSize:11, color:mu }}>
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <Mail size={12} color={mu}/>
              <span>{teacher.email || teacher.user?.email || '—'}</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <Phone size={12} color={mu}/>
              <span>{teacher.phone || teacher.user?.phone || '—'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {(groups || students || courses || income) && (
        <div style={{ marginTop:12, display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(100px,1fr))', gap:10 }}>
          {groups !== undefined && (
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <Users size={14} color={mu}/>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:tx }}>{groups}</p>
                <p style={{ fontSize:10, color:mu }}>Guruhlar</p>
              </div>
            </div>
          )}
          {students !== undefined && (
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <GraduationCap size={14} color={mu}/>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:tx }}>{students}</p>
                <p style={{ fontSize:10, color:mu }}>O\'quvchilar</p>
              </div>
            </div>
          )}
          {courses !== undefined && (
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <BookOpen size={14} color={mu}/>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:tx }}>{courses}</p>
                <p style={{ fontSize:10, color:mu }}>Kurslar</p>
              </div>
            </div>
          )}
          {income !== undefined && (
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <TrendingUp size={14} color={mu}/>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:tx }}>{income}</p>
                <p style={{ fontSize:10, color:mu }}>Daromad</p>
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
          <Mail size={14} color={color} strokeWidth={2}/>
          Xabar
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
          <FileText size={14} color={color} strokeWidth={2}/>
          Baholar
        </button>
      </div>
    </div>
  );
}

export default TeacherCard;