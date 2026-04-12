import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const login = (credentials) => {
    // Hardcoded admin for now — Week 5+ connect to real API
    if (
      credentials.email === 'admin@iles.ac.ug' &&
      credentials.password === 'admin123'
    ) {
      const userData = {
        name: 'Admin',
        email: credentials.email,
        role: 'admin',
      }
      setUser(userData)
      return { success: true }
    }
    return { success: false, message: 'Invalid email or password' }
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — import this anywhere you need auth info
export function useAuth() {
  return useContext(AuthContext)
}