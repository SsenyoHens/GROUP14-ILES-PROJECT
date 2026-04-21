// ── Date formatting ───────────────────────────────────
export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-UG', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export const formatDateRange = (start, end) => {
  if (!start) return '—'
  return `${formatDate(start)} → ${formatDate(end)}`
}

// ── Score → grade ─────────────────────────────────────
export const scoreToGrade = (score) => {
  if (score === null || score === undefined) return null
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}

// ── Initials from full name ───────────────────────────
export const getInitials = (name = '') => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

// ── Truncate long text ────────────────────────────────
export const truncate = (str, length = 40) => {
  if (!str) return '—'
  return str.length > length ? str.slice(0, length) + '…' : str
}

// ── Build query string from object ───────────────────
export const toQueryString = (params = {}) => {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
}

// ── Capitalise first letter ───────────────────────────
export const capitalise = (str = '') =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()