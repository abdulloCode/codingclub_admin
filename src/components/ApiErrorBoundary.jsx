import { Component } from 'react';
import { RefreshCw, Home, Wifi, WifiOff, Terminal, AlertTriangle } from 'lucide-react';

/* ─── STYLES ─────────────────────────────────────────────────── */
const styles = `
  .cc-eb-root {
    -webkit-font-smoothing: antialiased;
  }

  /* ── Logo animations ── */
  @keyframes eb-book-open {
    0%   { transform: rotateY(0deg) scale(1); }
    25%  { transform: rotateY(-20deg) scale(1.05); }
    50%  { transform: rotateY(0deg) scale(1.08); }
    75%  { transform: rotateY(20deg) scale(1.05); }
    100% { transform: rotateY(0deg) scale(1); }
  }
  @keyframes eb-page-flip {
    0%, 100% { transform: rotateY(0deg); opacity: 1; }
    50%       { transform: rotateY(-90deg); opacity: 0.3; }
  }
  @keyframes eb-float {
    0%, 100% { transform: translateY(0px) rotate(-2deg); }
    50%       { transform: translateY(-10px) rotate(2deg); }
  }
  @keyframes eb-orbit {
    from { transform: rotate(0deg) translateX(38px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(38px) rotate(-360deg); }
  }
  @keyframes eb-orbit-rev {
    from { transform: rotate(0deg) translateX(52px) rotate(0deg); }
    to   { transform: rotate(-360deg) translateX(52px) rotate(360deg); }
  }
  @keyframes eb-pulse-ring {
    0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(66,122,67,0.5); }
    70%  { transform: scale(1);    box-shadow: 0 0 0 14px rgba(66,122,67,0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(66,122,67,0); }
  }
  @keyframes eb-glitch {
    0%,100% { transform: translate(0); clip-path: none; }
    20%      { transform: translate(-2px, 1px); }
    40%      { transform: translate(2px, -1px); }
    60%      { transform: translate(-1px, 2px); }
    80%      { transform: translate(1px, -2px); }
  }
  @keyframes eb-fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes eb-fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes eb-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes eb-shake {
    0%,100% { transform: translateX(0); }
    15%      { transform: translateX(-5px) rotate(-1deg); }
    30%      { transform: translateX(5px) rotate(1deg); }
    45%      { transform: translateX(-4px); }
    60%      { transform: translateX(4px); }
    75%      { transform: translateX(-2px); }
    90%      { transform: translateX(2px); }
  }
  @keyframes eb-dot-blink {
    0%,80%,100% { opacity: 0; transform: scale(0.6); }
    40%          { opacity: 1; transform: scale(1);   }
  }
  @keyframes eb-scan {
    0%   { transform: translateY(-100%); opacity: 0.6; }
    100% { transform: translateY(600%);  opacity: 0;   }
  }
  @keyframes eb-bg-shift {
    0%,100% { background-position: 0% 50%; }
    50%      { background-position: 100% 50%; }
  }
  @keyframes eb-code-fall {
    from { transform: translateY(-20px); opacity: 0; }
    to   { transform: translateY(0);     opacity: 0.15; }
  }
  @keyframes eb-error-flash {
    0%,100% { opacity: 1; }
    50%      { opacity: 0.6; }
  }

  .eb-logo-float  { animation: eb-float 4s ease-in-out infinite; }
  .eb-pulse-ring  { animation: eb-pulse-ring 2.5s ease-out infinite; }
  .eb-orbit-1     { animation: eb-orbit 5s linear infinite; }
  .eb-orbit-2     { animation: eb-orbit-rev 8s linear infinite; }
  .eb-shake       { animation: eb-shake 0.6s ease both; }
  .eb-spin        { animation: eb-spin 1s linear infinite; }
  .eb-error-flash { animation: eb-error-flash 1.5s ease-in-out infinite; }

  .eb-fu-1 { animation: eb-fadeUp 0.6s ease 0.05s both; }
  .eb-fu-2 { animation: eb-fadeUp 0.6s ease 0.15s both; }
  .eb-fu-3 { animation: eb-fadeUp 0.6s ease 0.25s both; }
  .eb-fu-4 { animation: eb-fadeUp 0.6s ease 0.35s both; }
  .eb-fi   { animation: eb-fadeIn 0.8s ease both; }

  .eb-btn {
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s, opacity 0.2s;
    border: none;
  }
  .eb-btn:hover  { transform: scale(1.04) translateY(-1px); }
  .eb-btn:active { transform: scale(0.97); }

  .eb-code-char {
    position: absolute;
    font-family: monospace;
    font-size: 11px;
    color: rgba(66,122,67,0.18);
    pointer-events: none;
    animation: eb-code-fall 0.8s ease both;
  }

  .eb-scan-line {
    position: absolute; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, rgba(66,122,67,0.3), transparent);
    animation: eb-scan 3s ease-in-out infinite;
  }

  .eb-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #427A43; }
  .eb-dot:nth-child(1) { animation: eb-dot-blink 1.4s ease-in-out 0.0s infinite; }
  .eb-dot:nth-child(2) { animation: eb-dot-blink 1.4s ease-in-out 0.2s infinite; }
  .eb-dot:nth-child(3) { animation: eb-dot-blink 1.4s ease-in-out 0.4s infinite; }
`;

/* ─── ANIMATED LOGO ──────────────────────────────────────────── */
function CodingClubLogo() {
  return (
    <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 28px' }}>

      {/* Outer orbit ring (decorative) */}
      <div style={{
        position: 'absolute', inset: -8, borderRadius: '50%',
        border: '1px dashed rgba(66,122,67,0.18)',
        animation: 'eb-spin 20s linear infinite',
      }} />

      {/* Pulse ring */}
      <div className="eb-pulse-ring" style={{
        position: 'absolute', inset: 8, borderRadius: '50%',
        background: 'transparent',
      }} />

      {/* Orbiting dots */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="eb-orbit-1" style={{
          width: 10, height: 10, borderRadius: '50%',
          background: 'linear-gradient(135deg, #427A43, #5a9e5b)',
          boxShadow: '0 0 8px rgba(66,122,67,0.5)',
        }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="eb-orbit-2" style={{
          width: 7, height: 7, borderRadius: '50%',
          background: '#c9a84c',
          boxShadow: '0 0 6px rgba(201,168,76,0.5)',
        }} />
      </div>

      {/* Main icon container */}
      <div className="eb-logo-float" style={{
        position: 'absolute', inset: 16,
        borderRadius: '28px',
        background: 'linear-gradient(135deg, #2d5630 0%, #427A43 50%, #5a9e5b 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(66,122,67,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
      }}>
        {/* Scan line effect */}
        <div className="eb-scan-line" />

        {/* Book SVG icon — custom animated */}
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ position: 'relative', zIndex: 1 }}>
          {/* Book spine */}
          <rect x="18" y="6" width="4" height="28" rx="2" fill="rgba(255,255,255,0.3)" />

          {/* Left page */}
          <path d="M18 8 C18 8 8 9 6 12 L6 32 C8 30 18 30 18 30 Z" fill="rgba(255,255,255,0.85)"
                style={{ animation: 'eb-page-flip 3s ease-in-out infinite', transformOrigin: 'right center' }} />

          {/* Right page */}
          <path d="M22 8 C22 8 32 9 34 12 L34 32 C32 30 22 30 22 30 Z" fill="rgba(255,255,255,0.65)"
                style={{ animation: 'eb-page-flip 3s ease-in-out 1.5s infinite', transformOrigin: 'left center' }} />

          {/* Lines on left page */}
          <line x1="9" y1="16" x2="16" y2="15" stroke="rgba(66,122,67,0.4)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="9" y1="20" x2="16" y2="19" stroke="rgba(66,122,67,0.4)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="9" y1="24" x2="15" y2="23" stroke="rgba(66,122,67,0.4)" strokeWidth="1.5" strokeLinecap="round" />

          {/* Lines on right page */}
          <line x1="24" y1="15" x2="31" y2="16" stroke="rgba(66,122,67,0.3)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="24" y1="19" x2="31" y2="20" stroke="rgba(66,122,67,0.3)" strokeWidth="1.5" strokeLinecap="round" />

          {/* Error X mark overlay */}
          <g style={{ animation: 'eb-error-flash 2s ease-in-out infinite' }}>
            <circle cx="30" cy="10" r="7" fill="#ef4444" />
            <path d="M27 7 L33 13 M33 7 L27 13" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      {/* Brand label */}
      <div style={{
        position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, #427A43, #5a9e5b)',
        padding: '3px 12px', borderRadius: 99,
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 12px rgba(66,122,67,0.3)',
      }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: '0.08em' }}>
          CODINGCLUB
        </span>
      </div>
    </div>
  );
}

/* ─── ERROR CODE RAIN ────────────────────────────────────────── */
function CodeRain({ D }) {
  const chars = ['500', 'ERR', '{}', '//', '🔴', 'null', '[]', 'API', '404', '⚠'];
  const positions = [
    { left: '5%',  top: '10%', delay: '0s'    },
    { left: '15%', top: '60%', delay: '0.3s'  },
    { left: '80%', top: '20%', delay: '0.6s'  },
    { left: '90%', top: '70%', delay: '0.9s'  },
    { left: '50%', top: '85%', delay: '0.15s' },
    { left: '70%', top: '45%', delay: '0.45s' },
  ];
  return (
    <>
      {positions.map((pos, i) => (
        <span key={i} className="eb-code-char" style={{
          left: pos.left, top: pos.top,
          animationDelay: pos.delay,
          color: D ? 'rgba(66,122,67,0.14)' : 'rgba(66,122,67,0.12)',
        }}>
          {chars[i % chars.length]}
        </span>
      ))}
    </>
  );
}

/* ─── ERROR STATUS BADGE ─────────────────────────────────────── */
function StatusBadge({ online }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '6px 14px', borderRadius: 99, marginBottom: 16,
      background: online ? 'rgba(34,197,94,0.10)' : 'rgba(239,68,68,0.10)',
      border: `1px solid ${online ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
    }}>
      {online
        ? <Wifi size={13} color="#22c55e" />
        : <WifiOff size={13} color="#ef4444" />
      }
      <span style={{
        fontSize: 11, fontWeight: 800,
        color: online ? '#22c55e' : '#ef4444',
        letterSpacing: '0.06em', textTransform: 'uppercase',
      }}>
        {online ? 'Internet bor' : 'Internet yo\'q'}
      </span>
    </div>
  );
}
export class ApiErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isOnline: navigator.onLine,
      retrying: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('ApiErrorBoundary:', error, errorInfo);
  }

  componentDidMount() {
    window.addEventListener('online',  this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  componentWillUnmount() {
    window.removeEventListener('online',  this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  handleOnline  = () => this.setState({ isOnline: true });
  handleOffline = () => this.setState({ isOnline: false });

  handleRetry = () => {
    this.setState({ retrying: true });
    setTimeout(() => {
      this.setState({ hasError: false, error: null, errorInfo: null, retrying: false }, () => {
        window.location.reload();
      });
    }, 800);
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    /* ── Detect dark mode from html/body class or system pref ── */
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const hasDarkClass = document.documentElement.classList.contains('dark');
    const D = hasDarkClass || prefersDark;

    const bg      = D ? '#0a0a0b' : '#f0f4f0';
    const card    = D ? 'rgba(22,22,24,0.97)' : '#ffffff';
    const bord    = D ? 'rgba(255,255,255,0.08)' : 'rgba(66,122,67,0.14)';
    const tx      = D ? '#f5f5f7' : '#1a1a1a';
    const mu      = D ? 'rgba(245,245,247,0.45)' : 'rgba(0,0,0,0.45)';
    const errBg   = D ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.04)';
    const errBord = D ? 'rgba(239,68,68,0.20)' : 'rgba(239,68,68,0.15)';

    const errMsg = this.state.error?.message || "Noma'lum xatolik";

    return (
      <>
        <style>{styles}</style>
        <div className="cc-eb-root eb-fi" style={{
          minHeight: '100vh',
          background: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: D
              ? 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(66,122,67,0.12) 0%, transparent 70%)'
              : 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(66,122,67,0.07) 0%, transparent 70%)',
          }} />

          {/* Floating code characters */}
          <CodeRain D={D} />

          {/* Card */}
          <div style={{
            width: '100%', maxWidth: 440,
            background: card,
            border: `1px solid ${bord}`,
            borderRadius: 28,
            padding: '40px 36px 32px',
            boxShadow: D
              ? '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 20px 60px rgba(66,122,67,0.12), 0 4px 16px rgba(0,0,0,0.06)',
            position: 'relative', overflow: 'hidden',
            textAlign: 'center',
          }}>

            {/* Top accent */}
            <div style={{
              position: 'absolute', top: 0, left: '20%', right: '20%', height: 3,
              background: 'linear-gradient(90deg, transparent, #427A43, transparent)',
              borderRadius: '0 0 4px 4px',
            }} />

            {/* Logo */}
            <div className="eb-fu-1">
              <CodingClubLogo />
            </div>

            {/* Online status */}
            <div className="eb-fu-2">
              <StatusBadge online={this.state.isOnline} />
            </div>

            {/* Title */}
            <h1 className="cc-serif eb-fu-2" style={{
              fontSize: 26, fontWeight: 400,
              color: tx, marginBottom: 10, lineHeight: 1.2,
            }}>
              Ulanishda xatolik
            </h1>

            {/* Subtitle */}
            <p className="eb-fu-2" style={{
              fontSize: 13, color: mu, lineHeight: 1.7, marginBottom: 24,
            }}>
              Backend server ishlamayapti yoki ma'lumotlarni
              yuklashda muammo yuz berdi. Internet aloqangizni
              tekshirib, qayta urinib ko'ring.
            </p>

            {/* Error detail box */}
            <div className="eb-fu-3 eb-shake" style={{
              background: errBg, border: `1px solid ${errBord}`,
              borderRadius: 14, padding: '12px 16px',
              marginBottom: 24,
              display: 'flex', alignItems: 'flex-start', gap: 10,
              textAlign: 'left',
            }}>
              <Terminal size={14} color="#ef4444" style={{ marginTop: 1, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 10, fontWeight: 800, color: '#ef4444', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>
                  Xato tafsiloti
                </p>
                <p style={{ fontSize: 12, color: mu, fontFamily: 'monospace', lineHeight: 1.5, wordBreak: 'break-all' }}>
                  {errMsg}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="eb-fu-4" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                className="eb-btn"
                onClick={this.handleRetry}
                disabled={this.state.retrying}
                style={{
                  width: '100%', padding: '13px',
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #2d5630, #427A43, #5a9e5b)',
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  boxShadow: '0 6px 20px rgba(66,122,67,0.35)',
                  opacity: this.state.retrying ? 0.75 : 1,
                }}
              >
                <RefreshCw
                  size={16}
                  className={this.state.retrying ? 'eb-spin' : ''}
                />
                {this.state.retrying ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    Ulanilmoqda
                    <span style={{ display: 'flex', gap: 3 }}>
                      <span className="eb-dot" />
                      <span className="eb-dot" />
                      <span className="eb-dot" />
                    </span>
                  </span>
                ) : 'Qayta urinish'}
              </button>

              <button
                className="eb-btn"
                onClick={this.handleGoHome}
                style={{
                  width: '100%', padding: '13px',
                  borderRadius: 14,
                  background: D ? 'rgba(255,255,255,0.05)' : 'rgba(66,122,67,0.07)',
                  border: `1px solid ${bord}`,
                  color: tx, fontSize: 14, fontWeight: 600,
                }}
              >
                <Home size={16} color="#427A43" />
                Bosh sahifaga qaytish
              </button>
            </div>

            {/* Footer note */}
            <div className="eb-fu-4" style={{
              marginTop: 24, paddingTop: 20,
              borderTop: `1px solid ${bord}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <AlertTriangle size={12} color={mu} />
              <p style={{ fontSize: 11, color: mu, lineHeight: 1.5 }}>
                Muammo davom etsa, administrator bilan bog'laning
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default ApiErrorBoundary;