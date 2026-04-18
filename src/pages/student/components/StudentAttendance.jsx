import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function StudentAttendance({ attendance, C }) {
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

  const attendanceRate = attendance.length > 0
    ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)
    : 0;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Davomat</h2>
        <p style={{ fontSize: 13, color: C.muted }}>{attendance.length} ta yozuv</p>
      </div>

      <div style={{ display: "grid", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Keldi", value: attendance.filter(a => a.status === 'present').length, color: C.green, icon: CheckCircle },
          { label: "Kelmadi", value: attendance.filter(a => a.status === 'absent').length, color: C.red, icon: XCircle },
          { label: "Kechikdi", value: attendance.filter(a => a.status === 'late').length, color: C.amber, icon: Clock },
        ].map(stat => (
          <div key={stat.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: `${stat.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <stat.icon size={20} color={stat.color} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: C.text }}>{stat.value}</p>
              <p style={{ fontSize: 12, color: C.muted }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Ishtirok darajasi</p>
          <span style={{ fontSize: 20, fontWeight: 700, color: C.green }}>{attendanceRate}%</span>
        </div>
        <div style={{ height: 8, background: C.border, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${attendanceRate}%`, background: C.green, borderRadius: 4, transition: "width 0.3s ease" }} />
        </div>
        <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
          {attendance.slice(0, 10).map(record => (
            <div key={record.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, background: C.card2 }}>
              <Calendar size={14} color={C.muted} />
              <span style={{ flex: 1, fontSize: 12, color: C.text }}>{formatDate(record.date)}</span>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: record.status === 'present' ? `${C.green}15` : record.status === 'absent' ? `${C.red}15` : `${C.amber}15`, color: record.status === 'present' ? C.green : record.status === 'absent' ? C.red : C.amber }}>
                {record.status === 'present' ? 'Keldi' : record.status === 'absent' ? 'Kelmadi' : 'Kechikdi'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}