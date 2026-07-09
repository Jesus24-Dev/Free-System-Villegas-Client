import api from './client'
import type { Gym, PaginatedResponse, PaginationParams } from '@/types'

export const gymApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Gym>> => {
    const response = await api.get<PaginatedResponse<Gym>>('/gym', { params })
    return response.data
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
