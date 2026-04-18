import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const B = '#427A43';
const BL = '#5a9e5b';
const BD = '#2d5630';

export default function MiniCalendar({ D }) {
  const today = new Date();
  const [cur, setCur] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const days   = ['Mo','Tu','We','Th','Fr','Sa','Su'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const firstDay    = new Date(cur.getFullYear(), cur.getMonth(), 1).getDay();
  const offset      = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
  const highlighted = [9,14,21,28];
  const mu   = D ? 'rgba(245,245,247,0.45)' : 'rgba(0,0,0,0.40)';
  const tx   = D ? '#f5f5f7' : '#111';
  const bord = D ? 'rgba(255,255,255,0.07)' : 'rgba(66,122,67,0.10)';

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <button onClick={() => setCur(new Date(cur.getFullYear(), cur.getMonth()-1,1))}
          style={{ background:'none', border:'none', cursor:'pointer', color:mu, display:'flex', alignItems:'center' }}>
          <ChevronLeft size={15}/>
        </button>
        <span style={{ fontSize:13, fontWeight:600, color:tx }}>{months[cur.getMonth()]} {cur.getFullYear()}</span>
        <button onClick={() => setCur(new Date(cur.getFullYear(), cur.getMonth()+1,1))}
          style={{ background:'none', border:'none', cursor:'pointer', color:mu, display:'flex', alignItems:'center' }}>
          <ChevronRight size={15}/>
        </button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:6 }}>
        {days.map(d => <div key={d} style={{ textAlign:'center', fontSize:10, fontWeight:700, color:mu, padding:'3px 0' }}>{d}</div>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
        {Array(offset).fill(null).map((_,i) => <div key={'e'+i}/>)}
        {Array(daysInMonth).fill(null).map((_,i) => {
          const day = i+1;
          const isToday = day === today.getDate() && cur.getMonth() === today.getMonth() && cur.getFullYear() === today.getFullYear();
          const isHL = highlighted.includes(day);
          return (
            <div key={day} style={{
              textAlign:'center', fontSize:11, fontWeight: isToday||isHL ? 700 : 400,
              padding:'5px 0', borderRadius:7, cursor:'pointer',
              background: isToday ? `linear-gradient(135deg,${BD},${BL})` : isHL ? 'rgba(66,122,67,0.12)' : 'transparent',
              color: isToday ? '#fff' : isHL ? B : tx,
              transition:'background .15s',
            }}>{day}</div>
          );
        })}
      </div>
      <div style={{ marginTop:12, borderTop:`1px solid ${bord}`, paddingTop:12 }}>
        <p style={{ fontSize:11, fontWeight:600, color:mu, marginBottom:8 }}>Jadvaldagi darslar</p>
        {[{time:'10:00',label:'React - Group A'},{time:'14:00',label:'Node.js - Group B'}].map(ev=>(
          <div key={ev.time} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <div style={{ width:3, height:28, borderRadius:99, background:`linear-gradient(${BD},${BL})` }}/>
            <div>
              <p style={{ fontSize:11, fontWeight:600, color:tx }}>{ev.label}</p>
              <p style={{ fontSize:10, color:mu, display:'flex', alignItems:'center', gap:3 }}><Clock size={9}/> {ev.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}