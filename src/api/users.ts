import api from './client'
import type { User, PaginatedResponse, PaginationParams } from '@/types'

export const userApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    const response = await api.get<PaginatedResponse<User>>('/user', { params })
    return response.data
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/user/${id}`)
    return response.data
  },

  create: async (data: Partial<User>): Promise<User> => {
    const response = await api.post<User>('/user', data)
    return response.data
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.patch<User>(`/user/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/user/${id}`)
  },
}
