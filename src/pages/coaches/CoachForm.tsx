import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { coachApi } from '@/api/coaches'
import { personApi } from '@/api/persons'
import { getErrorMessage } from '@/api/client'
import { coachSchema, type CoachFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

export function CoachForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditing = Boolean(id)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CoachFormData>({
    resolver: zodResolver(coachSchema),
  })

  const { data: persons } = useQuery({
    queryKey: ['persons'],
    queryFn: () => personApi.getAll({ limit: 100 }),
  })

  const { data: coach, isLoading: isLoadingCoach } = useQuery({
    queryKey: ['coach', id],
    queryFn: () => coachApi.getById(id!),
    enabled: isEditing,
  })

  useEffect(() => {
    if (coach) {
      reset({
        person_id: coach.person_id,
      })
    }
  }, [coach, reset])

  const createMutation = useMutation({
    mutationFn: coachApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaches'] })
      toast.success('Entrenador creado exitosamente')
      navigate('/coaches')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error as Parameters<typeof getErrorMessage>[0]))
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: CoachFormData) => coachApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaches'] })
      toast.success('Entrenador actualizado exitosamente')
      navigate('/coaches')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error as Parameters<typeof getErrorMessage>[0]))
    },
  })

  const onSubmit = (data: CoachFormData) => {
    if (isEditing) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  if (isEditing && isLoadingCoach) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{isEditing ? 'Editar Entrenador' : 'Crear Entrenador'}</h1>
        <p className="text-muted-foreground">
          {isEditing ? 'Actualiza la informacion del entrenador' : 'Agrega un nuevo entrenador'}
        </p>
      </div>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Informacion del Entrenador</CardTitle>
            <CardDescription>Selecciona la persona para el entrenador</CardDescription>
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
              {errors.person_id && (
                <p className="text-sm text-destructive">{errors.person_id.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate('/coaches')}>
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
