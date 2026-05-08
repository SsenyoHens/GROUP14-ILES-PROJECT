// ── Roles ─────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN:               'admin',
  ACADEMIC_SUPERVISOR: 'academic_supervisor',
  STUDENT:             'student',
  WORKPLACE_SUPERVISOR:'workplace_supervisor',
}

// Roles that can access admin-side pages
export const ADMIN_ROLES    = [ROLES.ADMIN, ROLES.ACADEMIC_SUPERVISOR]
export const STUDENT_ROLES  = [ROLES.STUDENT]
export const SUPERVISOR_ROLES = [ROLES.WORKPLACE_SUPERVISOR]

// ── Student statuses ──────────────────────────────────────────────
export const STUDENT_STATUSES = ['Pending', 'Placed', 'Evaluating', 'Completed']

// ── Placement statuses ────────────────────────────────────────────
export const PLACEMENT_STATUSES = ['Pending', 'Active', 'Evaluating', 'Completed', 'Terminated']

// ── Evaluation statuses ───────────────────────────────────────────
export const EVAL_STATUSES = ['Draft', 'Submitted', 'Graded']

// ── Grades ────────────────────────────────────────────────────────
export const GRADES = ['A', 'B', 'C', 'D', 'F']

// ── Badge color maps (Chakra colorScheme) ─────────────────────────
export const STATUS_COLORS = {
  // student / placement
  Pending:    'orange',
  Placed:     'green',
  Active:     'green',
  Evaluating: 'blue',
  Completed:  'purple',
  Terminated: 'red',
  // evaluation
  Draft:      'gray',
  Submitted:  'teal',
  Graded:     'green',
}

export const GRADE_COLORS = {
  A: 'green',
  B: 'teal',
  C: 'blue',
  D: 'orange',
  F: 'red',
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

  // Universal dashboard redirect (resolves per role in App.jsx)
  DASHBOARD: '/dashboard',

  // Admin (internship_administrator)
  STUDENTS:    '/students',
  PLACEMENTS:  '/placements',
  EVALUATIONS: '/evaluations',
  REPORTS:     '/reports',
  USERS:       '/users',

  // Student portal  (/student/*)
  STUDENT_DASHBOARD:   '/student/dashboard',
  STUDENT_PLACEMENT:   '/student/placement',
  STUDENT_EVALUATIONS: '/student/evaluations',
  STUDENT_LOGBOOK:     '/student/logbook',
  STUDENT_PROFILE:     '/student/profile',

  // Workplace Supervisor portal  (/workplace-supervisor/*)
  WORKPLACESUPERVISOR_DASHBOARD:   '/workplace-supervisor/dashboard',
  WORKPLACESUPERVISOR_STUDENTS:    '/workplace-supervisor/students',
  WORKPLACESUPERVISOR_EVALUATIONS: '/workplace-supervisor/evaluations',
  WORKPLACESUPERVISOR_ATTENDANCE:  '/workplace-supervisor/attendance',
  WORKPLACESUPERVISOR_PROFILE:     '/workplace-supervisor/profile',
}

// ── Role → home route after login ────────────────────────────────
export const ROLE_HOME = {
  [ROLES.ADMIN]:               ROUTES.DASHBOARD,
  [ROLES.ACADEMIC_SUPERVISOR]: ROUTES.DASHBOARD,
  internship_administrator:    ROUTES.DASHBOARD,   // backend alias
  [ROLES.STUDENT]:             ROUTES.STUDENT_DASHBOARD,
  [ROLES.WORKPLACE_SUPERVISOR]:ROUTES.WORKPLACESUPERVISOR_DASHBOARD,
}