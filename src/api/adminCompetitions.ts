import api from './client'
import type { Competition, CompetitionDivision, CompetitionStatus, CombatMode, WeightCategory } from '@/types'

export interface CreateCompetitionDto {
  name: string
  description?: string
  logo_url?: string
  location: string
  inscription_begin_at: string
  inscription_end_at: string
  status: CompetitionStatus
}

export interface UpdateCompetitionDto {
  name?: string
  description?: string
  logo_url?: string
  location?: string
  inscription_begin_at?: string
  inscription_end_at?: string
  status?: CompetitionStatus
}

export interface CreateCompetitionDivisionDto {
  competition_id: string
  mode: CombatMode
  category: WeightCategory
  gender: 'MALE' | 'FEMALE'
  weight: number
}

export interface UpdateCompetitionDivisionDto {
  competition_id?: string
  mode?: CombatMode
  category?: WeightCategory
  gender?: 'MALE' | 'FEMALE'
  weight?: number
}

export const adminCompetitionApi = {
  getAll: async (params?: { status?: CompetitionStatus }): Promise<Competition[]> => {
    const response = await api.get('/admin/competitions', { params })
    const data = response.data
    if (Array.isArray(data)) return data
    if (data?.data && Array.isArray(data.data)) return data.data
    return []
  },

  getById: async (id: string): Promise<Competition> => {
    const response = await api.get<Competition>(`/admin/competitions/${id}`)
    return response.data
  },

  create: async (data: CreateCompetitionDto): Promise<Competition> => {
    const response = await api.post<Competition>('/admin/competitions', data)
    return response.data
  },

  update: async (id: string, data: UpdateCompetitionDto): Promise<Competition> => {
    const response = await api.patch<Competition>(`/admin/competitions/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/competitions/${id}`)
  },
}

export const adminCompetitionDivisionApi = {
  getAll: async (): Promise<CompetitionDivision[]> => {
    const response = await api.get('/admin/competition-divisions')
    const data = response.data
    if (Array.isArray(data)) return data
    if (data?.data && Array.isArray(data.data)) return data.data
    return []
  },

  getById: async (id: string): Promise<CompetitionDivision> => {
    const response = await api.get<CompetitionDivision>(`/admin/competition-divisions/${id}`)
    return response.data
  },

  create: async (data: CreateCompetitionDivisionDto): Promise<CompetitionDivision> => {
    const response = await api.post<CompetitionDivision>('/admin/competition-divisions', data)
    return response.data
  },

  update: async (id: string, data: UpdateCompetitionDivisionDto): Promise<CompetitionDivision> => {
    const response = await api.patch<CompetitionDivision>(`/admin/competition-divisions/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/competition-divisions/${id}`)
  },
}