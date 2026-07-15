import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { adminCoachApi, type CoachWithPerson } from '@/api/admin'
import { gymApi } from '@/api/gyms'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import type { Gym } from '@/types'

export function EditCoachPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [coach, setCoach] = useState<CoachWithPerson | null>(null)
  const [gyms, setGyms] = useState<Gym[]>([])

  const [formData, setFormData] = useState({
    gym_id: '',
  })

  const loadData = async () => {
    if (!id) return
    try {
      const [coachData, gymsData] = await Promise.all([
        adminCoachApi.getById(id),
        gymApi.getAll(),
      ])
      setCoach(coachData)
      setGyms(gymsData)
      setFormData({
        gym_id: coachData.gym_id || '',
      })
    } catch {
      toast.error('Error al cargar datos del entrenador')
      navigate('/admin-coaches')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleSubmit = async () => {
    if (!id) return

    try {
      setSaving(true)
      await adminCoachApi.delete(id)
      toast.success('Entrenador eliminado correctamente')
      navigate('/admin-coaches')
    } catch {
      toast.error('Error al eliminar entrenador')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando entrenador...</p>
      </div>
    )
  }

  if (!coach) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Entrenador no encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Entrenador</h1>
        <p className="text-muted-foreground">
          Información del entrenador: {coach.person.name} {coach.person.surname}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Entrenador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>DNI</Label>
              <p className="text-sm">{coach.person.dni}</p>
            </div>
            <div>
              <Label>Nombre</Label>
              <p className="text-sm">{coach.person.name} {coach.person.surname}</p>
            </div>
          </div>

          <div>
            <Label htmlFor="gym_id">Gimnasio</Label>
            <Select
              id="gym_id"
              value={formData.gym_id}
              onChange={(e) => setFormData({ ...formData, gym_id: e.target.value })}
            >
              <option value="">Sin gimnasio</option>
              {gyms.map((gym) => (
                <option key={gym.id} value={gym.id}>
                  {gym.name}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => navigate('/admin-coaches')}
          disabled={saving}
        >
          Volver
        </Button>
        <Button
          variant="destructive"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? 'Eliminando...' : 'Eliminar Entrenador'}
        </Button>
      </div>
    </div>
  )
}