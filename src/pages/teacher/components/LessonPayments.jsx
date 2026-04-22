import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../../services/api';
import {
  Calendar, DollarSign, Plus, Trash2, Users, 
  TrendingUp, RefreshCw, Filter, X, Save, AlertCircle
} from 'lucide-react';

export default function LessonPayments({ C, user, groups }) {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    studentId: '',
    lessonDate: new Date().toISOString().split('T')[0],
    amount: '',
  });

  // Studentlarni bir marta yuklab olamiz
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const studentsData = await apiService.getStudents();
        setStudents(Array.isArray(studentsData) ? studentsData : studentsData?.students || []);
      } catch (err) {
        console.error('Data fetch error:', err);
      }
    };
    fetchInitialData();
  }, []);

  // To'lovlarni yuklash funksiyasi
  const fetchLessonPayments = useCallback(async () => {
    try {
      setLoading(true);
      const teacherData = await apiService.getMyTeacherData();
      const teacherId = teacherData?.teacher?.id || teacherData?.id;

      if (!teacherId) return;

      const allPayments = await apiService.getPayments({
        teacherId: teacherId,
        startDate: selectedDate,
        endDate: selectedDate
      });

      const data = Array.isArray(allPayments) ? allPayments : (allPayments?.payments || []);
      
      // Faqat darsga oid to'lovlarni filtrlaymiz
      const lessonPaymentsData = data.filter(payment =>
        payment.typeId === 'LESSON' || 
        payment.paymentType?.code === 'LESSON' ||
        payment.description?.toLowerCase().includes('dars')
      );

      setPayments(lessonPaymentsData);
    } catch (err) {
      console.error('Payments fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchLessonPayments();
  }, [fetchLessonPayments]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentForm.studentId || !paymentForm.amount) return alert("Hamma maydonlarni to'ldiring");

    try {
      setLoading(true);
      const payload = {
        type: 'credit',
        dk: 'credit',
        amount: parseFloat(paymentForm.amount),
        toWhoId: paymentForm.studentId,
        groupId: selectedGroup?.id,
        typeId: 'LESSON',
        description: `Dars: ${new Date(paymentForm.lessonDate).toLocaleDateString('uz-UZ')}`
      };

      await apiService.createPayment(payload);
      setPaymentModalOpen(false);
      setPaymentForm({ ...paymentForm, studentId: '', amount: '' });
      fetchLessonPayments();
    } catch (err) {
      alert("Xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStudentInfo = (payment) => {
    if (payment.toWho) return payment.toWho;
    return students.find(s => s.id === payment.toWhoId) || {};
  };

  const currentGroupStudents = selectedGroup 
    ? students.filter(s => s.groupId === selectedGroup.id) 
    : [];

  const filteredPayments = payments.filter(p => {
    const student = getStudentInfo(p);
    const name = student.user?.name || student.name || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalAmount = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div style={{ fontFamily: 'inherit', color: C.text }}>
      {/* Header Section */}
      <div style={{ background: C.card, padding: '20px 24px', borderBottom: `1px solid ${C.border}`, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 15 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Dars To'lovlari</h2>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Kunlik dars kirimlarini nazorat qilish</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])} style={styles.secondaryBtn(C)}>
              <Calendar size={16} /> Bugun
            </button>
            <button onClick={fetchLessonPayments} style={styles.secondaryBtn(C)}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Yangilash
            </button>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{ padding: '0 24px', marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <select 
          value={selectedGroup?.id || ''} 
          onChange={(e) => setSelectedGroup(groups.find(g => g.id === e.target.value))}
          style={styles.input(C, true)}
        >
          <option value="">Barcha guruhlar</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>

        <input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)} 
          style={styles.input(C)} 
        />

        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Filter size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
          <input 
            placeholder="O'quvchi ismi..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...styles.input(C), paddingLeft: 38, width: '100%' }}
          />
        </div>

        <button onClick={() => selectedGroup ? setPaymentModalOpen(true) : alert("Avval guruh tanlang")} style={styles.primaryBtn}>
          <Plus size={18} /> To'lov Qo'shish
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, padding: '0 24px', marginBottom: 24 }}>
        <StatCard icon={<Users color="#6366f1"/>} label="Guruhdagi o'quvchilar" value={currentGroupStudents.length} C={C} />
        <StatCard icon={<CheckCircle color="#22c55e"/>} label="To'lov qilganlar" value={filteredPayments.length} C={C} />
        <StatCard icon={<TrendingUp color="#f59e0b"/>} label="Jami kirim" value={`${totalAmount.toLocaleString()} sum`} C={C} />
      </div>

      {/* Table/List Area */}
      <div style={{ padding: '0 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 50 }}><RefreshCw size={32} className="animate-spin" color={C.muted}/></div>
        ) : filteredPayments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: C.card, borderRadius: 16 }}>
            <AlertCircle size={48} color={C.muted} style={{ opacity: 0.2 }} />
            <p style={{ color: C.muted, marginTop: 10 }}>Ma'lumot topilmadi</p>
          </div>
        ) : (
          <div style={{ background: C.card, borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.border}` }}>
            {filteredPayments.map((p, i) => {
              const st = getStudentInfo(p);
              return (
                <div key={p.id} style={styles.listRow(C, i === filteredPayments.length - 1)}>
                  <div style={styles.iconCircle}><DollarSign size={18} color="#22c55e"/></div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: 15 }}>{st.user?.name || st.name || 'Noma\'lum'}</h4>
                    <span style={{ fontSize: 12, color: C.muted }}>{st.phone || 'Tel kiritilmagan'}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: C.text }}>{p.amount?.toLocaleString()} so'm</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{new Date(p.date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <button style={styles.deleteBtn}><Trash2 size={14}/></button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Integration */}
      {paymentModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent(C), width: '100%', maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Yangi To'lov</h3>
              <X size={20} onClick={() => setPaymentModalOpen(false)} style={{ cursor: 'pointer' }} />
            </div>
            <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <label style={styles.label}>O'quvchi
                <select required style={styles.input(C)} value={paymentForm.studentId} onChange={e => setPaymentForm({...paymentForm, studentId: e.target.value})}>
                  <option value="">Tanlang...</option>
                  {currentGroupStudents.map(s => <option key={s.id} value={s.id}>{s.user?.name || s.name}</option>)}
                </select>
              </label>
              <label style={styles.label}>Summa (so'm)
                <input type="number" required placeholder="50000" style={styles.input(C)} value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} />
              </label>
              <button type="submit" disabled={loading} style={{ ...styles.primaryBtn, width: '100%', padding: 12 }}>
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />} Saqlash
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Yordamchi komponent
const StatCard = ({ icon, label, value, C }) => (
  <div style={{ background: C.card, padding: 20, borderRadius: 16, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 15 }}>
    <div style={{ width: 45, height: 45, borderRadius: 12, background: `${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
    <div>
      <div style={{ fontSize: 20, fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: 12, color: C.muted }}>{label}</div>
    </div>
  </div>
);

// Stillar obyekti
const styles = {
  input: (C, isSelect) => ({
    padding: '10px 14px',
    borderRadius: 10,
    border: `1px solid ${C.border}`,
    background: C.card2,
    color: C.text,
    fontSize: 14,
    outline: 'none',
    cursor: isSelect ? 'pointer' : 'text'
  }),
  primaryBtn: {
    background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
    color: 'white',
    border: 'none',
    padding: '10px 18px',
    borderRadius: 10,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer'
  },
  secondaryBtn: (C) => ({
    background: C.card2,
    border: `1px solid ${C.border}`,
    color: C.text,
    padding: '8px 14px',
    borderRadius: 8,
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer'
  }),
  listRow: (C, isLast) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    gap: 15,
    borderBottom: isLast ? 'none' : `1px solid ${C.border}`,
    transition: '0.2s'
  }),
  iconCircle: {
    width: 38, height: 38, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  deleteBtn: {
    background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 8
  },
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
  },
  modalContent: (C) => ({
    background: C.card, padding: 25, borderRadius: 20, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
  }),
  label: {
    display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 500
  }
};