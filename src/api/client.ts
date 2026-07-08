import axios from 'axios'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export function getErrorMessage(error: AxiosError<ApiError>): string {
  const data = error.response?.data
  if (!data) return 'An error occurred'

  if (Array.isArray(data.message)) {
    return data.message.join(', ')
  }
  return data.message
}

export default api
