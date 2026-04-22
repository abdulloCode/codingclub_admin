import { useState, useCallback } from 'react';
import { Layers, Users, BookOpen, MapPin, ChevronDown, ChevronUp, Phone, Mail, Eye } from 'lucide-react';
import { apiService } from '../../../services/api';

export default function GroupManager({ groups, courses, rooms, C }) {
  const [expandedGroups, setExpandedGroups] = useState({});
  const [selectedGroupStudents, setSelectedGroupStudents] = useState({});
  const [loadingStudents, setLoadingStudents] = useState({});
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);

  // Guruhni ochish/yopish
  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Guruh o'quvchilarini yuklash
  const loadGroupStudents = async (groupId) => {
    if (selectedGroupStudents[groupId]) {
      // Already loaded, just show modal
      setCurrentGroup(groups.find(g => g.id === groupId));
      setShowStudentsModal(true);
      return;
    }

    try {
      setLoadingStudents(prev => ({ ...prev, [groupId]: true }));

      const students = await apiService.getGroupStudents(groupId);
      setSelectedGroupStudents(prev => ({
        ...prev,
        [groupId]: students
      }));

      setCurrentGroup(groups.find(g => g.id === groupId));
      setShowStudentsModal(true);
    } catch (err) {
      console.error("Error loading group students:", err);
      alert("O'quvchilarni yuklashda xatolik: " + err.message);
    } finally {
      setLoadingStudents(prev => ({ ...prev, [groupId]: false }));
    }
  };

  // Guruh ma'lumotlarini formatlash
  const formatSchedule = (group) => {
    if (!group.schedule) return "Belgilanmagan";

    const days = {
      dushanba: "Du",
      seshanba: "Se",
      chorshanba: "Ch",
      payshanba: "Pa",
      juma: "Ju",
      shanba: "Sh",
      yakshanba: "Ya"
    };

    const scheduleDays = group.schedule
      .filter(s => s.active)
      .map(s => days[s.day] || s.day)
      .join(", ");

    return scheduleDays || "Belgilanmagan";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Guruhlar</h2>
        <p style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>
          {groups.length} ta guruh boshqarasiz
        </p>
      </div>

      {/* Groups List */}
      {groups.length === 0 ? (
        <div style={{
          padding: 40,
          textAlign: "center",
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12
        }}>
          <Layers size={32} color={C.muted} style={{ marginBottom: 12, opacity: 0.5 }} />
          <p style={{ fontSize: 14, color: C.text, marginBottom: 8 }}>
            Guruhlar topilmadi
          </p>
          <p style={{ fontSize: 12, color: C.muted }}>
            Admin tomonidan guruh tayinlanadi
          </p>
        </div>
      ) : (
        <div style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          overflow: "hidden"
        }}>
          {/* Header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 100px 100px 90px 80px",
            gap: 12,
            padding: "12px 16px",
            borderBottom: `1px solid ${C.border}`,
            background: C.card2
          }}>
            {["Guruh nomi", "O'quvchilar", "Kurs", "Joy", "Amallar"].map((h) => (
              <p key={h} style={{
                fontSize: 11,
                fontWeight: 600,
                color: C.muted,
                textTransform: "uppercase",
                letterSpacing: "0.04em"
              }}>
                {h}
              </p>
            ))}
          </div>

          {/* Groups */}
          {groups.map((g) => {
            const studentCount = g.students?.length || g.currentStudents || 0;
            const maxStudents = g.maxStudents || 20;
            const percentage = maxStudents ? Math.round((studentCount / maxStudents) * 100) : 0;
            const course = courses.find((c) => c.id === g.courseId);
            const room = rooms.find((r) => r.id === g.roomId);
            const isExpanded = expandedGroups[g.id];

            return (
              <div key={g.id}>
                {/* Main Row */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 100px 100px 90px 80px",
                  gap: 12,
                  padding: "14px 16px",
                  alignItems: "center",
                  borderBottom: `1px solid ${C.border}`,
                  cursor: "pointer",
                  transition: "background 0.2s"
                }}
                  onClick={() => toggleGroup(g.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = C.card2;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {/* Group Name */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: `${C.blue}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      <Layers size={16} color={C.blue} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: C.text,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {g.name}
                      </p>
                      <p style={{
                        fontSize: 11,
                        color: C.muted,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {formatSchedule(g)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleGroup(g.id);
                      }}
                      style={{
                        padding: "4px",
                        background: "transparent",
                        border: "none",
                        color: C.muted,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center"
                      }}
                    >
                      {isExpanded ?
                        <ChevronUp size={16} /> :
                        <ChevronDown size={16} />
                      }
                    </button>
                  </div>

                  {/* Students Count */}
                  <div>
                    <p style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: C.text
                    }}>
                      {studentCount}/{maxStudents}
                    </p>
                    <div style={{
                      height: 4,
                      background: C.border,
                      borderRadius: 2,
                      marginTop: 6,
                      overflow: "hidden"
                    }}>
                      <div style={{
                        height: "100%",
                        width: `${percentage}%`,
                        background: percentage > 80 ? C.green :
                                   percentage > 50 ? C.amber :
                                   C.red,
                        borderRadius: 2,
                        transition: "width 0.3s ease"
                      }} />
                    </div>
                  </div>

                  {/* Course */}
                  <div>
                    <p style={{
                      fontSize: 13,
                      color: C.text,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      {course?.name || "Belgilanmagan"}
                    </p>
                  </div>

                  {/* Room */}
                  <div>
                    <p style={{
                      fontSize: 13,
                      color: C.text,
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}>
                      <MapPin size={12} color={C.muted} />
                      {room?.name || "Belgilanmagan"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        loadGroupStudents(g.id);
                      }}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: `1px solid ${C.blue}`,
                        background: `${C.blue}15`,
                        color: C.blue,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        whiteSpace: "nowrap"
                      }}
                    >
                      O'quvchilar
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{
                    padding: "16px",
                    background: C.card2,
                    borderBottom: `1px solid ${C.border}`
                  }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                      {/* Time Info */}
                      <div>
                        <p style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>Dars vaqti</p>
                        <p style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>
                          {g.timeSlot || "Belgilanmagan"}
                        </p>
                      </div>

                      {/* Price Info */}
                      <div>
                        <p style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>Oylik narx</p>
                        <p style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>
                          {g.monthlyPrice?.toLocaleString() || 0} so'm
                        </p>
                      </div>

                      {/* Lessons Per Month */}
                      <div>
                        <p style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>Darslar soni</p>
                        <p style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>
                          {g.lessonsPerMonth || 8} dars/oy
                        </p>
                      </div>

                      {/* Status */}
                      <div>
                        <p style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>Holat</p>
                        <span style={{
                          fontSize: 12,
                          padding: "4px 10px",
                          borderRadius: 12,
                          background: g.status === 'active' ? `${C.green}15` : `${C.red}15`,
                          color: g.status === 'active' ? C.green : C.red,
                          fontWeight: 600
                        }}>
                          {g.status === 'active' ? 'Faol' : 'Nofaol'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Students Modal */}
      {showStudentsModal && currentGroup && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20
        }}>
          <div style={{
            background: C.card,
            borderRadius: 16,
            width: "100%",
            maxWidth: 600,
            maxHeight: "80vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}>
            {/* Header */}
            <div style={{
              padding: "20px",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text }}>
                  {currentGroup.name}
                </h3>
                <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                  O'quvchilar ro'yxati
                </p>
              </div>
              <button
                onClick={() => {
                  setShowStudentsModal(false);
                  setCurrentGroup(null);
                }}
                style={{
                  padding: "6px",
                  borderRadius: 6,
                  background: "transparent",
                  border: `1px solid ${C.border}`,
                  color: C.muted,
                  cursor: "pointer"
                }}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
              {loadingStudents[currentGroup.id] ? (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  padding: 40
                }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "3px solid " + C.border,
                    borderTopColor: C.blue,
                    animation: "spin 1s linear infinite"
                  }} />
                  <p style={{ fontSize: 13, color: C.muted }}>Yuklanmoqda...</p>
                </div>
              ) : selectedGroupStudents[currentGroup.id]?.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: 40
                }}>
                  <Users size={32} color={C.muted} style={{ marginBottom: 12, opacity: 0.5 }} />
                  <p style={{ fontSize: 14, color: C.text }}>O'quvchilar yo'q</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selectedGroupStudents[currentGroup.id].map((student, index) => (
                    <div
                      key={student.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px",
                        borderRadius: 8,
                        background: C.card2,
                        border: `1px solid ${C.border}`
                      }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: `${C.blue}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 700,
                        color: C.blue,
                        flexShrink: 0
                      }}>
                        {(student.user?.name || student.name || "O")[0]?.toUpperCase()}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: C.text,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {student.user?.name || student.name}
                        </p>
                        <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                          {student.user?.phone && (
                            <p style={{
                              fontSize: 11,
                              color: C.muted,
                              display: "flex",
                              alignItems: "center",
                              gap: 4
                            }}>
                              <Phone size={10} />
                              {student.user.phone}
                            </p>
                          )}
                          {student.user?.email && (
                            <p style={{
                              fontSize: 11,
                              color: C.muted,
                              display: "flex",
                              alignItems: "center",
                              gap: 4
                            }}>
                              <Mail size={10} />
                              <span style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: 200
                              }}>
                                {student.user.email}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status */}
                      <div style={{
                        padding: "4px 10px",
                        borderRadius: 12,
                        background: `${C.green}15`,
                        color: C.green,
                        fontSize: 11,
                        fontWeight: 600,
                        whiteSpace: "nowrap"
                      }}>
                        Faol
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: "16px 20px",
              borderTop: `1px solid ${C.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <p style={{ fontSize: 12, color: C.muted }}>
                Jami: {selectedGroupStudents[currentGroup.id]?.length || 0} ta o'quvchi
              </p>
              <button
                onClick={() => {
                  setShowStudentsModal(false);
                  setCurrentGroup(null);
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  background: "transparent",
                  color: C.text,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
