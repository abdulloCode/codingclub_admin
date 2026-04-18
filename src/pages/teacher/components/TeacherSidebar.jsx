import { GraduationCap, Settings, LogOut } from 'lucide-react';

export default function TeacherSidebar({ user, active, goTo, NAV, D, C, onLogout, onSettings }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* brand */}
      <div
        style={{ padding: "16px 14px", borderBottom: `1px solid ${C.border}` }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              background: "#427A43",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <GraduationCap size={16} color="#fff" />
          </div>
          <div>
            <p
              style={{
                fontSize: 13.5,
                fontWeight: 700,
                color: C.text,
                lineHeight: 1.2,
              }}
            >
              CodingClub
            </p>
            <p style={{ fontSize: 11, color: C.muted }}>O'qituvchi Paneli</p>
          </div>
        </div>
      </div>

      {/* user */}
      <div
        style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}` }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "8px 10px",
            borderRadius: 7,
            background: D ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: D ? "#27272a" : "#f4f4f5",
              border: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color: C.text,
              flexShrink: 0,
            }}
          >
            {(user?.name || "T")[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: C.text,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.name || "O'qituvchi"}
            </p>
            <p
              style={{
                fontSize: 11,
                color: C.muted,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.email || "teacher"}
            </p>
          </div>
        </div>
      </div>

      {/* nav */}
      <nav
        style={{
          flex: 1,
          padding: "8px 10px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <p className="tp-nav-section">Menyu</p>
        {NAV.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => goTo(id)}
            className={`tp-nav-link ${active === id ? "active" : ""}`}
          >
            <span
              style={{
                width: 18,
                height: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={16} />
            </span>
            <span style={{ flex: 1 }}>{label}</span>
            {badge ? <span className="tp-nav-badge">{badge}</span> : null}
          </button>
        ))}
      </nav>

      {/* bottom */}
      <div style={{ padding: "10px", borderTop: `1px solid ${C.border}` }}>
        <button className="tp-nav-link" onClick={onSettings}>
          <span
            style={{
              width: 18,
              height: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Settings size={15} />
          </span>
          <span style={{ flex: 1 }}>Sozlamalar</span>
        </button>
        <button
          className="tp-nav-link"
          style={{ color: "#ef4444" }}
          onClick={onLogout}
        >
          <span
            style={{
              width: 18,
              height: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <LogOut size={15} />
          </span>
          <span style={{ flex: 1 }}>Chiqish</span>
        </button>
      </div>
    </div>
  );
}