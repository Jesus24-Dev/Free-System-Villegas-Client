// Auth
export interface JwtPayload {
  sub: string
  email: string
  role: 'ADMIN' | 'COACH' | 'ATHLETE' | string
  roles?: string[]
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
  gender: 'MALE' | 'FEMALE'
  role: 'COACH' | 'ATHLETE'
}

export interface ProfileDto {
  id: string
  email: string
  role: string[]
  dni: string
  name: string
  surname: string
  birthday: string
  gender: string
  status: boolean
}

// User
export interface User {
  id: string
  email: string
  role: string
  created_at: string
  updated_at: string
}

// Person
export interface Person {
  id: string
  dni: string
  name: string
  surname: string
  gender: 'MALE' | 'FEMALE'
  birthday: string
  status: boolean
  created_at: string
  updated_at: string
}

// Coach
export interface Coach {
  id: string
  dni: string
  name: string
  surname: string
  gender: 'MALE' | 'FEMALE'
  birthday: string
  status: boolean
  person_id?: string
  gym_id?: string
  created_at: string
  updated_at: string
}

// Athlete
export interface Athlete {
  id: string
  person_id: string
  dni: string
  name: string
  surname: string
  gender: 'MALE' | 'FEMALE'
  birthday: string
  status: boolean
  gym_id?: string
  created_at?: string
  updated_at?: string
}

// Athlete Profile (from /athlete/profile/:id)
export interface AthleteProfile {
  id: string
  personal: {
    dni: string
    name: string
    surname: string
    birthday: string
    gender: 'MALE' | 'FEMALE'
  }
  gym: {
    name: string
    address: string
    state: string
    monthly_payment: number
  }
  payments: Array<{
    date: string
    amount: number
    reference: string
    confirmed: boolean
  }>
  competitions: Array<{
    competition: string
    status: string
    division: {
      mode: string
      category: string
      weight: number
    }
  }>
}

// Gym
export interface Gym {
  id: string
  name: string
  address: string
  state: VenezuelanState
  monthly_payment: number
  coach_id?: string
  phone?: string
  owner?: GymOwner
  created_at: string
  updated_at: string
}

export interface GymOwner {
  id: string
  name: string
  surname: string
  status: boolean
}

export interface GymDetails {
  id: string
  name: string
  address: string
  state: VenezuelanState
  athletes: GymAthleteDetails[]
  coaches: GymCoachDetails[]
  pago_movil: GymPagoMovilDetails[]
}

export interface GymAthleteDetails {
  id: string
  person: GymPersonDetails
}

export interface GymCoachDetails {
  id: string
  person: GymPersonDetails
}

export interface GymPersonDetails {
  dni: string
  name: string
  surname: string
  gender: 'MALE' | 'FEMALE'
  status: boolean
}

export interface GymPagoMovilDetails {
  bank_to_pay: string
  dni: string
  phone: string
}

export type VenezuelanState =
  | 'AMAZONAS'
  | 'ANZOATEGUI'
  | 'APURE'
  | 'ARAGUA'
  | 'BARINAS'
  | 'BOLIVAR'
  | 'CARABOBO'
  | 'COJEDES'
  | 'DELTA_AMACURO'
  | 'DISTRITO_CAPITAL'
  | 'FALCON'
  | 'GUARICO'
  | 'LARA'
  | 'LA_GUAIRA'
  | 'MERIDA'
  | 'MIRANDA'
  | 'MONAGAS'
  | 'NUEVA_ESPARTA'
  | 'PORTUGUESA'
  | 'SUCRE'
  | 'TACHIRA'
  | 'TRUJILLO'
  | 'YARACUY'
  | 'ZULIA'

// Competition
export interface Competition {
  id: string
  name: string
  description?: string
  logo_url?: string
  location: string
  inscription_begin_at: string
  inscription_end_at: string
  status: CompetitionStatus
  created_at: string
  updated_at: string
}

export type CompetitionStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'FINISHED'

// Competition Division
export interface CompetitionDivision {
  id: string
  gender: 'MALE' | 'FEMALE'
  mode: CombatMode
  category: WeightCategory
  weight: number
  competition_id?: string
  competition?: Competition
  created_at?: string
  updated_at?: string
}

export type CombatMode =
  | 'POINT_FIGHTING'
  | 'KICK_LIGHT'
  | 'LIGHT_CONTACT'
  | 'FULL_CONTACT'
  | 'LOW_KICK'
  | 'K1'
  | 'BOXING'

export type WeightCategory = 'CH' | 'YC' | 'OC' | 'J' | 'S' | 'M'

// Competition Registration
export interface CompetitionRegistration {
  id: string
  athlete_id: string
  division_id: string
  athlete?: RegisteredAthlete
  division?: CompetitionDivision
  created_at?: string
  updated_at?: string
}

export interface RegisteredAthlete {
  id: string
  name: string
  surname: string
  gender: 'MALE' | 'FEMALE'
}

// Gym Payment
export interface GymPayment {
  id: string
  day_payed: string
  amount: number
  evidence_url?: string
  payment_reference?: string
  athlete_id: string
  gym_id: string
  created_at: string
  updated_at: string
}

// Pago Movil
export interface PagoMovil {
  id: string
  bank_to_pay: string
  dni: string
  phone: string
  created_at?: string
  updated_at?: string
}

// Weight Category
export interface WeightCategoryResponse {
  id?: string
  name?: string
  weight_min?: number
  weight_max?: number
  gender?: string
  mode?: CombatMode
  category?: WeightCategory
  weight?: number
}

// Pagination (if needed)
export interface PaginatedResponse<T> {
  data: T[]
  meta?: {
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

// Gender options for forms
export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Masculino' },
  { value: 'FEMALE', label: 'Femenino' },
] as const

// Competition status options for forms
export const COMPETITION_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'OPEN', label: 'Abierta' },
  { value: 'CLOSED', label: 'Cerrada' },
  { value: 'FINISHED', label: 'Finalizada' },
] as const

// Combat mode options for forms
export const COMBAT_MODE_OPTIONS = [
  { value: 'POINT_FIGHTING', label: 'Point Fighting' },
  { value: 'KICK_LIGHT', label: 'Kick Light' },
  { value: 'LIGHT_CONTACT', label: 'Light Contact' },
  { value: 'FULL_CONTACT', label: 'Full Contact' },
  { value: 'LOW_KICK', label: 'Low Kick' },
  { value: 'K1', label: 'K1' },
  { value: 'BOXING', label: 'Boxing' },
] as const

// Weight category options for forms
export const WEIGHT_CATEGORY_OPTIONS = [
  { value: 'CH', label: 'Children' },
  { value: 'YC', label: 'Youth' },
  { value: 'OC', label: 'Older Children' },
  { value: 'J', label: 'Junior' },
  { value: 'S', label: 'Senior' },
  { value: 'M', label: 'Master' },
] as const

// Venezuelan states for forms
export const VENEZUELAN_STATES = [
  { value: 'AMAZONAS', label: 'Amazonas' },
  { value: 'ANZOATEGUI', label: 'Anzoategui' },
  { value: 'APURE', label: 'Apure' },
  { value: 'ARAGUA', label: 'Aragua' },
  { value: 'BARINAS', label: 'Barinas' },
  { value: 'BOLIVAR', label: 'Bolivar' },
  { value: 'CARABOBO', label: 'Carabobo' },
  { value: 'COJEDES', label: 'Cojedes' },
  { value: 'DELTA_AMACURO', label: 'Delta Amacuro' },
  { value: 'DISTRITO_CAPITAL', label: 'Distrito Capital' },
  { value: 'FALCON', label: 'Falcon' },
  { value: 'GUARICO', label: 'Guarico' },
  { value: 'LARA', label: 'Lara' },
  { value: 'LA_GUAIRA', label: 'La Guaira' },
  { value: 'MERIDA', label: 'Merida' },
  { value: 'MIRANDA', label: 'Miranda' },
  { value: 'MONAGAS', label: 'Monagas' },
  { value: 'NUEVA_ESPARTA', label: 'Nueva Esparta' },
  { value: 'PORTUGUESA', label: 'Portuguesa' },
  { value: 'SUCRE', label: 'Sucre' },
  { value: 'TACHIRA', label: 'Tachira' },
  { value: 'TRUJILLO', label: 'Trujillo' },
  { value: 'YARACUY', label: 'Yaracuy' },
  { value: 'ZULIA', label: 'Zulia' },
] as const
