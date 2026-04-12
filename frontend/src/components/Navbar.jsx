import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

const navLinks = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/students', label: 'Students' },
  { path: '/placements', label: 'Placements' },
  { path: '/reports', label: 'Reports' },
]

function Navbar() {
  const location = useLocation()

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
        <span className="user-role">Admin</span>
        <div className="avatar">AD</div>
      </div>
    </nav>
  )
}

export default Navbar