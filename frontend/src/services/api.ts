import axios from 'axios'
import { supabase } from './supabaseClient'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api',
})

// Attach Supabase JWT to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

// ── Students ──────────────────────────────────────────────────────────────────
export const studentsApi = {
  list:       ()         => api.get('/students'),
  getById:    (id: string) => api.get(`/students/${id}`),
  getProfile: (id: string) => api.get(`/students/${id}/profile`),
  search:     (q: string) => api.get(`/students/search?q=${encodeURIComponent(q)}`),
}

// ── Risk ─────────────────────────────────────────────────────────────────────
export const riskApi = {
  getReport:       (studentId: string) => api.get(`/risk/${studentId}`),
  triggerAnalysis: (studentId: string) => api.post(`/risk/${studentId}/analyse`),
  listAll:         ()                  => api.get('/risk'),
  getSummary:      ()                  => api.get('/risk/summary'),
  analyseAll:      ()                  => api.post('/risk/analyse/all'),
  getHistory:      (studentId: string) => api.get(`/risk/${studentId}/history`),
}

// ── Interventions ─────────────────────────────────────────────────────────────
export const interventionsApi = {
  list:   (studentId: string) => api.get(`/interventions/${studentId}`),
  create: (payload: unknown)  => api.post('/interventions', payload),
  update: (id: string, payload: unknown) => api.put(`/interventions/${id}`, payload),
}

// ── Modules ──────────────────────────────────────────────────────────────────
export const modulesApi = {
  list:     ()                => api.get('/modules'),
  getMarks: (moduleId: string) => api.get(`/modules/${moduleId}/marks`),
}

// ── Tutor support ─────────────────────────────────────────────────────────────
export const tutorApi = {
  getSessions:   ()                     => api.get('/tutor/sessions'),
  getAtRisk:     ()                     => api.get('/tutor/at-risk'),
  logSession:    (payload: unknown)     => api.post('/tutor/sessions', payload),
  updateSession: (id: string, payload: unknown) => api.put(`/tutor/sessions/${id}`, payload),
}

export default api
