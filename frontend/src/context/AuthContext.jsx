import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../api/services'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Re-hydrate user from token on page refresh
  useEffect(() => {
    const token = localStorage.getItem('iles_token')
    if (token) {
      authService.me()
        .then((res) => setUser(res.data))
        .catch(() => localStorage.removeItem('iles_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credentials) => {
    const res = await authService.login(credentials)
    const { token, user: userData } = res.data
    localStorage.setItem('iles_token', token)
    setUser(userData)
    return userData
  }

  const logout = async () => {
    try { await authService.logout() } catch (_) {}
    localStorage.removeItem('iles_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)