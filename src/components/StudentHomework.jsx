import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiService } from '../services/api';
import {
  BookOpen,
  CheckCircle,
  Clock,
  User,
  FileText,
  X,
  RefreshCw,
} from 'lucide-react';

/**
 * Vazifa ko'rsatish componenti
 * Talabaning kodini ko'rsatish va bahosini berish uchun
 */
export default function StudentHomework({ studentId, studentName, onUpdate }) {
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [submission, setSubmission] = useState({
    code: '',
    comments: '',
    status: 'submitted'
  });

  const loadHomeworks = useCallback(async () => {
    try {
      console.log(`📚 Loading homework for student ${studentId}`);
      // Vazifalarni backend'dan yuklash
      const response = await apiService.getHomeworks();
      const studentHomeworks = response?.homeworks?.filter(hw =>
        hw.studentId === studentId ||
        hw.students?.includes(studentId)
      );

      console.log('📋 Student homeworks:', studentHomeworks);
      setHomeworks(studentHomeworks || []);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading homework:', error);
      setLoading(false);
      setHomeworks([]);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      loadHomeworks();
    }
  }, [studentId, loadHomeworks]);

  const handleSubmitSubmission = async (homeworkId) => {
    try {
      console.log(`📝 Submitting homework ${homeworkId} for student ${studentId}`);
      await apiService.submitHomework(homeworkId, submission);
      showToast('Vazifa muvaffaqiyatli yuborildi!', 'success');
      setSubmission({ code: '', comments: '', status: 'submitted' });
      loadHomeworks();
    } catch (error) {
      console.error('❌ Submit error:', error);
      showToast('Yuborishda xatolik yuz berdi', 'error');
    }
  };

  return (
    <div style={{
      padding: '20px',
      background: '#f8faf8',
      borderRadius: '12px',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#427A43',
            marginBottom: '8px'
          }}>
            📚 Vazifalar
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#666',
            marginTop: '4px'
          }}>
            {studentName} - Vazifalarni ko'rsatish
          </p>
        </div>

        <button
          onClick={loadHomeworks}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #2d5630, #427A43)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={16} />
          {loading ? 'Yuklanmoqda...' : 'Yangilash'}
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '16px',
        maxHeight: '300px',
        overflowY: 'auto'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #e2e8f0',
              borderRadius: '50%',
              borderTop: '3px solid #427A43',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ marginTop: '16px', color: '#666' }}>Vazifalar yuklanmoqda...</p>
          </div>
        ) : homeworks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#999',
            fontSize: '14px'
          }}>
            <FileText size={40} style={{ color: '#ccc', marginBottom: '12px' }} />
            <p>Hozircha vazifalar yo'q</p>
          </div>
        ) : (
          homeworks.map(homework => (
            <div
              key={homework.id}
              onClick={() => setSelectedHomework(homework)}
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: selectedHomework?.id === homework.id
                  ? '2px solid #427A43'
                  : '1px solid #e2e8f0',
                background: selectedHomework?.id === homework.id
                  ? 'rgba(66, 122, 67, 0.1)'
                  : '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: selectedHomework?.id === homework.id
                  ? '0 4px 12px rgba(66, 122, 67, 0.15)'
                  : 'none'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    marginBottom: '4px'
                  }}>
                    {homework.title}
                  </h4>
                  <p style={{
                    fontSize: '12px',
                    color: '#666',
                    marginBottom: '8px'
                  }}>
                    <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    {new Date(homework.dueDate).toLocaleDateString('uz-UZ', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: homework.status === 'submitted'
                      ? '#22c55e'
                      : homework.status === 'graded'
                        ? '#3b82f6'
                        : '#f59e0b',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {homework.status === 'submitted' ? '✅ Yuborildi' : '📝 Yangiladi'}
                  </div>
                  <div style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: '#f59e0b',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {homework.points || 0} ball
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
        )}
      </div>

      {/* Selected homework detail */}
      {selectedHomework && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 15)',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <button
              onClick={() => setSelectedHomework(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0,0,0,0.25)',
                border: 'none',
                borderRadius: '50%',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              <X size={20} color="#666" />
            </button>

            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1a1a1a',
              marginBottom: '20px',
              textAlign: 'center',
              marginTop: '40px'
            }}>
              {selectedHomework.title}
            </h3>

            <p style={{
              fontSize: '14px',
              color: '#666',
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              Tavsif: {selectedHomework.description || 'Izoh berilgan'}
            </p>

            <div style={{
              fontSize: '13px',
              color: '#666',
              marginBottom: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <Clock size={14} />
                <span style={{ color: '#999', fontSize: '12px' }}>
                  {selectedHomework.dueDate ? new Date(selectedHomework.dueDate).toLocaleDateString('uz-UZ', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : 'Muddati'}
                </span>
              </div>
              <div style={{
                padding: '4px 8px',
                borderRadius: '6px',
                background: '#f59e0b',
                color: '#fff',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {selectedHomework.points || 0} ball
              </div>
            </div>

            {/* Code editor */}
            <div style={{
              marginBottom: '16px'
            }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '8px'
              }}>
                Kod yozing:
              </label>
              <textarea
                value={submission.code}
                onChange={e => setSubmission({...submission, code: e.target.value})}
                placeholder="Vazifangiz kodni shu yerga yozing..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  fontSize: '13px',
                  color: '#1a1a1a',
                  resize: 'vertical',
                  fontFamily: 'monospace, monospace'
                }}
              />
              <input
                type="text"
                placeholder="Izohlar qoldirgan"
                value={submission.comments}
                onChange={e => setSubmission({...submission, comments: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '8px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  fontSize: '13px',
                  color: '#1a1a1a1a'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '20px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => handleSubmitSubmission(selectedHomework.id)}
                disabled={submission.status === 'submitted'}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #2d5630, #427A43)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: submission.status === 'submitted' ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(66, 122, 67, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {submission.status === 'submitted' ? (
                  <>
                    <CheckCircle size={16} />
                    Yuborildi
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Yuborish
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}