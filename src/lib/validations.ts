import { z } from 'zod'

const dniRegex = /^[VEve]\d{6,9}$/

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least 1 number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least 1 special character'),
  dni: z.string().regex(dniRegex, 'Invalid DNI format (e.g., V12345678)'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  surname: z.string().min(2, 'Surname must be at least 2 characters'),
  birthday: z.string().min(1, 'Birthday is required'),
  gender: z.enum(['M', 'F'], { required_error: 'Gender is required' }),
})

export const personSchema = z.object({
  dni: z.string().regex(dniRegex, 'Invalid DNI format (e.g., V12345678)'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  surname: z.string().min(2, 'Surname must be at least 2 characters'),
  birthday: z.string().min(1, 'Birthday is required'),
  gender: z.enum(['M', 'F'], { required_error: 'Gender is required' }),
  status: z.enum(['ACTIVE', 'INACTIVE'], { required_error: 'Status is required' }),
})

export const gymSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  coach_id: z.string().min(1, 'Coach is required'),
})

export const athleteSchema = z.object({
  person_id: z.string().min(1, 'Person is required'),
  gym_id: z.string().min(1, 'Gym is required'),
})

export const coachSchema = z.object({
  person_id: z.string().min(1, 'Person is required'),
})

export const competitionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(5, 'Location must be at least 5 characters'),
  status: z.enum(['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], {
    required_error: 'Status is required',
  }),
})

export const competitionDivisionSchema = z.object({
  competition_id: z.string().min(1, 'Competition is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  weight_min: z.number().min(0, 'Minimum weight must be positive'),
  weight_max: z.number().min(0, 'Maximum weight must be positive'),
  gender: z.enum(['M', 'F'], { required_error: 'Gender is required' }),
  mode: z.enum(['KUMITE', 'KATA', 'BOTH'], { required_error: 'Mode is required' }),
})

export const competitionRegistrationSchema = z.object({
  competition_id: z.string().min(1, 'Competition is required'),
  athlete_id: z.string().min(1, 'Athlete is required'),
  division_id: z.string().min(1, 'Division is required'),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED'], {
    required_error: 'Status is required',
  }),
})

export const gymPaymentSchema = z.object({
  gym_id: z.string().min(1, 'Gym is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(2, 'Description must be at least 2 characters'),
})

export const pagoMovilSchema = z.object({
  dni: z.string().regex(dniRegex, 'Invalid DNI format'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  bank: z.string().min(1, 'Bank is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  reference: z.string().min(1, 'Reference is required'),
  status: z.enum(['PENDING', 'CONFIRMED', 'REJECTED'], {
    required_error: 'Status is required',
  }),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type PersonFormData = z.infer<typeof personSchema>
export type GymFormData = z.infer<typeof gymSchema>
export type AthleteFormData = z.infer<typeof athleteSchema>
export type CoachFormData = z.infer<typeof coachSchema>
export type CompetitionFormData = z.infer<typeof competitionSchema>
export type CompetitionDivisionFormData = z.infer<typeof competitionDivisionSchema>
export type CompetitionRegistrationFormData = z.infer<typeof competitionRegistrationSchema>
export type GymPaymentFormData = z.infer<typeof gymPaymentSchema>
export type PagoMovilFormData = z.infer<typeof pagoMovilSchema>
