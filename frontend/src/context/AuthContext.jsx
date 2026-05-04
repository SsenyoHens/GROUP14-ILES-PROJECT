import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../api/services'

import axios from "axios";

export const login = async (data) => {
  try {
    const res = await axios.post(
      "http://127.0.0.1:8000/login/",
      {
        email: data.email,
        password: data.password,
      }
    );

    // 🔥 Save token
    localStorage.setItem("token", res.data.access);

    return res.data;

  } catch (error) {
    throw error;
  }
};

const token = localStorage.getItem("token");

axios.get("http://127.0.0.1:8000/logs/", {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
.then(res => console.log(res.data));

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