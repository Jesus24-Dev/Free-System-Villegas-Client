import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/auth'
import { personApi } from '@/api/persons'
import { userApi } from '@/api/users'
import { getValidationErrors } from '@/api/client'
import { registerSchema, type RegisterFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { DniInput } from '@/components/ui/dni-input'
import { Loader2, AlertCircle, UserPlus, Mail, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AxiosError } from 'axios'
import type { ApiError, PersonByDniResponse } from '@/types'

type Step = 'dni' | 'link-account' | 'full-register'

export function Register() {
  const [isLoading, setIsLoading] = useState(false)
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState<Step>('dni')
  const [dniValue, setDniValue] = useState('')
  const [personData, setPersonData] = useState<PersonByDniResponse | null>(null)
  const [accountExists, setAccountExists] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const setUserFromProfile = useAuthStore((s) => s.setUserFromProfile)

  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      dni: '',
      name: '',
      surname: '',
      birthday: '',
      gender: undefined,
      role: undefined,
      email: '',
      password: '',
    },
  })

  const handleDniVerification = async () => {
    if (!dniValue.trim()) {
      toast.error('Ingresa un DNI')
      return
    }

    try {
      setIsLoading(true)
      setServerErrors({})
      setAccountExists(false)
      const data = await personApi.getByDni(dniValue.trim())

      if (!data) {
        setStep('full-register')
        return
      }

      if (data.user_id) {
        setAccountExists(true)
        return
      }

      if (data.athlete_id) {
        setPersonData(data)
        setStep('link-account')
        return
      }

      setStep('full-register')
    } catch {
      setStep('full-register')
    } finally {
      setIsLoading(false)
    }
  }

  const onLinkAccountSubmit = async (data: { email: string; password: string }) => {
    if (!personData) return

    try {
      setIsLoading(true)
      setServerErrors({})
      await userApi.create({
        email: data.email,
        password: data.password,
        role: ['ATHLETE'],
        person_id: personData.id,
      })

      const authResponse = await authApi.login({
        email: data.email,
        password: data.password,
      })
      setAuth(authResponse.access_token)

      const profile = await authApi.getProfile()
      setUserFromProfile(profile)

      toast.success('Cuenta creada exitosamente')
      navigate('/dashboard')
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      const validationErrors = getValidationErrors(axiosError)
      if (Object.keys(validationErrors).length > 0) {
        setServerErrors(validationErrors)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const onFullRegisterSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true)
      setServerErrors({})
      const response = await authApi.register(data)
      setAuth(response.access_token)

      const profile = await authApi.getProfile()
      setUserFromProfile(profile)

      toast.success('Registro exitoso')
      navigate('/dashboard')
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      const validationErrors = getValidationErrors(axiosError)
      if (Object.keys(validationErrors).length > 0) {
        setServerErrors(validationErrors)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToDni = () => {
    setStep('dni')
    setPersonData(null)
    setAccountExists(false)
    setServerErrors({})
  }

  const renderDniStep = () => (
    <>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Ingresa tu cedula para verificar si ya tienes un registro en el sistema.</span>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dni">Cedula (DNI)</Label>
          <DniInput
            id="dni"
            value={dniValue}
            onChange={(value) => {
              setDniValue(value)
              setAccountExists(false)
            }}
            placeholder="V12345678"
            onKeyDown={(e) => e.key === 'Enter' && handleDniVerification()}
          />
        </div>
        {accountExists && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Ya existe una cuenta registrada con esa cedula. Si olvidaste tu contrasena, utiliza recuperar contrasena.</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button
          type="button"
          className="w-full"
          disabled={isLoading}
          onClick={handleDniVerification}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            'Continuar'
          )}
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Inicia sesion
          </Link>
        </p>
      </CardFooter>
    </>
  )

  const renderLinkAccountStep = () => (
    <>
      <CardContent className="space-y-4">
        <div className="border rounded-md p-3 bg-muted/30">
          <p className="text-sm font-medium">{personData?.name} {personData?.surname}</p>
          <p className="text-xs text-muted-foreground">DNI: {personData?.dni}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/10 p-3 rounded-md">
          <UserPlus className="h-4 w-4 shrink-0 text-secondary" />
          <span>Esta persona ya tiene un registro como atleta. Solo necesitas crear tu cuenta de acceso.</span>
        </div>
        <div className="space-y-2">
          <Label htmlFor="link-email">Correo electronico</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="link-email"
              type="email"
              placeholder="juan@ejemplo.com"
              className="pl-10"
              {...register('email')}
            />
          </div>
          {(errors.email || serverErrors.email) && (
            <p className="text-sm text-destructive">
              {errors.email?.message || serverErrors.email}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="link-password">Contrasena</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="link-password"
              type="password"
              placeholder="Min. 8 caracteres"
              className="pl-10"
              {...register('password')}
            />
          </div>
          {(errors.password || serverErrors.password) && (
            <p className="text-sm text-destructive">
              {errors.password?.message || serverErrors.password}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button
          type="button"
          className="w-full"
          disabled={isLoading}
          onClick={() => {
            const values = getValues()
            onLinkAccountSubmit({ email: values.email, password: values.password })
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            'Crear cuenta'
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={handleBackToDni}
        >
          Volver
        </Button>
      </CardFooter>
    </>
  )

  const renderFullRegisterStep = () => (
    <>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" placeholder="Juan" {...register('name')} />
            {(errors.name || serverErrors.name) && (
              <p className="text-sm text-destructive">
                {errors.name?.message || serverErrors.name}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="surname">Apellido</Label>
            <Input id="surname" placeholder="Perez" {...register('surname')} />
            {(errors.surname || serverErrors.surname) && (
              <p className="text-sm text-destructive">
                {errors.surname?.message || serverErrors.surname}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Correo electronico</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="email" type="email" placeholder="juan@ejemplo.com" className="pl-10" {...register('email')} />
          </div>
          {(errors.email || serverErrors.email) && (
            <p className="text-sm text-destructive">
              {errors.email?.message || serverErrors.email}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="dni">DNI</Label>
          <Controller
            control={control}
            name="dni"
            render={({ field }) => (
              <DniInput
                id="dni"
                value={field.value}
                onChange={field.onChange}
                placeholder="12345678"
              />
            )}
          />
          {(errors.dni || serverErrors.dni) && (
            <p className="text-sm text-destructive">
              {errors.dni?.message || serverErrors.dni}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="birthday">Fecha de nacimiento</Label>
            <Input id="birthday" type="date" {...register('birthday')} />
            {(errors.birthday || serverErrors.birthday) && (
              <p className="text-sm text-destructive">
                {errors.birthday?.message || serverErrors.birthday}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Genero</Label>
            <Select id="gender" {...register('gender')}>
              <option value="">Seleccionar</option>
              <option value="MALE">Masculino</option>
              <option value="FEMALE">Femenino</option>
            </Select>
            {(errors.gender || serverErrors.gender) && (
              <p className="text-sm text-destructive">
                {errors.gender?.message || serverErrors.gender}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Rol</Label>
          <Select id="role" {...register('role')}>
            <option value="">Seleccionar</option>
            <option value="COACH">Entrenador</option>
            <option value="ATHLETE">Atleta</option>
          </Select>
          {(errors.role || serverErrors.role) && (
            <p className="text-sm text-destructive">
              {errors.role?.message || serverErrors.role}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contrasena</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="password" type="password" placeholder="Min. 8 caracteres" className="pl-10" {...register('password')} />
          </div>
          {(errors.password || serverErrors.password) && (
            <p className="text-sm text-destructive">
              {errors.password?.message || serverErrors.password}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button
          type="button"
          className="w-full"
          disabled={isLoading}
          onClick={() => handleSubmit(onFullRegisterSubmit)()}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            'Registrarse'
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={handleBackToDni}
        >
          Volver
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Inicia sesion
          </Link>
        </p>
      </CardFooter>
    </>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/10 via-background to-primary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">FS</span>
          </div>
          <CardTitle className="text-2xl">
            {step === 'dni' && 'Crear Cuenta'}
            {step === 'link-account' && 'Vincular Cuenta'}
            {step === 'full-register' && 'Crear Cuenta'}
          </CardTitle>
          <CardDescription>
            {step === 'dni' && 'Ingresa tu cedula para verificar si ya tienes un registro'}
            {step === 'link-account' && 'Completa tu registro de acceso'}
            {step === 'full-register' && 'Registrate para crear una nueva cuenta'}
          </CardDescription>
        </CardHeader>
        <div className="px-6 pb-2">
          <div className="flex items-center gap-2">
            <div className={cn('flex items-center gap-2', step === 'dni' ? 'text-primary' : 'text-muted-foreground')}>
              <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium', step === 'dni' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>1</div>
              <span className="text-xs hidden sm:inline">Verificar</span>
            </div>
            <div className={cn('flex-1 h-px', step !== 'dni' ? 'bg-primary' : 'bg-muted')} />
            <div className={cn('flex items-center gap-2', step === 'link-account' ? 'text-primary' : 'text-muted-foreground')}>
              <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium', step === 'link-account' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>2</div>
              <span className="text-xs hidden sm:inline">Vincular</span>
            </div>
            <div className={cn('flex-1 h-px', step === 'full-register' ? 'bg-primary' : 'bg-muted')} />
            <div className={cn('flex items-center gap-2', step === 'full-register' ? 'text-primary' : 'text-muted-foreground')}>
              <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium', step === 'full-register' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>3</div>
              <span className="text-xs hidden sm:inline">Registro</span>
            </div>
          </div>
        </div>
        {step === 'dni' && renderDniStep()}
        {step === 'link-account' && renderLinkAccountStep()}
        {step === 'full-register' && renderFullRegisterStep()}
      </Card>
    </div>
  )
}
