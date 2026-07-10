import api from './client'
import type { Coach, CoachMeResponse } from '@/types'

interface RegisterAthletePayload {
  dni: string
  name: string
  surname: string
  birthday: string
  gender: 'MALE' | 'FEMALE'
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
