import api from './client'
import type { Coach, CoachMeResponse, CoachProfile } from '@/types'

interface RegisterAthletePayload {
  dni: string
  name: string
  surname: string
  birthday: string
  gender: 'MALE' | 'FEMALE'
}

interface AssignResponse {
  id: string
  person_id: string
  gym_id: string
  created_at: string
  updated_at: string
}

export const coachApi = {
  getMe: async (): Promise<CoachMeResponse> => {
    const response = await api.get<CoachMeResponse>('/coach/me')
    return response.data
  },

  registerAthlete: async (gymId: string, data: RegisterAthletePayload) => {
    const response = await api.post(`/coach/${gymId}/athlete`, data)
    return response.data
  },

  assignAthleteToGym: async (gymId: string, athleteId: string): Promise<AssignResponse> => {
    const response = await api.patch<AssignResponse>(`/coach/${gymId}/athlete/${athleteId}`)
    return response.data
  },

  assignCoachToGym: async (gymId: string, coachId: string): Promise<AssignResponse> => {
    const response = await api.patch<AssignResponse>(`/coach/${gymId}/coach/${coachId}`)
    return response.data
  },

  getByGym: async (gymId: string): Promise<Coach[]> => {
    const response = await api.get(`/coach/gym/${gymId}/coaches`)
    const data = response.data
    if (Array.isArray(data)) return data as Coach[]
    if (data?.data && Array.isArray(data.data)) return data.data as Coach[]
    return []
  },

  getAll: async (params?: { page?: number; limit?: number }): Promise<Coach[]> => {
    const response = await api.get('/coach', { params })
    const data = response.data
    if (Array.isArray(data)) return data
    if (data?.data && Array.isArray(data.data)) return data.data
    return []
  },

  getById: async (id: string): Promise<Coach> => {
    const response = await api.get<Coach>(`/coach/${id}`)
    return response.data
  },

  getProfile: async (id: string): Promise<CoachProfile> => {
    const response = await api.get<CoachProfile>(`/coach/profile/${id}`)
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

  unassignGym: async (coachId: string): Promise<void> => {
    await api.patch(`/coach/${coachId}/unassign-gym`)
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/coach/${id}`)
  },
}
