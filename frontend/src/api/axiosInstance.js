import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access')  
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
		err.response?.status === 401 &&
		localStorage.getItem('access')
    ) 	{
		localStorage.removeItem('access')
		localStorage.removeItem('refresh')
		window.location.href = '/login'
	}
    return Promise.reject(err)
  }
)

export default api