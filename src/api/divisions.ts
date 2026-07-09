import api from './client'
import type { CompetitionDivision, PaginatedResponse, PaginationParams } from '@/types'

export const divisionApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<CompetitionDivision>> => {
    const response = await api.get<PaginatedResponse<CompetitionDivision>>('/competition-division', { params })
    return response.data
  },

  getById: async (id: string): Promise<CompetitionDivision> => {
    const response = await api.get<CompetitionDivision>(`/competition-division/${id}`)
    return response.data
  },

  create: async (data: Partial<CompetitionDivision>): Promise<CompetitionDivision> => {
    const response = await api.post<CompetitionDivision>('/competition-division', data)
    return response.data
  },

  update: async (id: string, data: Partial<CompetitionDivision>): Promise<CompetitionDivision> => {
    const response = await api.patch<CompetitionDivision>(`/competition-division/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/competition-division/${id}`)
  },
}
