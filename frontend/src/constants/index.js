// ── Roles ─────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN:               'admin',
  ACADEMIC_SUPERVISOR: 'academic_supervisor',
  STUDENT:             'student',
  WORKPLACE_SUPERVISOR:'workplace_supervisor',
}

export const ADMIN_ROLES      = [ROLES.ADMIN, ROLES.ACADEMIC_SUPERVISOR]
export const STUDENT_ROLES    = [ROLES.STUDENT]
export const SUPERVISOR_ROLES = [ROLES.WORKPLACE_SUPERVISOR]

// ── Statuses ──────────────────────────────────────────────────────
export const STUDENT_STATUSES   = ['Pending', 'Placed', 'Evaluating', 'Completed']
export const PLACEMENT_STATUSES = ['Pending', 'Active', 'Evaluating', 'Completed', 'Terminated']
export const EVAL_STATUSES      = ['Draft', 'Submitted', 'Graded']
export const GRADES             = ['A', 'B', 'C', 'D', 'F']

// ── Badge color maps ──────────────────────────────────────────────
export const STATUS_COLORS = {
  Pending:    'orange',
  Placed:     'green',
  Active:     'green',
  Evaluating: 'blue',
  Completed:  'purple',
  Terminated: 'red',
  Draft:      'gray',
  Submitted:  'teal',
  Graded:     'green',
}

export const GRADE_COLORS = {
  A: 'green', B: 'teal', C: 'blue', D: 'orange', F: 'red',
}

export const ROLE_COLORS = {
  admin:               'red',
  academic_supervisor: 'purple',
  student:             'blue',
  workplace_supervisor:'orange',
}

// ── Routes ────────────────────────────────────────────────────────
export const ROUTES = {
  // Public
  HOME:     '/home',
  LOGIN:    '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',

  // Admin (internship administrator)
  ADMIN_DASHBOARD: '/admin/dashboard',   // ✅ added
  STUDENTS:        '/admin/students',    // ✅ prefixed
  PLACEMENTS:      '/admin/placements',  // ✅ prefixed
  EVALUATIONS:     '/admin/evaluations', // ✅ prefixed
  REPORTS:         '/admin/reports',     // ✅ prefixed
  USERS:           '/admin/users',       // ✅ prefixed

  // Academic supervisor
  ACADEMIC_DASHBOARD:   '/academic/dashboard',   // ✅ added
  ACADEMIC_EVALUATIONS: '/academic/evaluations', // ✅ added
  ACADEMIC_REPORTS:     '/academic/reports',     // ✅ added

  // Student portal
  STUDENT_DASHBOARD:   '/student/dashboard',
  STUDENT_PLACEMENT:   '/student/placement',
  STUDENT_EVALUATIONS: '/student/evaluations',
  STUDENT_LOGBOOK:     '/student/logbook',
  STUDENT_PROFILE:     '/student/profile',

  // Workplace supervisor portal
  WORKPLACE_DASHBOARD:   '/workplace/dashboard',   // ✅ simplified
  WORKPLACE_STUDENTS:    '/workplace/students',
  WORKPLACE_EVALUATIONS: '/workplace/evaluations',
  WORKPLACE_ATTENDANCE:  '/workplace/attendance',
  WORKPLACE_PROFILE:     '/workplace/profile',
}

// ── Role → home route after login ─────────────────────────────────
export const ROLE_HOME = {
  admin:               '/admin/dashboard',    // ✅ direct paths
  academic_supervisor: '/academic/dashboard', // ✅ direct paths
  student:             '/student/dashboard',
  workplace_supervisor:'/workplace/dashboard',
}