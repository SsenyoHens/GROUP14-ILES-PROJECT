import StatCard from '../../components/StatCard'
import './Dashboard.css'

const stats = [
  { label: 'Total Students', value: 248, note: '↑ 12 this intake', color: '#1560a8' },
  { label: 'Active Placements', value: 195, note: '79% placed', color: '#1a7a45' },
  { label: 'Supervisors', value: 43, note: '31 workplaces', color: '#0f2d52' },
  { label: 'Pending Evaluations', value: 17, note: '⚠ Needs attention', color: '#c05c00' },
]

const recentStudents = [
  { name: 'Aisha Nakato', status: 'Placed' },
  { name: 'Brian Otieno', status: 'Pending' },
  { name: 'Charity Namukasa', status: 'Placed' },
  { name: 'David Ssemwanga', status: 'Evaluating' },
]

const statusColors = {
  Placed: { bg: '#e6f4ed', color: '#1a7a45' },
  Pending: { bg: '#fef4e0', color: '#8a5c00' },
  Evaluating: { bg: '#e6f0fb', color: '#1560a8' },
}

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="page-header">
        <h2>Welcome, Admin</h2>
        <p>Internship Learning & Evaluation System — Session 2025/26</p>
      </div>

      <div className="stats-grid">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="dashboard-sections">
        <div className="section-card">
          <h3>Recent Student Registrations</h3>
          <table className="simple-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentStudents.map((s) => (
                <tr key={s.name}>
                  <td>{s.name}</td>
                  <td>
                    <span
                      className="pill"
                      style={statusColors[s.status]}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="section-card">
          <h3>Upcoming Deadlines</h3>
          <ul className="deadline-list">
            <li><span>Midterm evaluation submission</span><span>Apr 20</span></li>
            <li><span>Workplace visit reports</span><span>Apr 25</span></li>
            <li><span>Final grading window opens</span><span>May 10</span></li>
            <li><span>Completion certificates</span><span>May 30</span></li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Dashboard