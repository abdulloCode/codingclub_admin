import { Users, BookOpen, Calendar, DollarSign, AlertCircle, Target } from 'lucide-react';

export default function StudentDashboardStats({ group, homeworks, attendance, payments, user, studentData, C }) {
  // Calculate stats
  const totalHomeworks = homeworks.length;
  const submittedCount = homeworks.filter(h => h.submitted).length;
  const attendanceRate = attendance.length > 0
    ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)
    : 0;

  // Calculate payments and debt
  const creditPayments = payments.filter(p => p.type === 'credit' || p.dk === 'credit');
  const totalPaid = creditPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Calculate expected monthly payment
  const expectedPayment = group?.monthlyPrice || 0;

  // Calculate debt
  const debt = Math.max(0, expectedPayment - totalPaid);

  // Get teacher info
  const teacherName = group?.teacher?.user?.name || group?.teacher?.name || "Belgilanmagan";

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: C.text }}>Salom, {(studentData?.user?.name || user?.name || "Talaba").split(" ")[0]}! 👋</h2>
        <p style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>{new Date().toLocaleDateString("uz-UZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      {/* Main stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Guruh", value: group?.name || "—", icon: Users, color: C.blue },
          { label: "Uy vazifalari", value: `${submittedCount}/${totalHomeworks}`, icon: BookOpen, color: C.green },
          { label: "Davomat", value: `${attendanceRate}%`, icon: Calendar, color: C.amber },
          { label: "To'lov", value: `${totalPaid.toLocaleString()} so'm`, icon: DollarSign, color: C.indigo },
        ].map(stat => (
          <div key={stat.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: C.muted }}>{stat.label}</span>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${stat.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <stat.icon size={14} color={stat.color} />
              </div>
            </div>
            <p style={{ fontSize: 24, fontWeight: 700, color: C.text }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Additional group info */}
      {group && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 16 }}>Guruh haqida</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>O'qituvchi</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{teacherName}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Oylik kurs narxi</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{group.monthlyPrice?.toLocaleString() || 0} so'm</p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Qarzdorlik</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: debt > 0 ? C.red : C.green }}>
                {debt > 0 ? `${debt.toLocaleString()} so'm` : "To'langan"}
              </p>
            </div>
          </div>
          {debt > 0 && (
            <div style={{
              marginTop: 16,
              padding: 12,
              background: `${C.red}10`,
              border: `1px solid ${C.red}30`,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              <AlertCircle size={16} color={C.red} />
              <span style={{ fontSize: 13, color: C.red, fontWeight: 600 }}>
                Sizda {debt.toLocaleString()} so'm qarzdorlik mavjud
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}