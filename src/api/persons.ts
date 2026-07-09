import api from './client'
import type { Person } from '@/types'

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

  getByDni: async (dni: string): Promise<Person> => {
    const response = await api.get<Person>(`/person/dni/${dni}`)
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
