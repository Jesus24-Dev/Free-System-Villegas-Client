import api from './client'
import type { Person, PersonByDniResponse, CoachGymByDniResponse, AthleteGymByDniResponse } from '@/types'

export const personApi = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<Person[]> => {
    const response = await api.get('/person', { params })
    const data = response.data
    if (Array.isArray(data)) return data
    if (data?.data && Array.isArray(data.data)) return data.data
    return []
  },

  getById: async (id: string): Promise<Person> => {
    const response = await api.get<Person>(`/person/${id}`)
    return response.data
  },

  getByDni: async (dni: string): Promise<PersonByDniResponse | null> => {
    const response = await api.get<PersonByDniResponse | null>(`/person/dni/${dni}`)
    return response.data
  },

  getCoachGymByDni: async (dni: string): Promise<CoachGymByDniResponse> => {
    const response = await api.get<CoachGymByDniResponse>(`/person/dni/${dni}/coach-gym`)
    return response.data
  },

  getAthleteGymByDni: async (dni: string): Promise<AthleteGymByDniResponse> => {
    const response = await api.get<AthleteGymByDniResponse>(`/person/dni/${dni}/athlete-gym`)
    return response.data
  },

  create: async (data: Partial<Person>): Promise<Person> => {
    const response = await api.post<Person>('/person', data)
    return response.data
  },

  update: async (id: string, data: Partial<Person>): Promise<Person> => {
    const response = await api.patch<Person>(`/person/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/person/${id}`)
  },
}
