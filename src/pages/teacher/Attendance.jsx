import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiService } from '../../services/api';
import {
  Users, RefreshCw, CheckCircle, XCircle, Save,
  Search, Trash2, X, UserPlus, Calendar,
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
const normSt  = v => Array.isArray(v) ? v : (v?.students|| v?.data || v?.items   || []);
const initials = name =>
  (name || "?").split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");

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
export default function Attendance({ groups, C, user }) {
  const [groupStudents, setGroupStudents] = useState([]);
  const [selGroup,      setSelGroup]      = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [toast,         setToast]         = useState(null);
  const [searchTerm,    setSearchTerm]    = useState("");
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [selectedDay,   setSelectedDay]   = useState(null);

  const now = useMemo(() => new Date(), []);
  const todayDateStr = dateStr(now.getFullYear(), now.getMonth(), now.getDate());

  // Guruh uchun mumkin bo'lgan kunlarni hisoblash
  const availableDays = useMemo(() => {
    if (!selGroup?.schedule || !Array.isArray(selGroup.schedule)) {
      return WEEK_DAYS; // Agar schedule bo'lmasa, barcha kunlarni ko'rsatish
    }

    // Schedule'dan aktiv kunlarni olish
    const scheduleDays = selGroup.schedule
      .filter(s => s.active)
      .map(s => {
        const dayInfo = WEEK_DAYS.find(d =>
          d.name.toLowerCase() === s.day?.toLowerCase()
        );
        return dayInfo ? { ...dayInfo, timeSlot: s.timeSlot } : null;
      })
      .filter(Boolean);

    return scheduleDays.length > 0 ? scheduleDays : WEEK_DAYS;
  }, [selGroup?.schedule]);

  // Tanlangan kun asosida sanani hisoblash
  const selectedDateStr = useMemo(() => {
    if (selectedDay === null) return todayDateStr;

    const currentDayIndex = now.getDay(); // 0 = Dushanba, 6 = Yakshanba
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

  // Guruhni tanlaganda o'quvchilarni yuklash
  useEffect(() => {
    if (!selGroup) {
      setGroupStudents([]);
      setAttendanceData({});
      setSelectedDay(null); // Guruh o'zgarganda kunni tozalash
      return;
    }

    (async () => {
      try {
        setLoading(true);

        // Guruh o'quvchilarini API dan olish
        let gs = [];
        const r1 = await apiService.getGroupStudents(selGroup.id).catch(() => null);
        if (r1) {
          gs = Array.isArray(r1) ? r1 : (r1?.students || r1?.data || []);
        }

        // Agar getGroupStudents ishlamasa, boshqa usul
        if (!gs.length) {
          const allSt = normSt(await apiService.getStudents().catch(() => []));
          gs = allSt.filter(s => s.groupId === selGroup.id || s.group?.id === selGroup.id);
        }

        setGroupStudents(gs.sort((a, b) =>
          (a.user?.name || a.name || "").localeCompare(b.user?.name || b.name || "", "uz")
        ));

        // Bugungi davomatni yuklash
        await loadTodayAttendance();
      } catch (err) {
        console.error("Guruh o'quvchilari xatosi:", err);
        setGroupStudents([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [selGroup]);

  // Kun o'zgarganda davomatni yangilash
  useEffect(() => {
    if (selGroup && selectedDay !== null) {
      loadTodayAttendance();
    }
  }, [selectedDay, selGroup]);

  // Bugungi davomatni yuklash
  const loadTodayAttendance = async () => {
    if (!selGroup) return;

    try {
      const todayAttendance = await apiService.getAttendances({
        groupId: selGroup.id,
        date: selectedDateStr
      }).catch(() => []);

      const records = Array.isArray(todayAttendance) ? todayAttendance : (todayAttendance?.data || []);

      const attMap = {};
      groupStudents.forEach(student => {
        const studentId = student?.id || student?.studentId || student?.user?.id || student?._id;
        if (studentId) {
          attMap[studentId] = 'present'; // Default - keldi
        }
      });

      // Mavjud davomatni yangilash
      records.forEach(record => {
        if (record.attendanceData && Array.isArray(record.attendanceData)) {
          record.attendanceData.forEach(ar => {
            const studentId = ar.studentId || ar.student?.id || ar.user?.id;
            if (studentId && attMap.hasOwnProperty(studentId)) {
              attMap[studentId] = ar.status || 'present';
            }
          });
        }
      });

      setAttendanceData(attMap);
    } catch (err) {
      console.error("Davomat yuklash xatosi:", err);
    }
  };

  // Statusni o'zgartirish va avtomatik saqlash
  const handleStatusChange = async (studentId, status) => {
    // UI ni darhol yangilash
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));

    // Avtomatik saqlash
    try {
      setSaving(true);

      const attendanceRecords = Object.entries({
        ...attendanceData,
        [studentId]: status
      }).map(([sid, st]) => ({
        studentId: sid,
        status: st
      }));

      const payload = {
        groupId: selGroup.id,
        date: todayDateStr,
        attendanceData: attendanceRecords
      };

      // Mavjud davomatni tekshirish
      const existingAttendances = await apiService.getAttendances({
        groupId: selGroup.id,
        date: todayDateStr
      });

      if (existingAttendances && existingAttendances.length > 0) {
        await apiService.updateAttendance(existingAttendances[0].id, payload);
      } else {
        await apiService.createAttendance(payload);
      }

      setLastSavedTime(new Date().toISOString());
    } catch (err) {
      console.error("Saqlash xatosi:", err);
      showToast("Saqlashda xatolik: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleGroupSelect = async (groupId) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setSelGroup(group);
      setSelectedDay(null); // Guruh o'zgarganda kunni tozalash
    }
  };

  // Filter students
  const filteredStudents = groupStudents.filter(student => {
    if (!student) return false;

    const studentName =
      student.user?.name ||
      student.name ||
      student.fullName ||
      `${student?.firstName || ''} ${student?.lastName || ''}`.trim() ||
      "Noma'lum";

    const studentPhone =
      student.user?.phone ||
      student.phone ||
      student.phoneNumber ||
      "";

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      studentName.toLowerCase().includes(term) ||
      studentPhone.toLowerCase().includes(term)
    );
  });

  // Statistika
  const currentStats = Object.values(attendanceData).reduce((acc, status) => {
    if (status === 'present') acc.present++;
    else if (status === 'absent') acc.absent++;
    else if (status === 'late') acc.late++;
    acc.total++;
    return acc;
  }, { present: 0, absent: 0, late: 0, total: 0 });

  return (
    <div>
      <Toast msg={toast?.msg} type={toast?.type} />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Kun tanlagichi */}
            {selGroup && availableDays.length > 0 && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexWrap: "wrap"
              }}>
                {availableDays.map(day => (
                  <button
                    key={day.index}
                    onClick={() => {
                      setSelectedDay(day.index);
                      // Kun o'zgarganda, guruh o'quvchilarni yuklash
                      if (selGroup) {
                        loadTodayAttendance();
                      }
                    }}
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

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {saving && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                color: C.muted
              }}>
                <RefreshCw size={14} className="animate-spin" />
                Saqlanmoqda...
              </div>
            )}

            <button
              onClick={() => {
                if (selGroup) {
                  loadTodayAttendance();
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
      </div>
      </div>

      {/* Guruh tanlash */}
      {groups && groups.length > 0 && (
        <div style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 16,
          marginBottom: 20
        }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>
            Guruhni tanlang
          </label>
          <select
            value={selGroup?.id || ""}
            onChange={(e) => handleGroupSelect(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: C.card2,
              color: C.text,
              fontSize: 14,
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="">Guruh tanlang...</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name} ({group.currentStudents || 0}/{group.maxStudents || 20} o'quvchi)
              </option>
            ))}
          </select>
        </div>
      )}

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

      {/* O'quvchilar ro'yxati */}
      {selGroup && (
        <div style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          overflow: "hidden"
        }}>
          {/* Search */}
          <div style={{
            padding: "12px 16px",
            borderBottom: `1px solid ${C.border}`
          }}>
            <div style={{
              position: "relative",
              display: "flex",
              alignItems: "center"
            }}>
              <Search size={14} color={C.muted} style={{ position: "absolute", left: 12 }} />
              <input
                type="text"
                placeholder="O'quvchini qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 36px",
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  background: C.card2,
                  color: C.text,
                  fontSize: 13,
                  outline: "none"
                }}
              />
            </div>
          </div>

          {/* Students */}
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
          ) : filteredStudents.length === 0 ? (
            <div style={{
              padding: 40,
              textAlign: "center"
            }}>
              <Users size={32} color={C.muted} style={{ marginBottom: 12, opacity: 0.5 }} />
              <p style={{ fontSize: 13, color: C.muted }}>
                {searchTerm ? "O'quvchi topilmadi" : "Bu guruhda o'quvchilar yo'q"}
              </p>
            </div>
          ) : (
            <div style={{ padding: "12px" }}>
              {filteredStudents.map((student, index) => {
                const studentId = student?.id || student?.studentId || student?.user?.id || student?._id || index;

                const studentName =
                  student?.user?.name ||
                  student?.name ||
                  student?.fullName ||
                  `${student?.firstName || ''} ${student?.lastName || ''}`.trim() ||
                  "Noma'lum";

                const studentPhone =
                  student?.user?.phone ||
                  student?.phone ||
                  student?.phoneNumber ||
                  "";

                const avatarLetter = studentName[0]?.toUpperCase() || "O";

                return (
                  <div
                    key={studentId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px",
                      borderRadius: 8,
                      background: C.card2,
                      marginBottom: index < filteredStudents.length - 1 ? 8 : 0,
                      border: `1px solid ${C.border}`
                    }}
                  >
                    {/* Student Info */}
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: `${C.blue}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      color: C.blue,
                      flexShrink: 0
                    }}>
                      {avatarLetter}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: C.text,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {studentName}
                      </p>
                      <p style={{
                        fontSize: 11,
                        color: C.muted,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {studentPhone || "Telefon raqami yo'q"}
                      </p>
                    </div>

                    {/* Status Buttons */}
                    <div style={{ display: "flex", gap: 6 }}>
                      {['present', 'late', 'absent'].map(status => {
                        const isActive = attendanceData[studentId] === status;
                        const statusColor =
                          status === 'present' ? C.green :
                          status === 'late' ? '#f59e0b' :
                          C.red;

                        return (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(studentId, status)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 6,
                              border: `1px solid ${isActive ? statusColor : C.border}`,
                              background: isActive ? `${statusColor}15` : 'transparent',
                              color: isActive ? statusColor : C.muted,
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                          >
                            {status === 'present' && '✓ Keldi'}
                            {status === 'late' && '⏱ Kech'}
                            {status === 'absent' && '✗ Kelmadi'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* No Groups Message */}
      {(!groups || groups.length === 0) && (
        <div style={{
          padding: 40,
          textAlign: "center",
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12
        }}>
          <Users size={32} color={C.muted} style={{ marginBottom: 12, opacity: 0.5 }} />
          <p style={{ fontSize: 14, color: C.text, marginBottom: 8 }}>
            Guruhlar topilmadi
          </p>
          <p style={{ fontSize: 12, color: C.muted }}>
            Admin panelidan guruh yarating va o'quvchilarni biriktiring
          </p>
        </div>
      )}

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
