import api from './client'
import type { Coach } from '@/types'

export const coachApi = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<Coach[]> => {
    const response = await api.get<Coach[]>('/coach', { params })
    return response.data
  },

  getById: async (id: string): Promise<Coach> => {
    const response = await api.get<Coach>(`/coach/${id}`)
    return response.data
  },

  create: async (data: { person_id: string; gym_id: string }): Promise<Coach> => {
    const response = await api.post<Coach>('/coach', data)
    return response.data
  },

  update: async (id: string, data: Partial<Coach>): Promise<Coach> => {
    const response = await api.patch<Coach>(`/coach/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/coach/${id}`)
  },
}
