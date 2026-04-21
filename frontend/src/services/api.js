import axios from 'axios'

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api'

/**
 * Axios instance with base URL and automatic JWT injection.
 * Every request automatically includes the Authorization header
 * if a token is stored in localStorage.
 */
const axiosInstance = axios.create({ baseURL: BASE_URL })

// Request interceptor: attach token to every outgoing request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor: handle 401 globally (token expired)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  signup: (data) => axiosInstance.post('/auth/signup', data),
  login: (data) => axiosInstance.post('/auth/login', data),
  getMe: () => axiosInstance.get('/auth/me')
}

// ─── Documents API ────────────────────────────────────────────────────────────
export const documentsAPI = {
  upload: (file, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    return axiosInstance.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total))
      }
    })
  },
  getAll: (page = 1, limit = 10) =>
    axiosInstance.get(`/documents?page=${page}&limit=${limit}`),
  getOne: (id) => axiosInstance.get(`/documents/${id}`),
  search: (query) => axiosInstance.get(`/documents/search?q=${encodeURIComponent(query)}`),
  summarize: (id) => axiosInstance.post(`/documents/${id}/summarize`),
  delete: (id) => axiosInstance.delete(`/documents/${id}`)
}
