import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminCompetitionDivisionApi, adminCompetitionApi, type CreateCompetitionDivisionDto } from '@/api/adminCompetitions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { COMBAT_MODE_OPTIONS, WEIGHT_CATEGORY_OPTIONS } from '@/types'
import type { Competition } from '@/types'

export function CreateCompetitionDivisionPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [competitions, setCompetitions] = useState<Competition[]>([])

  const [formData, setFormData] = useState<CreateCompetitionDivisionDto>({
    competition_id: '',
    mode: 'POINT_FIGHTING',
    category: 'CH',
    gender: 'MALE',
    weight: 0,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadCompetitions = async () => {
    try {
      const data = await adminCompetitionApi.getAll()
      setCompetitions(data)
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCompetitions()
  }, [])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.competition_id) {
      newErrors.competition_id = 'Debe seleccionar una competencia'
    }
    if (formData.weight <= 0) {
      newErrors.weight = 'El peso debe ser mayor a 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Completa todos los campos requeridos')
      return
    }

    try {
      setSaving(true)
      await adminCompetitionDivisionApi.create(formData)
      toast.success('Division creada correctamente')
      navigate('/competition-divisions')
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando competencias...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Crear Division</h1>
        <p className="text-muted-foreground">
          Completa los datos para crear una nueva division de competencia
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la Division</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="competition_id">Competencia *</Label>
            <Select
              id="competition_id"
              value={formData.competition_id}
              onChange={(e) => setFormData({ ...formData, competition_id: e.target.value })}
            >
              <option value="">Seleccionar competencia</option>
              {competitions.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.name}
                </option>
              ))}
            </Select>
            {errors.competition_id && <p className="text-sm text-destructive mt-1">{errors.competition_id}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mode">Modo de Combate *</Label>
              <Select
                id="mode"
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value as CreateCompetitionDivisionDto['mode'] })}
              >
                {COMBAT_MODE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as CreateCompetitionDivisionDto['category'] })}
              >
                {WEIGHT_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gender">Genero *</Label>
              <Select
                id="gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'MALE' | 'FEMALE' })}
              >
                <option value="MALE">Masculino</option>
                <option value="FEMALE">Femenino</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="weight">Peso (kg) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                placeholder="Ej: 75"
              />
              {errors.weight && <p className="text-sm text-destructive mt-1">{errors.weight}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => navigate('/competition-divisions')}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? 'Creando...' : 'Crear Division'}
        </Button>
      </div>
    </div>
  )
}