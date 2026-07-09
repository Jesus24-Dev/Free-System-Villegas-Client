// Auth
export interface JwtPayload {
  sub: string
  email: string
  role: 'ADMIN' | 'COACH' | 'ATHLETE'
}

export interface AuthDto {
  access_token: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  password: string
  dni: string
  name: string
  surname: string
  birthday: string
  gender: string
  role: 'COACH' | 'ATHLETE'
}

export interface ProfileDto {
  id: string
  email: string
  role: string
  dni: string
  name: string
  surname: string
  birthday: string
  gender: string
  status: string
}

// User
export interface User {
  id: string
  email: string
  role: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  person?: Person
}

// Person
export interface Person {
  id: string
  dni: string
  name: string
  surname: string
  birthday: string
  gender: string
  status: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Coach
export interface Coach {
  id: string
  person_id: string
  person: Person
  gym?: Gym
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Athlete
export interface Athlete {
  id: string
  person_id: string
  gym_id: string
  person: Person
  gym: Gym
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Gym
export interface Gym {
  id: string
  name: string
  address: string
  phone: string
  coach_id: string
  coach?: Coach
  athletes?: Athlete[]
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Competition
export interface Competition {
  id: string
  name: string
  date: string
  location: string
  status: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  divisions?: CompetitionDivision[]
}

// Competition Division
export interface CompetitionDivision {
  id: string
  competition_id: string
  name: string
  weight_min: number
  weight_max: number
  gender: string
  mode: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Competition Registration
export interface CompetitionRegistration {
  id: string
  competition_id: string
  athlete_id: string
  division_id: string
  status: string
  athlete?: Athlete
  division?: CompetitionDivision
  competition?: Competition
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Gym Payment
export interface GymPayment {
  id: string
  gym_id: string
  amount: number
  date: string
  description: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Pago Movil
export interface PagoMovil {
  id: string
  dni: string
  phone: string
  bank: string
  amount: number
  date: string
  reference: string
  status: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Weight Category
export interface WeightCategory {
  id: string
  name: string
  weight_min: number
  weight_max: number
  gender: string
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// API Error
export interface ApiError {
  success: boolean
  statusCode: number
  timestamp: string
  path: string
  message: string | string[]
}

// Pagination params
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
}
