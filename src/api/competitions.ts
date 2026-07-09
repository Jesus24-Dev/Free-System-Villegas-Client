import api from './client'
import type { Competition, CompetitionDivision, CompetitionRegistration } from '@/types'

export const competitionApi = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<Competition[]> => {
    const response = await api.get<Competition[]>('/competition', { params })
    return response.data
  },

  getById: async (id: string): Promise<Competition> => {
    const response = await api.get<Competition>(`/competition/${id}`)
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

export const competitionDivisionApi = {
  getAll: async (params?: { competition_id?: string }): Promise<CompetitionDivision[]> => {
    const response = await api.get<CompetitionDivision[]>('/competition/division', { params })
    return response.data
  },

  getById: async (id: string): Promise<CompetitionDivision> => {
    const response = await api.get<CompetitionDivision>(`/competition/division/${id}`)
    return response.data
  },

  create: async (data: Partial<CompetitionDivision>): Promise<CompetitionDivision> => {
    const response = await api.post<CompetitionDivision>('/competition/division', data)
    return response.data
  },

  update: async (id: string, data: Partial<CompetitionDivision>): Promise<CompetitionDivision> => {
    const response = await api.patch<CompetitionDivision>(`/competition/division/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/competition/division/${id}`)
  },
}

export const competitionRegistrationApi = {
  getAll: async (params?: { competition_id?: string; athlete_id?: string }): Promise<CompetitionRegistration[]> => {
    const response = await api.get<CompetitionRegistration[]>('/competition/registration', { params })
    return response.data
  },

  getById: async (id: string): Promise<CompetitionRegistration> => {
    const response = await api.get<CompetitionRegistration>(`/competition/registration/${id}`)
    return response.data
  },

  create: async (data: { athlete_id: string; division_id: string }): Promise<CompetitionRegistration> => {
    const response = await api.post<CompetitionRegistration>('/competition/registration', data)
    return response.data
  },

  update: async (id: string, data: Partial<CompetitionRegistration>): Promise<CompetitionRegistration> => {
    const response = await api.patch<CompetitionRegistration>(`/competition/registration/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/competition/registration/${id}`)
  },
}
