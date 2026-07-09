import axios from 'axios'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types'
import { useAuthStore } from '@/stores/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token || localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname
      // Only redirect to login if not already on login page
      if (currentPath !== '/login' && currentPath !== '/register') {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export function getErrorMessage(error: AxiosError<ApiError>): string {
  const data = error.response?.data

  if (!data) {
    const status = error.response?.status
    switch (status) {
      case 401:
        return 'No tienes permiso para realizar esta accion'
      case 403:
        return 'No tienes acceso a este recurso'
      case 404:
        return 'El recurso solicitado no fue encontrado'
      case 409:
        return 'Existe un conflicto con la operacion solicitada'
      case 422:
        return 'Los datos enviados no son validos'
      case 429:
        return 'Demasiadas solicitudes. Intenta de nuevo mas tarde'
      case 500:
        return 'Error interno del servidor. Intenta de nuevo mas tarde'
      default:
        return 'Ocurrio un error inesperado'
    }
  }

  if (Array.isArray(data.message)) {
    return data.message.join(', ')
  }

  if (typeof data.message === 'string') {
    return data.message
  }

  return 'Ocurrio un error inesperado'
}

export function getValidationErrors(error: AxiosError<ApiError>): Record<string, string> {
  const data = error.response?.data
  const errors: Record<string, string> = {}

  if (!data || !Array.isArray(data.message)) {
    return errors
  }

  data.message.forEach((msg) => {
    const match = msg.match(/^(\w+)\s/)
    if (match) {
      const field = match[1].toLowerCase()
      errors[field] = msg
    }
  })

  return errors
}

export default api
