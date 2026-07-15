import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { adminAthleteApi, type AthleteWithPerson } from '@/api/admin'
import { gymApi } from '@/api/gyms'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import type { Gym } from '@/types'

export function EditAthletePage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [athlete, setAthlete] = useState<AthleteWithPerson | null>(null)
  const [gyms, setGyms] = useState<Gym[]>([])

  const loadData = async () => {
    if (!id) return
    try {
      const [athleteData, gymsData] = await Promise.all([
        adminAthleteApi.getById(id),
        gymApi.getAll(),
      ])
      setAthlete(athleteData)
      setGyms(gymsData)
    } catch {
      toast.error('Error al cargar datos del atleta')
      navigate('/admin-athletes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleDelete = async () => {
    if (!id) return

    try {
      setSaving(true)
      await adminAthleteApi.delete(id)
      toast.success('Atleta eliminado correctamente')
      navigate('/admin-athletes')
    } catch {
      toast.error('Error al eliminar atleta')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando atleta...</p>
      </div>
    )
  }

  if (!athlete) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Atleta no encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Atleta</h1>
        <p className="text-muted-foreground">
          Información del atleta: {athlete.person.name} {athlete.person.surname}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Atleta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>DNI</Label>
              <p className="text-sm">{athlete.person.dni}</p>
            </div>
            <div>
              <Label>Nombre</Label>
              <p className="text-sm">{athlete.person.name} {athlete.person.surname}</p>
            </div>
          </div>
          <div>
            <Label>Gimnasio Actual</Label>
            <p className="text-sm">
              {gyms.find(g => g.id === athlete.gym_id)?.name || 'Sin gimnasio'}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => navigate('/admin-athletes')}
          disabled={saving}
        >
          Volver
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={saving}
        >
          {saving ? 'Eliminando...' : 'Eliminar Atleta'}
        </Button>
      </div>
    </div>
  )
}