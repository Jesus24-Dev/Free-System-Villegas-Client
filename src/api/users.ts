import api from './client'
import type { User } from '@/types'

export const userApi = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<User[]> => {
    const response = await api.get<User[]>('/users', { params })
    return response.data
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`)
    return response.data
  },

  create: async (data: Partial<User>): Promise<User> => {
    const response = await api.post<User>('/users', data)
    return response.data
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`)
  },
}
