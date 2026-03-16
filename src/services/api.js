const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://blog-mrabdunozir-uz.onrender.com';

class ApiService {
  constructor() {
    this.isRefreshing = false;
    this.refreshPromise = null;
  }

  // ── Token Management ──────────────────────────────────────
  getToken() { return localStorage.getItem('accessToken'); }
  setToken(token) { if (token) localStorage.setItem('accessToken', token); }
  clearToken() {
    localStorage.removeItem('accessToken');
    // Refresh tokenni cookie'dan tozalash (agar server httpOnly ishlatmasa)
    document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }

  // ── Core Request Logic ────────────────────────────────────
  async request(endpoint, options = {}) {
    const token = this.getToken();
    const method = (options.method || 'GET').toUpperCase();
    const headers = new Headers(options.headers || {});

    // Avtomatik Authorization headerini qo'shish
    if (token) headers.set('Authorization', `Bearer ${token}`);

    // Agar body bo'lsa va u FormData bo'lmasa, Content-Type o'rnatamiz
    if (options.body && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    // Tarmoq holatini tekshirish
    if (!navigator.onLine) {
      throw new Error('Internet aloqasi yo\'q. Iltimos, tarmoqni tekshiring.');
    }

    try {
      console.log(`🔵 ${method}: ${endpoint}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 soniya timeout

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        method,
        headers,
        signal: controller.signal,
        credentials: 'include', // Refresh token cookie'lari uchun shart
      });

      clearTimeout(timeoutId);

      // Auth endpointlari ro'yxati
      const isAuthEndpoint = ['/api/auth/login', '/api/auth/refresh', '/api/auth/register']
        .some(p => endpoint.includes(p));

      // 401 xatosi va tokenni yangilash
      if (response.status === 401 && !isAuthEndpoint) {
        return this.handleTokenRefresh(endpoint, options);
      }

      // Xatoliklarni tekshirish
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server xatosi: ${response.status}`);
      }

      if (response.status === 204) return null;
      return await response.json();

    } catch (error) {
      console.error(`💥 API Error (${endpoint}):`, error.message);

      if (error.name === 'AbortError') {
        throw new Error('So\'rov muddati o\'tdi (Timeout).');
      } else if (error.message === 'Failed to fetch' || error instanceof TypeError) {
        throw new Error('Server bilan bog\'lanib bo\'lmadi. Backend yoniqligini tekshiring.');
      }
      throw error;
    }
  }

  // ── Refresh Token Logic ───────────────────────────────────
  async handleTokenRefresh(endpoint, options) {
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
        return this.request(endpoint, options); // So'rovni yangi token bilan takrorlash
      }
    } catch (err) {
      this.clearToken();
      window.location.href = '/login';
      throw new Error('Sessiya tugadi, iltimos qayta kiring');
    }
  }

  // ── Auth Endpoints ────────────────────────────────────────
  async register(data) {
    const res = await this.request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });
    if (res?.accessToken) this.setToken(res.accessToken);
    return res;
  }

  async login(data) {
    const res = await this.request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) });
    if (res?.accessToken) this.setToken(res.accessToken);
    return res;
  }

  async getProfile()        { return this.request('/api/auth/me'); }
  async updateProfile(data) { return this.request('/api/auth/me', { method: 'PUT', body: JSON.stringify(data) }); }
  async refresh()           { return this.request('/api/auth/refresh', { method: 'POST' }); }
  async logout() {
    try { await this.request('/api/auth/logout', { method: 'POST' }); }
    finally { this.clearToken(); }
  }

  // ── Students & Teachers ───────────────────────────────────
  async getStudents()           { return this.request('/api/students'); }
  async getStudent(id)          { return this.request(`/api/students/${id}`); }
  async createStudent(data)      { return this.request('/api/students', { method: 'POST', body: JSON.stringify(data) }); }
  async updateStudent(id, data)  { return this.request(`/api/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteStudent(id)       { return this.request(`/api/students/${id}`, { method: 'DELETE' }); }

  async getTeachers()           { return this.request('/api/teachers'); }
  async getTeacher(id)          { return this.request(`/api/teachers/${id}`); }
  async createTeacher(data)      { return this.request('/api/teachers', { method: 'POST', body: JSON.stringify(data) }); }
  async updateTeacher(id, data)  { return this.request(`/api/teachers/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteTeacher(id)       { return this.request(`/api/teachers/${id}`, { method: 'DELETE' }); }

  // ── Courses & Groups ──────────────────────────────────────
  async getCourses()            { return this.request('/api/courses'); }
  async getGroups()             { return this.request('/api/groups'); }
  async getGroup(id)            { return this.request(`/api/groups/${id}`); }
  async createGroup(data)       { return this.request('/api/groups', { method: 'POST', body: JSON.stringify(data) }); }
  
  // ── Homework & Attendance ─────────────────────────────────
  async getHomeworks()          { return this.request('/api/homework'); }
  async submitHomework(id, c)   { return this.request(`/api/homework/${id}/submit`, { method: 'POST', body: JSON.stringify({ content: c }) }); }
  async getAttendances()        { return this.request('/api/attendance'); }

  // ── Articles (Blog) ───────────────────────────────────────
  async getArticles(params = '') { return this.request(`/api/admin/articles${params}`); }
  async createArticle(data)      { return this.request('/api/admin/articles', { method: 'POST', body: JSON.stringify(data) }); }
  async updateArticle(id, data)  { return this.request(`/api/admin/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteArticle(id)        { return this.request(`/api/admin/articles/${id}`, { method: 'DELETE' }); }
}

export const apiService = new ApiService();