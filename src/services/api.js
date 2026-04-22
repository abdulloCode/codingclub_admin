const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://blog-mrabdunozir-uz.onrender.com";

class ApiService {
  constructor() {
    this.cache = new Map();
    this.cacheTime = 5 * 60 * 1000;
    this.queue = new Map();
    this.tokenKey = "accessToken";
    this.isRefreshing = false;
    this.refreshPromise = null;
  }

  // ── TOKEN ─────────────────────────
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token) {
    if (token) localStorage.setItem(this.tokenKey, token);
  }

  clearToken() {
    localStorage.removeItem(this.tokenKey);
    document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    this.clearCache();
  }

  // ── CACHE ─────────────────────────
  getCacheKey(url, options = {}) {
    return `${options.method || "GET"}:${url}`;
  }

  getCache(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.time > this.cacheTime) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  setCache(key, data) {
    this.cache.set(key, { data, time: Date.now() });
  }

  clearCache() {
    this.cache.clear();
  }

  clearCachePattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) this.cache.delete(key);
    }
  }

  // ── CORE REQUEST ─────────────────────────
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const method = options.method || "GET";
    const cacheKey = this.getCacheKey(endpoint, options);

    if (method === "GET" && !options.skipCache) {
      const cached = this.getCache(cacheKey);
      if (cached) return cached;
    }

    if (this.queue.has(cacheKey)) {
      return this.queue.get(cacheKey);
    }

    const headers = { ...(options.headers || {}) };
    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    if (options.body && !(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const fetchPromise = fetch(url, {
      method,
      headers,
      body: options.body,
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (res) => {
        clearTimeout(timeout);

        if (res.status === 401 && !endpoint.includes("/auth/refresh")) {
          return this.handleTokenRefresh(endpoint, options);
        }

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          let message = err.message || err.error || "Server error";
         if (res.status === 400) message = err.message || err.error || "Ma'lumotlar noto'g'ri";
          if (res.status === 401) message = "Parol yoki telefon raqam noto'g'ri";
          if (res.status === 403) message = "Ruxsat yo'q";
          if (res.status === 404) message = "Ma'lumot topilmadi";
          if (res.status === 500) message = "Server xatosi";
          throw new Error(message);
        }

        if (res.status === 204) return null;

        const data = await res.json();

        if (method === "GET" && !options.skipCache) {
          this.setCache(cacheKey, data);
        }

        if (method !== "GET") {
          this.clearCachePattern(endpoint.split("/")[2] || "");
        }

        return data;
      })
      .catch((err) => {
        clearTimeout(timeout);
        // ✅ React StrictMode AbortError ni handle qilish
        if (err.name === "AbortError") {
          this.queue.delete(cacheKey);
          return this.request(endpoint, { ...options, skipCache: true });
        }
        throw err;
      })
      .finally(() => {
        clearTimeout(timeout);
        this.queue.delete(cacheKey);
      });

    this.queue.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  async handleTokenRefresh(endpoint, options) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshPromise = this.refreshToken().finally(() => {
        this.isRefreshing = false;
        this.refreshPromise = null;
      });
    }

    try {
      const res = await this.refreshPromise;
      if (res?.accessToken) {
        this.setToken(res.accessToken);
        return this.request(endpoint, options);
      }
      throw new Error("No token received");
    } catch {
      this.clearToken();
      window.location.href = "/login";
      throw new Error("Sessiya tugadi, qayta kiring");
    }
  }

  async refreshToken() {
    return this.request("/api/auth/refresh", { method: "POST" });
  }

  // ── AUTH ─────────────────────────
  // POST /api/auth/register
  async register(data) {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // POST /api/auth/login → { accessToken, user }
  async login(data) {
    const res = await this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res?.accessToken) this.setToken(res.accessToken);
    return res;
  }

  // GET /api/auth/me
  async getProfile() {
    return this.request("/api/auth/me", { skipCache: true });
  }

  // PUT /api/auth/me
  async updateProfile(data) {
    return this.request("/api/auth/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // POST /api/auth/logout
  async logout() {
    try {
      await this.request("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      this.clearToken();
    }
  }

  // ── STUDENTS ─────────────────────────
  // GET /api/students?page=1&limit=10&search=john
  async getStudents(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/api/students?${query}` : "/api/students";
    const res = await this.request(url);
    if (Array.isArray(res)) return res;
    if (res?.students) return res.students;
    if (res?.data) return res.data;
    return [];
  }

  // GET /api/students/:id
  async getStudent(id) {
    return this.request(`/api/students/${id}`, { skipCache: true });
  }

  // POST /api/students
  async createStudent(data) {
    return this.request("/api/students", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // PUT /api/students/:id
  async updateStudent(id, data) {
    return this.request(`/api/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // DELETE /api/students/:id
  async deleteStudent(id) {
    return this.request(`/api/students/${id}`, { method: "DELETE" });
  }

  // GET /api/students?page&limit
  async getStudentsPaginated(page = 1, limit = 20, params = {}) {
    const query = new URLSearchParams({ ...params, page, limit }).toString();
    return this.request(`/api/students?${query}`, { skipCache: true });
  }

  // ── TEACHERS ─────────────────────────
  // GET /api/teachers?page=1&limit=10&search=jane
  async getTeachers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/api/teachers?${query}` : "/api/teachers";
    const res = await this.request(url);
    if (Array.isArray(res)) return res;
    if (res?.teachers) return res.teachers;
    if (res?.data) return res.data;
    return [];
  }

  // GET /api/teachers/:id
  async getTeacher(id) {
    return this.request(`/api/teachers/${id}`, { skipCache: true });
  }

  // POST /api/teachers
  async createTeacher(data) {
    return this.request("/api/teachers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // PUT /api/teachers/:id
  async updateTeacher(id, data) {
    return this.request(`/api/teachers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // DELETE /api/teachers/:id
  async deleteTeacher(id) {
    return this.request(`/api/teachers/${id}`, { method: "DELETE" });
  }

  // GET /api/teachers/:id/earnings
  async getTeacherEarnings(teacherId, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query
      ? `/api/teachers/${teacherId}/earnings?${query}`
      : `/api/teachers/${teacherId}/earnings`;
    return this.request(url, { skipCache: true });
  }

  // GET /api/teachers/:id/commission
  async getTeacherCommission(teacherId) {
    return this.request(`/api/teachers/${teacherId}/commission`, { skipCache: true });
  }

  async getMyTeacherData() {
    const profile = await this.getProfile();
    if (profile?.role === "teacher") {
      if (profile.teacher) return profile.teacher;
      if (profile.id) return this.getTeacher(profile.id);
    }
    throw new Error("Teacher data not found");
  }

  async getMyTeacherGroups() {
    const res = await this.getMyGroups();
    return res?.groups ?? [];
  }

  // ── COURSES ─────────────────────────
  // GET /api/courses?search=python
  async getCourses(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/api/courses?${query}` : "/api/courses";
    const res = await this.request(url);
    if (Array.isArray(res)) return res;
    if (res?.courses) return res.courses;
    if (res?.data) return res.data;
    return [];
  }

  // GET /api/courses/:id
  async getCourse(id) {
    return this.request(`/api/courses/${id}`, { skipCache: true });
  }

  // POST /api/courses
  async createCourse(data) {
    return this.request("/api/courses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // PUT /api/courses/:id
  async updateCourse(id, data) {
    return this.request(`/api/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // DELETE /api/courses/:id
  async deleteCourse(id) {
    return this.request(`/api/courses/${id}`, { method: "DELETE" });
  }

  // ── GROUPS ─────────────────────────
  // GET /api/groups?search=keyword&includePaymentInfo=true
  async getGroups(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/api/groups?${query}` : "/api/groups";
    const res = await this.request(url);
    if (Array.isArray(res)) return res;
    if (res?.groups) return res.groups;
    if (res?.data) return res.data;
    return [];
  }

  // GET /api/groups/:id?includePaymentInfo=true&month=2026-01
  async getGroup(id, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/api/groups/${id}?${query}` : `/api/groups/${id}`;
    return this.request(url, { skipCache: true });
  }

  // GET /api/groups/me
  async getMyGroups() {
    return this.request("/api/groups/me", { skipCache: true });
  }

  // POST /api/groups
  async createGroup(data) {
    return this.request("/api/groups", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // PUT /api/groups/:id
  async updateGroup(id, data) {
    return this.request(`/api/groups/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // DELETE /api/groups/:id
  async deleteGroup(id) {
    return this.request(`/api/groups/${id}`, { method: "DELETE" });
  }

  // POST /api/groups/:id/students → { studentId }
  async addStudentToGroup(groupId, studentId) {
    return this.request(`/api/groups/${groupId}/students`, {
      method: "POST",
      body: JSON.stringify({ studentId }),
    });
  }

  // DELETE /api/groups/:id/students/:studentId
  async removeStudentFromGroup(groupId, studentId) {
    return this.request(`/api/groups/${groupId}/students/${studentId}`, {
      method: "DELETE",
    });
  }

  // Guruh o'quvchilarini olish (bir nechta usul bilan)
  async getGroupStudents(groupId) {
    if (!groupId) return [];

    // 1. Guruhni to'liq ma'lumot bilan olish
    try {
      const group = await this.getGroup(groupId);

      // Populated arrays
      for (const key of ["students", "members", "enrollments"]) {
        const arr = group?.[key];
        if (Array.isArray(arr) && arr.length > 0) {
          return key === "enrollments"
            ? arr.map(e => e.student || e.user || e)
            : arr;
        }
      }

      // Faqat IDlar bo'lsa — parallel olish
      const ids = group?.studentIds;
      if (Array.isArray(ids) && ids.length > 0) {
        const results = await Promise.all(
          ids.map(id => this.getStudent(id).catch(() => null))
        );
        return results.filter(Boolean);
      }
    } catch (_) {
      // fallthrough
    }

    // 2. Barcha studentlardan filter
    try {
      const allStudents = await this.getStudents();
      return allStudents.filter(s => s.groupId === groupId);
    } catch {
      return [];
    }
  }


  // ── ATTENDANCE ─────────────────────────
  // GET /api/attendance?date=2026-01-01&groupId=xxx
  async getAttendances(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url   = query ? `/api/attendance?${query}` : "/api/attendance";
    const res   = await this.request(url, { skipCache: true }); // skipCache: har doim fresh
    if (Array.isArray(res)) return res;
    if (res?.attendances) return res.attendances;
    if (res?.data)        return res.data;
    return [];
  }
 
  // GET /api/attendance/:id
  async getAttendance(id) {
    return this.request(`/api/attendance/${id}`, { skipCache: true });
  }
 
  // POST /api/attendance
  // Body: { date, groupId, attendanceData: [{studentId, status}] }
  // MUHIM: Bir kun = bitta record, ichida barcha o'quvchilar!
  async createAttendance(data) {
    return this.request("/api/attendance", {
      method: "POST",
      body:   JSON.stringify(data),
      skipCache: true,
    });
  }
 
  // PUT /api/attendance/:id
  // Body: { attendanceData: [{studentId, status}] }
  async updateAttendance(id, data) {
    return this.request(`/api/attendance/${id}`, {
      method: "PUT",
      body:   JSON.stringify(data),
      skipCache: true,
    });
  }
 
  // DELETE /api/attendance/:id
  async deleteAttendance(id) {
    return this.request(`/api/attendance/${id}`, { method: "DELETE" });
  }
 
  // Guruh attendance recordlarini olish (bir oy yoki barcha)
  async getGroupAttendanceRecords(groupId, params = {}) {
    if (!groupId) return [];
    try {
      return await this.getAttendances({ groupId, ...params });
    } catch {
      return [];
    }
  }
 
  // Bugungi attendance record (guruh uchun)
  async getTodayAttendance(groupId) {
    if (!groupId) return null;
    try {
      const today   = new Date().toISOString().split("T")[0];
      const records = await this.getAttendances({ groupId, date: today });
      return Array.isArray(records) && records.length > 0 ? records[0] : null;
    } catch {
      return null;
    }
  }

  // ✅ Bu endpoint backend da YO'Q — xato yutib, bo'sh qaytarish
  async getGroupAttendanceCalendar(groupId, year, month) {
    if (!groupId) return { days: [], students: [] };
    try {
      const records = await this.getAttendances({ groupId });
      // Attendance recordlarni calendar formatga o'tkazish
      const filtered = records.filter(r => {
        const d = new Date(r.date);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      });
      return { days: filtered, students: [] };
    } catch {
      return { days: [], students: [] };
    }
  }

  // ── PAYMENTS ─────────────────────────
  // GET /api/payments?page=1&limit=10&startDate=...&endDate=...&typeId=...&dk=...&toWhoId=...&month=...
  async getPayments(params = {}) {
    const cleanParams = {};
    Object.entries(params).forEach(([k, v]) => {
      if (v !== "" && v !== null && v !== undefined) cleanParams[k] = v;
    });
    const query = new URLSearchParams(cleanParams).toString();
    const url = query ? `/api/payments?${query}` : "/api/payments";
    const res = await this.request(url);
    if (Array.isArray(res)) return res;
    if (res?.payments) return res.payments;
    if (res?.data) return res.data;
    return [];
  }

  // GET /api/payments/:id
  async getPayment(id) {
    return this.request(`/api/payments/${id}`, { skipCache: true });
  }

 
  async createPayment(data) {
    return this.request("/api/payments", {
      method: "POST",
      body: JSON.stringify(data),
      skipCache: true,
    });
  }

  // PUT /api/payments/:id
  async updatePayment(id, data) {
    return this.request(`/api/payments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      skipCache: true,
    });
  }

  // DELETE /api/payments/:id
  async deletePayment(id) {
    return this.request(`/api/payments/${id}`, { method: "DELETE" });
  }

  // GET /api/payments/user/:id?dk=credit|debit
  async getUserPayments(userId, dk = "") {
    if (!userId) throw new Error("User ID required");
    const query = dk ? `?dk=${dk}` : "";
    const res = await this.request(`/api/payments/user/${userId}${query}`, {
      skipCache: true,
    });
    if (Array.isArray(res)) return res;
    if (res?.payments) return res.payments;
    if (res?.data) return res.data;
    return [];
  }

  // GET /api/payments/me/payments (student o'zining to'lovlari)
  async getMyPayments() {
    const res = await this.request("/api/payments/me/payments", { skipCache: true });
    if (Array.isArray(res)) return res;
    if (res?.payments) return res.payments;
    if (res?.data) return res.data;
    return [];
  }

  // GET /api/payments/report/:month
  async getPaymentReport(month) {
    if (!month) return {};
    try {
      return await this.request(`/api/payments/report/${month}`, { skipCache: true });
    } catch {
      return {};
    }
  }

  // POST /api/payments/:id/approve
  async approvePayment(id) {
    return this.request(`/api/payments/${id}/approve`, {
      method: "POST",
      skipCache: true,
    });
  }

  // POST /api/payments/:id/reject → { reason }
  async rejectPayment(id, reason) {
    return this.request(`/api/payments/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
      skipCache: true,
    });
  }

  // ── PAYMENT TYPES ─────────────────────────
  // GET /api/payment-types?activeOnly=true
  async getPaymentTypes(activeOnly = false) {
    const query = activeOnly ? "?activeOnly=true" : "";
    const res = await this.request(`/api/payment-types${query}`);
    if (Array.isArray(res)) return res;
    if (res?.paymentTypes) return res.paymentTypes;
    if (res?.data) return res.data;
    return [];
  }

  // GET /api/payment-types/:id
  async getPaymentType(id) {
    return this.request(`/api/payment-types/${id}`, { skipCache: true });
  }

  // POST /api/payment-types → { name, code, dk, description? }
  async createPaymentType(data) {
    return this.request("/api/payment-types", {
      method: "POST",
      body: JSON.stringify(data),
      skipCache: true,
    });
  }

  // PUT /api/payment-types/:id
  async updatePaymentType(id, data) {
    return this.request(`/api/payment-types/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      skipCache: true,
    });
  }

  // DELETE /api/payment-types/:id
  async deletePaymentType(id) {
    return this.request(`/api/payment-types/${id}`, { method: "DELETE" });
  }

  // POST /api/payment-types/initialize
  async initializePaymentTypes() {
    return this.request("/api/payment-types/initialize", {
      method: "POST",
      skipCache: true,
    });
  }

  // ── PAYMENT CALCULATIONS ─────────────────────────
  // GET /api/payment-calculations/summary/daily/:date
  async getDailyFinancialSummary(date) {
    if (!date) return {};
    try {
      return await this.request(
        `/api/payment-calculations/summary/daily/${date}`,
        { skipCache: true }
      );
    } catch {
      return {};
    }
  }

  // GET /api/payment-calculations/student/:studentId/daily/:date
  async getStudentDailyPayment(studentId, date) {
    return this.request(
      `/api/payment-calculations/student/${studentId}/daily/${date}`,
      { skipCache: true }
    );
  }

  // GET /api/payment-calculations/teacher/:teacherId/daily/:date
  async getTeacherDailyPayment(teacherId, date) {
    return this.request(
      `/api/payment-calculations/teacher/${teacherId}/daily/${date}`,
      { skipCache: true }
    );
  }

  // GET /api/payment-calculations/student/:studentId/monthly/:month
  async getStudentMonthlyPayment(studentId, month) {
    return this.request(
      `/api/payment-calculations/student/${studentId}/monthly/${month}`,
      { skipCache: true }
    );
  }

  // GET /api/payment-calculations/teacher/:teacherId/monthly/:month
  async getTeacherMonthlyPayment(teacherId, month) {
    return this.request(
      `/api/payment-calculations/teacher/${teacherId}/monthly/${month}`,
      { skipCache: true }
    );
  }

  // GET /api/payment-calculations/students/daily/:date
  async getAllStudentsDailyPayments(date) {
    return this.request(
      `/api/payment-calculations/students/daily/${date}`,
      { skipCache: true }
    );
  }

  // GET /api/payment-calculations/teachers/daily/:date
  async getAllTeachersDailyPayments(date) {
    return this.request(
      `/api/payment-calculations/teachers/daily/${date}`,
      { skipCache: true }
    );
  }

  // ── PAYMENT REPORTS ─────────────────────────
  // GET /api/payment-reports?startDate=...&endDate=...&groupingBy=type|month|toWho&typeId=...
  async getPaymentReports(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/api/payment-reports?${query}` : "/api/payment-reports";
    try {
      return await this.request(url, { skipCache: true });
    } catch {
      return {};
    }
  }

  // GET /api/payment-reports/daily/:date
  async getDailyPaymentReport(date) {
    try {
      return await this.request(`/api/payment-reports/daily/${date}`, { skipCache: true });
    } catch {
      return {};
    }
  }

  // GET /api/payment-reports/monthly/:month
  async getMonthlyPaymentReport(month) {
    try {
      return await this.request(`/api/payment-reports/monthly/${month}`, { skipCache: true });
    } catch {
      return {};
    }
  }

  // GET /api/payment-reports/user/:userId?startDate=...&endDate=...
  async getUserPaymentReport(userId, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query
      ? `/api/payment-reports/user/${userId}?${query}`
      : `/api/payment-reports/user/${userId}`;
    try {
      return await this.request(url, { skipCache: true });
    } catch {
      return {};
    }
  }

  // ── STAFF ─────────────────────────
  // GET /api/staff?role=supporter&status=active&search=john
  async getStaff(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/api/staff?${query}` : "/api/staff";
    const res = await this.request(url);
    if (Array.isArray(res)) return res;
    if (res?.staff) return res.staff;
    if (res?.data) return res.data;
    return [];
  }

  // GET /api/staff/:id
  async getStaffMember(id) {
    return this.request(`/api/staff/${id}`, { skipCache: true });
  }

  // POST /api/staff → { name, phone, password, role, jobTitle?, hireDate?, specialization? }
  async createStaffMember(data) {
    return this.request("/api/staff", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // PUT /api/staff/:id
  async updateStaffMember(id, data) {
    return this.request(`/api/staff/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // DELETE /api/staff/:id
  async deleteStaffMember(id) {
    return this.request(`/api/staff/${id}`, { method: "DELETE" });
  }

  // POST /api/staff/:id/salary → { month, monthlySalary, startDate?, comment? }
  async setStaffSalary(id, data) {
    return this.request(`/api/staff/${id}/salary`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // GET /api/staff/:id/salary?month=2026-01
  async getStaffSalary(id, month = "") {
    const query = month ? `?month=${month}` : "";
    return this.request(`/api/staff/${id}/salary${query}`, { skipCache: true });
  }

  // GET /api/staff/:id/salary-history
  async getStaffSalaryHistory(id) {
    return this.request(`/api/staff/${id}/salary-history`, { skipCache: true });
  }

  // GET /api/staff/daily-salaries/:date
  async getStaffDailySalaries(date) {
    return this.request(`/api/staff/daily-salaries/${date}`, { skipCache: true });
  }

  // ── ROOMS ─────────────────────────
  // GET /api/rooms?capacity=20&location=main
  async getRooms(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/api/rooms?${query}` : "/api/rooms";
    const res = await this.request(url);
    if (Array.isArray(res)) return res;
    if (res?.rooms) return res.rooms;
    if (res?.data) return res.data;
    return [];
  }

  // GET /api/rooms/:id
  async getRoom(id) {
    return this.request(`/api/rooms/${id}`, { skipCache: true });
  }

  // POST /api/rooms → { name, capacity, location, equipment? }
  async createRoom(data) {
    return this.request("/api/rooms", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // PUT /api/rooms/:id
  async updateRoom(id, data) {
    return this.request(`/api/rooms/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // DELETE /api/rooms/:id
  async deleteRoom(id) {
    return this.request(`/api/rooms/${id}`, { method: "DELETE" });
  }

  // ✅ Bu endpoint backend da YO'Q — barcha xonalarni qaytarish
  async getFreeRooms(days, times) {
    try {
      return await this.getRooms();
    } catch {
      return [];
    }
  }

  // ── NOTIFICATIONS ─────────────────────────
  async getNotifications(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/api/notifications?${query}` : "/api/notifications";
    const res = await this.request(url, { skipCache: true });
    if (Array.isArray(res)) return res;
    if (res?.notifications) return res.notifications;
    return [];
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/api/notifications/${notificationId}/read`, { method: "PUT" });
  }

  async markAllNotificationsAsRead() {
    return this.request("/api/notifications/read-all", { method: "PUT" });
  }

  async deleteNotification(notificationId) {
    return this.request(`/api/notifications/${notificationId}`, { method: "DELETE" });
  }

  // ── RATINGS ─────────────────────────
  async getRatings(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/api/ratings?${query}` : "/api/ratings";
    const res = await this.request(url);
    if (Array.isArray(res)) return res;
    if (res?.ratings) return res.ratings;
    return [];
  }

  async createRating(data) {
    return this.request("/api/ratings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateRating(id, data) {
    return this.request(`/api/ratings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteRating(id) {
    return this.request(`/api/ratings/${id}`, { method: "DELETE" });
  }

  // ── STATS ─────────────────────────
  // GET /api/stats
  async getStats() {
    try {
      return await this.request("/api/stats", { skipCache: true });
    } catch {
      return {};
    }
  }

  // ── SETTINGS ─────────────────────────
  // GET /api/setting
  async getSettings() {
    return this.request("/api/setting");
  }

  // PUT /api/setting
  async updateSettings(data) {
    return this.request("/api/setting", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // ── ARTICLES ─────────────────────────
  // GET /api/admin/articles
  async getArticles() {
    const res = await this.request("/api/admin/articles");
    if (Array.isArray(res)) return res;
    if (res?.articles) return res.articles;
    return [];
  }

  async createArticle(data) {
    return this.request("/api/admin/articles", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateArticle(id, data) {
    return this.request(`/api/admin/articles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteArticle(id) {
    return this.request(`/api/admin/articles/${id}`, { method: "DELETE" });
  }
}

export const apiService = new ApiService();