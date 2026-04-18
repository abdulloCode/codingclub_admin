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

  // ── Cache helpers ─────────────────────────────────────────
  getCacheKey(endpoint, options = {}) {
    const method = options.method || "GET";
    const body = options.body ? JSON.stringify(options.body) : "";
    return `${method}:${endpoint}:${body}`;
  }
  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
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

  // ── Token helpers ─────────────────────────────────────────
  getToken()      { return localStorage.getItem("accessToken"); }
  setToken(token) { if (token) localStorage.setItem("accessToken", token); }
  clearToken() {
    localStorage.removeItem("accessToken");
    document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    this.clearCache();
  }

  // ── Core request ──────────────────────────────────────────
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
      console.log(`${method}: ${endpoint}`);
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
            if      (response.status === 400) msg = errorData.message || errorData.error || "Ma'lumotlar noto'g'ri kiritilgan.";
            else if (response.status === 401) msg = "Parol yoki telefon raqam noto'g'ri. Iltimos, qayta urinib ko'ring.";
            else if (response.status === 403) msg = "Bu amalni bajarish uchun ruxsat yo'q.";
            else if (response.status === 404) msg = "Ma'lumot topilmadi.";
            else if (response.status === 409) msg = errorData.error || "Bu ma'lumot allaqachon mavjud.";
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
    if (endpoint.includes("/api/auth/refresh")) {
      this.clearToken();
      throw new Error("Sessiya tugadi, iltimos qayta kiring.");
    }
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshPromise = this.refresh().finally(() => {
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
      throw new Error("No access token received");
    } catch {
      this.clearToken();
      throw new Error("iltimos qayta kiring.");
    }
  }

  async login(data) {
    const res = await this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res?.accessToken) this.setToken(res.accessToken);
    return res;
  }

  async studentLogin(data) {
    const res = await this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ ...data, role: "student" }),
      headers: { "X-User-Role": "student" },
    });
    if (res?.accessToken) this.setToken(res.accessToken);
    return res;
  }

  async teacherLogin(data) {
    const res = await this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ ...data, role: "teacher" }),
      headers: { "X-User-Role": "teacher" },
    });
    if (res?.accessToken) this.setToken(res.accessToken);
    return res;
  }

  async register(data) {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async getProfile() {
    return this.request("/api/auth/me", { skipCache: true });
  }
  async updateProfile(data) {
    return this.request("/api/auth/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  async refresh() {
    return this.request("/api/auth/refresh", { method: "POST" });
  }
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
  async getStudents(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url   = query ? `/api/students?${query}` : "/api/students";
    return this.request(url);
  }
  async getStudentsPaginated(page = 1, limit = 20, filters = {}) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit), ...filters });
    return this.request(`/api/students?${params}`, { skipCache: true });
  }
  async getStudent(id) {
    return this.request(`/api/students/${id}`, { skipCache: true });
  }
  async createStudent(data) {
    return this.request("/api/students", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async updateStudent(id, data) {
    return this.request(`/api/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  async deleteStudent(id) {
    return this.request(`/api/students/${id}`, { method: "DELETE" });
  }
  async assignGroupToStudent(studentId, groupId) {
    return this.request(`/api/students/${studentId}/assign-group`, {
      method: "POST",
      body: JSON.stringify({ groupId }),
    });
  }
  async getStudentAttendance(studentId) {
    return this.request(`/api/students/${studentId}/attendance`, { skipCache: true });
  }
  async getMyAttendance() {
    return this.request("/api/attendance/me/attendance", { skipCache: true });
  }
  async getMyAttendanceCount() {
    try {
      const res     = await this.getMyAttendance();
      const records = Array.isArray(res) ? res : [];
      return records.filter(r => r.status === "present").length;
    } catch (err) {
      console.error("Davomatni hisoblashda xato:", err);
      return 0;
    }
  }
  async getMyPayments() {
    return this.request("/api/payments/me/payments", { skipCache: true });
  }
  async getMyGroup() {
    return this.request("/api/groups/me", { skipCache: true });
  }
  async getMyHomeworks() {
    try {
      const group = await this.getMyGroup();
      if (!group?.id) return [];
      const all = await this.request("/api/homework", { skipCache: true });
      let list = [];
      if (Array.isArray(all))                 list = all;
      else if (Array.isArray(all?.homeworks)) list = all.homeworks;
      else if (Array.isArray(all?.data))      list = all.data;
      else { console.warn("Unexpected homework response:", all); return []; }
      return list.filter(h => h.groupId === group.id);
    } catch (err) {
      console.error("getMyHomeworks error:", err);
      return [];
    }
  }
  async submitHomework(id, data) {
    return this.request(`/api/homework/${id}/submissions`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ── Teachers ──────────────────────────────────────────────
  async getTeachers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url   = query ? `/api/teachers?${query}` : "/api/teachers";
    return this.request(url);
  }
  async getTeacher(id) {
    return this.request(`/api/teachers/${id}`, { skipCache: true });
  }
  async createTeacher(data) {
    return this.request("/api/teachers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async updateTeacher(id, data) {
    return this.request(`/api/teachers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  async deleteTeacher(id) {
    return this.request(`/api/teachers/${id}`, { method: "DELETE" });
  }
  async getMyTeacherData() {
    return this.request("/api/teachers/me", { skipCache: true });
  }
  async getMyTeacherGroups() {
    return this.request("/api/teachers/me/groups", { skipCache: true });
  }
  async getTeacherGroups(teacherId) {
    return this.request(`/api/teachers/${teacherId}/groups`, { skipCache: true });
  }

  // ── Courses ───────────────────────────────────────────────
  async getCourses(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url   = query ? `/api/courses?${query}` : "/api/courses";
    return this.request(url);
  }
  async getCourse(id) {
    return this.request(`/api/courses/${id}`, { skipCache: true });
  }
  async createCourse(data) {
    return this.request("/api/courses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async updateCourse(id, data) {
    return this.request(`/api/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  async deleteCourse(id) {
    return this.request(`/api/courses/${id}`, { method: "DELETE" });
  }

  // ── Groups ────────────────────────────────────────────────
  async getGroups(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url   = query ? `/api/groups?${query}` : "/api/groups";
    return this.request(url);
  }
  async getGroup(id, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url   = query ? `/api/groups/${id}?${query}` : `/api/groups/${id}`;
    return this.request(url, { skipCache: true });
  }
  async createGroup(data) {
    return this.request("/api/groups", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async updateGroup(id, data) {
    return this.request(`/api/groups/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  async deleteGroup(id) {
    return this.request(`/api/groups/${id}`, { method: "DELETE" });
  }
  async addStudentToGroup(groupId, studentId) {
    return this.request(`/api/groups/${groupId}/students`, {
      method: "POST",
      body: JSON.stringify({ studentId }),
    });
  }
  async removeStudentFromGroup(groupId, studentId) {
    return this.request(`/api/groups/${groupId}/students/${studentId}`, {
      method: "DELETE",
    });
  }
  async getMyGroups() {
    return this.request("/api/groups/me", { skipCache: true });
  }

  // ── Homework ──────────────────────────────────────────────
  async getHomeworks(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url   = query ? `/api/homework?${query}` : "/api/homework";
    return this.request(url);
  }
  async getHomework(id) {
    return this.request(`/api/homework/${id}`, { skipCache: true });
  }
  async createHomework(data) {
    return this.request("/api/homework", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async updateHomework(id, data) {
    return this.request(`/api/homework/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  async deleteHomework(id) {
    return this.request(`/api/homework/${id}`, { method: "DELETE" });
  }
  async submitHomeworkById(id, data) {
    return this.request(`/api/homework/${id}/submissions`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async getHomeworkSubmissions(id) {
    return this.request(`/api/homework/${id}/submissions`, { skipCache: true });
  }
  async gradeSubmission(homeworkId, submissionId, data) {
    return this.request(`/api/homework/${homeworkId}/submissions/${submissionId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // ── Attendance ────────────────────────────────────────────
  async getAttendances(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url   = query ? `/api/attendance?${query}` : "/api/attendance";
    return this.request(url);
  }
  async getAttendance(id) {
    return this.request(`/api/attendance/${id}`, { skipCache: true });
  }
  async createAttendance(data) {
    return this.request("/api/attendance", {
      method: "POST",
      body: JSON.stringify(data),
      skipCache: true,
    });
  }
  async updateAttendance(id, data) {
    return this.request(`/api/attendance/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      skipCache: true,
    });
  }
  async deleteAttendance(id) {
    return this.request(`/api/attendance/${id}`, { method: "DELETE" });
  }

  // ── Payments  /api/payments ───────────────────────────────

  async getPayments(params = {}) {
    const allowedParams = ['page', 'limit', 'startDate', 'endDate', 'typeId', 'dk', 'toWhoId', 'month', 'groupId'];
    const validParams = {};
    for (const [key, value] of Object.entries(params)) {
      if (allowedParams.includes(key) && value !== undefined && value !== null && value !== '') {
        validParams[key] = value;
      }
    }
    const query = new URLSearchParams(validParams).toString();
    const url   = query ? `/api/payments?${query}` : "/api/payments";
    return this.request(url);
  }

  async getPayment(id) {
    if (!id || typeof id !== 'string' || !this.isValidUUID(id)) {
      throw new Error("Noto'g'ri to'lov ID");
    }
    return this.request(`/api/payments/${id}`, { skipCache: true });
  }

  /**
   * FIX 1: amount endi number sifatida qabul qilinadi (string ham ishlaydi — ichida parse qilinadi)
   * FIX 2: typeId endi validatedData ga kiritildi
   * FIX 3: isValidInput haddan oshiq qattiq edi — oddiy text validation bilan almashtirildi
   */
  async createPayment(data) {
    const validatedData = this.validatePaymentData(data);
    return this.request("/api/payments", {
      method: "POST",
      body: JSON.stringify(validatedData),
      skipCache: true,
    });
  }

  async updatePayment(id, data) {
    if (!id || typeof id !== 'string' || !this.isValidUUID(id)) {
      throw new Error("Noto'g'ri to'lov ID");
    }
    const validatedData = this.validatePaymentData(data);
    return this.request(`/api/payments/${id}`, {
      method: "PUT",
      body: JSON.stringify(validatedData),
      skipCache: true,
    });
  }

  async deletePayment(id) {
    if (!id || typeof id !== 'string' || !this.isValidUUID(id)) {
      throw new Error("Noto'g'ri to'lov ID");
    }
    return this.request(`/api/payments/${id}`, { method: "DELETE" });
  }

  async getUserPayments(userId, dk = "") {
    if (!userId || typeof userId !== 'string' || !this.isValidUUID(userId)) {
      throw new Error("Noto'g'ri foydalanuvchi ID");
    }
    if (dk && !['credit', 'debit'].includes(dk)) {
      throw new Error("Noto'g'ri dk parametri");
    }
    const query = dk ? `?dk=${dk}` : "";
    return this.request(`/api/payments/user/${userId}${query}`, { skipCache: true });
  }

  async getPaymentReport(month) {
    if (!month || !this.isValidMonthFormat(month)) {
      throw new Error("Noto'g'ri oy formati. YYYY-MM ko'rinishida bo'lishi kerak");
    }
    return this.request(`/api/payments/report/${month}`, { skipCache: true });
  }

  async approvePayment(id) {
    if (!id || typeof id !== 'string' || !this.isValidUUID(id)) {
      throw new Error("Noto'g'ri to'lov ID");
    }
    return this.request(`/api/payments/${id}/approve`, {
      method: "POST",
      skipCache: true,
    });
  }

  async rejectPayment(id, reason) {
    if (!id || typeof id !== 'string' || !this.isValidUUID(id)) {
      throw new Error("Noto'g'ri to'lov ID");
    }
    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      throw new Error("Rad etish sababi kiritilishi shart");
    }
    // FIX: sanitizeInput endi faqat haqiqatan xavfli belgilarni olib tashlaydi
    const sanitizedReason = this.sanitizeInput(reason);
    return this.request(`/api/payments/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason: sanitizedReason }),
      skipCache: true,
    });
  }

  // ── Payment Types ─────────────────────────────────────────
  async getPaymentTypes(activeOnly = false) {
    const query = activeOnly ? "?activeOnly=true" : "";
    return this.request(`/api/payment-types${query}`);
  }

  async getPaymentType(id) {
    if (!id || typeof id !== 'string' || !this.isValidUUID(id)) {
      throw new Error("Noto'g'ri to'lov turi ID");
    }
    return this.request(`/api/payment-types/${id}`, { skipCache: true });
  }

  async createPaymentType(data) {
    if (!data || typeof data !== 'object') {
      throw new Error("Noto'g'ri ma'lumotlar");
    }
    const validatedData = this.validatePaymentTypeData(data);
    return this.request("/api/payment-types", {
      method: "POST",
      body: JSON.stringify(validatedData),
      skipCache: true,
    });
  }

  async updatePaymentType(id, data) {
    if (!id || typeof id !== 'string' || !this.isValidUUID(id)) {
      throw new Error("Noto'g'ri to'lov turi ID");
    }
    if (!data || typeof data !== 'object') {
      throw new Error("Noto'g'ri ma'lumotlar");
    }
    const validatedData = this.validatePaymentTypeData(data);
    return this.request(`/api/payment-types/${id}`, {
      method: "PUT",
      body: JSON.stringify(validatedData),
      skipCache: true,
    });
  }

  async deletePaymentType(id) {
    if (!id || typeof id !== 'string' || !this.isValidUUID(id)) {
      throw new Error("Noto'g'ri to'lov turi ID");
    }
    return this.request(`/api/payment-types/${id}`, { method: "DELETE" });
  }

  async initializePaymentTypes() {
    return this.request("/api/payment-types/initialize", {
      method: "POST",
      skipCache: true,
    });
  }

  // ── Payment Calculations ──────────────────────────────────
  async getStudentDailyPayment(studentId, date) {
    if (!studentId || typeof studentId !== 'string' || !this.isValidUUID(studentId)) {
      throw new Error("Noto'g'ri o'quvchi ID");
    }
    if (!date || !this.isValidDateFormat(date)) {
      throw new Error("Noto'g'ri sana formati. YYYY-MM-DD ko'rinishida bo'lishi kerak");
    }
    return this.request(`/api/payment-calculations/student/${studentId}/daily/${date}`, { skipCache: true });
  }

  async getTeacherDailySalary(teacherId, date) {
    if (!teacherId || typeof teacherId !== 'string' || !this.isValidUUID(teacherId)) {
      throw new Error("Noto'g'ri o'qituvchi ID");
    }
    if (!date || !this.isValidDateFormat(date)) {
      throw new Error("Noto'g'ri sana formati. YYYY-MM-DD ko'rinishida bo'lishi kerak");
    }
    return this.request(`/api/payment-calculations/teacher/${teacherId}/daily/${date}`, { skipCache: true });
  }

  async getStudentMonthlySummary(studentId, month) {
    if (!studentId || typeof studentId !== 'string' || !this.isValidUUID(studentId)) {
      throw new Error("Noto'g'ri o'quvchi ID");
    }
    if (!month || !this.isValidMonthFormat(month)) {
      throw new Error("Noto'g'ri oy formati. YYYY-MM ko'rinishida bo'lishi kerak");
    }
    return this.request(`/api/payment-calculations/student/${studentId}/monthly/${month}`, { skipCache: true });
  }

  async getTeacherMonthlySummary(teacherId, month) {
    if (!teacherId || typeof teacherId !== 'string' || !this.isValidUUID(teacherId)) {
      throw new Error("Noto'g'ri o'qituvchi ID");
    }
    if (!month || !this.isValidMonthFormat(month)) {
      throw new Error("Noto'g'ri oy formati. YYYY-MM ko'rinishida bo'lishi kerak");
    }
    return this.request(`/api/payment-calculations/teacher/${teacherId}/monthly/${month}`, { skipCache: true });
  }

  async getAllStudentsDailyPayments(date) {
    if (!date || !this.isValidDateFormat(date)) {
      throw new Error("Noto'g'ri sana formati. YYYY-MM-DD ko'rinishida bo'lishi kerak");
    }
    return this.request(`/api/payment-calculations/students/daily/${date}`, { skipCache: true });
  }

  async getAllTeachersDailySalaries(date) {
    if (!date || !this.isValidDateFormat(date)) {
      throw new Error("Noto'g'ri sana formati. YYYY-MM-DD ko'rinishida bo'lishi kerak");
    }
    return this.request(`/api/payment-calculations/teachers/daily/${date}`, { skipCache: true });
  }

  async getDailyFinancialSummary(date) {
    if (!date || !this.isValidDateFormat(date)) {
      throw new Error("Noto'g'ri sana formati. YYYY-MM-DD ko'rinishida bo'lishi kerak");
    }
    return this.request(`/api/payment-calculations/summary/daily/${date}`, { skipCache: true });
  }

  // ── Payment Reports ───────────────────────────────────────
  async getPaymentReports(params = {}) {
    const allowedParams = ['startDate', 'endDate', 'type', 'userId', 'groupId', 'page', 'limit'];
    const validParams = {};
    for (const [key, value] of Object.entries(params)) {
      if (allowedParams.includes(key) && value !== undefined && value !== '') {
        validParams[key] = value;
      }
    }
    const query = new URLSearchParams(validParams).toString();
    const url   = query ? `/api/payment-reports?${query}` : "/api/payment-reports";
    return this.request(url, { skipCache: true });
  }

  async getDailyReport(date) {
    if (!date || !this.isValidDateFormat(date)) {
      throw new Error("Noto'g'ri sana formati. YYYY-MM-DD ko'rinishida bo'lishi kerak");
    }
    return this.request(`/api/payment-reports/daily/${date}`, { skipCache: true });
  }

  async getMonthlyReport(month) {
    if (!month || !this.isValidMonthFormat(month)) {
      throw new Error("Noto'g'ri oy formati. YYYY-MM ko'rinishida bo'lishi kerak");
    }
    return this.request(`/api/payment-reports/monthly/${month}`, { skipCache: true });
  }

  async getUserPaymentReport(userId, params = {}) {
    if (!userId || typeof userId !== 'string' || !this.isValidUUID(userId)) {
      throw new Error("Noto'g'ri foydalanuvchi ID");
    }
    const allowedParams = ['startDate', 'endDate'];
    const validParams = {};
    for (const [key, value] of Object.entries(params)) {
      if (allowedParams.includes(key) && value !== undefined && value !== '') {
        validParams[key] = value;
      }
    }
    const query = new URLSearchParams(validParams).toString();
    const url   = query
      ? `/api/payment-reports/user/${userId}?${query}`
      : `/api/payment-reports/user/${userId}`;
    return this.request(url, { skipCache: true });
  }

  // ── Teacher Payment Management ────────────────────────────
  async getTeacherCommission(teacherId) {
    if (!teacherId || typeof teacherId !== 'string' || !this.isValidUUID(teacherId)) {
      throw new Error("Noto'g'ri o'qituvchi ID");
    }
    return this.request(`/api/teachers/${teacherId}/commission`, { skipCache: true });
  }

  async updateTeacherCommission(teacherId, commissionPercentage) {
    if (!teacherId || typeof teacherId !== 'string' || !this.isValidUUID(teacherId)) {
      throw new Error("Noto'g'ri o'qituvchi ID");
    }
    if (typeof commissionPercentage !== 'number' || commissionPercentage < 0 || commissionPercentage > 100) {
      throw new Error("Komissiya foizi 0 dan 100 gacha bo'lishi kerak");
    }
    return this.request(`/api/teachers/${teacherId}/commission`, {
      method: "PUT",
      body: JSON.stringify({ commissionPercentage }),
      skipCache: true,
    });
  }

  async getTeacherEarnings(teacherId, params = {}) {
    if (!teacherId || typeof teacherId !== 'string' || !this.isValidUUID(teacherId)) {
      throw new Error("Noto'g'ri o'qituvchi ID");
    }
    const allowedParams = ['startDate', 'endDate', 'month'];
    const validParams = {};
    for (const [key, value] of Object.entries(params)) {
      if (allowedParams.includes(key) && value !== undefined && value !== '') {
        validParams[key] = value;
      }
    }
    const query = new URLSearchParams(validParams).toString();
    const url   = query
      ? `/api/teachers/${teacherId}/earnings?${query}`
      : `/api/teachers/${teacherId}/earnings`;
    return this.request(url, { skipCache: true });
  }

  async createGroupPayment(data) {
    const validatedData = this.validateGroupPaymentData(data);
    return this.request("/api/payments/group-payment", {
      method: "POST",
      body: JSON.stringify(validatedData),
      skipCache: true,
    });
  }

  // ── Student Payment Management ────────────────────────────
  async createStudentLessonPayment(data) {
    const validatedData = this.validateStudentPaymentData(data);
    return this.request("/api/payments/student-lesson", {
      method: "POST",
      body: JSON.stringify(validatedData),
      skipCache: true,
    });
  }

  async getStudentPaymentHistory(studentId, params = {}) {
    if (!studentId || typeof studentId !== 'string' || !this.isValidUUID(studentId)) {
      throw new Error("Noto'g'ri o'quvchi ID");
    }
    const allowedParams = ['startDate', 'endDate', 'limit', 'page'];
    const validParams = {};
    for (const [key, value] of Object.entries(params)) {
      if (allowedParams.includes(key) && value !== undefined && value !== '') {
        validParams[key] = value;
      }
    }
    const query = new URLSearchParams(validParams).toString();
    const url   = query
      ? `/api/payments/student/${studentId}/history?${query}`
      : `/api/payments/student/${studentId}/history`;
    return this.request(url, { skipCache: true });
  }

  async getStudentPaymentMonthlyReport(studentId, month) {
    if (!studentId || typeof studentId !== 'string' || !this.isValidUUID(studentId)) {
      throw new Error("Noto'g'ri o'quvchi ID");
    }
    if (!month || !this.isValidMonthFormat(month)) {
      throw new Error("Noto'g'ri oy formati. YYYY-MM ko'rinishida bo'lishi kerak");
    }
    return this.request(`/api/payments/student/${studentId}/monthly/${month}`, { skipCache: true });
  }

  // ── Staff ─────────────────────────────────────────────────
  async getStaff(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url   = query ? `/api/staff?${query}` : "/api/staff";
    return this.request(url);
  }
  async getStaffMember(id) {
    return this.request(`/api/staff/${id}`, { skipCache: true });
  }
  async createStaffMember(data) {
    return this.request("/api/staff", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async updateStaffMember(id, data) {
    return this.request(`/api/staff/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  async deleteStaffMember(id) {
    return this.request(`/api/staff/${id}`, { method: "DELETE" });
  }
  async setStaffSalary(id, data) {
    return this.request(`/api/staff/${id}/salary`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async getStaffSalary(id, month = "") {
    const query = month ? `?month=${month}` : "";
    return this.request(`/api/staff/${id}/salary${query}`, { skipCache: true });
  }
  async getStaffSalaryHistory(id) {
    return this.request(`/api/staff/${id}/salary-history`, { skipCache: true });
  }
  async getAllStaffDailySalaries(date) {
    return this.request(`/api/staff/daily-salaries/${date}`, { skipCache: true });
  }

  // ── Misc ──────────────────────────────────────────────────
  async getStats() {
    return this.request("/api/stats", { skipCache: true });
  }
  async getSettings() {
    return this.request("/api/setting");
  }
  async updateSettings(data) {
    return this.request("/api/setting", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  async getRatings() {
    return this.request("/api/ratings");
  }
  async getRating(id) {
    return this.request(`/api/ratings/${id}`, { skipCache: true });
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
  async getRooms(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url   = query ? `/api/rooms?${query}` : "/api/rooms";
    return this.request(url);
  }
  async getRoom(id) {
    return this.request(`/api/rooms/${id}`, { skipCache: true });
  }
  async createRoom(data) {
    return this.request("/api/rooms", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async updateRoom(id, data) {
    return this.request(`/api/rooms/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  async deleteRoom(id) {
    return this.request(`/api/rooms/${id}`, { method: "DELETE" });
  }

  // ── Room Availability ─────────────────────────────────────
  async getFreeRooms(days, times) {
    const params = new URLSearchParams();
    if (Array.isArray(days) && days.length > 0) {
      params.append('days', days.join(','));
    }
    if (Array.isArray(times) && times.length > 0) {
      params.append('times', times.join(','));
    }
    const url = `/api/rooms/free${params.toString() ? '?' + params.toString() : ''}`;
    return this.request(url, { skipCache: true });
  }

  // ── Notifications ──────────────────────────────────────────
  async getNotifications(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/api/notifications?${query}` : "/api/notifications";
    return this.request(url, { skipCache: true });
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/api/notifications/${notificationId}/read`, {
      method: "PUT",
    });
  }

  async markAllNotificationsAsRead() {
    return this.request("/api/notifications/read-all", {
      method: "PUT",
    });
  }

  async deleteNotification(notificationId) {
    return this.request(`/api/notifications/${notificationId}`, {
      method: "DELETE",
    });
  }
  async getArticles(params = "") {
    return this.request(`/api/admin/articles${params}`);
  }
  async getArticle(id) {
    return this.request(`/api/admin/articles/${id}`, { skipCache: true });
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
  async fetchDashboardData() {
    return Promise.all([
      this.getStudents(),
      this.getTeachers(),
      this.getGroups(),
      this.getCourses(),
    ]);
  }

  // ── Security Validation Helpers ───────────────────────────

  isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  isValidDateFormat(date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime()) && dateObj.toISOString().split('T')[0] === date;
  }

  isValidMonthFormat(month) {
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) return false;
    const [year, monthNum] = month.split('-').map(Number);
    return year >= 2000 && year <= 2100 && monthNum >= 1 && monthNum <= 12;
  }

  /**
   * FIX: isValidInput — faqat haqiqatan xavfli belgilarni tekshiradi.
   * Avvalgi versiyada '@', '/', '!', '#' ham bloklangan edi,
   * bu oddiy matn, email, URL kabi qiymatlarda xatolikka olib kelardi.
   */
  isValidInput(input) {
    if (typeof input !== 'string') return false;

    // Faqat skript injection uchun ishlatiluvchi belgilar
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,    // onclick=, onload= etc
      /--/,            // SQL comment
      /\/\*/,          // SQL block comment
    ];

    const hasDangerousPattern = dangerousPatterns.some(p => p.test(input));
    const isValidLength = input.length <= 1000;

    return !hasDangerousPattern && isValidLength;
  }

  /**
   * FIX: sanitizeInput — faqat XSS uchun xavfli HTML teglarini olib tashlaydi.
   * Avval '@', '/', '!', '#', '$' va boshqa oddiy belgilar ham olinardi — BUG edi.
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .trim();
  }

  /**
   * FIX 1: amount — string yoki number bo'lishi mumkin, ikkalasini ham qabul qiladi
   * FIX 2: typeId — endi validatedData ga kiritildi (avval saqlanmaydi edi)
   * FIX 3: isValidInput haddan oshiq qattiq edi — yangi versiyasi ishlatilmoqda
   */
  validatePaymentData(data) {
    if (!data || typeof data !== 'object') {
      throw new Error("Noto'g'ri to'lov ma'lumotlari");
    }

    if (!data.type) throw new Error("type maydoni majburiy");
    if (data.amount === undefined || data.amount === null || data.amount === '') {
      throw new Error("amount maydoni majburiy");
    }

    // Type validation
    const validTypes = ['credit', 'debit', 'refund'];
    if (!validTypes.includes(data.type)) {
      throw new Error("Noto'g'ri to'lov turi. credit, debit, yoki refund bo'lishi kerak");
    }

    // FIX: amount string bo'lsa ham ishlaydigan qilamiz
    const amount = typeof data.amount === 'string'
      ? parseFloat(data.amount)
      : data.amount;

    if (isNaN(amount) || amount <= 0 || amount > 100_000_000) {
      throw new Error("Noto'g'ri summa. 0 dan 100 million gacha bo'lishi kerak");
    }

    // Date validation
    if (data.date && !this.isValidDateFormat(data.date)) {
      throw new Error("Noto'g'ri sana formati. YYYY-MM-DD ko'rinishida bo'lishi kerak");
    }

    if (data.toWho && !this.isValidUUID(data.toWho)) {
      throw new Error("Noto'g'ri foydalanuvchi ID");
    }
    if (data.groupId && !this.isValidUUID(data.groupId)) {
      throw new Error("Noto'g'ri guruh ID");
    }

    // FIX: typeId validation — ixtiyoriy, lekin berilgan bo'lsa UUID bo'lishi shart
    if (data.typeId && !this.isValidUUID(data.typeId)) {
      throw new Error("Noto'g'ri to'lov turi ID");
    }

    let sanitizedDescription = '';
    if (data.description) {
      if (typeof data.description !== 'string' || data.description.length > 500) {
        throw new Error("Tavsif 500 ta harfdan oshmasligi kerak");
      }
      sanitizedDescription = this.sanitizeInput(data.description);
    }

    return {
      type:        data.type,
      amount:      Math.round(amount * 100) / 100,
      date:        data.date || new Date().toISOString().split('T')[0],
      toWho:       data.toWho       || null,
      groupId:     data.groupId     || null,
      typeId:      data.typeId      || null,   // FIX: typeId endi saqlanadi
      description: sanitizedDescription,
      lessonDate:  data.lessonDate  || data.date || new Date().toISOString().split('T')[0],
    };
  }
// apiService.js - Room related methods (TO'LIQ TUZATILGAN VERSIYA)

// ── Rooms ──────────────────────────────────────────────────
async getRooms(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = query ? `/api/rooms?${query}` : "/api/rooms";
  const response = await this.request(url);
  
  // Normalize response: { rooms: [...] } yoki to'g'ridan-to'g'ri array
  if (response?.rooms && Array.isArray(response.rooms)) {
    return response.rooms;
  }
  if (Array.isArray(response)) {
    return response;
  }
  return [];
}

async getRoom(id) {
  if (!id) throw new Error("Room ID required");
  return this.request(`/api/rooms/${id}`, { skipCache: true });
}

async createRoom(data) {
  if (!data.name || !data.number) {
    throw new Error("Room name and number are required");
  }
  return this.request("/api/rooms", {
    method: "POST",
    body: JSON.stringify({
      name: data.name.trim(),
      number: data.number.trim(),
      capacity: parseInt(data.capacity) || 20,
      equipment: data.equipment || [],
    }),
  });
}

async updateRoom(id, data) {
  if (!id) throw new Error("Room ID required");
  return this.request(`/api/rooms/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      name: data.name?.trim(),
      number: data.number?.trim(),
      capacity: data.capacity ? parseInt(data.capacity) : undefined,
      equipment: data.equipment,
    }),
  });
}

async deleteRoom(id) {
  if (!id) throw new Error("Room ID required");
  return this.request(`/api/rooms/${id}`, { method: "DELETE" });
}

// Bo'sh xonalarni olish (backend: GET /api/rooms/free?days=...&time=...)
async getFreeRooms(days, times) {
  console.log('🔍 getFreeRooms called:', { days, times });
  
  const params = new URLSearchParams();
  if (Array.isArray(days) && days.length > 0) {
    params.append('days', days.join(','));
  }
  if (Array.isArray(times) && times.length > 0) {
    // Backend 'time' parametrini kutadi (singular)
    params.append('time', times.join(','));
  }
  
  const url = `/api/rooms/free${params.toString() ? '?' + params.toString() : ''}`;
  console.log('📡 Fetching URL:', url);
  
  try {
    const result = await this.request(url, { skipCache: true });
    console.log('✅ getFreeRooms response:', result);
    
    // Normalize response - backend { availableRooms: [...] } qaytaradi
    if (result?.availableRooms && Array.isArray(result.availableRooms)) {
      return result.availableRooms;
    }
    if (Array.isArray(result)) {
      return result;
    }
    return [];
  } catch (err) {
    console.error('❌ getFreeRooms error:', err);
    throw err;
  }
}

// Xonani groupga biriktirish
async assignRoomToGroup(groupId, roomId) {
  if (!groupId) throw new Error("Group ID required");
  return this.request(`/api/groups/${groupId}`, {
    method: "PUT",
    body: JSON.stringify({ roomId: roomId || null }),
  });
}
  validatePaymentTypeData(data) {
    if (!data || typeof data !== 'object') {
      throw new Error("Noto'g'ri to'lov turi ma'lumotlari");
    }

    const required = ['name', 'code', 'dk'];
    for (const field of required) {
      if (!data[field]) throw new Error(`${field} maydoni majburiy`);
    }

    if (typeof data.name !== 'string' || data.name.length < 2 || data.name.length > 100) {
      throw new Error("Nomi 2 dan 100 ta harf orasida bo'lishi kerak");
    }
    if (typeof data.code !== 'string' || data.code.length < 2 || data.code.length > 50) {
      throw new Error("Kod 2 dan 50 ta harf orasida bo'lishi kerak");
    }

    const validDK = ['credit', 'debit'];
    if (!validDK.includes(data.dk)) {
      throw new Error("DK credit yoki debit bo'lishi kerak");
    }

    let sanitizedDescription = '';
    if (data.description) {
      if (typeof data.description !== 'string' || data.description.length > 500) {
        throw new Error("Tavsif 500 ta harfdan oshmasligi kerak");
      }
      sanitizedDescription = this.sanitizeInput(data.description);
    }

    return {
      name:        this.sanitizeInput(data.name),
      code:        this.sanitizeInput(data.code),
      dk:          data.dk,
      description: sanitizedDescription,
    };
  }

  validateGroupPaymentData(data) {
    if (!data || typeof data !== 'object') {
      throw new Error("Noto'g'ri guruh to'lov ma'lumotlari");
    }
    const required = ['groupId', 'amount', 'date'];
    for (const field of required) {
      if (!data[field]) throw new Error(`${field} maydoni majburiy`);
    }
    if (!this.isValidUUID(data.groupId)) throw new Error("Noto'g'ri guruh ID");

    const amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
    if (isNaN(amount) || amount <= 0 || amount > 100_000_000) {
      throw new Error("Noto'g'ri summa");
    }
    if (!this.isValidDateFormat(data.date)) throw new Error("Noto'g'ri sana formati");

    let sanitizedDescription = '';
    if (data.description) {
      if (typeof data.description !== 'string' || data.description.length > 500) {
        throw new Error("Tavsif 500 ta harfdan oshmasligi kerak");
      }
      sanitizedDescription = this.sanitizeInput(data.description);
    }

    return {
      groupId:     data.groupId,
      amount:      Math.round(amount * 100) / 100,
      date:        data.date,
      description: sanitizedDescription || "Guruh to'lovi",
      type:        'credit',
    };
  }

  validateStudentPaymentData(data) {
    if (!data || typeof data !== 'object') {
      throw new Error("Noto'g'ri o'quvchi to'lov ma'lumotlari");
    }
    const required = ['studentId', 'groupId', 'amount', 'date'];
    for (const field of required) {
      if (!data[field]) throw new Error(`${field} maydoni majburiy`);
    }
    if (!this.isValidUUID(data.studentId)) throw new Error("Noto'g'ri o'quvchi ID");
    if (!this.isValidUUID(data.groupId))   throw new Error("Noto'g'ri guruh ID");

    const amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
    if (isNaN(amount) || amount <= 0 || amount > 100_000_000) {
      throw new Error("Noto'g'ri summa");
    }
    if (!this.isValidDateFormat(data.date)) throw new Error("Noto'g'ri sana formati");

    return {
      studentId:   data.studentId,
      groupId:     data.groupId,
      amount:      Math.round(amount * 100) / 100,
      date:        data.date,
      type:        'credit',
      description: "Dars to'lovi",
    };
  }
}


export const apiService = new ApiService();