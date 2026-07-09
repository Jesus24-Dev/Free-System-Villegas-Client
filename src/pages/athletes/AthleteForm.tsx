import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { athleteApi } from '@/api/athletes'
import { gymApi } from '@/api/gyms'
import { personApi } from '@/api/persons'
import { getErrorMessage, getValidationErrors } from '@/api/client'
import { athleteSchema, type AthleteFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types'

export function AthleteForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditing = Boolean(id)
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({})

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AthleteFormData>({
    resolver: zodResolver(athleteSchema),
  })

  const { data: gyms } = useQuery({
    queryKey: ['gyms'],
    queryFn: () => gymApi.getAll({ limit: 100 }),
  })

  const { data: persons } = useQuery({
    queryKey: ['persons'],
    queryFn: () => personApi.getAll({ limit: 100 }),
  })

  const { data: athlete, isLoading: isLoadingAthlete } = useQuery({
    queryKey: ['athlete', id],
    queryFn: () => athleteApi.getById(id!),
    enabled: isEditing,
  })

  useEffect(() => {
    if (athlete) {
      reset({
        person_id: athlete.person_id,
        gym_id: athlete.gym_id,
      })
    }
  }, [athlete, reset])

  const handleServerError = (error: AxiosError<ApiError>) => {
    const validationErrors = getValidationErrors(error)
    if (Object.keys(validationErrors).length > 0) {
      setServerErrors(validationErrors)
    }
    toast.error(getErrorMessage(error))
  }

  const createMutation = useMutation({
    mutationFn: athleteApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] })
      toast.success('Atleta creado exitosamente')
      navigate('/athletes')
    },
    onError: handleServerError,
  })

  const updateMutation = useMutation({
    mutationFn: (data: AthleteFormData) => athleteApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] })
      toast.success('Atleta actualizado exitosamente')
      navigate('/athletes')
    },
    onError: handleServerError,
  })

  const onSubmit = (data: AthleteFormData) => {
    setServerErrors({})
    if (isEditing) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  if (isEditing && isLoadingAthlete) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{isEditing ? 'Editar Atleta' : 'Crear Atleta'}</h1>
        <p className="text-muted-foreground">
          {isEditing ? 'Actualiza la informacion del atleta' : 'Agrega un nuevo atleta'}
        </p>
      </div>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Informacion del Atleta</CardTitle>
            <CardDescription>Selecciona la persona y el gimnasio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="person_id">Persona</Label>
              <Select id="person_id" {...register('person_id')}>
                <option value="">Seleccionar persona</option>
                {persons?.data?.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name} {person.surname} - {person.dni}
                  </option>
                ))}
              </Select>
              {(errors.person_id || serverErrors.person_id || serverErrors.person) && (
                <p className="text-sm text-destructive">
                  {errors.person_id?.message || serverErrors.person_id || serverErrors.person}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gym_id">Gimnasio</Label>
              <Select id="gym_id" {...register('gym_id')}>
                <option value="">Seleccionar gimnasio</option>
                {gyms?.data?.map((gym) => (
                  <option key={gym.id} value={gym.id}>
                    {gym.name}
                  </option>
                ))}
              </Select>
              {(errors.gym_id || serverErrors.gym_id || serverErrors.gym) && (
                <p className="text-sm text-destructive">
                  {errors.gym_id?.message || serverErrors.gym_id || serverErrors.gym}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate('/athletes')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                isEditing ? 'Actualizar' : 'Crear'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
