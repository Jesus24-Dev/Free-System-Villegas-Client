import { z } from 'zod'

const dniRegex = /^[VEve]\d{6,9}$/

export const loginSchema = z.object({
  email: z.string().email('Correo electronico invalido'),
  password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres'),
})

export const registerSchema = z.object({
  email: z.string().email('Correo electronico invalido'),
  password: z
    .string()
    .min(8, 'La contrasena debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contrasena debe contener al menos 1 letra mayuscula')
    .regex(/[0-9]/, 'La contrasena debe contener al menos 1 numero')
    .regex(/[^A-Za-z0-9]/, 'La contrasena debe contener al menos 1 caracter especial'),
  dni: z.string().regex(dniRegex, 'Formato de DNI invalido (ej: V12345678)'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  surname: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  birthday: z.string().min(1, 'La fecha de nacimiento es requerida'),
  gender: z.enum(['MALE', 'FEMALE'], { message: 'El genero es requerido' }),
  role: z.enum(['COACH', 'ATHLETE'], { message: 'El rol es requerido' }),
})

export const personSchema = z.object({
  dni: z.string().regex(dniRegex, 'Formato de DNI invalido (ej: V12345678)'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  surname: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  birthday: z.string().min(1, 'La fecha de nacimiento es requerida'),
  gender: z.enum(['MALE', 'FEMALE'], { message: 'El genero es requerido' }),
  status: z.boolean({ message: 'El estado es requerido' }),
})

export const gymSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  address: z.string().min(5, 'La direccion debe tener al menos 5 caracteres'),
  state: z.string().min(1, 'El estado es requerido'),
  monthly_payment: z.number().min(0, 'El pago mensual debe ser positivo'),
  phone: z.string().optional(),
})

export const athleteSchema = z.object({
  person_id: z.string().min(1, 'La persona es requerida'),
  gym_id: z.string().min(1, 'El gimnasio es requerido'),
})

export const coachSchema = z.object({
  person_id: z.string().min(1, 'La persona es requerida'),
  gym_id: z.string().min(1, 'El gimnasio es requerido'),
})

export const competitionSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  logo_url: z.string().url('URL invalida').optional().or(z.literal('')),
  location: z.string().min(5, 'La ubicacion debe tener al menos 5 caracteres'),
  inscription_begin_at: z.string().min(1, 'La fecha de inicio de inscripciones es requerida'),
  inscription_end_at: z.string().min(1, 'La fecha de fin de inscripciones es requerida'),
  status: z.enum(['DRAFT', 'OPEN', 'CLOSED', 'FINISHED'], {
    message: 'El estado es requerido',
  }),
})

export const competitionDivisionSchema = z.object({
  competition_id: z.string().min(1, 'La competencia es requerida'),
  gender: z.enum(['MALE', 'FEMALE'], { message: 'El genero es requerido' }),
  mode: z.enum(['POINT_FIGHTING', 'KICK_LIGHT', 'LIGHT_CONTACT', 'FULL_CONTACT', 'LOW_KICK', 'K1', 'BOXING'], {
    message: 'El modo es requerido',
  }),
  category: z.enum(['CH', 'YC', 'OC', 'J', 'S', 'M'], {
    message: 'La categoria es requerida',
  }),
  weight: z.number().min(0, 'El peso debe ser positivo'),
})

export const competitionRegistrationSchema = z.object({
  athlete_id: z.string().min(1, 'El atleta es requerido'),
  division_id: z.string().min(1, 'La division es requerida'),
})

export const gymPaymentSchema = z.object({
  day_payed: z.string().min(1, 'La fecha de pago es requerida'),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  athlete_id: z.string().min(1, 'El atleta es requerido'),
  gym_id: z.string().min(1, 'El gimnasio es requerido'),
  payment_reference: z.string().optional(),
  evidence_url: z.string().url('URL invalida').optional().or(z.literal('')),
})

export const pagoMovilSchema = z.object({
  bank_to_pay: z.string().min(1, 'El banco es requerido'),
  dni: z.string().regex(dniRegex, 'Formato de DNI invalido'),
  phone: z.string().min(10, 'El telefono debe tener al menos 10 caracteres'),
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
