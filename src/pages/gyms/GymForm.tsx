import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { gymApi } from '@/api/gyms'
import { coachApi } from '@/api/coaches'
import { getErrorMessage } from '@/api/client'
import { gymSchema, type GymFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

export function GymForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditing = Boolean(id)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GymFormData>({
    resolver: zodResolver(gymSchema),
  })

  const { data: coaches } = useQuery({
    queryKey: ['coaches'],
    queryFn: () => coachApi.getAll({ limit: 100 }),
  })

  const { data: gym, isLoading: isLoadingGym } = useQuery({
    queryKey: ['gym', id],
    queryFn: () => gymApi.getById(id!),
    enabled: isEditing,
  })

  useEffect(() => {
    if (gym) {
      reset({
        name: gym.name,
        address: gym.address,
        phone: gym.phone,
        coach_id: gym.coach_id,
      })
    }
  }, [gym, reset])

  const createMutation = useMutation({
    mutationFn: gymApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gyms'] })
      toast.success('Gimnasio creado exitosamente')
      navigate('/gyms')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error as Parameters<typeof getErrorMessage>[0]))
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: GymFormData) => gymApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gyms'] })
      toast.success('Gimnasio actualizado exitosamente')
      navigate('/gyms')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error as Parameters<typeof getErrorMessage>[0]))
    },
  })

  const onSubmit = (data: GymFormData) => {
    if (isEditing) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  if (isEditing && isLoadingGym) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{isEditing ? 'Editar Gimnasio' : 'Crear Gimnasio'}</h1>
        <p className="text-muted-foreground">
          {isEditing ? 'Actualiza la informacion del gimnasio' : 'Agrega un nuevo gimnasio'}
        </p>
      </div>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Informacion del Gimnasio</CardTitle>
            <CardDescription>Completa los datos del gimnasio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" placeholder="Nombre del gimnasio" {...register('name')} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Direccion</Label>
              <Input id="address" placeholder="Direccion del gimnasio" {...register('address')} />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input id="phone" placeholder="Telefono del gimnasio" {...register('phone')} />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="coach_id">Entrenador</Label>
              <Select id="coach_id" {...register('coach_id')}>
                <option value="">Seleccionar entrenador</option>
                {coaches?.data?.map((coach) => (
                  <option key={coach.id} value={coach.id}>
                    {coach.person?.name} {coach.person?.surname}
                  </option>
                ))}
              </Select>
              {errors.coach_id && (
                <p className="text-sm text-destructive">{errors.coach_id.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate('/gyms')}>
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
