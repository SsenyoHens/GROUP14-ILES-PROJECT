import api from './axiosInstance'

// ── Auth ──────────────────────────────────────────────
export const authService = {
  login:   (data)  => api.post('/auth/login', data),
  logout:  ()      => api.post('/auth/logout'),
  me:      ()      => api.get('/auth/me'),
  register: (data) => api.post('/auth/register', data),

// ── Dashboard ─────────────────────────────────────────
export const dashboardService = {
  getStats:     () => api.get('/dashboard/stats'),
  getRecent:    () => api.get('/dashboard/recent-activity'),
  getDeadlines: () => api.get('/dashboard/deadlines'),
}

// ── Students ──────────────────────────────────────────
export const studentService = {
  getAll:    (params) => api.get('/students', { params }),
  getById:   (id)     => api.get(`/students/${id}`),
  create:    (data)   => api.post('/students', data),
  update:    (id, d)  => api.put(`/students/${id}`, d),
  delete:    (id)     => api.delete(`/students/${id}`),
}

// ── Placements ────────────────────────────────────────
export const placementService = {
  getAll:          (params) => api.get('/placements', { params }),
  getById:         (id)     => api.get(`/placements/${id}`),
  create:          (data)   => api.post('/placements', data),
  update:          (id, d)  => api.put(`/placements/${id}`, d),
  updateStatus:    (id, s)  => api.patch(`/placements/${id}/status`, { status: s }),
}

// ── Evaluations ───────────────────────────────────────
export const evaluationService = {
  getAll:    (params) => api.get('/evaluations', { params }),
  getById:   (id)     => api.get(`/evaluations/${id}`),
  create:    (data)   => api.post('/evaluations', data),
  update:    (id, d)  => api.put(`/evaluations/${id}`, d),
  submit:    (id)     => api.patch(`/evaluations/${id}/submit`),
}

// ── Reports ───────────────────────────────────────────
export const reportService = {
  getSummary:      () => api.get('/reports/summary'),
  getPlacementTrend: () => api.get('/reports/placement-trend'),
  getByDept:       () => api.get('/reports/by-department'),
  getStatusBreakdown: () => api.get('/reports/status-breakdown'),
}

// ── Users / Accounts ──────────────────────────────────
export const userService = {
  getAll:    (params) => api.get('/users', { params }),
  create:    (data)   => api.post('/users', data),
  update:    (id, d)  => api.put(`/users/${id}`, d),
  delete:    (id)     => api.delete(`/users/${id}`),
  resetPw:   (id)     => api.post(`/users/${id}/reset-password`),
}