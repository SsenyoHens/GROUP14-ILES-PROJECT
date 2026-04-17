import axiosInstance from './axiosInstance'

export const authService = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials)
    return response.data
  },

  logout: async () => {
    const response = await axiosInstance.post('/auth/logout')
    return response.data
  },
}