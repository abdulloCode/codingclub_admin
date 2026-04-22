import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';
import {
  Users, RefreshCw, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Save, BookOpen,
  Search, Trash2, X, UserPlus, ArrowLeft,
} from 'lucide-react';

/* ─── CONSTANTS ─────────────────────────────────────────────── */
const MONTH_NAMES = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];
const DAY_SHORT = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];

const pad     = n => String(n).padStart(2, "0");
const dateStr = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const norm    = v => Array.isArray(v) ? v : (v?.groups  || v?.data || v?.items   || []);
const normSt  = v => Array.isArray(v) ? v : (v?.students|| v?.data || v?.items   || []);
const initials = name =>
  (name || "?").split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");

/* ─── TOAST ──────────────────────────────────────────────────── */
function Toast({ msg, type }) {
  if (!msg) return null;
  const ok = type === "success";
  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg animate-in slide-in-from-bottom-2 duration-200 ${
      ok ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
         : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
    }`}>
      {ok ? <CheckCircle size={15} className="text-green-500 shrink-0" />
          : <XCircle    size={15} className="text-red-500 shrink-0" />}
      <span className={`text-sm font-medium ${ok ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
        {msg}
      </span>
    </div>
  );
}

/* ─── ADD STUDENT MODAL ──────────────────────────────────────── */
function AddStudentModal({ isOpen, onClose, availableStudents, onAdd }) {
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState("");

  if (!isOpen) return null;

  const filtered = availableStudents.filter(s =>
    (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd   = () => { if (selected) { onAdd(selected); setSearch(""); setSelected(""); } };
  const handleClose = () => { setSearch(""); setSelected(""); onClose(); };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && handleClose()}
    >
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-700 flex items-center justify-center shadow-md shadow-green-700/30">
              <UserPlus size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">O'quvchi qo'shish</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Guruhga qo'shish uchun tanlang</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="px-5 pt-4 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <Search size={13} className="text-gray-400 shrink-0" />
            <input
              placeholder="Qidirish..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-1.5">
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <Users size={28} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-400">O'quvchi topilmadi</p>
            </div>
          ) : filtered.map(s => (
            <button
              key={s.id}
              onClick={() => setSelected(s.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all border ${
                selected === s.id
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-800 to-green-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {initials(s.user?.name || s.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{s.user?.name || s.name || "—"}</p>
                <p className="text-xs text-gray-400 truncate">{s.email || s.user?.email || s.phone || "—"}</p>
              </div>
              {selected === s.id && <CheckCircle size={15} className="text-green-500 shrink-0" />}
            </button>
          ))}
        </div>

        <div className="flex gap-2.5 px-5 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
          <button onClick={handleClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Bekor
          </button>
          <button
            onClick={handleAdd}
            disabled={!selected}
            className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-green-800 to-green-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-green-700/25 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            <UserPlus size={14} /> Qo'shish
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── TOGGLE SWITCH ──────────────────────────────────────────── */
function Toggle({ on, onChange, disabled, isOwner, user }) {
  const canEdit = !disabled || (user?.role === 'admin') || isOwner;
  return (
    <button
      type="button"
      onClick={() => canEdit && onChange(!on)}
      disabled={!canEdit}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
        !canEdit
          ? "opacity-25 cursor-not-allowed " + (on ? "bg-green-500" : "bg-red-400")
          : on
            ? "bg-green-500 shadow-sm shadow-green-500/40 cursor-pointer"
            : "bg-red-400 shadow-sm shadow-red-400/30 cursor-pointer"
      }`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
        on ? "left-5" : "left-0.5"
      }`} />
    </button>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────── */
export default function Attendance() {
  const { user }          = useAuth();
  const { isDarkMode: D } = useTheme();
  const [searchParams]    = useSearchParams();
  const navigate          = useNavigate();

  const [groups,        setGroups]        = useState([]);
  const [allStudents,   setAllStudents]   = useState([]);
  const [groupStudents, setGroupStudents] = useState([]);
  const [selGroup,      setSelGroup]      = useState(null);

  // ─── att: { [date]: { [studentId]: { present, status, recordId, changed, createdBy } } }
  // Backend strukturasiga mos: bir kun = bir record, ichida attendanceData[]
  const [att,           setAtt]           = useState({});
  // dateRecordMap: { [date]: recordId } — PUT uchun kerak
  const [dateRecordMap, setDateRecordMap] = useState({});

  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [toast,         setToast]         = useState(null);
  const [dirty,         setDirty]         = useState(false);
  const [addModalOpen,  setAddModalOpen]  = useState(false);
  const [autoSave,      setAutoSave]      = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [saveErrors,    setSaveErrors]    = useState([]);

  const now        = useMemo(() => new Date(), []);
  const todayYear  = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDate  = now.getDate();

  const [viewYear,  setViewYear]  = useState(todayYear);
  const [viewMonth, setViewMonth] = useState(todayMonth);

  const groupIdFromUrl = searchParams.get('groupId');

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth]
  );

  const isCurrentMonth = viewYear === todayYear && viewMonth === todayMonth;
  const isToday  = d => isCurrentMonth && d === todayDate;
  const isFuture = d => new Date(viewYear, viewMonth, d) > new Date(todayYear, todayMonth, todayDate);
  const isPast   = d => new Date(viewYear, viewMonth, d) < new Date(todayYear, todayMonth, todayDate);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── INITIAL LOAD ────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        let gr = [];
        if (user?.role === "teacher") {
          const raw = await apiService.getMyTeacherGroups().catch(() => []);
          gr = Array.isArray(raw) ? raw : (raw?.groups || raw?.data || []);
          const tid = user?.id || user?.userId;
          if (tid) gr = gr.filter(g => g.teacherId === tid || g.teacher?.id === tid);
        } else {
          gr = norm(await apiService.getGroups());
        }

        const st = normSt(await apiService.getStudents().catch(() => []));
        setGroups(gr);
        setAllStudents(st);

        if (groupIdFromUrl) {
          const found = gr.find(g => g.id === groupIdFromUrl);
          if (found) setSelGroup(found);
          else showToast("Guruh topilmadi", "error");
        } else if (gr.length) {
          setSelGroup(gr[0]);
        }
      } catch (err) {
        showToast(err.message || "Yuklashda xatolik", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.role]);

  // ─── GURUH O'QUVCHILARI ───────────────────────────────────────
  useEffect(() => {
    if (!selGroup) { setGroupStudents([]); return; }
    (async () => {
      try {
        setLoading(true);
        // API: GET /api/students?groupId=xxx — cheksiz olish uchun limit katta
        const res = await apiService.getStudentsPaginated(1, 500, { groupId: selGroup.id }).catch(() => null);
        let gs = normSt(res);

        // Fallback: barcha studentlardan filter
        if (!gs.length) {
          gs = allStudents.filter(s => s.groupId === selGroup.id);
        }

        setGroupStudents(
          gs.sort((a, b) =>
            (a.user?.name || a.name || "").localeCompare(b.user?.name || b.name || "", "uz")
          )
        );
        setAtt({});
        setDateRecordMap({});
        setDirty(false);
      } catch (err) {
        console.error("Guruh o'quvchilari xatosi:", err);
        setGroupStudents(allStudents.filter(s => s.groupId === selGroup.id));
      } finally {
        setLoading(false);
      }
    })();
  }, [selGroup]);

  // ─── DAVOMAT YUKLASH ─────────────────────────────────────────
  // Backend: GET /api/attendance?groupId=xxx
  // Response: [ { id, date, groupId, attendanceData: [{studentId, status}] } ]
  const loadAttendance = useCallback(async () => {
    if (!selGroup) return;
    try {
      const raw     = await apiService.getAttendances({ groupId: selGroup.id });
      const records = Array.isArray(raw) ? raw : (raw?.attendances || raw?.data || []);

      // dateMap: { [date]: recordId }
      const dMap = {};
      // attMap:  { [date]: { [studentId]: { present, status, changed, createdBy } } }
      const aMap = {};

      records.forEach(record => {
        const date = record.date ? record.date.split("T")[0] : null;
        if (!date) return;

        dMap[date] = record.id;
        aMap[date] = aMap[date] || {};

        const attendanceData = record.attendanceData || [];
        attendanceData.forEach(item => {
          const sid = item.studentId || item.student_id;
          if (!sid) return;
          aMap[date][sid] = {
            present:   item.status === "present" || item.status === "late",
            status:    item.status || "absent",
            changed:   false,
            createdBy: record.createdBy || record.teacherId || null,
          };
        });
      });

      // O'tgan va bugungi kunlar uchun default absent
      groupStudents.forEach(student => {
        days.forEach(day => {
          if (isFuture(day)) return;
          const ds = dateStr(viewYear, viewMonth, day);
          if (!aMap[ds]) aMap[ds] = {};
          if (!aMap[ds][student.id]) {
            aMap[ds][student.id] = {
              present: false, status: "absent", changed: false, createdBy: null,
            };
          }
        });
      });

      setAtt(aMap);
      setDateRecordMap(dMap);
      setDirty(false);
    } catch (err) {
      console.error("Davomat yuklash xatosi:", err);
      showToast("Davomatni yuklashda xatolik", "error");
    }
  }, [selGroup, groupStudents, days, viewYear, viewMonth]);

  useEffect(() => { loadAttendance(); }, [loadAttendance]);

  // ─── AUTO SAVE ───────────────────────────────────────────────
  useEffect(() => {
    if (!dirty || !autoSave) return;
    const t = setTimeout(handleSave, 5000);
    return () => clearTimeout(t);
  }, [dirty, autoSave]);

  // ─── AVTOMATIK TO'LOV YARATISH ────────────────────────────────
  const createLessonPayments = async (date, attendanceData) => {
    try {
      // Kunlik dars narxini hisoblash
      const monthlyPrice = selGroup?.monthlyPrice || 0;
      const lessonsPerMonth = selGroup?.lessonsPerMonth || 8;
      const dailyPrice = Math.round(monthlyPrice / lessonsPerMonth);

      // Faqat kelgan o'quvchilar uchun to'lov yaratish
      const presentStudents = attendanceData.filter(s => s.status === 'present' || s.status === 'late');

      for (const studentRecord of presentStudents) {
        try {
          // Bu o'quvchi uchun shu kun uchun allaqachon to'lov yaratilganmi?
          const today = new Date().toISOString().split('T')[0];
          const existingPayments = await apiService.getPayments({ studentId: studentRecord.studentId }).catch(() => []);
          const paymentsList = Array.isArray(existingPayments) ? existingPayments : (existingPayments?.payments || []);

          const alreadyPaid = paymentsList.some(p => {
            const paymentDate = p.date || p.paidAt || p.createdAt ? new Date(p.date || p.paidAt || p.createdAt).toISOString().split('T')[0] : null;
            return paymentDate === date && p.typeId === 'LESSON';
          });

          if (!alreadyPaid) {
            // Avtomatik to'lov yaratish
            await apiService.createPayment({
              type: 'credit',
              dk: 'credit',
              amount: dailyPrice,
              toWhoId: studentRecord.studentId,
              groupId: selGroup.id,
              typeId: 'LESSON',
              description: `Avtomatik to'lov: ${date} kuni dars`,
            });
            console.log(`✅ O'quvchi ${studentRecord.studentId} uchun ${dailyPrice} so'm to'lov yaratildi`);
          }
        } catch (err) {
          console.error(`O'quvchi ${studentRecord.studentId} uchun to'lov yaratishda xatolik:`, err);
        }
      }
    } catch (err) {
      console.error('Avtomatik to\'lov yaratishda xatolik:', err);
    }
  };

  // ─── SAQLASH ─────────────────────────────────────────────────
  // Backend: POST /api/attendance → { date, groupId, attendanceData: [{studentId, status}] }
  //          PUT  /api/attendance/:id → { attendanceData: [{studentId, status}] }
  // Bir kun = bitta record — barcha o'quvchilar bitta so'rovda!
  const handleSave = async () => {
    if (!selGroup) return;
    setSaving(true);
    setSaveErrors([]);

    try {
      // Faqat o'zgargan kunlarni topamiz
      const changedDates = new Set();
      Object.entries(att).forEach(([date, students]) => {
        Object.values(students).forEach(cell => {
          if (cell.changed) changedDates.add(date);
        });
      });

      if (changedDates.size === 0) {
        showToast("Saqlanadigan yangi ma'lumot yo'q", "error");
        setSaving(false);
        return;
      }

      const promises = [];

      changedDates.forEach(date => {
        const students   = att[date] || {};
        const recordId   = dateRecordMap[date];

        // attendanceData: barcha o'quvchilar (faqat o'zgarganlar emas — to'liq kun yozuvi)
        const attendanceData = groupStudents.map(student => ({
          studentId: student.id,
          status:    students[student.id]?.status || "absent",
        }));

        if (recordId) {
          // Mavjud record → PUT /api/attendance/:id
          promises.push(
            apiService.updateAttendance(recordId, { attendanceData })
              .then(() => ({ success: true, date, attendanceData }))
              .catch(err => ({ success: false, date, error: err.message }))
          );
        } else {
          // Yangi record → POST /api/attendance
          promises.push(
            apiService.createAttendance({
              date,
              groupId: selGroup.id,
              attendanceData,
            })
              .then(() => ({ success: true, date, attendanceData }))
              .catch(err => ({ success: false, date, error: err.message }))
          );
        }
      });

      const results  = await Promise.all(promises);
      const failed   = results.filter(r => !r.success);
      const success  = results.filter(r => r.success);

      // ✅ AVTOMATIK TO'LOV YARATISH
      if (success.length > 0) {
        for (const result of success) {
          await createLessonPayments(result.date, result.attendanceData);
        }
      }

      if (failed.length > 0) {
        setSaveErrors(failed.map(f => `${f.date}: ${f.error}`));
      }
      if (success.length > 0) {
        setLastSavedTime(new Date().toISOString());
        setDirty(false);
      }

      if (failed.length === 0) {
        showToast(`${success.length} kun saqlandi va to'lovlar yaratildi ✓`);
      } else {
        showToast(`${success.length} ta saqlandi, ${failed.length} ta xatolik`, "error");
      }

      if (success.length > 0) await loadAttendance();
    } catch (err) {
      showToast(err.message || "Saqlashda xatolik", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── OY BO'YICHA SAQLASH ─────────────────────────────────────
  // Butun oy uchun: o'tgan + bugungi kunlarni bittada saqlaydi
  const handleSaveAllMonth = async () => {
    if (!selGroup) return;
    setSaving(true);
    try {
      const promises = [];

      days.forEach(day => {
        if (isFuture(day)) return;
        const date     = dateStr(viewYear, viewMonth, day);
        const students = att[date] || {};
        const recordId = dateRecordMap[date];

        const attendanceData = groupStudents.map(student => ({
          studentId: student.id,
          status:    students[student.id]?.status || "absent",
        }));

        if (recordId) {
          promises.push(
            apiService.updateAttendance(recordId, { attendanceData })
              .then(() => ({ success: true, date, attendanceData }))
              .catch(err => ({ success: false, date, error: err.message }))
          );
        } else {
          promises.push(
            apiService.createAttendance({ date, groupId: selGroup.id, attendanceData })
              .then(() => ({ success: true, date, attendanceData }))
              .catch(err => ({ success: false, date, error: err.message }))
          );
        }
      });

      const results = await Promise.all(promises);
      const failed  = results.filter(r => !r.success);
      const success = results.filter(r => r.success);

      // ✅ AVTOMATIK TO'LOV YARATISH (OY BO'YICHA)
      if (success.length > 0) {
        for (const result of success) {
          await createLessonPayments(result.date, result.attendanceData);
        }
      }

      setDirty(false);
      setLastSavedTime(new Date().toISOString());

      if (failed.length === 0) {
        showToast(`${success.length} kun saqlandi va to'lovlar yaratildi (oy bo'yicha) ✓`);
      } else {
        showToast(`${success.length} ta saqlandi, ${failed.length} ta xatolik`, "error");
        setSaveErrors(failed.map(f => `${f.date}: ${f.error}`));
      }

      await loadAttendance();
    } catch (err) {
      showToast(err.message || "Oynani saqlashda xatolik", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── TOGGLE ──────────────────────────────────────────────────
  const togglePresent = (studentId, ds, dayNum) => {
    const cell    = att[ds]?.[studentId];
    const isOwner = cell?.createdBy === (user?.id || user?.userId);

    if (isFuture(dayNum)) return;
    if (isPast(dayNum) && user?.role !== 'admin' && !isOwner) return;

    setAtt(prev => {
      const old = prev[ds]?.[studentId] ?? { present: false, status: "absent", changed: false, createdBy: null };
      const nowPresent = !old.present;
      return {
        ...prev,
        [ds]: {
          ...prev[ds],
          [studentId]: {
            ...old,
            present:   nowPresent,
            status:    nowPresent ? "present" : "absent",
            changed:   true,
            createdBy: user?.id || user?.userId || null,
          },
        },
      };
    });
    setDirty(true);
  };

  const setLate = (studentId, ds) => {
    setAtt(prev => ({
      ...prev,
      [ds]: {
        ...prev[ds],
        [studentId]: {
          ...(prev[ds]?.[studentId] ?? { present: true, changed: false, createdBy: null }),
          present:   true,
          status:    "late",
          changed:   true,
          createdBy: user?.id || user?.userId || null,
        },
      },
    }));
    setDirty(true);
  };

  // ─── O'QUVCHI QO'SHISH/OLIB TASHLASH ────────────────────────
  const handleAddStudent = async (studentId) => {
    try {
      await apiService.addStudentToGroup(selGroup.id, studentId);
      const s = allStudents.find(s => s.id === studentId);
      if (s) {
        setGroupStudents(prev =>
          prev.some(x => x.id === studentId) ? prev
            : [...prev, { ...s, groupId: selGroup.id }]
                .sort((a, b) => (a.user?.name || a.name || "").localeCompare(b.user?.name || b.name || "", "uz"))
        );
      }
      showToast("O'quvchi guruhga qo'shildi");
      setAddModalOpen(false);
    } catch (err) {
      showToast(err.message || "Xatolik", "error");
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      await apiService.removeStudentFromGroup(selGroup.id, studentId);
      setGroupStudents(prev => prev.filter(s => s.id !== studentId));
      setAtt(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(date => {
          if (next[date][studentId]) {
            next[date] = { ...next[date] };
            delete next[date][studentId];
          }
        });
        return next;
      });
      showToast("O'quvchi guruhdan olib tashlandi");
    } catch (err) {
      showToast(err.message || "Xatolik", "error");
    }
  };

  // ─── NAVIGATSIYA ─────────────────────────────────────────────
  const prevMonth = () => viewMonth === 0  ? (setViewMonth(11), setViewYear(y => y - 1)) : setViewMonth(m => m - 1);
  const nextMonth = () => viewMonth === 11 ? (setViewMonth(0),  setViewYear(y => y + 1)) : setViewMonth(m => m + 1);

  // ─── STATISTIKA ──────────────────────────────────────────────
  const groupStudentIds   = new Set(groupStudents.map(s => s.id));
  const availableStudents = allStudents.filter(s => !groupStudentIds.has(s.id));

  let totalPresent = 0, totalPossible = 0;
  groupStudents.forEach(s => {
    days.forEach(d => {
      if (isFuture(d)) return;
      totalPossible++;
      const cell = att[dateStr(viewYear, viewMonth, d)]?.[s.id];
      if (cell?.status === "present" || cell?.status === "late") totalPresent++;
    });
  });
  const attendancePct = totalPossible > 0 ? Math.round(totalPresent / totalPossible * 100) : 0;

  // ─── RENDER ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Toast msg={toast?.msg} type={toast?.type} />

      <AddStudentModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        availableStudents={availableStudents}
        onAdd={handleAddStudent}
      />

      {/* HEADER */}
      <header className="sticky top-0 z-40 h-14 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate(user?.role === 'teacher' ? '/teacher-panel' : '/admin-panel')}
            className="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-800 to-green-500 flex items-center justify-center shadow-md shadow-green-700/25">
            <Users size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-700 dark:text-green-400 leading-none">Davomat</p>
            <p className="text-xs text-gray-400 mt-0.5">{selGroup?.name || "Guruh tanlanmagan"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {dirty && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Saqlanmagan</span>
            </div>
          )}

          {/* Oy navigatsiya */}
          <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button onClick={prevMonth} className="w-6 h-6 flex items-center justify-center text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors">
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200 w-28 text-center">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} className="w-6 h-6 flex items-center justify-center text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>

          <button onClick={loadAttendance} className="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>

          {/* Auto save toggle */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div
              onClick={() => setAutoSave(!autoSave)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${autoSave ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${autoSave ? "left-5" : "left-0.5"}`} />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Auto saqlash</span>
          </div>

          {lastSavedTime && (
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {new Date(lastSavedTime).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}

          {dirty && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-green-800 to-green-500 text-white text-xs font-semibold shadow-md shadow-green-700/25 hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap"
            >
              {saving ? <><RefreshCw size={12} className="animate-spin" /> Saqlanmoqda...</> : <><Save size={12} /> Saqlash</>}
            </button>
          )}

          {saveErrors.length > 0 && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap"
            >
              <RefreshCw size={12} className={saving ? "animate-spin" : ""} /> Qayta urinish
            </button>
          )}

          <button
            onClick={handleSaveAllMonth}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 text-white text-xs font-semibold shadow-md hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap"
            title="Butun oyni saqlash"
          >
            {saving ? <><RefreshCw size={12} className="animate-spin" /> ...</> : <><Save size={12} /> Oyni saqlash</>}
          </button>

          {selGroup && (
            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-green-700 dark:text-green-400 text-xs font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors whitespace-nowrap"
            >
              <UserPlus size={13} /> Qo'shish
            </button>
          )}
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-5 pb-16">

        {/* Xatoliklar */}
        {saveErrors.length > 0 && (
          <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <XCircle size={16} className="text-red-500" />
              <span className="text-sm font-semibold text-red-700 dark:text-red-400">Saqlashda xatoliklar ({saveErrors.length})</span>
            </div>
            <ul className="text-xs text-red-600 dark:text-red-300 space-y-1">
              {saveErrors.map((e, i) => <li key={i}>• {e}</li>)}
            </ul>
            <button onClick={() => setSaveErrors([])} className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium">Yopish</button>
          </div>
        )}

        {/* Statistika */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: "O'quvchilar", val: groupStudents.length, cls: "text-green-700 dark:text-green-400" },
            { label: "Davomat",     val: `${attendancePct}%`, cls: attendancePct >= 80 ? "text-green-600" : attendancePct >= 60 ? "text-amber-600" : "text-red-500" },
            { label: "Keldi",       val: `${totalPresent} / ${totalPossible}`, cls: "text-blue-600 dark:text-blue-400" },
            { label: "Oy",          val: MONTH_NAMES[viewMonth], cls: "text-gray-500 dark:text-gray-400 text-sm pt-1" },
          ].map(({ label, val, cls }) => (
            <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 font-medium">{label}</p>
              <p className={`text-xl font-semibold leading-none ${cls}`}>{val}</p>
            </div>
          ))}
        </div>

        {/* Asosiy kontent */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-800 to-green-500 flex items-center justify-center shadow-lg">
              <Users size={20} className="text-white animate-spin" />
            </div>
            <p className="text-sm text-green-700 dark:text-green-400 font-medium">Yuklanmoqda...</p>
          </div>
        ) : !selGroup ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <BookOpen size={32} className="text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-400">Guruh topilmadi</p>
            <button
              onClick={() => navigate(user?.role === 'teacher' ? '/teacher-panel' : '/admin-panel')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-800 to-green-500 text-white text-sm font-semibold mt-4"
            >
              <ArrowLeft size={14} /> Orqaga qaytish
            </button>
          </div>
        ) : groupStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Users size={32} className="text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-400">Bu guruhda o'quvchi yo'q</p>
            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-800 to-green-500 text-white text-sm font-semibold"
            >
              <UserPlus size={14} /> O'quvchi qo'shish
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50">
                    <th className="sticky left-0 z-20 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-sm text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-800 min-w-[180px] whitespace-nowrap">
                      # Familiya
                    </th>
                    <th className="px-2 py-3 font-medium text-gray-400 w-8"></th>
                    {days.map(d => {
                      const todayFlag  = isToday(d);
                      const futureFlag = isFuture(d);
                      const dow        = new Date(viewYear, viewMonth, d).getDay();
                      return (
                        <th key={d} className={`py-2 px-1 font-medium text-center min-w-[52px] whitespace-nowrap ${
                          todayFlag ? "text-green-700 dark:text-green-400 bg-green-50/60 dark:bg-green-900/10"
                            : futureFlag ? "text-gray-300 dark:text-gray-700"
                            : "text-gray-400 dark:text-gray-500"
                        }`}>
                          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] ${todayFlag ? "bg-green-600 text-white font-semibold" : ""}`}>{d}</span>
                          <br />
                          <span className="text-[9px] opacity-60">{DAY_SHORT[dow]}</span>
                        </th>
                      );
                    })}
                    <th className="px-3 py-3 font-medium text-gray-400 text-center min-w-[70px]">Davomat</th>
                  </tr>
                </thead>
                <tbody>
                  {groupStudents.map((s, idx) => {
                    let pCnt = 0, dCnt = 0;
                    days.forEach(d => {
                      if (isFuture(d)) return;
                      dCnt++;
                      const cell = att[dateStr(viewYear, viewMonth, d)]?.[s.id];
                      if (cell?.status === "present" || cell?.status === "late") pCnt++;
                    });
                    const pct    = dCnt > 0 ? Math.round(pCnt / dCnt * 100) : 0;
                    const pctCls = pct >= 80 ? "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
                                 : pct >= 60 ? "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400"
                                 : pct > 0   ? "text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
                                 :             "text-gray-400 bg-gray-100 dark:bg-gray-800";
                    const name   = s.user?.name || s.name || "—";

                    return (
                      <tr key={s.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        {/* Ism */}
                        <td className="sticky left-0 z-10 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 px-4 py-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] text-gray-300 dark:text-gray-600 w-4 shrink-0">{idx + 1}</span>
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-800 to-green-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                              {initials(name)}
                            </div>
                            <span className="text-[13px] font-medium text-gray-800 dark:text-gray-200">{name}</span>
                          </div>
                        </td>

                        {/* O'chirish */}
                        <td className="px-2 py-2.5 text-center">
                          <button
                            onClick={() => handleRemoveStudent(s.id)}
                            className="w-6 h-6 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 flex items-center justify-center text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 size={10} />
                          </button>
                        </td>

                        {/* Kunlar */}
                        {days.map(d => {
                          const todayFlag  = isToday(d);
                          const futureFlag = isFuture(d);
                          const pastFlag   = isPast(d);
                          const ds         = dateStr(viewYear, viewMonth, d);
                          const cell       = att[ds]?.[s.id] ?? { present: false, status: "absent", changed: false, createdBy: null };
                          const status     = cell.status || (cell.present ? "present" : "absent");
                          const isChanged  = cell.changed;
                          const isOwner    = cell.createdBy === (user?.id || user?.userId);

                          return (
                            <td key={d} className={`py-2 px-1 text-center align-middle ${
                              todayFlag ? "bg-green-50/40 dark:bg-green-900/5" : ""
                            } ${isChanged ? "ring-2 ring-amber-400/50 dark:ring-amber-500/50 rounded-md" : ""}`}>
                              {futureFlag ? (
                                <div className="w-10 h-5 rounded-full bg-gray-100 dark:bg-gray-800 opacity-20 mx-auto" />
                              ) : (
                                <div className="flex flex-col items-center gap-1">
                                  <div className="relative">
                                    <Toggle
                                      on={cell.present}
                                      onChange={() => togglePresent(s.id, ds, d)}
                                      disabled={pastFlag}
                                      isOwner={isOwner}
                                      user={user}
                                    />
                                    {isChanged && (
                                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                    )}
                                  </div>

                                  {todayFlag ? (
                                    cell.present && (
                                      <button
                                        onClick={() => setLate(s.id, ds)}
                                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded transition-colors ${
                                          status === "late"
                                            ? "bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-amber-50 hover:text-amber-500"
                                        }`}
                                      >
                                        Kech
                                      </button>
                                    )
                                  ) : pastFlag ? (
                                    <span className={`text-[11px] font-bold leading-none ${
                                      status === "present" ? "text-green-500"
                                      : status === "late"  ? "text-amber-500"
                                      :                      "text-red-400"
                                    }`}>
                                      {status === "present" ? "✓" : status === "late" ? "~" : "✗"}
                                    </span>
                                  ) : null}
                                </div>
                              )}
                            </td>
                          );
                        })}

                        {/* Foiz */}
                        <td className="px-3 py-2.5 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${pctCls}`}>
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}