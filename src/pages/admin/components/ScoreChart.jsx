import { useState } from 'react';

const B = '#427A43';
const BL = '#5a9e5b';
const BD = '#2d5630';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const SCORES = [62, 45, 78, 55, 88, 95, 70, 82, 60, 75, 68, 80];

export default function ScoreChart({ D }) {
  const [hov, setHov] = useState(null);
  const mu   = D ? 'rgba(245,245,247,0.40)' : 'rgba(0,0,0,0.35)';
  const grid = D ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const maxV = Math.max(...SCORES);

  return (
    <div style={{ width:'100%' }}>
      <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:110, position:'relative' }}>
        {[0,25,50,75,100].map(v => (
          <div key={v} style={{ position:'absolute', left:0, right:0, bottom:`${v}%`, borderTop:`1px dashed ${grid}`, pointerEvents:'none' }}>
            <span style={{ position:'absolute', left:-24, top:-7, fontSize:9, color:mu }}>{v}</span>
          </div>
        ))}
        {SCORES.map((s, i) => {
          const isActive = i === 5;
          const isHov = hov === i;
          return (
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, position:'relative', height:'100%', justifyContent:'flex-end' }}
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}>
              {(isHov || isActive) && (
                <div style={{ position:'absolute', top:-32, left:'50%', transform:'translateX(-50%)', background: isActive ? B : '#333', color:'#fff', fontSize:10, fontWeight:700, padding:'3px 7px', borderRadius:6, whiteSpace:'nowrap', pointerEvents:'none', zIndex:10 }}>
                  avg. {s}%
                </div>
              )}
              <div style={{ width:'100%', borderRadius:'5px 5px 0 0', height:`${(s/maxV)*100}%`, background: isActive ? `linear-gradient(180deg,${BL},${BD})` : isHov ? `linear-gradient(180deg,rgba(66,122,67,0.5),rgba(66,122,67,0.2))` : D ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)', transition:'all .2s', cursor:'pointer' }}/>
            </div>
          );
        })}
      </div>
      <div style={{ display:'flex', gap:6, marginTop:8 }}>
        {MONTHS.map((m,i) => <div key={m} style={{ flex:1, textAlign:'center', fontSize:9, color: hov===i ? B : mu, fontWeight: hov===i ? 700 : 400, transition:'color .15s' }}>{m}</div>)}
      </div>
    </div>
  );
}