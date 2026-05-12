import axios from 'axios'

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/'
})

api.interceptors.request.use((config) => {

    const user = JSON.parse(localStorage.getItem('user'))

    if (user?.tokens?.access) {

        config.headers.Authorization =
            `Bearer ${user.tokens.access}`
    }

    return config
})

export default api