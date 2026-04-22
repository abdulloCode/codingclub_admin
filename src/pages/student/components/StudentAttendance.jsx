import { useState, useEffect, useMemo } from 'react';
import { apiService } from '../../../services/api';
import {
  Users, RefreshCw, CheckCircle, XCircle, Calendar,
} from 'lucide-react';

// Hafta kunlari va indekslari
const WEEK_DAYS = [
  { name: 'Dushanba', short: 'Du', index: 0 },
  { name: 'Seshanba', short: 'Se', index: 1 },
  { name: 'Chorshanba', short: 'Ch', index: 2 },
  { name: 'Payshanba', short: 'Pa', index: 3 },
  { name: 'Juma', short: 'Ju', index: 4 },
  { name: 'Shanba', short: 'Sh', index: 5 },
  { name: 'Yakshanba', short: 'Ya', index: 6 },
];

/* ─── CONSTANTS ─────────────────────────────────────────────── */
const MONTH_NAMES = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];

const pad     = n => String(n).padStart(2, "0");
const dateStr = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

/* ─── TOAST ──────────────────────────────────────────────────── */
function Toast({ msg, type }) {
  if (!msg) return null;
  const ok = type === "success";
  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg ${
      ok ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
    }`}>
      {ok ? <CheckCircle size={15} className="text-green-500" />
          : <XCircle    size={15} className="text-red-500" />}
      <span className={`text-sm font-medium ${ok ? "text-green-700" : "text-red-700"}`}>
        {msg}
      </span>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────── */
export default function StudentAttendance({ group, user, studentData, C }) {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  const now = useMemo(() => new Date(), []);
  const todayDateStr = dateStr(now.getFullYear(), now.getMonth(), now.getDate());

  // Guruh uchun mumkin bo'lgan kunlarni hisoblash
  const availableDays = useMemo(() => {
    if (!group?.schedule || !Array.isArray(group.schedule)) {
      return WEEK_DAYS;
    }

    const scheduleDays = group.schedule
      .filter(s => s.active)
      .map(s => {
        const dayInfo = WEEK_DAYS.find(d =>
          d.name.toLowerCase() === s.day?.toLowerCase()
        );
        return dayInfo ? { ...dayInfo, timeSlot: s.timeSlot } : null;
      })
      .filter(Boolean);

    return scheduleDays.length > 0 ? scheduleDays : WEEK_DAYS;
  }, [group?.schedule]);

  // Tanlangan kun asosida sanani hisoblash
  const selectedDateStr = useMemo(() => {
    if (selectedDay === null) return todayDateStr;

    const currentDayIndex = now.getDay();
    const targetDayIndex = selectedDay.index;
    const dayDiff = targetDayIndex - currentDayIndex;

    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + dayDiff);

    return dateStr(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  }, [selectedDay, now]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Talabaning davomatini yuklash
  useEffect(() => {
    if (!group || !studentData) return;

    (async () => {
      try {
        setLoading(true);

        // Guruh uchun barcha davomatni olish
        const allAttendance = await apiService.getAttendances({
          groupId: group.id
        }).catch(() => []);

        const records = Array.isArray(allAttendance) ? allAttendance : (allAttendance?.data || []);

        // Talabaning o'z davomatini filtrlash
        const studentId = studentData?.id || studentData?.studentId || studentData?.user?.id || studentData?._id;
        const studentAttendance = [];

        records.forEach(record => {
          if (record.attendanceData && Array.isArray(record.attendanceData)) {
            const studentRecord = record.attendanceData.find(ar =>
              ar.studentId === studentId || ar.student?.id === studentId || ar.user?.id === studentId
            );
            if (studentRecord) {
              studentAttendance.push({
                id: record.id,
                date: record.date,
                status: studentRecord.status || 'present',
                groupId: record.groupId
              });
            }
          }
        });

        // Sanaga bo'yicha saralash (yangi sanalar birinchi)
        studentAttendance.sort((a, b) => new Date(b.date) - new Date(a.date));

        setAttendanceData(studentAttendance);
      } catch (err) {
        console.error("Davomat yuklash xatosi:", err);
        setAttendanceData([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [group, studentData]);

  // Kun o'zgarganda davomatni yangilash
  useEffect(() => {
    if (group && selectedDay !== null) {
      loadDayAttendance();
    }
  }, [selectedDay, group]);

  // Tanlangan kun uchun davomatni yuklash
  const loadDayAttendance = async () => {
    if (!group) return;

    try {
      const dayAttendance = await apiService.getAttendances({
        groupId: group.id,
        date: selectedDateStr
      }).catch(() => []);

      const records = Array.isArray(dayAttendance) ? dayAttendance : (dayAttendance?.data || []);

      const studentId = studentData?.id || studentData?.studentId || studentData?.user?.id || studentData?._id;

      let status = 'present';
      records.forEach(record => {
        if (record.attendanceData && Array.isArray(record.attendanceData)) {
          const studentRecord = record.attendanceData.find(ar =>
            ar.studentId === studentId || ar.student?.id === studentId || ar.user?.id === studentId
          );
          if (studentRecord) {
            status = studentRecord.status || 'present';
          }
        }
      });

      // Tanlangan kun uchun ma'lumotni ko'rsatish
      const dayData = attendanceData.find(a => a.date === selectedDateStr);
      if (!dayData && status !== 'present') {
        setAttendanceData(prev => [
          {
            id: `temp-${selectedDateStr}`,
            date: selectedDateStr,
            status: status,
            groupId: group.id
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.error("Kun davomatini yuklash xatosi:", err);
    }
  };

  // Statistika
  const currentStats = attendanceData.reduce((acc, record) => {
    if (record.status === 'present') acc.present++;
    else if (record.status === 'absent') acc.absent++;
    else if (record.status === 'late') acc.late++;
    acc.total++;
    return acc;
  }, { present: 0, absent: 0, late: 0, total: 0 });

  const attendanceRate = currentStats.total > 0
    ? Math.round((currentStats.present / currentStats.total) * 100)
    : 0;

  const formatDate = (date) => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleDateString("uz-UZ", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch {
      return "—";
    }
  };

  return (
    <div>
      <Toast msg={toast?.msg} type={toast?.type} />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Kun tanlagichi */}
            {group && availableDays.length > 0 && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexWrap: "wrap"
              }}>
                {availableDays.map(day => (
                  <button
                    key={day.index}
                    onClick={() => setSelectedDay(day.index)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: `1px solid ${selectedDay === day.index ? C.blue : C.border}`,
                      background: selectedDay === day.index ? `${C.blue}15` : 'transparent',
                      color: selectedDay === day.index ? C.blue : C.muted,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {day.short}
                  </button>
                ))}
                {selectedDay !== null && (
                  <button
                    onClick={() => setSelectedDay(null)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: `1px solid ${C.red}`,
                      background: 'transparent',
                      color: C.red,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    Tozalash
                  </button>
                )}
              </div>
            )}

            {/* Sana */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 8,
              background: C.card2,
              border: `1px solid ${C.border}`,
              width: "fit-content"
            }}>
              <Calendar size={16} color={C.blue} />
              <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>
                {(() => {
                  const dayName = selectedDay ? availableDays.find(d => d.index === selectedDay)?.name : 'Bugun';
                  const dateParts = selectedDateStr.split('-');
                  const displayDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
                  return `${dayName}: ${displayDate.toLocaleDateString("uz-UZ", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}`;
                })()}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (group && studentData) {
                loadDayAttendance();
                showToast("Ma'lumotlar yangilandi");
              }
            }}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: C.card2,
              color: C.text,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <RefreshCw size={14} /> Yangilash
          </button>
        </div>
      </div>

      {/* Statistika kartalari */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 12,
        marginBottom: 20
      }}>
        {[
          { label: "Keldi", value: currentStats.present, color: C.green, icon: CheckCircle },
          { label: "Kelmadi", value: currentStats.absent, color: C.red, icon: XCircle },
          { label: "Kechikdi", value: currentStats.late, color: "#f59e0b", icon: null },
          { label: "Jami", value: currentStats.total, color: C.blue, icon: Users }
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{
            padding: 16,
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `${color}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {Icon ? <Icon size={16} color={color} /> : <span style={{ fontSize: 16, fontWeight: 700, color }}>{value}</span>}
            </div>
            <div>
              <p style={{ fontSize: 24, fontWeight: 700, color: C.text }}>{value}</p>
              <p style={{ fontSize: 11, color: C.muted }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Ishtirok darajasi */}
      <div style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 20,
        marginBottom: 20
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Ishtirok darajasi</p>
          <span style={{ fontSize: 24, fontWeight: 700, color: attendanceRate >= 80 ? C.green : attendanceRate >= 60 ? '#f59e0b' : C.red }}>
            {attendanceRate}%
          </span>
        </div>
        <div style={{ height: 8, background: C.border, borderRadius: 4, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${attendanceRate}%`,
            background: attendanceRate >= 80 ? C.green : attendanceRate >= 60 ? '#f59e0b' : C.red,
            borderRadius: 4,
            transition: "width 0.3s ease"
          }} />
        </div>
      </div>

      {/* Davomat tarixi */}
      <div style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        overflow: "hidden"
      }}>
        <div style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${C.border}`,
          background: C.card2
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Davomat tarixi</h3>
        </div>

        {loading ? (
          <div style={{
            padding: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12
          }}>
            <RefreshCw size={24} color={C.muted} className="animate-spin" />
            <p style={{ fontSize: 13, color: C.muted }}>Yuklanmoqda...</p>
          </div>
        ) : attendanceData.length === 0 ? (
          <div style={{
            padding: 40,
            textAlign: "center"
          }}>
            <Calendar size={32} color={C.muted} style={{ marginBottom: 12, opacity: 0.5 }} />
            <p style={{ fontSize: 13, color: C.muted }}>
              Davomat ma'lumotlari yo'q
            </p>
          </div>
        ) : (
          <div style={{ padding: "12px" }}>
            {attendanceData.map((record, index) => {
              const statusColor =
                record.status === 'present' ? C.green :
                record.status === 'late' ? '#f59e0b' :
                C.red;

              const statusText =
                record.status === 'present' ? '✓ Keldi' :
                record.status === 'late' ? '⏱ Kechikdi' :
                '✗ Kelmadi';

              return (
                <div
                  key={record.id || index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px",
                    borderRadius: 8,
                    background: C.card2,
                    marginBottom: index < attendanceData.length - 1 ? 8 : 0,
                    border: `1px solid ${C.border}`
                  }}
                >
                  <Calendar size={16} color={C.muted} />
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: C.text
                    }}>
                      {formatDate(record.date)}
                    </p>
                  </div>
                  <div style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    background: `${statusColor}15`,
                    color: statusColor,
                    fontSize: 11,
                    fontWeight: 600
                  }}>
                    {statusText}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}