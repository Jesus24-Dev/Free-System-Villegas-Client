import api from './client'
import type { PagoMovil } from '@/types'

export const pagoMovilApi = {
  getAll: async (params?: { dni?: string }): Promise<PagoMovil[]> => {
    const response = await api.get<PagoMovil[]>('/gym/pago-movil', { params })
    return response.data
  },

  getById: async (id: string): Promise<PagoMovil> => {
    const response = await api.get<PagoMovil>(`/gym/pago-movil/${id}`)
    return response.data
  },

  create: async (data: Partial<PagoMovil>): Promise<PagoMovil> => {
    const response = await api.post<PagoMovil>('/gym/pago-movil', data)
    return response.data
  },

  update: async (id: string, data: Partial<PagoMovil>): Promise<PagoMovil> => {
    const response = await api.patch<PagoMovil>(`/gym/pago-movil/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/gym/pago-movil/${id}`)
  },
}
