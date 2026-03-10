const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://blog-mrabdunozir-uz.onrender.com';

class ApiService {
  constructor() {
    this.isRefreshing = false;
    this.refreshPromise = null;
  }

  getToken() { return localStorage.getItem('accessToken'); }
  setToken(token) { if (token) localStorage.setItem('accessToken', token); }
  clearToken() {
    localStorage.removeItem('accessToken');
    document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const method = (options.method || 'GET').toUpperCase();

    // Faqat POST, PUT, PATCH, DELETE requestlar uchun Content-Type qo'shamiz
    const headers = new Headers();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      headers.set('Content-Type', 'application/json');
    }

    // GET requestlar uchun hech qanday Content-Type qo'shmaydi

    try {
      console.log(`🔵 API Request: ${method} ${API_BASE_URL}${endpoint}`);
      if (options.body) {
        console.log('📤 Request Body:', JSON.parse(options.body));
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: method,
        headers: headers,
        ...options
      });

      console.log(`🟢 API Response Status: ${response.status} ${response.statusText}`);

      if (response.status === 401 && !endpoint.includes('/api/auth/refresh')) {
        console.warn('⚠️ Token expired, refreshing...');
        return this.handleTokenRefresh(endpoint, options);
      }

      // 500 xatoliklarini maxsus ko'rsatish
      if (response.status === 500) {
        console.error('🔴 Server Error 500 for:', endpoint);
        const errorData = await response.json().catch(() => ({}));
        console.error('🔴 Error Data:', errorData);
        throw new Error(errorData.message || errorData.error || 'Serverda xatolik yuz berdi (500). Backend endpointini tekshiring.');
      }

      // 400 va 404 xatoliklarini ko'rsatish
      if (response.status === 400 || response.status === 404) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'Xatolik yuz berdi';
        console.error('🟠 Validation Error:', errorMessage);
        console.error('🟠 Error Details:', errorData);
        throw new Error(errorMessage);
      }

      const data = await response.json().catch(() => ({}));
      console.log('✅ API Response Data:', data);

      if (!response.ok) {
        const errorMessage = data.message || data.error || 'Xatolik yuz berdi';
        console.error('❌ API Error:', errorMessage);
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error(`💥 API Error (${endpoint}):`, error.message);
      throw error;
    }
  }

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
      if (res && res.accessToken) {
        this.setToken(res.accessToken);
        return this.request(endpoint, options);
      }
    } catch (err) {
      this.clearToken();
      window.location.href = '/login';
      throw new Error('Sessiya tugadi');
    }
  }

  // --- Yangilangan Metodlar ---
  async register(data) {
    const res = await this.request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });
    if (res.accessToken) this.setToken(res.accessToken);
    return res;
  }

  async login(data) {
    const res = await this.request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) });
    if (res.accessToken) this.setToken(res.accessToken);
    return res;
  }

  async getProfile() { return this.request('/api/auth/me'); }

  async updateProfile(data) {
    // Backend endpointingizga qarab '/api/auth/profile' yoki '/api/auth/me'
    return this.request('/api/auth/me', { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    });
  }

  async refresh() { return this.request('/api/auth/refresh', { method: 'POST' }); }

  // --- Guruhlar Metodlari ---
  async getGroups() { return this.request('/api/groups'); }
  async getGroup(id) { return this.request(`/api/groups/${id}`); }
  async createGroup(data) { return this.request('/api/groups', { method: 'POST', body: JSON.stringify(data) }); }
  async updateGroup(id, data) { return this.request(`/api/groups/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteGroup(id) { return this.request(`/api/groups/${id}`, { method: 'DELETE' }); }

  // --- Guruh O'quvchilari ---
  async addStudentToGroup(groupId, studentId) {
    const response = await this.request(`/api/groups/${groupId}/students`, { method: 'POST', body: JSON.stringify({ studentId }) });
    return response;
  }
  async removeStudentFromGroup(groupId, studentId) {
    const response = await this.request(`/api/groups/${groupId}/students/${studentId}`, { method: 'DELETE' });
    return response;
  }

  async setDefaultStudent(groupId, studentId, isDefault) {
    return this.request(`/api/groups/${groupId}/students/${studentId}/default`, { method: 'PATCH', body: JSON.stringify({ isDefault }) });
  }
  async getGroupStudents(groupId) {
    return this.request(`/api/groups/${groupId}/students`, { method: 'GET' });
  }

  // --- Rolga asoslangan Guruhlar ---
  async getMyGroup() {
    return this.request('/api/groups/me/group');
  }
  async getMyGroups() {
    return this.request('/api/groups/me/groups');
  }

  // --- O'qituvchilar Metodlari ---
  async getTeachers() { return this.request('/api/teachers'); }
  async createTeacher(data) { return this.request('/api/teachers', { method: 'POST', body: JSON.stringify(data) }); }
  async updateTeacher(id, data) { return this.request(`/api/teachers/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteTeacher(id) { return this.request(`/api/teachers/${id}`, { method: 'DELETE' }); }

  // --- O'quvchilar Metodlari ---
  async getStudents() { return this.request('/api/students'); }
  async createStudent(data) { return this.request('/api/students', { method: 'POST', body: JSON.stringify(data) }); }
  async updateStudent(id, data) { return this.request(`/api/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteStudent(id) { return this.request(`/api/students/${id}`, { method: 'DELETE' }); }

  // --- Kurslar Metodlari ---
  async getCourses() { return this.request('/api/courses'); }
  async getCourse(id) { return this.request(`/api/courses/${id}`); }
  async createCourse(data) {
    const response = await this.request('/api/courses', { method: 'POST', body: JSON.stringify(data) });
    return response;
  }
  async updateCourse(id, data) {
    const response = await this.request(`/api/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    return response;
  }
  async deleteCourse(id) { return this.request(`/api/courses/${id}`, { method: 'DELETE' }); }

  // --- Dashboard Metodlari ---
  async getDashboard() { return this.request('/api/dashboard'); }
}

export const apiService = new ApiService();