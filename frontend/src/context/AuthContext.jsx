import { createContext, useState } from "react";
import axiosInstance from "../api/axiosInstance";

<<<<<<< HEAD
export const AuthContext = createContext();
=======
import axios from "axios";
import api from '../api/axiosInstance';
>>>>>>> c916829 (cleaned up logs api call in AuthContext.jsx and fixed the role field in admin.py and serializers.py)

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const loginUser = async (email, password) => {
    try {
      const response = await axiosInstance.post("login/", {
        email,
        password,
      });

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      setUser(response.data);

<<<<<<< HEAD
      return true;
    } catch (error) {
      console.error(error);
      return false;
=======
const token = localStorage.getItem("token");

api.get("logs/", {
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
>>>>>>> c916829 (cleaned up logs api call in AuthContext.jsx and fixed the role field in admin.py and serializers.py)
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}