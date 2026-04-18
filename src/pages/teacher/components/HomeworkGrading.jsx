import { CheckCircle, Calendar, Users, Send, Star } from 'lucide-react';

export default function HomeworkGrading({ selHW, submissions, groups, C, onBack, onGrade }) {
  const fmtDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    return date.toLocaleDateString("uz-UZ", { month: "short", day: "numeric" });
  };

  if (!selHW) {
    return (
      <div className="tp-card">
        <div className="tp-empty">
          <div className="tp-empty-icon">
            <CheckCircle size={22} color={C.muted} />
          </div>
          <p
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: C.text,
            }}
          >
            Topshiriq tanlanmagan
          </p>
          <p style={{ fontSize: 13, color: C.muted }}>
            Baholash uchun "Uy vazifalari" bo'limidan birini tanlang
          </p>
        </div>
      </div>
    );
  }

  const grp = groups.find((g) => g.id === selHW.groupId);

  return (
    <>
      <div>
        <button
          className="tp-btn tp-btn-ghost"
          onClick={onBack}
          style={{
            marginBottom: 12,
            fontSize: 13,
            padding: "5px 0",
          }}
        >
          ← Orqaga
        </button>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: C.text,
                letterSpacing: "-.02em",
              }}
            >
              {selHW.title}
            </h2>
            <p
              style={{
                fontSize: 13,
                color: C.muted,
                marginTop: 4,
              }}
            >
              {selHW.description}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span
              className="tp-badge tp-badge-gray"
              style={{ alignItems: "center", gap: 4 }}
            >
              <Calendar size={10} />{" "}
              {fmtDate(selHW.deadline || selHW.dueDate)}
            </span>
            <span
              className="tp-badge tp-badge-blue"
              style={{ alignItems: "center", gap: 4 }}
            >
              <Users size={10} /> {grp?.name || "Guruh"}
            </span>
            <span className="tp-badge tp-badge-amber">
              {selHW.maxPoints || selHW.points || 100} ball
            </span>
          </div>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="tp-card">
          <div className="tp-empty">
            <div className="tp-empty-icon">
              <Send size={20} color={C.muted} />
            </div>
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: C.text,
              }}
            >
              Topshirmalar hali yo'q
            </p>
            <p style={{ fontSize: 13, color: C.muted }}>
              O'quvchilar topshiriqni topshirganda shu yerda ko'rinadi
            </p>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill,minmax(400px,1fr))",
            gap: 14,
          }}
        >
          {submissions.map((sub) => (
            <div key={sub.id} className="tp-card">
              <div style={{ padding: 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: C.text,
                      }}
                    >
                      {sub.studentName || sub.student?.name || "O'quvchi"}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color: C.muted,
                        marginTop: 2,
                      }}
                    >
                      {sub.studentEmail || sub.student?.email || ""}
                    </p>
                  </div>
                  {sub.graded ? (
                    <span
                      className="tp-badge tp-badge-green"
                      style={{ alignItems: "center", gap: 4 }}
                    >
                      <Star size={10} /> Baholangan
                    </span>
                  ) : (
                    <span className="tp-badge tp-badge-amber">
                      Kutilmoqda
                    </span>
                  )}
                </div>
                <div
                  style={{
                    background: C.card2,
                    borderRadius: 7,
                    padding: 10,
                    marginBottom: 12,
                  }}
                >
                  <p
                    style={{
                      fontSize: 12,
                      color: C.text,
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {sub.submissionContent || sub.content || "Topshiriq mazmuni yo'q"}
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: 11,
                        color: C.muted,
                        marginBottom: 4,
                        display: "block",
                      }}
                    >
                      Ball
                    </label>
                    <input
                      type="number"
                      defaultValue={sub.score || 0}
                      min="0"
                      max={selHW.maxPoints || selHW.points || 100}
                      className="tp-inp"
                      style={{
                        width: 70,
                        padding: "6px 10px",
                        fontSize: 13,
                      }}
                      onChange={(e) =>
                        onGrade(sub.id, parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                  <button
                    className="tp-btn tp-btn-default"
                    style={{
                      padding: "6px 12px",
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Send size={12} /> Baholash
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}