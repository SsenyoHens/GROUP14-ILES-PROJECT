import axios from 'axios'

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/'
})

api.interceptors.request.use((config) => {

    const user = JSON.parse(localStorage.getItem('user'))

    if (user?.access) {
        config.headers.Authorization = `Bearer ${user.access}`
    }

    return config
})

export const supervisorService = {

    getAll: () => api.get('supervisors/'),

    create: (data) =>
        api.post('/supervisors/create/', data),

    update: (id, data) =>
        api.put(`/supervisors/update/${id}/`, data),

    delete: (id) =>
        api.delete(`/supervisors/delete/${id}/`),
}

export const authService = {

    login: (data) =>
        api.post('/login/', data)
}

export const weeklyLogService = {

    create: (data) => api.post('/logs/create/', data),

    getAll: () => api.get('/logs/')
}

export default api