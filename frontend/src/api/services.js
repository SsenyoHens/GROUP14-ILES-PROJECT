import api from './axios'

// =========================
// AUTH SERVICES
// =========================

export const authService = {

    login: (data) =>
        api.post('/auth/login/', data)
}


// =========================
// SUPERVISOR SERVICES
// =========================

export const supervisorService = {

    getAll: () =>
        api.get('/supervisors/'),

    create: (data) =>
        api.post('/supervisors/create/', data),

    update: (id, data) =>
        api.put(`/supervisors/${id}/update/`, data),

    delete: (id) =>
        api.delete(`/supervisors/${id}/delete/`)
}


// =========================
// WEEKLY LOG SERVICES
// =========================

export const weeklyLogService = {

    create: (data) =>
        api.post('/logs/create/', data),

    getAll: () =>
        api.get('/logs/')
}