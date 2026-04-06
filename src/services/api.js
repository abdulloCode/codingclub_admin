const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://blog-mrabdunozir-uz.onrender.com";

class ApiService {
  constructor() {
    this.isRefreshing = false;
    this.refreshPromise = null;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000;
    this.requestQueue = new Map();
  }
  getCacheKey(endpoint, options = {}) {
    const method = options.method || "GET";
    const body = options.body ? JSON.stringify(options.body) : "";
    return `${method}:${endpoint}:${body}`;
  }
  setCache(key, data) { this.cache.set(key, { data, timestamp: Date.now() }); }
  getCache(key) {
    const cached = this.cache.get(key);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < this.cacheTimeout) return cached.data;
      this.cache.delete(key);
    }
    return null;
  }
  clearCache() { this.cache.clear(); }
  clearCachePattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) this.cache.delete(key);
    }
  }

  getToken()      { return localStorage.getItem("accessToken"); }
  setToken(token) { if (token) localStorage.setItem("accessToken", token); }
  clearToken() {
    localStorage.removeItem("accessToken");
    document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    this.clearCache();
  }
  async request(endpoint, options = {}) {
    const token    = this.getToken();
    const method   = (options.method || "GET").toUpperCase();
    const headers  = new Headers(options.headers || {});
    const cacheKey = this.getCacheKey(endpoint, options);

    if (method === "GET" && !options.skipCache) {
      const cached = this.getCache(cacheKey);
      if (cached) { console.log(`✅ Cache HIT: ${endpoint}`); return cached; }
    }
    if (this.requestQueue.has(cacheKey)) {
      console.log(`⏳ Queued: ${endpoint}`);
      return this.requestQueue.get(cacheKey);
    }
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (options.body && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }
    if (!navigator.onLine) throw new Error("Internet aloqasi yo'q. Tarmoqni tekshiring.");

    try {
      console.log(` ${method}: ${endpoint}`);
      const requestPromise = (async () => {
        const controller = new AbortController();
        const timeoutId  = setTimeout(() => controller.abort(), 30000);
        try {
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options, method, headers,
            signal: controller.signal, credentials: "include",
          });
          clearTimeout(timeoutId);
          const isAuthEndpoint = [
            "/api/auth/login", "/api/auth/refresh", "/api/auth/register",
          ].some(p => endpoint.includes(p));
          if (response.status === 401 && !isAuthEndpoint) {
            return this.handleTokenRefresh(endpoint, options);
          }
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            let msg = errorData.message || errorData.error || `Server xatosi: ${response.status}`;
            if      (response.status === 400) msg = errorData.message || "Ma'lumotlar noto'g'ri kiritilgan.";
            else if (response.status === 401) msg = "Parol yoki telefon raqam noto'g'ri. Iltimos, qayta urinib ko'ring.";
            else if (response.status === 403) msg = "Bu amalni bajarish uchun ruxsat yo'q.";
            else if (response.status === 404) msg = "Ma'lumot topilmadi.";
            else if (response.status === 409) msg = "Bu ma'lumot allaqachon mavjud.";
            else if (response.status >= 500)  msg = "Serverda xatolik. Keyinroq urinib ko'ring.";
            throw new Error(msg);
          }
          if (response.status === 204) {
            this.clearCachePattern(endpoint.split("/")[2]);
            return null;
          }
          const data = await response.json();
          if (method === "GET" && !options.skipCache) this.setCache(cacheKey, data);
          if (method !== "GET") this.clearCachePattern(endpoint.split("/")[2]);
          return data;
        } finally {
          this.requestQueue.delete(cacheKey);
        }
      })();
      this.requestQueue.set(cacheKey, requestPromise);
      return await requestPromise;
    } catch (error) {
      this.requestQueue.delete(cacheKey);
      console.error(`💥 API Error (${endpoint}):`, error.message);
      if (error.name === "AbortError") throw new Error("So'rov muddati o'tdi (Timeout).");
      if (error.message === "Failed to fetch" || error instanceof TypeError)
        throw new Error("Server bilan bog'lanib bo'lmadi.");
      throw error;
    }
  }

  async handleTokenRefresh(endpoint, options) {
    if (!this.isRefreshing) {
      this.isRefreshing   = true;
      this.refreshPromise = this.refresh().finally(() => {
        this.isRefreshing   = false;
        this.refreshPromise = null;
      });
    }
    try {
      const res = await this.refreshPromise;
      if (res?.accessToken) { this.setToken(res.accessToken); return this.request(endpoint, options); }
    } catch {
      this.clearToken();
      throw new Error("Sessiya tugadi, iltimos qayta kiring.");
    }
  }

  // ── Auth ──────────────────────────────────────────────────
  // ── Auth ──────────────────────────────────────────────────
  async login(data) {
    // data bu yerda { email: "...", password: "..." } 
    // yoki { phone: "...", password: "..." } ko'rinishida keladi
    const res = await this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data)
    });
    
    if (res?.accessToken) {
      this.setToken(res.accessToken);
    }
    return res;
  }

  async studentLogin(email, password) {
    return this.login({ email, password });
  }

  async teacherLogin(email, password) {
    return this.login({ email, password });
  }
  async studentLogin(data) {
    const res = await this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ ...data, role: "student" }),
      headers: { "X-User-Role": "student" }
    });
    if (res?.accessToken) this.setToken(res.accessToken);
    return res;
  }

  async getProfile()        { return this.request("/api/auth/me",      { skipCache: true }); }
  async updateProfile(data) { return this.request("/api/auth/me",      { method: "PUT", body: JSON.stringify(data) }); }
  async refresh()           { return this.request("/api/auth/refresh",  { method: "POST" }); }
  async logout() {
    try {
      await this.request("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout so'rovida xatolik:", error.message);
    } finally {
      this.clearToken();
    }
  }

  // ── Students ──────────────────────────────────────────────
  async getStudents()           { return this.request("/api/students"); }
  async getStudent(id)          { return this.request(`/api/students/${id}`, { skipCache: true }); }
  async createStudent(data)     { return this.request("/api/students",       { method: "POST",   body: JSON.stringify(data) }); }
  async updateStudent(id, data) { return this.request(`/api/students/${id}`, { method: "PUT",    body: JSON.stringify(data) }); }
  async deleteStudent(id)       { return this.request(`/api/students/${id}`, { method: "DELETE" }); }
  async getMyGrades()           { return this.request("/api/students/me/grades",     { skipCache: true }); }
  async getMyHomeworks()        { return this.request("/api/students/me/homework",   { skipCache: true }); }
  async getMyStudentData()      { return this.request("/api/students/me/data",       { skipCache: true }); }
  async getMyAttendanceCount()  {
    try {
      const attendance = await this.request("/api/students/me/attendance", { skipCache: true });
      const records = Array.isArray(attendance) ? attendance : (attendance?.attendance || attendance?.data || []);
      return records.filter(r => r.status === "present").length;
    } catch (err) {
      console.error("Davomat sonini olishda xatolik:", err);
      return 0;
    }
  }
  async getMyCoins() {
    try {
      const data = await this.request("/api/students/me/data", { skipCache: true });
      return data?.coins || 0;
    } catch (err) {
      console.error("Tangalarni olishda xatolik:", err);
      return 0;
    }
  }
  async submitHomeworkWithCode(id, data) {
    return this.request(`/api/homework/${id}/submit`, { method: "POST", body: JSON.stringify(data) });
  }
 async assignGroupToStudent(studentId, groupId) {
  return this.request(`/api/students/${studentId}/assign-group`, {
    method: "POST",
    body: JSON.stringify({ groupId: String(groupId).trim() }),
    skipCache: true,
  });
}
  async getStudentsPaginated(page = 1, limit = 20, filters = {}) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit), ...filters });
    return this.request(`/api/students?${params}`, { skipCache: true });
  }
  async searchStudents(query) {
    return this.request(`/api/students/search?q=${encodeURIComponent(query)}`, { skipCache: true });
  }

  // ── Teachers ──────────────────────────────────────────────
  async getTeachers()           { return this.request("/api/teachers"); }
  async getTeacher(id)          { return this.request(`/api/teachers/${id}`, { skipCache: true }); }
  async createTeacher(data)     { return this.request("/api/teachers",        { method: "POST",   body: JSON.stringify(data) }); }
  async updateTeacher(id, data) { return this.request(`/api/teachers/${id}`,  { method: "PUT",    body: JSON.stringify(data) }); }
  async deleteTeacher(id)       { return this.request(`/api/teachers/${id}`,  { method: "DELETE" }); }
  async getMyTeacherData()      { return this.request("/api/teachers/me/data",    { skipCache: true }); }
  async getMyTeacherGroups()    { return this.request("/api/teachers/me/groups",  { skipCache: true }); }
  async getTeacherGroups(id)    { return this.request(`/api/teachers/${id}/groups`, { skipCache: true }); }
  async searchTeachers(query) {
    return this.request(`/api/teachers/search?q=${encodeURIComponent(query)}`, { skipCache: true });
  }

  // ── Courses ───────────────────────────────────────────────
  async getCourses()            { return this.request("/api/courses"); }
  async getCourse(id)           { return this.request(`/api/courses/${id}`, { skipCache: true }); }
  async createCourse(data)      { return this.request("/api/courses",        { method: "POST",   body: JSON.stringify(data) }); }
  async updateCourse(id, data)  { return this.request(`/api/courses/${id}`,  { method: "PUT",    body: JSON.stringify(data) }); }
  async deleteCourse(id)        { return this.request(`/api/courses/${id}`,  { method: "DELETE" }); }

  // ── Groups ────────────────────────────────────────────────
  async getGroups()             { return this.request("/api/groups"); }
  async getGroup(id)            { return this.request(`/api/groups/${id}`, { skipCache: true }); }
  async createGroup(data)       { return this.request("/api/groups",        { method: "POST",   body: JSON.stringify(data) }); }
  async updateGroup(id, data)   { return this.request(`/api/groups/${id}`,  { method: "PUT",    body: JSON.stringify(data) }); }
  async deleteGroup(id)         { return this.request(`/api/groups/${id}`,  { method: "DELETE" }); }
  async getMyGroup()            { return this.request("/api/groups/me/group",   { skipCache: true }); }
  async getMyGroups()           { return this.request("/api/groups/me/groups",  { skipCache: true }); }
  async addStudentToGroup(groupId, studentId) {
    return this.request(`/api/groups/${groupId}/students`, {
      method: "POST", body: JSON.stringify({ studentId }),
    });
  }
  async removeStudentFromGroup(groupId, studentId) {
    return this.request(`/api/groups/${groupId}/students/${studentId}`, { method: "DELETE" });
  }
  async getGroupStudents(groupId) {
    return this.request(`/api/students?groupId=${groupId}`, { skipCache: true });
  }

  // ── Attendance ────────────────────────────────────────────
  async getAttendances()                   { return this.request("/api/attendance"); }
  async getGroupAttendanceRecords(groupId) { return this.request(`/api/attendance/group/${groupId}`,     { skipCache: true }); }
  async getStudentAttendance(studentId)    { return this.request(`/api/attendance/student/${studentId}`, { skipCache: true }); }
 // TO'G'RI VARIANT:
async getMyAttendance() {
  return this.request("/api/attendance/me/attendance", { skipCache: true });
}

async getMyAttendanceCount() {
  try {
    const res = await this.getMyAttendance();
    // Hujjatga ko'ra massiv qaytishi kerak
    const records = Array.isArray(res) ? res : (res?.data || []);
    return records.filter(r => r.status === "present").length;
  } catch (err) {
    console.error("Davomatni hisoblashda xato:", err);
    return 0;
  }
}
  async createAttendance(data) {
    return this.request("/api/attendance", { method: "POST", body: JSON.stringify(data), skipCache: true });
  }
  async updateAttendance(id, data) {
    return this.request(`/api/attendance/${id}`, { method: "PUT", body: JSON.stringify(data), skipCache: true });
  }
  async deleteAttendance(id) {
    return this.request(`/api/attendance/${id}`, { method: "DELETE" });
  }
  async createBulkAttendance(data) {
    return this.request("/api/attendance/bulk", { method: "POST", body: JSON.stringify(data), skipCache: true });
  }
  async updateBulkAttendance(data) {
    return this.request("/api/attendance/bulk", { method: "PUT", body: JSON.stringify(data), skipCache: true });
  }

  // ── Homework ──────────────────────────────────────────────
  async getHomeworks()             { return this.request("/api/homework"); }
  async getHomework(id)            { return this.request(`/api/homework/${id}`, { skipCache: true }); }
  async createHomework(data)       { return this.request("/api/homework",        { method: "POST",   body: JSON.stringify(data) }); }
  async updateHomework(id, data)   { return this.request(`/api/homework/${id}`,  { method: "PUT",    body: JSON.stringify(data) }); }
  async deleteHomework(id)         { return this.request(`/api/homework/${id}`,  { method: "DELETE" }); }
  async submitHomework(id, data)   { return this.request(`/api/homework/${id}/submit`, { method: "POST", body: JSON.stringify(data) }); }
  async gradeHomework(id, data)    { return this.request(`/api/homework/${id}/grade`,  { method: "POST", body: JSON.stringify(data) }); }
  async getHomeworkSubmissions(id) { return this.request(`/api/homework/${id}/submissions`, { skipCache: true }); }
  async getMySubmissions()         { return this.request("/api/homework/me/submissions", { skipCache: true }); }

  // ── Articles ──────────────────────────────────────────────
  async getArticles(params = "")  { return this.request(`/api/admin/articles${params}`); }
  async getArticle(id)            { return this.request(`/api/admin/articles/${id}`, { skipCache: true }); }
  async createArticle(data)       { return this.request("/api/admin/articles",       { method: "POST",   body: JSON.stringify(data) }); }
  async updateArticle(id, data)   { return this.request(`/api/admin/articles/${id}`, { method: "PUT",    body: JSON.stringify(data) }); }
  async deleteArticle(id)         { return this.request(`/api/admin/articles/${id}`, { method: "DELETE" }); }

  // ── Reports ───────────────────────────────────────────────
  async getDashboard()        { return this.request("/api/reports/dashboard"); }
  async getStudentReport(id)  { return this.request(`/api/reports/student/${id}`,  { skipCache: true }); }
  async getTeacherReport(id)  { return this.request(`/api/reports/teacher/${id}`,  { skipCache: true }); }
  async getGroupReport(id)    { return this.request(`/api/reports/group/${id}`,    { skipCache: true }); }
  async getCourseReport(id)   { return this.request(`/api/reports/course/${id}`,   { skipCache: true }); }
  async getAttendanceReport() { return this.request("/api/reports/attendance",     { skipCache: true }); }
  async getPaymentsReport()   { return this.request("/api/reports/payments",       { skipCache: true }); }
  // ✅ YANGI: Leaderboard — backend endpoint yo'q bo'lsa xato chiqarmaydi
  async getLeaderboard()      { return this.request("/api/reports/leaderboard",    { skipCache: true }); }

  // ── Payments ──────────────────────────────────────────────
  async getPayments()            { return this.request("/api/payments"); }
  async createPayment(data)      { return this.request("/api/payments",        { method: "POST",   body: JSON.stringify(data) }); }
  async updatePayment(id, data)  { return this.request(`/api/payments/${id}`,  { method: "PUT",    body: JSON.stringify(data) }); }
  async deletePayment(id)        { return this.request(`/api/payments/${id}`,  { method: "DELETE" }); }
  async getStudentPayments(id)   { return this.request(`/api/payments/student/${id}`, { skipCache: true }); }
  async getMyPayments()          { return this.request("/api/payments/me/payments",   { skipCache: true }); }
  async getPaymentReport(month)  { return this.request(`/api/payments/report/${month}`, { skipCache: true }); }

  // ── Notifications ─────────────────────────────────────────
  async getNotifications()         { return this.request("/api/notifications", { skipCache: true }); }
  async markNotificationAsRead(id) { return this.request(`/api/notifications/${id}/read`, { method: "POST" }); }

  // ── Dashboard helper ──────────────────────────────────────
  async fetchDashboardData() {
    return Promise.all([
      this.getStudents(), this.getTeachers(), this.getGroups(), this.getCourses(),
    ]);
  }
}

export const apiService = new ApiService();