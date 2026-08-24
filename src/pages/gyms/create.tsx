import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { gymApi } from '@/api/gyms'
import { coachApi } from '@/api/coaches'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { DniInput } from '@/components/ui/dni-input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { VENEZUELAN_STATES } from '@/types'
import type { CreatePagoMovilDto } from '@/types'

export function CreateGymPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [coachId, setCoachId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    state: '',
    monthly_payment: '',
  })

  const [paymentMethods, setPaymentMethods] = useState<CreatePagoMovilDto[]>([
    { bank_to_pay: '', dni: '', phone: '' },
  ])

  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadCoachData = async () => {
    try {
      const coachMe = await coachApi.getMe()
      setCoachId(coachMe.id)
    } catch {
      // handled by interceptor
    }
  }

  useEffect(() => {
    loadCoachData()
  }, [])

  const addPaymentMethod = () => {
    setPaymentMethods([...paymentMethods, { bank_to_pay: '', dni: '', phone: '' }])
  }

  const removePaymentMethod = (index: number) => {
    if (paymentMethods.length <= 1) return
    setPaymentMethods(paymentMethods.filter((_, i) => i !== index))
  }

  const updatePaymentMethod = (index: number, field: keyof CreatePagoMovilDto, value: string) => {
    const updated = [...paymentMethods]
    updated[index] = { ...updated[index], [field]: value }
    setPaymentMethods(updated)
  }

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
    if (!formData.monthly_payment || parseFloat(formData.monthly_payment) < 0) {
      newErrors.monthly_payment = 'El pago mensual debe ser positivo'
    }

    const hasValidPayment = paymentMethods.some(
      (pm) => pm.bank_to_pay && pm.dni && pm.phone
    )
    if (!hasValidPayment) {
      newErrors.payment_methods = 'Debe agregar al menos un metodo de pago movil completo'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!coachId) {
      toast.error('No se pudo identificar el coach')
      return
    }

    if (!validate()) {
      toast.error('Completa todos los campos requeridos')
      return
    }

    try {
      setLoading(true)
      await gymApi.create({
        name: formData.name,
        address: formData.address,
        state: formData.state as 'AMAZONAS' | 'ANZOATEGUI' | 'APURE' | 'ARAGUA' | 'BARINAS' | 'BOLIVAR' | 'CARABOBO' | 'COJEDES' | 'DELTA_AMACURO' | 'DISTRITO_CAPITAL' | 'FALCON' | 'GUARICO' | 'LARA' | 'LA_GUAIRA' | 'MERIDA' | 'MIRANDA' | 'MONAGAS' | 'NUEVA_ESPARTA' | 'PORTUGUESA' | 'SUCRE' | 'TACHIRA' | 'TRUJILLO' | 'YARACUY' | 'ZULIA',
        monthly_payment: parseFloat(formData.monthly_payment),
        owner_id: coachId,
        payment_methods: paymentMethods.filter((pm) => pm.bank_to_pay && pm.dni && pm.phone),
      })
      toast.success('Gimnasio creado correctamente')
      navigate('/dashboard')
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Registrar Gimnasio</h1>
        <p className="text-muted-foreground">
          Completa los datos para crear tu gimnasio
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Gimnasio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                value={formData.monthly_payment}
                onChange={(e) => setFormData({ ...formData, monthly_payment: e.target.value })}
                placeholder="Ej: 20"
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Metodos de Pago Movil</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addPaymentMethod}
          >
            <Plus className="mr-1 h-4 w-4" />
            Agregar
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.payment_methods && (
            <p className="text-sm text-destructive">{errors.payment_methods}</p>
          )}
          {paymentMethods.map((pm, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Metodo de Pago {index + 1}</h4>
                {paymentMethods.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removePaymentMethod(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`bank-${index}`}>Banco *</Label>
                  <Input
                    id={`bank-${index}`}
                    value={pm.bank_to_pay}
                    onChange={(e) => updatePaymentMethod(index, 'bank_to_pay', e.target.value)}
                    placeholder="Ej: 0102 - Banco de Venezuela"
                  />
                </div>
                <div>
                  <Label htmlFor={`dni-${index}`}>DNI *</Label>
                  <DniInput
                    id={`dni-${index}`}
                    value={pm.dni}
                    onChange={(value) => updatePaymentMethod(index, 'dni', value)}
                    placeholder="12345678"
                  />
                </div>
                <div>
                  <Label htmlFor={`phone-${index}`}>Telefono *</Label>
                  <Input
                    id={`phone-${index}`}
                    value={pm.phone}
                    onChange={(e) => updatePaymentMethod(index, 'phone', e.target.value)}
                    placeholder="Ej: 04141234567"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !coachId}
        >
          {loading ? 'Creando...' : 'Crear Gimnasio'}
        </Button>
      </div>
    </div>
  )
}
