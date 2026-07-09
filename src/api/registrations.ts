import api from './client'
import type { CompetitionRegistration, PaginatedResponse, PaginationParams } from '@/types'

export const registrationApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<CompetitionRegistration>> => {
    const response = await api.get<PaginatedResponse<CompetitionRegistration>>('/competition-registration', { params })
    return response.data
  },

  getById: async (id: string): Promise<CompetitionRegistration> => {
    const response = await api.get<CompetitionRegistration>(`/competition-registration/${id}`)
    return response.data
  },

  create: async (data: Partial<CompetitionRegistration>): Promise<CompetitionRegistration> => {
    const response = await api.post<CompetitionRegistration>('/competition-registration', data)
    return response.data
  },

  update: async (id: string, data: Partial<CompetitionRegistration>): Promise<CompetitionRegistration> => {
    const response = await api.patch<CompetitionRegistration>(`/competition-registration/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/competition-registration/${id}`)
  },
}
