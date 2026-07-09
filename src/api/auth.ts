import api from './client'
import type { AuthDto, LoginDto, RegisterDto, ProfileDto } from '@/types'

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
}
