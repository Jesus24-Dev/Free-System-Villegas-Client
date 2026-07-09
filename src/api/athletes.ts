import api from './client'
import type { Athlete, AthleteProfile, PaginatedResponse } from '@/types'

export const athleteApi = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Athlete>> => {
    const response = await api.get<PaginatedResponse<Athlete>>('/athlete', { params })
    return response.data
  },

  getById: async (personId: string): Promise<Athlete> => {
    const response = await api.get<Athlete>(`/athlete/${personId}`)
    return response.data
  },

  getProfile: async (id: string): Promise<AthleteProfile> => {
    const response = await api.get<AthleteProfile>(`/athlete/profile/${id}`)
    return response.data
  },

  create: async (data: { person_id: string; gym_id: string }): Promise<Athlete> => {
    const response = await api.post<Athlete>('/athlete', data)
    return response.data
  },

  update: async (personId: string, data: { person_id?: string; gym_id?: string }): Promise<Athlete> => {
    const response = await api.patch<Athlete>(`/athlete/${personId}`, data)
    return response.data
  },

  delete: async (personId: string): Promise<void> => {
    await api.delete(`/athlete/${personId}`)
  },
}
