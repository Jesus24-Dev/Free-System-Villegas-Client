import api from './client'
import type { Athlete, AthleteProfile, PaginatedResponse } from '@/types'

export const athleteApi = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Athlete>> => {
    const response = await api.get<PaginatedResponse<Athlete>>('/athlete', { params })
    return response.data
  },

  getByGym: async (gymId: string): Promise<Athlete[]> => {
    const response = await api.get(`/athlete/gym/${gymId}/athletes`)
    const data = response.data
    if (Array.isArray(data)) return data as Athlete[]
    if (data?.data && Array.isArray(data.data)) return data.data as Athlete[]
    return []
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

  unassignGym: async (athleteId: string): Promise<void> => {
    await api.patch(`/athlete/${athleteId}/unassign-gym`)
  },

  delete: async (personId: string): Promise<void> => {
    await api.delete(`/athlete/${personId}`)
  },
}
