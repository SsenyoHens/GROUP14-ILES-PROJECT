import { createContext, useState, useEffect, useContext } from 'react'
import { authService } from '../api/services'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // Re-hydrate user from token on page refresh
  useEffect(() => {
    const token = localStorage.getItem('access')
    if (token) {
      authService.me()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('access')
          localStorage.removeItem('refresh')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const loginUser = async (email, password) => {
    try {
      const response = await authService.login({ email, password })

      localStorage.setItem('access',  response.data.tokens.access)
      localStorage.setItem('refresh', response.data.tokens.refresh)
      setUser(response.data.user)

      return response.data.user  

    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logoutUser = async () => {
    try {
      const refresh = localStorage.getItem('refresh')
      if (refresh) await authService.logout({ refresh })
    } catch {
      // fail silently
    } finally {
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)