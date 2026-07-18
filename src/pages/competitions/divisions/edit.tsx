import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { adminCompetitionDivisionApi, adminCompetitionApi, type UpdateCompetitionDivisionDto } from '@/api/adminCompetitions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { COMBAT_MODE_OPTIONS, WEIGHT_CATEGORY_OPTIONS } from '@/types'
import type { Competition, CompetitionDivision } from '@/types'

export function EditCompetitionDivisionPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [division, setDivision] = useState<CompetitionDivision | null>(null)
  const [competitions, setCompetitions] = useState<Competition[]>([])

  const [formData, setFormData] = useState<UpdateCompetitionDivisionDto>({
    competition_id: '',
    mode: 'POINT_FIGHTING',
    category: 'CH',
    gender: 'MALE',
    weight: 0,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadData = async () => {
    if (!id) return
    try {
      setLoading(true)
      const [divisionData, competitionsData] = await Promise.all([
        adminCompetitionDivisionApi.getById(id),
        adminCompetitionApi.getAll(),
      ])
      setDivision(divisionData)
      setCompetitions(competitionsData)
      setFormData({
        competition_id: divisionData.competition_id || '',
        mode: divisionData.mode,
        category: divisionData.category,
        gender: divisionData.gender,
        weight: divisionData.weight,
      })
    } catch {
      // handled by interceptor
      navigate('/competition-divisions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.competition_id) {
      newErrors.competition_id = 'Debe seleccionar una competencia'
    }
    if (!formData.weight || formData.weight <= 0) {
      newErrors.weight = 'El peso debe ser mayor a 0'
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
      await adminCompetitionDivisionApi.update(id, formData)
      toast.success('Division actualizada correctamente')
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
        <p className="text-muted-foreground">Cargando division...</p>
      </div>
    )
  }

  if (!division) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Division no encontrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Division</h1>
        <p className="text-muted-foreground">
          Modifica los datos de la division de competencia
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mode">Modo de Combate *</Label>
              <Select
                id="mode"
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value as UpdateCompetitionDivisionDto['mode'] })}
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
                onChange={(e) => setFormData({ ...formData, category: e.target.value as UpdateCompetitionDivisionDto['category'] })}
              >
                {WEIGHT_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  )
}