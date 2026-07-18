import api from './client'
import type { AuthDto, LoginDto, RegisterDto, ProfileDto } from '@/types'

export interface UpdateProfileData {
  dni?: string
  name?: string
  surname?: string
  birthday?: string
  gender?: 'MALE' | 'FEMALE'
}

export const authApi = {
  login: async (data: LoginDto): Promise<AuthDto> => {
    const response = await api.post<AuthDto>('/auth/login', data)
    return response.data
  },

  register: async (data: RegisterDto): Promise<AuthDto> => {
    const response = await api.post<AuthDto>('/auth/register', data)
    return response.data
  },

  getProfile: async (): Promise<ProfileDto> => {
    const response = await api.get<ProfileDto>('/auth/profile')
    return response.data
  },

  updateProfile: async (data: UpdateProfileData): Promise<ProfileDto> => {
    const response = await api.patch<ProfileDto>('/auth/profile', data)
    return response.data
  },
}
