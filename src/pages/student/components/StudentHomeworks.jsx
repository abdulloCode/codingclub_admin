import { BookOpen, Clock, Star, FileText, Send } from 'lucide-react';

export default function StudentHomeworks({ homeworks, submissions, active, onSelectHomework, C }) {
  const formatDate = (date) => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return "—";
    }
  };

  if (active === "dashboard") {
    return (
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>So'nggi uy vazifalari</p>
        </div>
        {homeworks.slice(0, 5).map(hw => (
          <div key={hw.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `${C.blue}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText size={16} color={C.blue} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{hw.title}</p>
              <p style={{ fontSize: 11, color: C.muted }}>Muddat: {formatDate(hw.deadline)}</p>
            </div>
            {hw.submitted ? (
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: `${C.green}15`, color: C.green }}>✅ Topshirilgan</span>
            ) : (
              <button onClick={() => onSelectHomework(hw)} style={{ padding: "4px 12px", borderRadius: 6, background: C.blue, border: "none", fontSize: 11, color: "#fff", cursor: "pointer" }}>Topshirish</button>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (active === "homeworks") {
    return (
      <div>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Uy vazifalari</h2>
          <p style={{ fontSize: 13, color: C.muted }}>{homeworks.length} ta vazifa</p>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {homeworks.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, background: C.card, borderRadius: 12 }}>
              <BookOpen size={32} color={C.muted} />
              <p style={{ fontSize: 14, color: C.muted, marginTop: 12 }}>Hozircha uy vazifalari yo'q</p>
            </div>
          ) : (
            homeworks.map(hw => (
              <div key={hw.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{hw.title}</p>
                    <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{hw.description}</p>
                    <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                      <span style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4, color: C.muted }}><Clock size={11} /> {formatDate(hw.deadline)}</span>
                      <span style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4, color: C.muted }}><Star size={11} /> {hw.maxPoints || 100} ball</span>
                    </div>
                  </div>
                  {hw.submitted ? (
                    <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 20, background: `${C.green}15`, color: C.green }}>✅ Topshirilgan {hw.grade ? `(${hw.grade} ball)` : ""}</span>
                  ) : (
                    <button onClick={() => onSelectHomework(hw)} style={{ padding: "6px 16px", borderRadius: 8, background: C.blue, border: "none", fontSize: 12, color: "#fff", cursor: "pointer" }}>Topshirish</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (active === "submissions") {
    return (
      <div>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Topshiriqlarim</h2>
          <p style={{ fontSize: 13, color: C.muted }}>{submissions.length} ta topshiriq</p>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {submissions.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, background: C.card, borderRadius: 12 }}>
              <Send size={32} color={C.muted} />
              <p style={{ fontSize: 14, color: C.muted, marginTop: 12 }}>Hali topshiriq yubormagansiz</p>
            </div>
          ) : (
            submissions.map(sub => (
              <div key={sub.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{sub.homeworkTitle || sub.title}</p>
                    <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{formatDate(sub.submittedAt || sub.createdAt)}</p>
                  </div>
                  <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 20, background: sub.graded ? `${C.green}15` : `${C.amber}15`, color: sub.graded ? C.green : C.amber }}>
                    {sub.graded ? `${sub.score || sub.grade || 0} ball` : "Baholanmagan"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return null;
}