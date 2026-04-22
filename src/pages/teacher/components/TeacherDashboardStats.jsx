import { Users, Layers, XCircle, Wallet, TrendingUp, DollarSign, ArrowUpRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';

export default function TeacherDashboardStats({ totalStudents, groups, C, teacherFinance }) {
  const [absentToday, setAbsentToday] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAbsentStudents = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        let totalAbsent = 0;

        // Har bir guruh uchun bugungi kelmaganlarni sanash
        for (const group of groups) {
          try {
            const attendance = await apiService.getAttendances({
              groupId: group.id,
              date: today
            });

            const records = Array.isArray(attendance) ? attendance : (attendance?.data || []);
            const attendanceData = records.flatMap(r => r.attendanceData || []);

            // Bu guruhdagi kelmaganlar
            const absentInGroup = attendanceData.filter(a => a.status === 'absent').length;
            totalAbsent += absentInGroup;
          } catch (err) {
            console.error(`Error loading attendance for group ${group.id}:`, err);
          }
        }

        setAbsentToday(totalAbsent);
      } catch (err) {
        console.error("Error loading absent students:", err);
      } finally {
        setLoading(false);
      }
    };

    if (groups.length > 0) {
      loadAbsentStudents();
    } else {
      setLoading(false);
    }
  }, [groups]);

  // Format currency helper
  const fmtCurrency = (n) => new Intl.NumberFormat('uz-UZ').format(n ?? 0);

  const stats = [
    {
      label: "O'quvchilar",
      value: totalStudents,
      sub: "Jami",
      icon: Users,
      color: C.blue,
    },
    {
      label: "Kelmagan",
      value: loading ? "..." : absentToday,
      sub: "Bugun",
      icon: XCircle,
      color: C.red,
    },
    ...(teacherFinance ? [
      {
        label: "Jami balans",
        value: `${fmtCurrency(teacherFinance.totalBalance)} so'm`,
        sub: "Sizning daromadingiz",
        icon: Wallet,
        color: C.green,
      },
      {
        label: "Oylik daromad",
        value: `${fmtCurrency(teacherFinance.monthlyEarnings)} so'm`,
        sub: "Bu oy",
        icon: TrendingUp,
        color: C.indigo,
      },
      {
        label: "Dars narxi",
        value: `${fmtCurrency(teacherFinance.lessonPrice)} so'm`,
        sub: "Bir dars uchun",
        icon: DollarSign,
        color: C.amber,
      },
      {
        label: "Sizning ulushi",
        value: `${teacherFinance.commissionPercent || 20}%`,
        sub: "Komissiya",
        icon: ArrowUpRight,
        color: C.blue,
      },
    ] : []),
  ];

  return (
    <div
      className="tp-stat-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
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