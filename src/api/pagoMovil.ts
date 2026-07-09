import api from './client'
import type { PagoMovil, PaginatedResponse, PaginationParams } from '@/types'

export const pagoMovilApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<PagoMovil>> => {
    const response = await api.get<PaginatedResponse<PagoMovil>>('/pago-movil', { params })
    return response.data
  },

  getById: async (id: string): Promise<PagoMovil> => {
    const response = await api.get<PagoMovil>(`/pago-movil/${id}`)
    return response.data
  },

  create: async (data: Partial<PagoMovil>): Promise<PagoMovil> => {
    const response = await api.post<PagoMovil>('/pago-movil', data)
    return response.data
  },

  update: async (id: string, data: Partial<PagoMovil>): Promise<PagoMovil> => {
    const response = await api.patch<PagoMovil>(`/pago-movil/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/pago-movil/${id}`)
  },
}
