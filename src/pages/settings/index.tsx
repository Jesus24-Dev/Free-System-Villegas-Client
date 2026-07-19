import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { DniInput } from '@/components/ui/dni-input'
import { User, Mail, CreditCard, Calendar, Hash, Pencil, X, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { authApi, type UpdateProfileData } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import type { ProfileDto } from '@/types'

export function SettingsPage() {
  const [profile, setProfile] = useState<ProfileDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<UpdateProfileData>({})
  const [dniError, setDniError] = useState('')

  const { setUserFromProfile } = useAuthStore()

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await authApi.getProfile()
      setProfile(data)
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const handleEdit = () => {
    if (!profile) return
    setFormData({
      dni: profile.dni,
      name: profile.name,
      surname: profile.surname,
      birthday: profile.birthday ? profile.birthday.split('T')[0] : '',
      gender: profile.gender as 'MALE' | 'FEMALE',
    })
    setEditing(true)
  }

  const handleCancel = () => {
    setEditing(false)
    setFormData({})
    setDniError('')
  }

  const handleSave = async () => {
    if (!profile) return

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
      const updatedProfile = await authApi.updateProfile({
        dni: formData.dni,
        name: formData.name,
        surname: formData.surname,
        birthday: formData.birthday,
        gender: formData.gender,
      })
      setProfile(updatedProfile)
      setUserFromProfile(updatedProfile)
      setEditing(false)
      toast.success('Perfil actualizado correctamente')
    } catch {
      // handled by interceptor
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (date: string) => {
    const dateStr = date.split('T')[0]
    const [year, month, day] = dateStr.split('-')
    return `${parseInt(day)} de ${new Date(2000, parseInt(month) - 1).toLocaleDateString('es-VE', { month: 'long' })} de ${year}`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <p className="text-muted-foreground">Cargando informacion...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <p className="text-muted-foreground">No se pudo cargar tu perfil</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <p className="text-muted-foreground">Informacion de tu cuenta</p>
        </div>
        {!editing && (
          <Button onClick={handleEdit} variant="outline">
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Datos Personales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {editing ? (
              <>
                <div>
                  <Label htmlFor="dni">DNI *</Label>
                  <DniInput
                    id="dni"
                    value={formData.dni || ''}
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
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nombre"
                  />
                </div>
                <div>
                  <Label htmlFor="surname">Apellido *</Label>
                  <Input
                    id="surname"
                    value={formData.surname || ''}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    placeholder="Apellido"
                  />
                </div>
                <div>
                  <Label htmlFor="birthday">Fecha de Nacimiento *</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={formData.birthday || ''}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Genero *</Label>
                  <Select
                    id="gender"
                    value={formData.gender || 'MALE'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'MALE' | 'FEMALE' })}
                  >
                    <option value="MALE">Masculino</option>
                    <option value="FEMALE">Femenino</option>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre completo</p>
                    <p className="font-medium">{profile.name} {profile.surname}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Hash className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">DNI</p>
                    <p className="font-medium">{profile.dni}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de nacimiento</p>
                    <p className="font-medium">{formatDate(profile.birthday)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Genero</p>
                    <p className="font-medium">{profile.gender === 'MALE' ? 'Masculino' : 'Femenino'}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Datos de Cuenta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Correo electronico</p>
                <p className="font-medium">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Rol</p>
                <div className="flex gap-2 mt-1">
                  {profile.role.map((r) => (
                    <Badge key={r} variant="default">
                      {r === 'ADMIN' ? 'Administrador' : r === 'COACH' ? 'Entrenador' : 'Atleta'}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <Badge variant={profile.status ? 'default' : 'destructive'}>
                  {profile.status ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">ID de usuario</p>
                <p className="font-mono text-xs text-muted-foreground">{profile.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {editing && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={submitting}
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={submitting}
            className="hover:opacity-90 transition-opacity"
          >
            <Check className="mr-2 h-4 w-4" />
            {submitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      )}
    </div>
  )
}
