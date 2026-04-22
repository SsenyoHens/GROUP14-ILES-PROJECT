// ── Roles ─────────────────────────────────────────────
export const ROLES = {
  ADMIN:               'admin',
  ACADEMIC_SUPERVISOR: 'academic_supervisor',
  STUDENT:             'student',
  WORKPLACE_SUPERVISOR:'workplace_supervisor',
}

export const ADMIN_ROLES = [ROLES.ADMIN, ROLES.ACADEMIC_SUPERVISOR]

// ── Student statuses ──────────────────────────────────
export const STUDENT_STATUSES = ['Pending', 'Placed', 'Evaluating', 'Completed']

// ── Placement statuses ────────────────────────────────
export const PLACEMENT_STATUSES = ['Pending', 'Active', 'Evaluating', 'Completed', 'Terminated']

// ── Evaluation statuses ───────────────────────────────
export const EVAL_STATUSES = ['Draft', 'Submitted', 'Graded']

// ── Grades ────────────────────────────────────────────
export const GRADES = ['A', 'B', 'C', 'D', 'F']

// ── Badge color maps (Chakra colorScheme) ─────────────
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

// ── Routes ────────────────────────────────────────────
export const ROUTES = {
  LOGIN:       '/login',
  REGISTER:    '/register',
  DASHBOARD:   '/dashboard',
  STUDENTS:    '/students',
  PLACEMENTS:  '/placements',
  EVALUATIONS: '/evaluations',
  REPORTS:     '/reports',
  USERS:       '/users',
}

export const ROLE_HOME = {
  [ROLES.ADMIN]:               ROUTES.DASHBOARD,
  [ROLES.ACADEMIC_SUPERVISOR]: ROUTES.DASHBOARD,
   internship_administrator:    ROUTES.DASHBOARD,  
  [ROLES.STUDENT]:             '/student/dashboard',
  [ROLES.WORKPLACE_SUPERVISOR]:'/supervisor/dashboard',
}