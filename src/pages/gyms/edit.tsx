import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gymApi } from '@/api/gyms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { VENEZUELAN_STATES } from '@/types'
import type { Gym } from '@/types'

export function EditGymPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isGymOwner, gymId } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [gym, setGym] = useState<Gym | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    state: '',
    monthly_payment: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadGym = async () => {
      if (!id) return

      try {
        setLoading(true)
        const data = await gymApi.getById(id)
        setGym(data)
        setFormData({
          name: data.name,
          address: data.address,
          state: data.state,
          monthly_payment: String(data.monthly_payment),
        })
      } catch {
        // handled by interceptor
      } finally {
        setLoading(false)
      }
    }

    loadGym()
  }, [id])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres'
    }
    if (!formData.address || formData.address.length < 5) {
      newErrors.address = 'La direccion debe tener al menos 5 caracteres'
    }
    if (!formData.state) {
      newErrors.state = 'El estado es requerido'
    }
    if (!formData.monthly_payment || parseFloat(formData.monthly_payment) < 1) {
      newErrors.monthly_payment = 'El pago mensual debe ser minimo 1'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!id || !gym) return

    if (!validate()) {
      toast.error('Completa todos los campos requeridos')
      return
    }

    try {
      setSubmitting(true)
      await gymApi.update(id, {
        name: formData.name,
        address: formData.address,
        state: formData.state as Gym['state'],
        monthly_payment: parseFloat(formData.monthly_payment),
      })
      toast.success('Gimnasio actualizado correctamente')
      navigate('/dashboard')
    } catch {
      // handled by interceptor
    } finally {
      setSubmitting(false)
    }
  }

  const canEdit = () => {
    if (!gym) return false
    return isGymOwner && gymId === id
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  if (!gym) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Gimnasio no encontrado</h1>
        </div>
      </div>
    )
  }

  if (!canEdit()) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Sin permisos</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              No tienes permisos para editar este gimnasio.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Gimnasio</h1>
          <p className="text-muted-foreground">{gym.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Gimnasio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre del gimnasio"
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="monthly_payment">Pago Mensual (USD) *</Label>
              <Input
                id="monthly_payment"
                type="number"
                step="0.01"
                min="1"
                value={formData.monthly_payment}
                onChange={(e) => setFormData({ ...formData, monthly_payment: e.target.value })}
                placeholder="Ej: 25"
              />
              {errors.monthly_payment && <p className="text-sm text-destructive mt-1">{errors.monthly_payment}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="address">Direccion *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Direccion del gimnasio"
            />
            {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
          </div>
          <div>
            <Label htmlFor="state">Estado *</Label>
            <Select
              id="state"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            >
              <option value="">Seleccionar estado</option>
              {VENEZUELAN_STATES.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </Select>
            {errors.state && <p className="text-sm text-destructive mt-1">{errors.state}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          disabled={submitting}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="hover:opacity-90 transition-opacity"
        >
          {submitting ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  )
}
