import api from './client'
import type { GymPayment, PaginatedResponse, PaginationParams } from '@/types'

export const paymentApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<GymPayment>> => {
    const response = await api.get<PaginatedResponse<GymPayment>>('/gym-payment', { params })
    return response.data
  },

  getById: async (id: string): Promise<GymPayment> => {
    const response = await api.get<GymPayment>(`/gym-payment/${id}`)
    return response.data
  },

  create: async (data: Partial<GymPayment>): Promise<GymPayment> => {
    const response = await api.post<GymPayment>('/gym-payment', data)
    return response.data
  },

  update: async (id: string, data: Partial<GymPayment>): Promise<GymPayment> => {
    const response = await api.patch<GymPayment>(`/gym-payment/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/gym-payment/${id}`)
  },
}
