import { Users, Layers, FileText, AlertCircle } from 'lucide-react';

export default function TeacherDashboardStats({ totalStudents, groups, homeworks, pendingGrade, C }) {
  const stats = [
    {
      label: "O'quvchilar",
      value: totalStudents,
      sub: "Jami",
      icon: Users,
      color: C.blue,
    },
    {
      label: "Guruhlar",
      value: groups.length,
      sub: "Jami",
      icon: Layers,
      color: C.green,
    },
    {
      label: "Uy vazifalari",
      value: homeworks.length,
      sub: "Jami",
      icon: FileText,
      color: C.amber,
    },
    {
      label: "Baholash",
      value: pendingGrade,
      sub: "Kutilmoqda",
      icon: AlertCircle,
      color: C.red,
    },
  ];

  return (
    <div
      className="tp-stat-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: 12,
      }}
    >
      {stats.map(({ label, value, sub, icon: Icon, color }) => (
        <div key={label} className="tp-stat">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 500,
                color: C.muted,
              }}
            >
              {label}
            </span>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: `${color}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={14} color={color} />
            </div>
          </div>
          <p
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: C.text,
              lineHeight: 1,
              letterSpacing: "-.02em",
            }}
          >
            {value}
          </p>
          <span style={{ fontSize: 11.5, color: C.muted }}>
            {sub}
          </span>
        </div>
      ))}
    </div>
  );
}