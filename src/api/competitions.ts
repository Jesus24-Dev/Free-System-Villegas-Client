import api from './client'
import type { Competition, PaginatedResponse, PaginationParams } from '@/types'

export const competitionApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Competition>> => {
    const response = await api.get<PaginatedResponse<Competition>>('/competition', { params })
    return response.data
  },

  getById: async (id: string): Promise<Competition> => {
    const response = await api.get<Competition>(`/competition/${id}`)
    return response.data
  },

  exportAthletes: async (competitionId: string, gymId: string): Promise<Blob> => {
    const response = await api.get(`/competition/${competitionId}/export/${gymId}`, {
      responseType: 'blob',
    })
    return response.data
  },

  create: async (data: Partial<Competition>): Promise<Competition> => {
    const response = await api.post<Competition>('/competition', data)
    return response.data
  },

  update: async (id: string, data: Partial<Competition>): Promise<Competition> => {
    const response = await api.patch<Competition>(`/competition/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/competition/${id}`)
  },
}
