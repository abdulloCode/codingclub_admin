# Codingclub Project Structure

## 📁 Main Directory Structure
```
src/
├── App.jsx                    # Main App component with routing
├── main.jsx                   # Entry point
├── index.css                  # Global styles
├── components/               # Reusable components
├── contexts/                 # React contexts (Auth, Theme, etc.)
├── pages/                    # Page components
├── services/                 # API services
├── hooks/                    # Custom hooks
├── assets/                   # Images and static files
```

---

## 🎯 Core Components (Components Directory)

### 🎨 UI Components
```
components/
├── Layout.jsx               # Main layout wrapper
├── Navbar.jsx               # Navigation bar
├── ImageLoader.jsx           # Loading spinner
├── ApiErrorBoundary.jsx      # Error boundary
├── CalendarDateRange.jsx    # Date range picker
└── Settings.jsx             # Settings component
```

### 💻 Code Editor Components
```
components/
├── CodeEditor.jsx            # Standalone code editor
├── SharedCodeEditor.jsx       # Reusable code editor
└── shared/                   # Shared utilities
```

### 🎓 Student Components
```
components/
├── StudentHomework.jsx       # Student homework interface
├── SharedHomework.jsx        # Shared homework component
├── SharedStatsCard.jsx       # Statistics cards
└── SharedStudentCard.jsx     # Student card component
```

### 👨‍🏫 Teacher Components
```
components/
├── TeacherLayout.jsx         # Teacher panel layout
├── ServerStatus.jsx          # Server status indicator
```

### 🛡️ Admin Components
```
components/
├── AdminLayout.jsx           # Admin panel layout
└── shared/                  # Shared utilities
```

---

## 📄 Pages by Role

### 👨‍💼 Admin Pages
```
pages/
├── AdminPanel.jsx            # Main admin dashboard
├── Teachers.jsx             # Teachers management
├── Students.jsx             # Students management
├── Groups.jsx               # Groups management
├── Courses.jsx              # Courses management
├── Attendance.jsx            # Attendance tracking
├── Reports.jsx              # Reports and analytics
├── Settings.jsx             # System settings
└── Profile.jsx              # User profile
```

### 👨‍🏫 Teacher Pages
```
pages/
├── TeacherPanel.jsx          # Teacher dashboard
├── TeacherGroups.jsx        # Teacher's groups
├── TeacherRegister.jsx       # Teacher registration
└── TeacherLogin.jsx          # Teacher login
```

### 🎓 Student Pages
```
pages/
├── Student.jsx               # Student dashboard
├── Students.jsx              # Students list panel
├── StudentLogin.jsx          # Student login
└── StudentHomework.jsx       # Student homework interface
```

### 🔐 Auth Pages
```
pages/
├── Login.jsx                 # Universal login
├── Register.jsx              # Registration page
```

---

## 🔧 Core System Files

### 📁 Contexts Directory
```
contexts/
├── AuthContext.jsx           # Authentication state
├── ThemeContext.jsx          # Theme management (dark/light)
└── SidebarContext.jsx        # Sidebar state
```

### 📁 Services Directory
```
services/
└── api.js                   # API service layer
```

### 📁 Hooks Directory
```
hooks/
├── ...                      # Custom React hooks
```

---

## 🚀 Application Routing

### Universal Routes
```
/                              → Redirect to login based on role
/login                        → Universal login page
/register                     → Registration page
```

### Admin Routes (`/admin-*`)
```
/admin-panel                 → Admin dashboard
/teachers                     → Teachers management
/students                     → Students management
/groups                       → Groups management
/courses                      → Courses management
/attendance                  → Attendance tracking
/reports                      → Reports and analytics
/settings                     → System settings
/profile                      → User profile
```

### Teacher Routes (`/teacher-*`)
```
/teacher-panel               → Teacher dashboard
/teacher-groups              → Teacher's groups
/teacher-login               → Teacher login (redirects to /login)
/teacher-register            → Teacher registration
```

### Student Routes (`/students-*`)
```
/students-panel              → Student dashboard
/student-login               → Student login (redirects to /login)
```

---

## 🔌 Role-Based Access Control

### 👨‍💼 Admin
- Access: All routes
- Dashboard: `/admin-panel`
- Can manage: Teachers, Students, Groups, Courses, Attendance, Reports

### 👨‍🏫 Teacher
- Access: Teacher-specific routes
- Dashboard: `/teacher-panel`
- Can manage: Own groups, Students in groups, Homework, Attendance

### 🎓 Student
- Access: Student-specific routes
- Dashboard: `/students-panel`
- Can view: Own homework, grades, attendance, leaderboards

---

## 🎨 Key Features by Component Type

### Code Editors
- **CodeEditor.jsx**: Full-featured VS Code-style editor
- **SharedCodeEditor.jsx**: Reusable code editor component

### Homework System
- **SharedHomework.jsx**: Homework display and submission
- **StudentHomework.jsx**: Student homework interface
- Code editing and submission
- Grade tracking and feedback

### Attendance System
- Calendar-based attendance tracking
- Group-level attendance management
- Status: Present/Absent/Late
- Historical records

### Statistics & Analytics
- **SharedStatsCard.jsx**: Stat cards with animations
- Student performance tracking
- Leaderboard system
- Course and group analytics

---

## 🎯 Import Dependencies

### Core React
```javascript
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
```

### Contexts
```javascript
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { SidebarProvider } from '../contexts/SidebarContext';
```

### Services
```javascript
import { apiService } from '../services/api';
```

### UI Components
```javascript
import { Users, BookOpen, Calendar, Settings, ... } from 'lucide-react';
```

---

## 📋 Component Hierarchy

```
App.jsx
├── Router
├── AuthProvider
│   └── AuthContext.jsx
├── ThemeProvider
│   └── ThemeContext.jsx
└── Routes
    ├── Public Routes (Login, Register)
    ├── Admin Routes (Protected)
    │   └── AdminLayout.jsx
    │       └── AdminPanel.jsx, Teachers.jsx, Students.jsx, etc.
    ├── Teacher Routes (Protected)
    │   └── TeacherLayout.jsx
    │       └── TeacherPanel.jsx, TeacherGroups.jsx
    └── Student Routes (Protected)
        └── Students.jsx (Student dashboard)
```

---

## 🔄 State Management Flow

### Authentication Flow
1. User → `/login` → Enter credentials
2. AuthContext → API login request
3. Response → Set user data & token
4. Route protection → Redirect based on role

### Data Flow
1. Component → API Service → Backend
2. Response → Update component state
3. Cache → Optimized API calls
4. Error → Toast notification

---

## 🎯 File Organization by Function

### Admin Files (Management & Analytics)
- AdminPanel.jsx - Main admin dashboard
- Teachers.jsx - Teacher management
- Students.jsx - Student management
- Groups.jsx - Group management
- Courses.jsx - Course management
- Attendance.jsx - Attendance tracking
- Reports.jsx - Reports and analytics
- Settings.jsx - System settings

### Teacher Files (Classroom Management)
- TeacherPanel.jsx - Teacher dashboard
- TeacherGroups.jsx - Group management
- TeacherRegister.jsx - Teacher registration

### Student Files (Learning & Progress)
- Student.jsx - Student dashboard
- Students.jsx - Student list panel
- StudentLogin.jsx - Student authentication
- StudentHomework.jsx - Homework interface

### Code Editor Files (Development Tools)
- CodeEditor.jsx - Standalone code editor
- SharedCodeEditor.jsx - Reusable code editor

### Shared Components (UI Elements)
- SharedHomework.jsx - Homework component
- SharedStatsCard.jsx - Statistics cards
- SharedStudentCard.jsx - Student cards

---

## 📊 Component Relationships

### Dashboard Components
```
AdminPanel.jsx
├── TopCard.jsx (stats display)
├── ScoreChart.jsx (analytics)
├── MiniCalendar.jsx (calendar)
├── Modal.jsx (dialogs)
└── Various cards and sections
```

### Student Dashboard Components
```
Student.jsx / Students.jsx
├── HomeworkCard.jsx (homework display)
├── CodeEditor.jsx (code editing)
├── GradeCard.jsx (grades display)
├── AttendanceCalendar.jsx (attendance)
└── LeaderboardCard.jsx (leaderboard)
```

---

## 🚦 File Naming Conventions

### Pages
- **Admin**: `AdminPanel.jsx`, `Teachers.jsx`, `Students.jsx`
- **Teacher**: `TeacherPanel.jsx`, `TeacherGroups.jsx`
- **Student**: `Student.jsx`, `StudentLogin.jsx`
- **Auth**: `Login.jsx`, `Register.jsx`

### Components
- **Shared**: `Shared*.jsx` (reusable components)
- **Specific**: `TeacherLayout.jsx`, `StudentHomework.jsx`
- **Functional**: `CodeEditor.jsx`, `CalendarDateRange.jsx`

---

## 📝 Notes

1. **Role-Based Routing**: Each role has its own routes and dashboards
2. **Authentication**: Centralized in AuthContext with token management
3. **API Layer**: Single api.js service for all backend calls
4. **Component Reusability**: Shared components reduce code duplication
5. **State Management**: React Context API for global state
6. **Error Handling**: ApiErrorBoundary for error management

---

## 🎯 Next Steps

1. ✅ All import statements fixed to use single quotes
2. ✅ Routing paths corrected (e.g., `/students-panel` vs `/students`)
3. ✅ Proper import ordering maintained
4. ✅ Role-based access control implemented
5. ✅ Shared components for reusability

---

## 📊 Project Statistics

- **Total Pages**: 16+
- **Total Components**: 15+
- **Contexts**: 3 (Auth, Theme, Sidebar)
- **Main Services**: 1 (API service)
- **Routes**: 20+ with role-based protection