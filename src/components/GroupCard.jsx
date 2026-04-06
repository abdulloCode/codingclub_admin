import { useState, useEffect } from 'react';
import { Users, BookOpen, Calendar, Clock, CheckCircle, XCircle, TrendingUp, Activity, Star, Shield, Edit3, Trash2, UserPlus, Settings, MoreHorizontal, ChevronRight, GraduationCap, Layers, Award, AlertTriangle, RefreshCw, Zap, Target, Crown, Sparkles, FileText } from 'lucide-react';

function GroupCard({ group, students, teacher, course, status, attendance, progress, completionRate, D, onClick, onEdit, onDelete, onStudents, onAttendance, onStats, activities, badges }) {
  const card = D ? 'rgba(26,26,29,0.95)' : '#fff';
  const bord = D ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const mu   = D ? 'rgba(245,245,247,0.42)' : 'rgba(0,0,0,0.40)';
  const tx   = D ? '#f5f5f7' : '#18181b';

  const getStatusColor = (status) => {
    if (status === 'active') return { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', label: 'Faol' };
    if (status === 'completed') return { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Tugallangan' };
    if (status === 'cancelled') return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'Bekor qilingan' };
    return { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', label: 'Nofaol' };
  };

  const getStatusConfig = getStatusColor(status);

  return (
    <div onClick={onClick} style={{
      background: card, border:`1px solid ${bord}`, borderRadius:18,
      padding:'20px', cursor:'pointer', position:'relative', overflow:'hidden',
      boxShadow: D ? 'none' : '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
      transition:'transform .2s, box-shadow .2s',
    }}
    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,0.10)'}}
    onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow= D?'none':'0 1px 3px rgba(0,0,0,0.06)'}}>
      {/* Decorative bg circle */}
      <div style={{
        position:'absolute', right:-18, top:-18, width:80, height:80,
        borderRadius:'50%', background:getStatusConfig(status).bg, opacity:0.3, pointerEvents:'none',
      }}/>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{
          width:38, height:38, borderRadius:12, background:getStatusConfig(status).bg,
          display:'flex', alignItems:'center', justifyContent:'center',
          border:`1px solid ${getStatusConfig(status).color}22`,
        }}>
          <Layers size={18} color={getStatusConfig(status).color} strokeWidth={2}/>
        </div>

        {/* Status badge */}
        <span style={{
          fontSize:10, fontWeight:600, padding:'3px 8px', borderRadius:99,
          background:getStatusConfig(status).bg, color:getStatusConfig(status).color,
          textTransform:'uppercase', letterSpacing:'0.05em',
        }}>
          {getStatusConfig(status).label}
        </span>
      </div>

      {/* Main content */}
      <p style={{ fontSize:16, fontWeight:700, color:tx, marginBottom:8 }}>{group?.name || 'Guruh nomi'}</p>

      {/* Course info */}
      {course && (
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <BookOpen size={14} color={mu}/>
          <p style={{ fontSize:12, color:mu }}>{course.title || course.name || 'Kurs'}</p>
        </div>
      )}

      {/* Teacher info */}
      {teacher && (
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, padding:'12px', borderRadius:12, background:D?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.02)', border:`1px solid ${bord}` }}>
          <GraduationCap size={14} color={mu}/>
          <span style={{ fontSize:12, color:tx }}>
            {teacher.name || teacher.user?.name || 'O\'qituvchi'}
          </span>
        </div>
      )}

      {/* Progress */}
      {progress !== undefined && (
        <div style={{ marginBottom:12 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
            <span style={{ fontSize:11, color:mu }}>Progress</span>
            <span style={{ fontSize:14, fontWeight:700, color:tx }}>{progress}%</span>
          </div>
          <div style={{ flex:1, height:6, background:'rgba(0,0,0,0.06)', borderRadius:99, overflow:'hidden' }}>
            <div style={{
              height:'100%', width:`${progress}%`,
              background:`linear-gradient(90deg,${getStatusConfig(status).color},${getStatusConfig(status).color})`,
              borderRadius:99, transition:'width 1s ease',
            }}/>
          </div>
        </div>
      )}

      {/* Completion rate */}
      {completionRate !== undefined && (
        <div style={{ marginBottom:12 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
            <span style={{ fontSize:11, color:mu }}>Tamomlanish</span>
            <span style={{ fontSize:14, fontWeight:700, color:tx }}>{completionRate}%</span>
          </div>
          <div style={{ flex:1, height:6, background:'rgba(0,0,0,0.06)', borderRadius:99, overflow:'hidden' }}>
            <div style={{
              height:'100%', width:`${completionRate}%`,
              background:`linear-gradient(90deg,#22c55e,#10b981)`,
              borderRadius:99, transition:'width 1s ease',
            }}/>
          </div>
        </div>
      )}

      {/* Stats */}
      {(students !== undefined || attendance !== undefined) && (
        <div style={{ marginTop:12, display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px,1fr))', gap:10 }}>
          {students !== undefined && (
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <Users size={14} color={mu}/>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:tx }}>{students}</p>
                <p style={{ fontSize:10, color:mu }}>O\'quvchilar</p>
              </div>
            </div>
          )}
          {attendance !== undefined && (
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <CheckCircle size={14} color={mu}/>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:tx }}>{attendance}</p>
                <p style={{ fontSize:10, color:mu }}>Davomat (%)</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Badges */}
      {badges && badges.length > 0 && (
        <div style={{ marginTop:12, display:'flex', gap:6, flexWrap:'wrap' }}>
          {badges.map((badge, index) => (
            <span key={index} style={{
              fontSize:10, fontWeight:600, padding:'3px 8px', borderRadius:99,
              background:badge.bg + '20', color:badge.color, border:`1px solid ${badge.color}30`,
            }}>
              {badge.label}
            </span>
          ))}
        </div>
      )}

      {/* Recent activities */}
      {activities && activities.length > 0 && (
        <div style={{ marginTop:12, padding:'12px', borderRadius:12, background:D?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.02)', border:`1px solid ${bord}` }}>
          <p style={{ fontSize:11, fontWeight:600, color:mu, marginBottom:8 }}>So'nggi faoliyatlar</p>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {activities.slice(0, 3).map((activity, index) => (
              <div key={index} style={{ display:'flex', alignItems:'center', gap:8, fontSize:11, color:tx }}>
                <Activity size={12} color={getStatusConfig(status).color}/>
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
          <FileText size={14} color={getStatusConfig(status).color} strokeWidth={2}/>
          Vazifalar
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
          <UserCheck size={14} color={getStatusConfig(status).color} strokeWidth={2}/>
          Davomat
        </button>
      </div>

      {/* Quick action buttons */}
      <div style={{ marginTop:12, display:'flex', gap:6, justifyContent:'center' }}>
        <button
          style={{
            padding:'8px 16px', borderRadius:10, border:`1px solid ${bord}`,
            background:'transparent', color:mu, fontSize:11, fontWeight:600, cursor:'pointer',
            display:'flex', alignItems:'center', gap:6, transition:'all .15s',
          }}
          onClick={onStats}
        >
          <BarChart3 size={14} strokeWidth={2}/> Statistika
        </button>
        <button
          style={{
            padding:'8px 16px', borderRadius:10, border:`1px solid ${bord}`,
            background:'transparent', color:mu, fontSize:11, fontWeight:600, cursor:'pointer',
            display:'flex', alignItems:'center', gap:6, transition:'all .15s',
          }}
          onClick={onEdit}
        >
          <Settings size={14} strokeWidth={2}/> Tahrirlash
        </button>
        <button
          style={{
            padding:'8px 16px', borderRadius:10, border:`1px solid ${bord}`,
            background:'transparent', color:mu, fontSize:11, fontWeight:600, cursor:'pointer',
            display:'flex', alignItems:'center', gap:6, transition:'all .15s',
          }}
          onClick={onStudents}
        >
          <Users size={14} strokeWidth={2}/> O'quvchilar
        </button>
        <button
          style={{
            padding:'8px 16px', borderRadius:10, border:`1px solid ${bord}`,
            background:'transparent', color:mu, fontSize:11, fontWeight:600, cursor:'pointer',
            display:'flex', alignItems:'center', gap:6, transition:'all .15s',
          }}
          onClick={onAttendance}
        >
          <Calendar size={14} strokeWidth={2}/> Davomat
        </button>
      </div>
    </div>
  );
}

export default GroupCard;