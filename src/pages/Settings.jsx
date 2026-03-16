import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Sun, Moon, User, Lock, Bell, Globe, Shield, Save, RotateCw } from 'lucide-react';

export default function Settings() {
  const { isDarkMode: D, toggleDarkMode } = useTheme();
  const { user } = useAuth();

  const BRAND      = '#427A43';
  const BRAND_PALE = D ? 'rgba(66,122,67,0.15)' : 'rgba(66,122,67,0.08)';
  const bg         = D ? '#000000' : '#f5f5f7';
  const card       = D ? '#1c1c1e' : '#ffffff';
  const bord       = D ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const tx         = D ? '#f5f5f7' : '#1d1d1f';
  const mu         = D ? 'rgba(245,245,247,0.5)' : 'rgba(29,29,31,0.55)';

  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Section = ({ icon: Icon, title, children }) => (
    <div className="rounded-2xl p-5 sm:p-6" style={{ background: card, border: `1px solid ${bord}` }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: BRAND_PALE }}>
          <Icon size={18} style={{ color: BRAND }} />
        </div>
        <p className="text-sm font-bold" style={{ color: tx }}>{title}</p>
      </div>
      {children}
    </div>
  );

  const inputStyle = {
    background: D ? '#2c2c2e' : '#f5f5f7',
    border: `1px solid ${bord}`,
    color: tx,
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 14,
    width: '100%',
    outline: 'none',
  };

  const Row = ({ label, children }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3"
         style={{ borderBottom: `1px solid ${bord}` }}>
      <span className="text-sm font-medium" style={{ color: mu }}>{label}</span>
      <div className="sm:w-64">{children}</div>
    </div>
  );

  const Toggle = ({ value, onChange }) => (
    <button onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0"
      style={{ background: value ? BRAND : (D ? '#3a3a3c' : '#d1d1d6') }}>
      <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300"
            style={{ transform: value ? 'translateX(20px)' : 'translateX(0)' }} />
    </button>
  );

  const [notifs, setNotifs] = useState({ email: true, push: false, sms: true });
  const [lang, setLang]     = useState('uz');

  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-4" style={{ background: bg }}>

      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold" style={{ color: tx }}>Sozlamalar</h1>
        <p className="text-sm mt-1" style={{ color: mu }}>Tizim va profil sozlamalarini boshqaring</p>
      </div>

      {/* Profil */}
      <Section icon={User} title="Profil ma'lumotlari">
        <div className="space-y-3">
          {[
            { label: "To'liq ism", key: 'name',  type: 'text',  placeholder: 'Ism Familiya' },
            { label: 'Email',      key: 'email', type: 'email', placeholder: 'email@example.com' },
            { label: 'Telefon',    key: 'phone', type: 'tel',   placeholder: '+998 90 000 00 00' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: mu }}>{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={profile[f.key]}
                onChange={e => setProfile({ ...profile, [f.key]: e.target.value })}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Ko'rinish */}
      <Section icon={Sun} title="Ko'rinish">
        <Row label="Qorong'u rejim">
          <Toggle value={D} onChange={toggleDarkMode} />
        </Row>
        <Row label="Til">
          <select value={lang} onChange={e => setLang(e.target.value)} style={{ ...inputStyle, padding: '8px 12px' }}>
            <option value="uz">O'zbek</option>
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </select>
        </Row>
      </Section>

      {/* Bildirishnomalar */}
      <Section icon={Bell} title="Bildirishnomalar">
        {[
          { key: 'email', label: 'Email bildirishnomalar' },
          { key: 'push',  label: 'Push bildirishnomalar'  },
          { key: 'sms',   label: 'SMS bildirishnomalar'   },
        ].map(n => (
          <Row key={n.key} label={n.label}>
            <Toggle value={notifs[n.key]} onChange={v => setNotifs({ ...notifs, [n.key]: v })} />
          </Row>
        ))}
      </Section>

      {/* Xavfsizlik */}
      <Section icon={Shield} title="Xavfsizlik">
        <Row label="Parolni o'zgartirish">
          <button className="text-xs font-semibold px-4 py-2 rounded-lg transition-all hover:opacity-80"
                  style={{ background: BRAND_PALE, color: BRAND }}>
            O'zgartirish
          </button>
        </Row>
        <Row label="Ikki bosqichli tasdiqlash">
          <Toggle value={false} onChange={() => {}} />
        </Row>
      </Section>

      {/* Saqlash */}
      <div className="flex justify-end pb-4">
        <button onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: BRAND }}>
          {saved ? <RotateCw size={16} className="animate-spin" /> : <Save size={16} />}
          {saved ? 'Saqlandi!' : 'Saqlash'}
        </button>
      </div>
    </div>
  );
}