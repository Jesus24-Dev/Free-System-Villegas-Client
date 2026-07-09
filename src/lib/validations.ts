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
  gender: z.enum(['M', 'F'], { message: 'El genero es requerido' }),
  role: z.enum(['COACH', 'ATHLETE'], { message: 'El rol es requerido' }),
})

export const personSchema = z.object({
  dni: z.string().regex(dniRegex, 'Formato de DNI invalido (ej: V12345678)'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  surname: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  birthday: z.string().min(1, 'La fecha de nacimiento es requerida'),
  gender: z.enum(['M', 'F'], { message: 'El genero es requerido' }),
  status: z.enum(['ACTIVE', 'INACTIVE'], { message: 'El estado es requerido' }),
})

export const gymSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  address: z.string().min(5, 'La direccion debe tener al menos 5 caracteres'),
  phone: z.string().min(10, 'El telefono debe tener al menos 10 caracteres'),
  coach_id: z.string().min(1, 'El entrenador es requerido'),
})

export const athleteSchema = z.object({
  person_id: z.string().min(1, 'La persona es requerida'),
  gym_id: z.string().min(1, 'El gimnasio es requerido'),
})

export const coachSchema = z.object({
  person_id: z.string().min(1, 'La persona es requerida'),
})

export const competitionSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  date: z.string().min(1, 'La fecha es requerida'),
  location: z.string().min(5, 'La ubicacion debe tener al menos 5 caracteres'),
  status: z.enum(['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], {
    message: 'El estado es requerido',
  }),
})

export const competitionDivisionSchema = z.object({
  competition_id: z.string().min(1, 'La competencia es requerida'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  weight_min: z.number().min(0, 'El peso minimo debe ser positivo'),
  weight_max: z.number().min(0, 'El peso maximo debe ser positivo'),
  gender: z.enum(['M', 'F'], { message: 'El genero es requerido' }),
  mode: z.enum(['KUMITE', 'KATA', 'BOTH'], { message: 'El modo es requerido' }),
})

export const competitionRegistrationSchema = z.object({
  competition_id: z.string().min(1, 'La competencia es requerida'),
  athlete_id: z.string().min(1, 'El atleta es requerido'),
  division_id: z.string().min(1, 'La division es requerida'),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED'], {
    message: 'El estado es requerido',
  }),
})

export const gymPaymentSchema = z.object({
  gym_id: z.string().min(1, 'El gimnasio es requerido'),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  date: z.string().min(1, 'La fecha es requerida'),
  description: z.string().min(2, 'La descripcion debe tener al menos 2 caracteres'),
})

export const pagoMovilSchema = z.object({
  dni: z.string().regex(dniRegex, 'Formato de DNI invalido'),
  phone: z.string().min(10, 'El telefono debe tener al menos 10 caracteres'),
  bank: z.string().min(1, 'El banco es requerido'),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  date: z.string().min(1, 'La fecha es requerida'),
  reference: z.string().min(1, 'La referencia es requerida'),
  status: z.enum(['PENDING', 'CONFIRMED', 'REJECTED'], {
    message: 'El estado es requerido',
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
