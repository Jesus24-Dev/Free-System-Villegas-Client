import api from './client'
import type { Athlete, AthleteProfile } from '@/types'

export const athleteApi = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<Athlete[]> => {
    const response = await api.get('/athlete', { params })
    const data = response.data
    if (Array.isArray(data)) return data
    if (data?.data && Array.isArray(data.data)) return data.data
    return []
  },

  getById: async (id: string): Promise<Athlete> => {
    const response = await api.get<Athlete>(`/athlete/${id}`)
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

  update: async (id: string, data: Partial<Athlete>): Promise<Athlete> => {
    const response = await api.patch<Athlete>(`/athlete/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/athlete/${id}`)
  },
}
