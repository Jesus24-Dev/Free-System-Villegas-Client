import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { athleteApi } from '@/api/athletes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DniInput } from '@/components/ui/dni-input'
import { Select } from '@/components/ui/select'
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Athlete } from '@/types'

export function EditAthletePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [athlete, setAthlete] = useState<Athlete | null>(null)
  const [hasAccount, setHasAccount] = useState<boolean | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    dni: '',
    name: '',
    surname: '',
    birthday: '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
  })
  const [dniError, setDniError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      if (!id) return

      try {
        setLoading(true)
        const athleteData = await athleteApi.getById(id)
        setAthlete(athleteData)
        
        const dateStr = athleteData.birthday.split('T')[0]
        const [year, month, day] = dateStr.split('-')
        
        setFormData({
          dni: athleteData.dni,
          name: athleteData.name,
          surname: athleteData.surname,
          birthday: `${year}-${month}-${day}`,
          gender: athleteData.gender,
        })

        try {
          const accountData = await athleteApi.hasAccount(athleteData.person_id)
          setHasAccount(accountData.hasAccount)
        } catch {
          setHasAccount(false)
        }
      } catch {
        // handled by interceptor
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  const handleSubmit = async () => {
    if (!athlete) return

    const dniRegex = /^[VEJvej]\d{6,9}$/
    if (!formData.dni) {
      setDniError('El DNI es requerido')
      return
    }
    if (!dniRegex.test(formData.dni)) {
      setDniError('Formato de DNI invalido (ej: V12345678)')
      return
    }
    setDniError('')

    if (!formData.name || !formData.surname || !formData.birthday) {
      toast.error('Completa todos los campos requeridos')
      return
    }

    try {
      setSubmitting(true)
      await athleteApi.updatePerson(athlete.person_id, {
        dni: formData.dni,
        name: formData.name,
        surname: formData.surname,
        birthday: formData.birthday,
        gender: formData.gender,
      })
      toast.success('Datos del atleta actualizados correctamente')
      navigate('/athletes')
    } catch {
      // handled by interceptor
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (hasAccount === true) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Editar Atleta</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <AlertTriangle className="h-12 w-12 text-amber-500" />
              <div className="text-center">
                <h2 className="text-lg font-semibold">No se puede editar</h2>
                <p className="text-muted-foreground mt-2">
                  Este atleta tiene cuenta propia registrada. Los datos personales son gestionados directamente por el atleta.
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate(-1)}>
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!athlete) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Atleta no encontrado</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Editar Atleta</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos Personales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dni">DNI *</Label>
              <DniInput
                id="dni"
                value={formData.dni}
                onChange={(value) => {
                  setFormData({ ...formData, dni: value })
                  if (dniError) setDniError('')
                }}
                placeholder="12345678"
              />
              {dniError && (
                <p className="text-sm text-destructive mt-1">{dniError}</p>
              )}
            </div>
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre"
              />
            </div>
            <div>
              <Label htmlFor="surname">Apellido *</Label>
              <Input
                id="surname"
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                placeholder="Apellido"
              />
            </div>
            <div>
              <Label htmlFor="birthday">Fecha de Nacimiento *</Label>
              <Input
                id="birthday"
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              />
            </div>
            <div className="col-span-2">
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
          </div>

          <div className="flex justify-end gap-2 pt-4">
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
        </CardContent>
      </Card>
    </div>
  )
}
