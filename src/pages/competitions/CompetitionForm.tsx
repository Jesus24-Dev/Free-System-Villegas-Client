import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { competitionApi } from '@/api/competitions'
import { getErrorMessage } from '@/api/client'
import { competitionSchema, type CompetitionFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

export function CompetitionForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditing = Boolean(id)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CompetitionFormData>({
    resolver: zodResolver(competitionSchema),
  })

  const { data: competition, isLoading: isLoadingCompetition } = useQuery({
    queryKey: ['competition', id],
    queryFn: () => competitionApi.getById(id!),
    enabled: isEditing,
  })

  useEffect(() => {
    if (competition) {
      reset({
        name: competition.name,
        date: competition.date.split('T')[0],
        location: competition.location,
        status: competition.status as CompetitionFormData['status'],
      })
    }
  }, [competition, reset])

  const createMutation = useMutation({
    mutationFn: competitionApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] })
      toast.success('Competencia creada exitosamente')
      navigate('/competitions')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error as Parameters<typeof getErrorMessage>[0]))
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: CompetitionFormData) => competitionApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] })
      toast.success('Competencia actualizada exitosamente')
      navigate('/competitions')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error as Parameters<typeof getErrorMessage>[0]))
    },
  })

  const onSubmit = (data: CompetitionFormData) => {
    if (isEditing) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  if (isEditing && isLoadingCompetition) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{isEditing ? 'Editar Competencia' : 'Crear Competencia'}</h1>
        <p className="text-muted-foreground">
          {isEditing ? 'Actualiza la informacion de la competencia' : 'Agrega una nueva competencia'}
        </p>
      </div>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Informacion de la Competencia</CardTitle>
            <CardDescription>Completa los datos de la competencia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" placeholder="Nombre de la competencia" {...register('name')} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" type="date" {...register('date')} />
                {errors.date && (
                  <p className="text-sm text-destructive">{errors.date.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select id="status" {...register('status')}>
                  <option value="">Seleccionar</option>
                  <option value="UPCOMING">Proxima</option>
                  <option value="IN_PROGRESS">En Curso</option>
                  <option value="COMPLETED">Finalizada</option>
                  <option value="CANCELLED">Cancelada</option>
                </Select>
                {errors.status && (
                  <p className="text-sm text-destructive">{errors.status.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ubicacion</Label>
              <Input id="location" placeholder="Ubicacion de la competencia" {...register('location')} />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate('/competitions')}>
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
