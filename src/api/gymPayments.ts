import api from './client'
import type { GymPayment } from '@/types'

export const gymPaymentApi = {
  getAll: async (params?: { athlete_id?: string; gym_id?: string }): Promise<GymPayment[]> => {
    const response = await api.get('/gym-payment', { params })
    const data = response.data
    if (Array.isArray(data)) return data
    if (data?.data && Array.isArray(data.data)) return data.data
    return []
  },

  getByGym: async (gymId: string): Promise<GymPayment[]> => {
    const response = await api.get(`/gym-payment/gym/${gymId}`)
    const data = response.data
    if (Array.isArray(data)) return data
    if (data?.data && Array.isArray(data.data)) return data.data
    return []
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

  confirm: async (id: string): Promise<GymPayment> => {
    const response = await api.patch<GymPayment>(`/gym-payment/${id}/confirm`)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/gym-payment/${id}`)
  },
}
