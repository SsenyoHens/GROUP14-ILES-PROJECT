import api from './axiosInstance'

// ── Auth ──────────────────────────────────────────────
export const authService = {
  login:    (data) => api.post('/auth/login/', data),
  register: (data) => api.post('/auth/register/', data),
  me:       ()     => api.get('/auth/me/'),
}

// ── Dashboard (role-aware, backend filters automatically) ──
export const dashboardService = {
  getStats:     () => api.get('/dashboard/stats/'),
  getRecent:    () => api.get('/dashboard/recent-activity/'),
  getDeadlines: () => api.get('/dashboard/deadlines/'),
}

// ── Students (admin + supervisors only) ───────────────
export const studentService = {
  getAll:  (params) => api.get('/students/', { params }),
  getById: (id)     => api.get(`/students/${id}/`),
  update:  (id, d)  => api.put(`/students/${id}/`, d),
}

// ── Placements ────────────────────────────────────────
export const placementService = {
  getAll:       (params) => api.get('/placements/', { params }),
  getById:      (id)     => api.get(`/placements/${id}/`),
  create:       (data)   => api.post('/placements/create/', data),        // student only
  update:       (id, d)  => api.put(`/placements/${id}/update/`, d),      // admin + supervisors
  updateStatus: (id, s)  => api.patch(`/placements/${id}/status/`, { status: s }), // admin + supervisors
}

// ── Weekly Logs ───────────────────────────────────────
export const logService = {
  getAll:  (params) => api.get('/logs/', { params }),
  create:  (data)   => api.post('/logs/create/', data),         // student only
  update:  (id, d)  => api.put(`/logs/${id}/update/`, d),       // student (draft) + supervisors (feedback)
  delete:  (id)     => api.delete(`/logs/${id}/delete/`),       // student (draft) + admin
  summary: ()       => api.get('/logs/summary/'),
  stats:   ()       => api.get('/weeklylog/stats/'),
}

// ── Evaluations ───────────────────────────────────────
export const evaluationService = {
  getAll:  (params) => api.get('/evaluations/', { params }),
  getById: (id)     => api.get(`/evaluations/${id}/`),
  create:  (data)   => api.post('/evaluations/create/', data),       // supervisors + admin
  update:  (id, d)  => api.put(`/evaluations/${id}/update/`, d),     // supervisors + admin
  submit:  (id)     => api.patch(`/evaluations/${id}/submit/`),      // supervisors + admin
  summary: ()       => api.get('/evaluations/summary/'),
}

// ── Reports (admin + supervisors) ─────────────────────
export const reportService = {
  getSummary:         () => api.get('/reports/summary/'),
  getPlacementTrend:  () => api.get('/reports/placement-trend/'),
  getByDept:          () => api.get('/reports/by-department/'),
  getStatusBreakdown: () => api.get('/reports/status-breakdown/'),
}

// ── Users (admin only) ────────────────────────────────
export const userService = {
  getAll:  (params) => api.get('/users/', { params }),
  getById: (id)     => api.get(`/users/${id}/`),
  update:  (id, d)  => api.put(`/users/${id}/`, d),
  delete:  (id)     => api.delete(`/users/${id}/`),
  resetPw: (id, d)  => api.post(`/users/${id}/reset-password/`, d),
}

// ── Supervisors (admin only to manage) ────────────────
export const supervisorService = {
  getAll:  ()       => api.get('/supervisors/'),
  create:  (data)   => api.post('/supervisors/create/', data),
  update:  (id, d)  => api.put(`/supervisors/${id}/update/`, d),
  delete:  (id)     => api.delete(`/supervisors/${id}/delete/`),
}