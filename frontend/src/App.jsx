import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          {/* Routes will be added as features merge in */}
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}

export default App