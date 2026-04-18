import { Layers, Users, BookOpen, MapPin } from 'lucide-react';

export default function GroupManager({ groups, courses, rooms, C }) {
  return (
    <div
      className="tp-enter"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
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
          Guruhlar
        </h2>
        <p style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>
          {groups.length} ta guruh
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="tp-card">
          <div className="tp-empty">
            <div className="tp-empty-icon">
              <Layers size={22} color={C.muted} />
            </div>
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: C.text,
              }}
            >
              Guruhlar topilmadi
            </p>
            <p style={{ fontSize: 13, color: C.muted }}>
              Admin tomonidan guruh tayinlanadi
            </p>
          </div>
        </div>
      ) : (
        <div className="tp-card" style={{ overflow: "hidden" }}>
          {/* header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 100px 100px 90px 80px",
              gap: 12,
              padding: "10px 16px",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            {[
              "Guruh nomi",
              "O'quvchilar",
              "Kurs",
              "Joy",
              "Amallar",
            ].map((h) => (
              <p
                key={h}
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: C.muted,
                  textTransform: "uppercase",
                  letterSpacing: ".04em",
                }}
              >
                {h}
              </p>
            ))}
          </div>
          {groups.map((g) => {
            const sc =
              g.students?.length || g.currentStudents || 0;
            const max = g.maxStudents || 20;
            const pct = max ? Math.round((sc / max) * 100) : 0;
            const course = courses.find((c) => c.id === g.courseId);
            const room = rooms.find((r) => r.id === g.roomId);

            return (
              <div
                key={g.id}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 100px 100px 90px 80px",
                  gap: 12,
                  padding: "13px 16px",
                  alignItems: "center",
                  borderBottom: `1px solid ${C.border}`,
                  transition: "background 120ms",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = C.card2;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: C.text,
                      marginBottom: 2,
                    }}
                  >
                    {g.name}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        height: 3,
                        background: C.border,
                        borderRadius: 2,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          background: pct > 80 ? C.red : pct > 60 ? C.amber : C.green,
                          borderRadius: 2,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 10.5,
                        color: C.muted,
                        fontWeight: 500,
                      }}
                    >
                      {sc}/{max}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Users size={12} color={C.muted} />
                  <span
                    style={{
                      fontSize: 12.5,
                      color: C.text,
                      fontWeight: 500,
                    }}
                  >
                    {sc}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <BookOpen size={12} color={C.muted} />
                  <span
                    style={{
                      fontSize: 12,
                      color: C.text,
                    }}
                  >
                    {course?.name || g.courseName || "Kurs"}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <MapPin size={12} color={C.muted} />
                  <span
                    style={{
                      fontSize: 12,
                      color: C.text,
                    }}
                  >
                    {room?.name || g.roomName || "Xona"}
                  </span>
                </div>
                <div>
                  <button
                    className="tp-btn tp-btn-ghost"
                    style={{
                      fontSize: 11,
                      padding: "4px 8px",
                    }}
                  >
                    Batafsil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}