import api from './client'
import type { PagoMovil } from '@/types'

export const pagoMovilApi = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<{ data: PagoMovil[]; total: number; totalPages: number }> => {
    const response = await api.get('/pago-movil', { params })
    const data = response.data
    if (data?.data && Array.isArray(data.data)) {
      return { data: data.data, total: data.total || 0, totalPages: data.totalPages || 1 }
    }
    if (Array.isArray(data)) {
      return { data, total: data.length, totalPages: 1 }
    }
    return { data: [], total: 0, totalPages: 1 }
  },

  getByGym: async (gymId: string): Promise<PagoMovil[]> => {
    const response = await api.get(`/pago-movil/gym/${gymId}`)
    const data = response.data
    if (Array.isArray(data)) return data
    if (data?.data && Array.isArray(data.data)) return data.data
    return []
  },

  getById: async (id: string): Promise<PagoMovil> => {
    const response = await api.get<PagoMovil>(`/pago-movil/${id}`)
    return response.data
  },

  create: async (gymId: string, data: Partial<PagoMovil>): Promise<PagoMovil> => {
    const response = await api.post<PagoMovil>(`/pago-movil/${gymId}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/pago-movil/${id}`)
  },
}
