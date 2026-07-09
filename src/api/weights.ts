import api from './client'
import type { WeightCategory } from '@/types'

export const weightsApi = {
  getAll: async (): Promise<WeightCategory[]> => {
    const response = await api.get<WeightCategory[]>('/weights')
    return response.data
  },

  getMale: async (): Promise<WeightCategory[]> => {
    const response = await api.get<WeightCategory[]>('/weights/male')
    return response.data
  },

  getFemale: async (): Promise<WeightCategory[]> => {
    const response = await api.get<WeightCategory[]>('/weights/female')
    return response.data
  },
}
