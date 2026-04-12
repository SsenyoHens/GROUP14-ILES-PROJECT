import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <span>ILES — Internship Learning & Evaluation System</span>
      <span>© {new Date().getFullYear()} Admin Panel • Group 14</span>
    </footer>
  )
}

export default Footer