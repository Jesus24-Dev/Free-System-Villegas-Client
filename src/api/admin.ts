import api from './client'
import type { User, Person, Coach, Athlete, GymPayment } from '@/types'

export type { Person }

// ==================== Users ====================

export interface CreateUserDto {
  email: string
  password: string
  role: ('ATHLETE' | 'COACH')[]
  person_id: string
}

export interface UpdateUserDto {
  email?: string
  password?: string
  role?: ('ATHLETE' | 'COACH')[]
  person_id?: string
}

export interface PaginatedUsersResponse {
  data: User[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const adminUserApi = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<PaginatedUsersResponse> => {
    const response = await api.get('/admin/users/paginated', { params })
    return response.data
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/admin/users/${id}`)
    return response.data
  },

  create: async (data: CreateUserDto): Promise<User> => {
    const response = await api.post<User>('/admin/users', data)
    return response.data
  },

  update: async (id: string, data: UpdateUserDto): Promise<User> => {
    const response = await api.patch<User>(`/admin/users/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`)
  },

  toggleStatus: async (id: string): Promise<User> => {
    const response = await api.patch<User>(`/admin/users/${id}/status`)
    return response.data
  },
}

// ==================== Persons ====================

export interface CreatePersonDto {
  dni: string
  name: string
  surname: string
  birthday: string
  gender: 'MALE' | 'FEMALE'
  status?: boolean
}

export interface UpdatePersonDto {
  dni?: string
  name?: string
  surname?: string
  birthday?: string
  gender?: 'MALE' | 'FEMALE'
  status?: boolean
}

export interface PaginatedPersonsResponse {
  data: Person[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const adminPersonApi = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<PaginatedPersonsResponse> => {
    const response = await api.get('/admin/persons/paginated', { params })
    return response.data
  },

  getById: async (id: string): Promise<Person> => {
    const response = await api.get<Person>(`/admin/persons/${id}`)
    return response.data
  },

  create: async (data: CreatePersonDto): Promise<Person> => {
    const response = await api.post<Person>('/admin/persons', data)
    return response.data
  },

  update: async (id: string, data: UpdatePersonDto): Promise<Person> => {
    const response = await api.patch<Person>(`/admin/persons/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/persons/${id}`)
  },
}

// ==================== Coaches ====================

export interface CreateCoachDto {
  person_id: string
  gym_id?: string
}

export interface CoachWithPerson {
  id: string
  person_id: string
  gym_id?: string
  created_at: string
  updated_at: string
  person: Person
}

export interface PaginatedCoachesResponse {
  data: CoachWithPerson[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const adminCoachApi = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<PaginatedCoachesResponse> => {
    const response = await api.get('/admin/coaches/paginated', { params })
    return response.data
  },

  getById: async (id: string): Promise<CoachWithPerson> => {
    const response = await api.get<CoachWithPerson>(`/admin/coaches/${id}`)
    return response.data
  },

  create: async (data: CreateCoachDto): Promise<Coach> => {
    const response = await api.post<Coach>('/admin/coaches', data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/coaches/${id}`)
  },
}

// ==================== Athletes ====================

export interface CreateAthleteDto {
  person_id: string
  gym_id?: string
}

export interface AthleteWithPerson {
  id: string
  person_id: string
  gym_id?: string
  created_at: string
  updated_at: string
  person: Person
}

export interface PaginatedAthletesResponse {
  data: AthleteWithPerson[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const adminAthleteApi = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<PaginatedAthletesResponse> => {
    const response = await api.get('/admin/athletes/paginated', { params })
    return response.data
  },

  getById: async (id: string): Promise<AthleteWithPerson> => {
    const response = await api.get<AthleteWithPerson>(`/admin/athletes/${id}`)
    return response.data
  },

  create: async (data: CreateAthleteDto): Promise<Athlete> => {
    const response = await api.post<Athlete>('/admin/athletes', data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/athletes/${id}`)
  },
}

// ==================== Gyms ====================

export const adminGymApi = {
  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/gyms/${id}`)
  },
}

// ==================== Gym Payments ====================

export interface UpdateGymPaymentDto {
  day_payed?: string
  amount?: number
  evidence_url?: string
  payment_reference?: string
  athlete_id?: string
  gym_id?: string
}

export const adminGymPaymentApi = {
  update: async (id: string, data: UpdateGymPaymentDto): Promise<GymPayment> => {
    const response = await api.patch<GymPayment>(`/admin/gym-payments/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/gym-payments/${id}`)
  },
}