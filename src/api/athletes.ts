import api from './client'
import type { Athlete, PaginatedResponse, PaginationParams } from '@/types'

export const athleteApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Athlete>> => {
    const response = await api.get<PaginatedResponse<Athlete>>('/athlete', { params })
    return response.data
  },

  getById: async (id: string): Promise<Athlete> => {
    const response = await api.get<Athlete>(`/athlete/${id}`)
    return response.data
  },

  getProfile: async (id: string): Promise<Athlete> => {
    const response = await api.get<Athlete>(`/athlete/profile/${id}`)
    return response.data
  },

  getByPersonId: async (personId: string): Promise<Athlete> => {
    const response = await api.get<Athlete>(`/athlete/person/${personId}`)
    return response.data
  },

  create: async (data: Partial<Athlete>): Promise<Athlete> => {
    const response = await api.post<Athlete>('/athlete', data)
    return response.data
  },

  update: async (id: string, data: Partial<Athlete>): Promise<Athlete> => {
    const response = await api.patch<Athlete>(`/athlete/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/athlete/${id}`)
  },
}
