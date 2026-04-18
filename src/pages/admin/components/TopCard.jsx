import { useState, useEffect } from 'react';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

const BL = '#5a9e5b';
const BD = '#2d5630';

export default function TopCard({ icon: Icon, label, value, sub, change, color, pale, D, onClick }) {
  const [n, setN] = useState(0);

  useEffect(() => {
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
    <div onClick={onClick} style={{ background:card, border:`1px solid ${bord}`, borderRadius:18, padding:'20px 22px', cursor:'pointer', position:'relative', overflow:'hidden', boxShadow: D?'none':'0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04)', transition:'transform .2s,box-shadow .2s' }}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,0.10)'}}
      onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow=D?'none':'0 1px 3px rgba(0,0,0,0.06)'}}>
      <div style={{ position:'absolute', right:-18, top:-18, width:80, height:80, borderRadius:'50%', background:pale, opacity:0.7, pointerEvents:'none' }}/>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ width:38, height:38, borderRadius:12, background:pale, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${color}22` }}>
          <Icon size={18} color={color} strokeWidth={2}/>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 9px', borderRadius:99, background:'rgba(34,197,94,0.09)', border:'1px solid rgba(34,197,94,0.18)' }}>
          <TrendingUp size={10} color="#22c55e"/>
          <span style={{ fontSize:10, fontWeight:700, color:'#22c55e' }}>{change}</span>
        </div>
      </div>
      <p style={{ fontSize:32, fontWeight:700, color:tx, lineHeight:1, letterSpacing:'-0.02em' }}>{n}</p>
      <p style={{ fontSize:12, fontWeight:600, color:tx, marginTop:4 }}>{label}</p>
      <p style={{ fontSize:11, color:mu, marginTop:2 }}>{sub}</p>
      <div style={{ marginTop:12, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:11, color:mu }}>Batafsil</span>
        <ArrowUpRight size={12} color={mu}/>
      </div>
      <div style={{ height:3, background:'rgba(0,0,0,0.06)', borderRadius:99, marginTop:8, overflow:'hidden' }}>
        <div style={{ height:'100%', width:'72%', background:`linear-gradient(90deg,${BD},${BL})`, borderRadius:99 }}/>
      </div>
    </div>
  );
}