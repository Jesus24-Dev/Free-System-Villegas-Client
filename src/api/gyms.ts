import api from './client'
import type { Gym } from '@/types'

export const gymApi = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<Gym[]> => {
    const response = await api.get('/gym', { params })
    const data = response.data
    if (Array.isArray(data)) return data
    if (data?.data && Array.isArray(data.data)) return data.data
    return []
  },

  getById: async (id: string): Promise<Gym> => {
    const response = await api.get<Gym>(`/gym/${id}`)
    return response.data
  },

  create: async (data: Partial<Gym>): Promise<Gym> => {
    const response = await api.post<Gym>('/gym', data)
    return response.data
  },

  update: async (id: string, data: Partial<Gym>): Promise<Gym> => {
    const response = await api.patch<Gym>(`/gym/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/gym/${id}`)
  },
}
