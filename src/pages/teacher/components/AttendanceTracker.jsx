import { CheckCircle, X, Clock, Users, Calendar, Layers } from 'lucide-react';

export default function AttendanceTracker({ attStats, groups, C }) {
  return (
    <div
      className="tp-enter"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {groups.length === 0 ? (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 14, color: C.muted }}>
            Guruhlar topilmadi. Admin panelidan guruh yarating.
          </p>
          <p style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
            API: /api/teachers/me/groups | Status: {groups.length} ta guruh
          </p>
        </div>
      ) : (
        <div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: C.text,
              letterSpacing: "-.02em",
            }}
          >
            Davomat
          </h2>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>
            Bugungi davomat holati
          </p>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(150px,1fr))",
          gap: 12,
        }}
      >
        {[
          {
            label: "Keldi",
            value: attStats.present,
            color: C.green,
            icon: CheckCircle,
          },
          {
            label: "Kelmadi",
            value: attStats.absent,
            color: C.red,
            icon: X,
          },
          {
            label: "Kechikdi",
            value: attStats.late,
            color: C.amber,
            icon: Clock,
          },
          {
            label: "Jami",
            value: attStats.total,
            color: C.blue,
            icon: Users,
          },
        ].map(({ label, value, color, icon: Icon }) => (
          <div
            key={label}
            className="tp-stat"
            style={{ alignItems: "flex-start" }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 7,
                background: `${color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={15} color={color} />
            </div>
            <p
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: C.text,
                lineHeight: 1,
                letterSpacing: "-.02em",
                marginTop: 8,
              }}
            >
              {value}
            </p>
            <span
              style={{
                fontSize: 11.5,
                color: C.muted,
                marginTop: 2,
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {groups.length > 0 && (
        <div className="tp-card">
          <div
            style={{
              padding: "14px 16px",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: C.text,
              }}
            >
              Guruhlar bo'yicha davomat
            </p>
            <span
              style={{
                fontSize: 11,
                color: C.muted,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Calendar size={12} />
              {new Date().toLocaleDateString("uz-UZ", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <div style={{ padding: "12px" }}>
            {groups.map((g) => (
              <div
                key={g.id}
                className="tp-row"
                style={{
                  padding: "10px 12px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: `${C.green}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Layers size={12} color={C.green} />
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: C.text,
                    }}
                  >
                    {g.name}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: C.muted,
                      marginTop: 2,
                    }}
                  >
                    {`${g.currentStudents || 0}/${g.maxStudents || 20}`} o'quvchi
                  </p>
                </div>
                <div
                  style={{
                    textAlign: "right",
                  }}
                >
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: C.green,
                    }}
                  >
                    {Math.round(
                      ((attStats.present / attStats.total) * 100) || 0
                    )}
                    %
                  </p>
                  <p
                    style={{
                      fontSize: 10,
                      color: C.muted,
                    }}
                  >
                    Ishtirok
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}