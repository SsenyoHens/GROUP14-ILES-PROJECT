import { Link } from 'react-router-dom'

const Sidebar = () => {
  return (
    <div>
      <h2>Admin Panel</h2>
      <nav>
        <ul>
          <li><Link to="/admin/dashboard">Dashboard</Link></li>
          <li><Link to="/admin/students">Students</Link></li>
          <li><Link to="/admin/placements">Placements</Link></li>
          <li><Link to="/admin/evaluations">Evaluations</Link></li>
          <li><Link to="/admin/reports">Reports</Link></li>
          <li><Link to="/admin/user-accounts">User Accounts</Link></li>
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar