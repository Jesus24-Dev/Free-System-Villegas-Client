import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/auth'
import { getErrorMessage, getValidationErrors } from '@/api/client'
import { registerSchema, type RegisterFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types'

export function Register() {
  const [isLoading, setIsLoading] = useState(false)
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({})
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setServerErrors({})
    try {
      const response = await authApi.register(data)
      setAuth(response.access_token)
      toast.success('Registro exitoso')
      navigate('/dashboard')
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      const validationErrors = getValidationErrors(axiosError)
      if (Object.keys(validationErrors).length > 0) {
        setServerErrors(validationErrors)
      }
      const message = getErrorMessage(axiosError)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/10 via-background to-primary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">FS</span>
          </div>
          <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
          <CardDescription>Registrate para crear una nueva cuenta</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
              <Input id="email" type="email" placeholder="juan@ejemplo.com" {...register('email')} />
              {(errors.email || serverErrors.email) && (
                <p className="text-sm text-destructive">
                  {errors.email?.message || serverErrors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dni">DNI</Label>
              <Input id="dni" placeholder="V12345678" {...register('dni')} />
              {(errors.dni || serverErrors.dni) && (
                <p className="text-sm text-destructive">
                  {errors.dni?.message || serverErrors.dni}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
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
              <Input id="password" type="password" placeholder="Min. 8 caracteres" {...register('password')} />
              {(errors.password || serverErrors.password) && (
                <p className="text-sm text-destructive">
                  {errors.password?.message || serverErrors.password}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                'Registrarse'
              )}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Ya tienes una cuenta?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Inicia sesion
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
