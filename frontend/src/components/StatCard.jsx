import './StatCard.css'

function StatCard({ label, value, note, color }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color: color || '#0f2d52' }}>{value}</div>
      {note && <div className="stat-note">{note}</div>}
    </div>
  )
}

export default StatCard