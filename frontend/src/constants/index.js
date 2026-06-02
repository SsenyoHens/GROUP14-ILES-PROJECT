export const ROLES = {
  STUDENT:              'student',
  ACADEMIC_SUPERVISOR:  'academic_supervisor',
  WORKPLACE_SUPERVISOR: 'workplace_supervisor',
  ADMIN:                'admin',
}

export const ROUTES = {
  HOME:      '/home',
  LOGIN:     '/login',
  REGISTER:  '/register',
  DASHBOARD: '/dashboard',

  // ── Admin ──────────────────────────────────────────────
  ADMIN_DASHBOARD:     '/admin/dashboard',
  ADMIN_NOTIFICATIONS: '/admin/notifications',
  STUDENTS:            '/admin/students',
  PLACEMENTS:          '/admin/placements',
  EVALUATIONS:         '/admin/evaluations',
  REPORTS:             '/admin/reports',
  USERS:               '/admin/users',

  // ── Academic Supervisor ────────────────────────────────
  ACADEMIC_DASHBOARD:     '/academic/dashboard',
  ACADEMIC_STUDENTS:      '/academic/students',
  ACADEMIC_EVALUATIONS:   '/academic/evaluations',
  ACADEMIC_REPORTS:       '/academic/reports',
  ACADEMIC_NOTIFICATIONS: '/academic/notifications',

  // ── Student ────────────────────────────────────────────
  STUDENT_DASHBOARD:     '/student/dashboard',
  STUDENT_PLACEMENT:     '/student/placement',
  STUDENT_EVALUATIONS:   '/student/evaluations',
  STUDENT_LOGBOOK:       '/student/logbook',
  STUDENT_PROFILE:       '/student/profile',
  STUDENT_NOTIFICATIONS: '/student/notifications',

  // ── Workplace Supervisor ───────────────────────────────
  WORKPLACE_DASHBOARD:     '/workplace/dashboard',
  WORKPLACE_STUDENTS:      '/workplace/students',
  WORKPLACE_EVALUATIONS:   '/workplace/evaluations',
  WORKPLACE_ATTENDANCE:    '/workplace/attendance',
  WORKPLACE_PROFILE:       '/workplace/profile',
  WORKPLACE_NOTIFICATIONS: '/workplace/notifications',
}

export const ROLE_HOME = {
  student:              ROUTES.STUDENT_DASHBOARD,
  academic_supervisor:  ROUTES.ACADEMIC_DASHBOARD,
  workplace_supervisor: ROUTES.WORKPLACE_DASHBOARD,
  admin:                ROUTES.ADMIN_DASHBOARD,
}