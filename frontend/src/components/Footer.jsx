const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer>
      <div>
        <p>© {currentYear} ILES Project. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer