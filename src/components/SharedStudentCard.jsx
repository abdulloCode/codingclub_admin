import { useState, useCallback } from 'react';
import {
  Mail, Phone, Edit3, Trash2, CheckCircle, XCircle,
  GraduationCap, FileText, BookOpen, Code2,
} from 'lucide-react';

/**
 * O'quvchi karta komponenti - Barcha panellar uchun umumiy o'quvchi tizimi
 */
export default function SharedStudentCard({
  student,
  onEdit,
  onDelete,
  onViewHomework,
  onViewCode,
  showGrades = true,
  showActions = true,
  userRole = 'admin', // 'admin', 'teacher'
}) {
  const [expanded, setExpanded] = useState(false);

  const handleEdit = useCallback(() => {
    onEdit?.(student);
  }, [student, onEdit]);

  const handleDelete = useCallback(() => {
    if (confirm('Haqiqatan o\'quvchini o\'chirmoqchimisiz?')) {
      onDelete?.(student.id || student._id);
    }
  }, [student, onDelete]);

  const handleViewHomework = useCallback(() => {
    onViewHomework?.(student);
  }, [student, onViewHomework]);

  const handleViewCode = useCallback(() => {
    onViewCode?.(student);
  }, [student, onViewCode]);

  const name = student.user?.name || student.name || '—';
  const email = student.user?.email || student.email || '—';
  const phone = student.user?.phone || student.phone || '—';
  const groupName = student.groupName || student.group?.name || '—';
  const courseName = student.courseName || student.course || 'Kiberxavfsizlik';
  const teacherName = student.teacherName || student.teacher?.name || student.teacher?.user?.name || '—';

  const isActive = student.status === 'active';
  const averageGrade = student.averageGrade || 0;

  return (
    <div style={{
      background: '#18181b',
      borderRadius: 16,
      border: `1px solid ${isActive ? 'rgba(66, 122, 67, 0.3)' : '#27272a'}`,
      overflow: 'hidden',
      transition: 'all 0.3s',
      cursor: 'pointer',
    }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '16px 20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          {/* Avatar */}
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'linear-gradient(135deg, #2d5630, #427A43)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ffffff', fontWeight: 600, fontSize: 18,
            flexShrink: 0,
          }}>
            {(name || '?')[0]}
          </div>

          {/* Student Info */}
          <div style={{ flex: 1 }}>
            <h4 style={{
              fontSize: 16, fontWeight: 600, color: '#fafafa', marginBottom: 4,
            }}>
              {name}
            </h4>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#a1a1aa' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Mail size={12} />
                <span>{email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Phone size={12} />
                <span>{phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div style={{
          padding: '4px 12px', borderRadius: 20,
          background: isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          color: isActive ? '#22c55e' : '#ef4444',
          fontSize: 11, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
          <span>{isActive ? 'Faol' : 'Nofaol'}</span>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{
          padding: '0 20px 20px',
          borderTop: '1px solid #27272a',
        }}>
          {/* Course */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 12px', borderRadius: 8,
              background: 'rgba(66, 122, 67, 0.15)',
              color: '#427A43', fontSize: 12, fontWeight: 600,
            }}>
              <GraduationCap size={14} />
              <span>{courseName}</span>
            </div>
          </div>

          {/* Group */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 12px', borderRadius: 8,
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#3b82f6', fontSize: 12, fontWeight: 600,
            }}>
              <FileText size={14} />
              <span>{groupName !== '—' ? `Guruh: ${groupName}` : 'Guruh tanlanmagan'}</span>
            </div>
          </div>

          {/* Teacher */}
          {teacherName !== '—' && (
            <div style={{ marginBottom: 16 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 12px', borderRadius: 8,
                background: 'rgba(139, 92, 246, 0.15)',
                color: '#8b5cf6', fontSize: 12, fontWeight: 600,
              }}>
                <GraduationCap size={14} />
                <span>O'qituvchi: {teacherName}</span>
              </div>
            </div>
          )}

          {/* Grades */}
          {showGrades && (
            <div style={{ marginBottom: 16 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px',
                borderRadius: 8,
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 8,
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#ffffff', fontSize: 20, fontWeight: 700,
                }}>
                  {averageGrade.toFixed(1)}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fafafa', marginBottom: 4 }}>
                    O'rtacha baho
                  </div>
                  <div style={{ fontSize: 12, color: '#a1a1aa' }}>
                    Jami vazifalar: {student.totalHomeworks || 0} ta
                  </div>
                  <div style={{ fontSize: 12, color: '#a1a1aa' }}>
                    Bajarilgan: {student.completedHomeworks || 0} ta
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div style={{
              display: 'flex', gap: 12, justifyContent: 'center',
            }}>
              <button
                onClick={handleViewHomework}
                style={{
                  padding: '10px 18px',
                  borderRadius: 8,
                  background: 'rgba(66, 122, 67, 0.15)',
                  border: '1px solid rgba(66, 122, 67, 0.3)',
                  color: '#427A43', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(66, 122, 67, 0.25)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(66, 122, 67, 0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <BookOpen size={14} />
                Vazifalar
              </button>

              <button
                onClick={handleViewCode}
                style={{
                  padding: '10px 18px',
                  borderRadius: 8,
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#3b82f6', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.25)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Code2 size={14} />
                Kodni ko'rish
              </button>

              <button
                onClick={handleEdit}
                style={{
                  padding: '10px 18px',
                  borderRadius: 8,
                  background: 'transparent',
                  border: '1px solid #27272a',
                  color: '#a1a1aa', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(42, 42, 42, 0.1)';
                  e.currentTarget.style.borderColor = '#427A43';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = '#27272a';
                }}
              >
                <Edit3 size={14} />
                Tahrirlash
              </button>

              <button
                onClick={handleDelete}
                style={{
                  padding: '10px 18px',
                  borderRadius: 8,
                  background: 'transparent',
                  border: '1px solid #ef4444',
                  color: '#ef4444', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                  e.currentTarget.style.borderColor = '#dc2626';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = '#ef4444';
                }}
              >
                <Trash2 size={14} />
                O'chirish
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}