import { Link, useLocation, useNavigate } from 'react-router-dom'
import './Navbar.css'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/students', label: 'Students' },
  { path: '/placements', label: 'Placements' },
  { path: '/reports', label: 'Reports' },
]

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-logo">ILES</span>
        <span className="brand-sub">Admin Portal</span>
      </div>

      <ul className="navbar-links">
        {navLinks.map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className={location.pathname === link.path ? 'active' : ''}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="navbar-user">
        <span className="user-role">{user?.name || 'Admin'}</span>
        <div className="avatar">AD</div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar