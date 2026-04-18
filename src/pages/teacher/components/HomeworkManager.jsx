import { FileText, Search, Calendar, Users } from 'lucide-react';

export default function HomeworkManager({ homeworks, groups, search, setSearch, C, onSelectHomework }) {
  const fmtDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    return date.toLocaleDateString("uz-UZ", { month: "short", day: "numeric" });
  };

  return (
    <div
      className="tp-enter"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
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
            Uy vazifalari
          </h2>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>
            {homeworks.length} ta uy vazifasi
          </p>
        </div>
        <div style={{ position: "relative" }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: C.muted,
            }}
          />
          <input
            className="tp-inp"
            placeholder="Qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 32, width: 200 }}
          />
        </div>
      </div>

      {homeworks.length === 0 ? (
        <div className="tp-card">
          <div className="tp-empty">
            <div className="tp-empty-icon">
              <FileText size={22} color={C.muted} />
            </div>
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: C.text,
              }}
            >
              Uy vazifalari yo'q
            </p>
            <p style={{ fontSize: 13, color: C.muted }}>
              Yuqoridagi "Yangi uy vazifasi" tugmasini bosing
            </p>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill,minmax(300px,1fr))",
            gap: 14,
          }}
        >
          {homeworks
            .filter(
              (hw) =>
                !search ||
                hw.title
                  ?.toLowerCase()
                  .includes(search.toLowerCase()),
            )
            .map((hw) => {
              const grp = groups.find((g) => g.id === hw.groupId);
              return (
                <div
                  key={hw.id}
                  className="tp-card"
                  style={{ padding: 14 }}
                >
                  <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 7,
                        background: `${C.blue}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FileText size={14} color={C.blue} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: C.text,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {hw.title}
                      </p>
                      <p
                        style={{
                          fontSize: 11.5,
                          color: C.muted,
                          marginTop: 2,
                        }}
                      >
                        {hw.maxPoints || hw.points || 100} ball
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      marginTop: 8,
                    }}
                  >
                    {grp && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "4px 8px",
                          borderRadius: 4,
                          background: `${C.green}15`,
                          color: C.green,
                          fontSize: 11,
                        }}
                      >
                        <Users size={10} />
                        {grp.name}
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "4px 8px",
                        borderRadius: 4,
                        background: `${C.amber}15`,
                        color: C.amber,
                        fontSize: 11,
                      }}
                    >
                      <Calendar size={10} />
                      {fmtDate(hw.deadline || hw.dueDate)}
                    </div>
                  </div>
                  <button
                    className="tp-btn tp-btn-ghost"
                    style={{
                      width: "100%",
                      marginTop: 10,
                      fontSize: 12,
                      padding: "8px 12px",
                    }}
                    onClick={() => onSelectHomework(hw)}
                  >
                    Baholash uchun ochish
                  </button>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}