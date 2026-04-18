import { Save, X, RotateCw } from 'lucide-react';

const BL = '#5a9e5b';
const BD = '#2d5630';

export default function Modal({ open, title, subtitle, onClose, onSubmit, loading, D, children }) {
  if (!open) return null;
  const card = D ? 'rgba(18,18,20,0.99)' : '#fff';
  const bord = D ? 'rgba(255,255,255,0.08)' : 'rgba(66,122,67,0.12)';
  const mu   = D ? 'rgba(245,245,247,0.45)' : 'rgba(0,0,0,0.45)';
  const tx   = D ? '#f5f5f7' : '#111';

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position:'fixed', inset:0, zIndex:60, background:'rgba(0,0,0,0.50)', backdropFilter:'blur(14px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ width:'100%', maxWidth:520, borderRadius:24, background:card, border:`1px solid ${bord}`, boxShadow:'0 30px 80px rgba(0,0,0,0.25)', maxHeight:'90vh', display:'flex', flexDirection:'column', animation:'fadeIn .25s ease both' }}>
        <div style={{ padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${bord}`, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:12, background:`linear-gradient(135deg,${BD},${BL})`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(66,122,67,0.25)' }}>
              <Save size={16} color="#fff"/>
            </div>
            <div>
              <p style={{ fontSize:15, fontWeight:700, color:tx }}>{title}</p>
              <p style={{ fontSize:11, color:mu }}>{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:9, background:'rgba(0,0,0,0.06)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:mu }}><X size={14}/></button>
        </div>
        <form onSubmit={onSubmit} style={{ padding:'20px 24px', overflowY:'auto', display:'flex', flexDirection:'column', gap:13 }}>
          {children}
          <div style={{ display:'flex', gap:10, paddingTop:4 }}>
            <button type="button" onClick={onClose} style={{ flex:1, padding:'12px', borderRadius:13, background:'transparent', border:`1px solid ${bord}`, fontSize:13, fontWeight:600, color:mu, cursor:'pointer' }}>Bekor qilish</button>
            <button type="submit" disabled={loading} style={{ flex:2, padding:'12px', borderRadius:13, background:`linear-gradient(135deg,${BD},${BL})`, border:'none', fontSize:13, fontWeight:700, color:'#fff', cursor:loading?'not-allowed':'pointer', opacity:loading?0.6:1, boxShadow:'0 4px 14px rgba(66,122,67,0.30)', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
              {loading ? <><RotateCw size={13} style={{ animation:'spin .9s linear infinite' }}/> Saqlanmoqda...</> : "Qo'shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}