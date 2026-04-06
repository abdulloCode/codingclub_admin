import { useState, useCallback } from 'react';
import {
  FileText, Clock, Send, CheckCircle, ChevronRight,
  RefreshCw, AlertCircle, BookOpen, Code, Image, Link,
} from 'lucide-react';
import SharedCodeEditor from './SharedCodeEditor';

/**
 * Vazifa komponenti - Barcha panellar uchun umumiy vazifa tizimi
 * Student, Teacher va Admin panellarida ishlashi mumkin
 */
export default function SharedHomework({
  homework,
  onSubmit,
  userRole = 'student', // 'student', 'teacher', 'admin'
  isExpanded = false,
  onToggle,
}) {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  // Image URL extraction from description
  const imageUrl = homework.imageUrl || homework.image || homework.image_url;
  const urlLink = homework.url || homework.link || homework.link_url;
  const hasMediaContent = imageUrl || urlLink;

  const statusConfig = {
    pending:   { label: "Kutilmoqda",    color: "#f59e0b", icon: Clock,        bg: "rgba(245, 158, 11, 0.15)" },
    submitted: { label: "Tekshirilmoqda", color: "#3b82f6", icon: Send,         bg: "rgba(59, 130, 246, 0.15)"    },
    graded:    { label: "Baholangan",    color: "#22c55e", icon: CheckCircle,  bg: "rgba(34, 197, 94, 0.15)" },
  };

  const status = homework.status || "pending";
  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;
  const isOverdue = homework.deadline && new Date(homework.deadline) < new Date() && status === "pending";

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(homework.id, { content: code });
      setCode('');
      setSubmitDone(true);
      setShowEditor(false);
      setTimeout(() => setSubmitDone(false), 3000);
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const canEdit = userRole === 'student' && status === 'pending' && !isOverdue;
  const canViewCode = userRole === 'teacher' || userRole === 'admin';

  return (
    <div style={{
      background: '#18181b',
      borderRadius: 16,
      border: `1px solid ${isOverdue ? '#ef444480' : submitDone ? '#22c55e60' : '#27272a'}`,
      overflow: 'hidden',
      transition: 'all 0.3s',
    }}>
      {/* Header */}
      <div
        onClick={onToggle}
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
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'rgba(66, 122, 67, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileText size={22} color="#427A43" />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{
              fontSize: 16, fontWeight: 600, color: '#fafafa', marginBottom: 4,
            }}>
              {homework.title}
            </h4>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#a1a1aa' }}>
              <span>
                📅 {homework.deadline
                  ? new Date(homework.deadline).toLocaleDateString('uz-UZ')
                  : "Belgilanmagan"}
              </span>
              {homework.maxPoints && (
                <span>🏆 Max: {homework.maxPoints} ball</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {submitDone && (
            <span style={{
              padding: '4px 12px', borderRadius: 20,
              background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e',
              fontSize: 12, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Check size={12} /> Topshirildi!
            </span>
          )}
          {isOverdue && (
            <span style={{
              padding: '4px 10px', borderRadius: 20,
              background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444',
              fontSize: 11, fontWeight: 600,
            }}>
              Muddati o'tgan
            </span>
          )}
          <div style={{
            padding: '4px 12px', borderRadius: 20,
            background: config.bg, color: config.color,
            fontSize: 11, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <StatusIcon size={12} />
            <span>{config.label}</span>
          </div>
          <ChevronRight
            size={18} color="#a1a1aa"
            style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
          />
        </div>
      </div>

      {/* Expanded Body */}
      {isExpanded && (
        <div style={{
          padding: '0 20px 20px',
          borderTop: '1px solid #27272a',
        }}>
          {/* Description */}
          <p style={{
            fontSize: 14, color: '#a1a1aa', lineHeight: 1.7, margin: '16px 0',
          }}>
            {homework.description || "Tavsif mavjud emas"}
          </p>

          {/* Image content from teacher */}
          {imageUrl && (
            <div style={{ marginBottom: 16 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                fontSize: 12, color: '#427A43', fontWeight: 600,
              }}>
                <Image size={14} />
                <span>Vazifa rasmi</span>
              </div>
              <div style={{
                borderRadius: 12, overflow: 'hidden',
                border: '1px solid #27272a', maxWidth: '100%',
              }}>
                <img
                  src={imageUrl}
                  alt="Vazifa rasmi"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    console.error('Rasm yuklanmadi:', imageUrl);
                  }}
                />
              </div>
            </div>
          )}

          {/* URL content from teacher */}
          {urlLink && (
            <div style={{ marginBottom: 16 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                fontSize: 12, color: '#3b82f6', fontWeight: 600,
              }}>
                <Link size={14} />
                <span>Vazifa havolasi</span>
              </div>
              <a
                href={urlLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '12px 16px', borderRadius: 10,
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#3b82f6', fontSize: 14, fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 8,
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
              >
                <span>{urlLink}</span>
                <ChevronRight size={14} />
              </a>
            </div>
          )}

          {/* Student view - can submit code */}
          {canEdit && (
            <div>
              {/* Code Editor - Auto show when expanded */}
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginBottom: 8, fontSize: 12, color: '#427A43',
                  fontWeight: 600,
                }}>
                  <Code size={14} />
                  <span>Kod yozing</span>
                  <span style={{
                    fontSize: 11, color: '#a1a1aa', marginLeft: 'auto',
                    background: 'rgba(66, 122, 67, 0.1)', padding: '2px 8px', borderRadius: 6,
                  }}>
                    💡 Ctrl+A, Ctrl+C, Tab ishlaydi
                  </span>
                </div>
                <SharedCodeEditor
                  value={code}
                  onChange={setCode}
                  language="javascript"
                  minHeight={280}
                  placeholder="// Vazifangiz kodini shu yerga yozing..."
                />
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={submitting || !code.trim()}
                style={{
                  width: '100%', padding: '14px',
                  borderRadius: 10,
                  background: submitting || !code.trim()
                    ? 'rgba(66, 122, 67, 0.4)'
                    : 'linear-gradient(135deg, #2d5630, #427A43)',
                  color: '#ffffff', fontSize: 15, fontWeight: 700,
                  border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  cursor: (submitting || !code.trim()) ? 'not-allowed' : 'pointer',
                  boxShadow: `0 4px 16px ${submitting || !code.trim() ? 'rgba(66, 122, 67, 0.2)' : 'rgba(66, 122, 67, 0.4)'}`,
                  transition: 'all 0.2s',
                }}
              >
                {submitting
                  ? <><RefreshCw size={18} className="spin" /> Yuborilmoqda...</>
                  : <><Send size={18} /> Vazifani topshirish</>
                }
              </button>
            </div>
          )}

          {/* Teacher/Admin view - show submitted code */}
          {canViewCode && homework.submission?.content && (
            <div style={{
              padding: 14, borderRadius: 12,
              background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Send size={14} color="#3b82f6" />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#3b82f6" }}>
                  {userRole === 'teacher' ? 'Talaba yubordi:' : 'Yuborilgan kod:'}
                </span>
              </div>
              <SharedCodeEditor
                value={homework.submission.content}
                readOnly
                language="javascript"
                minHeight={180}
                placeholder="// Talabaning kodi..."
              />
              {homework.submission?.studentName && (
                <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 8 }}>
                  👤 {homework.submission.studentName}
                </div>
              )}
            </div>
          )}

          {/* Graded - show grade and feedback */}
          {status === 'graded' && (
            <div style={{
              padding: 14, borderRadius: 12,
              background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <CheckCircle size={14} color="#22c55e" />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#22c55e" }}>
                  Baholangan
                  {homework.submission?.points != null && (
                    <span style={{ marginLeft: 8, color: '#f59e0b' }}>
                      ⭐ {homework.submission.points} ball
                    </span>
                  )}
                </span>
              </div>
              {homework.submission?.content && (
                <div style={{ marginBottom: 10 }}>
                  <SharedCodeEditor
                    value={homework.submission.content}
                    readOnly
                    language="javascript"
                    minHeight={150}
                  />
                </div>
              )}
              {homework.feedback && (
                <p style={{ fontSize: 13, color: '#a1a1aa', marginTop: 8 }}>
                  💬 {homework.feedback}
                </p>
              )}
            </div>
          )}

          {/* No content message */}
          {!canEdit && !canViewCode && (
            <div style={{
              padding: 20, borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.05)', border: '1px solid #27272a',
              textAlign: 'center',
            }}>
              <AlertCircle size={32} color="#a1a1aa" style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 14, color: '#a1a1aa', margin: 0 }}>
                {userRole === 'admin' ? 'Bu vazifa tahrirlash uchun yopiq' : 'Kod ko\'rish uchun vazifa topshirilishi kerak'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}