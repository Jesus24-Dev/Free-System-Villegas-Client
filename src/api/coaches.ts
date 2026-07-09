import api from './client'
import type { Coach, PaginatedResponse, PaginationParams } from '@/types'

export const coachApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Coach>> => {
    const response = await api.get<PaginatedResponse<Coach>>('/coach', { params })
    return response.data
  },

  getById: async (id: string): Promise<Coach> => {
    const response = await api.get<Coach>(`/coach/${id}`)
    return response.data
  },

  getByPersonId: async (personId: string): Promise<Coach> => {
    const response = await api.get<Coach>(`/coach/person/${personId}`)
    return response.data
  },

  create: async (data: Partial<Coach>): Promise<Coach> => {
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
