import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { adminCompetitionApi, type UpdateCompetitionDto } from '@/api/adminCompetitions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { COMPETITION_STATUS_OPTIONS } from '@/types'
import type { Competition } from '@/types'

export function EditCompetitionPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [competition, setCompetition] = useState<Competition | null>(null)

  const [formData, setFormData] = useState<UpdateCompetitionDto>({
    name: '',
    description: '',
    logo_url: '',
    location: '',
    inscription_begin_at: '',
    inscription_end_at: '',
    status: 'DRAFT',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadCompetition = async () => {
    if (!id) return
    try {
      setLoading(true)
      const data = await adminCompetitionApi.getById(id)
      setCompetition(data)
      setFormData({
        name: data.name,
        description: data.description || '',
        logo_url: data.logo_url || '',
        location: data.location,
        inscription_begin_at: data.inscription_begin_at.slice(0, 16),
        inscription_end_at: data.inscription_end_at.slice(0, 16),
        status: data.status,
      })
    } catch {
      toast.error('Error al cargar la competencia')
      navigate('/competitions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCompetition()
  }, [id])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres'
    }
    if (!formData.location) {
      newErrors.location = 'La ubicacion es requerida'
    }
    if (!formData.inscription_begin_at) {
      newErrors.inscription_begin_at = 'La fecha de inicio es requerida'
    }
    if (!formData.inscription_end_at) {
      newErrors.inscription_end_at = 'La fecha de fin es requerida'
    }
    if (formData.inscription_begin_at && formData.inscription_end_at) {
      if (new Date(formData.inscription_begin_at) >= new Date(formData.inscription_end_at)) {
        newErrors.inscription_end_at = 'La fecha de fin debe ser posterior a la de inicio'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!id || !validate()) {
      toast.error('Completa todos los campos requeridos')
      return
    }

    try {
      setSaving(true)
      await adminCompetitionApi.update(id, formData)
      toast.success('Competencia actualizada correctamente')
      navigate('/competitions')
    } catch {
      toast.error('Error al actualizar la competencia')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando competencia...</p>
      </div>
    )
  }

  if (!competition) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Competencia no encontrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Competencia</h1>
        <p className="text-muted-foreground">
          Modifica los datos de la competencia
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la Competencia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre de la competencia"
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="location">Ubicacion *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ubicacion de la competencia"
              />
              {errors.location && <p className="text-sm text-destructive mt-1">{errors.location}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="description">Descripcion</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripcion de la competencia"
            />
          </div>
          <div>
            <Label htmlFor="logo_url">URL del Logo</Label>
            <Input
              id="logo_url"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              placeholder="https://ejemplo.com/logo.png"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="inscription_begin_at">Inicio Inscripciones *</Label>
              <Input
                id="inscription_begin_at"
                type="datetime-local"
                value={formData.inscription_begin_at}
                onChange={(e) => setFormData({ ...formData, inscription_begin_at: e.target.value })}
              />
              {errors.inscription_begin_at && <p className="text-sm text-destructive mt-1">{errors.inscription_begin_at}</p>}
            </div>
            <div>
              <Label htmlFor="inscription_end_at">Fin Inscripciones *</Label>
              <Input
                id="inscription_end_at"
                type="datetime-local"
                value={formData.inscription_end_at}
                onChange={(e) => setFormData({ ...formData, inscription_end_at: e.target.value })}
              />
              {errors.inscription_end_at && <p className="text-sm text-destructive mt-1">{errors.inscription_end_at}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="status">Estado *</Label>
            <Select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as UpdateCompetitionDto['status'] })}
            >
              {COMPETITION_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => navigate('/competitions')}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  )
}