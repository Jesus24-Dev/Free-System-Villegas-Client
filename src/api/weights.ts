import api from './client'
import type { WeightCategoryResponse } from '@/types'

export const weightApi = {
  getByCategory: async (category: string, gender: string): Promise<WeightCategoryResponse[]> => {
    const response = await api.get<WeightCategoryResponse[]>('/gym/weights', {
      params: { category, gender },
    })
    return response.data
  },

  getChYcByGender: async (gender: string): Promise<WeightCategoryResponse[]> => {
    const response = await api.get<WeightCategoryResponse[]>('/gym/weights/ch-yc', {
      params: { gender },
    })
    return response.data
  },

  getOcSByGender: async (gender: string): Promise<WeightCategoryResponse[]> => {
    const response = await api.get<WeightCategoryResponse[]>('/gym/weights/oc-s', {
      params: { gender },
    })
    return response.data
  },

  getMByGender: async (gender: string): Promise<WeightCategoryResponse[]> => {
    const response = await api.get<WeightCategoryResponse[]>('/gym/weights/m', {
      params: { gender },
    })
    return response.data
  },
}
