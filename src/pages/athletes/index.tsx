import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { athleteApi } from '@/api/athletes'
import { coachApi } from '@/api/coaches'
import { adminAthleteApi } from '@/api/admin'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Dialog } from '@/components/ui/dialog'
import { DniInput } from '@/components/ui/dni-input'
import { Select } from '@/components/ui/select'
import { PersonSearch } from '@/components/PersonSearch'
import { Plus, Search, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore, extractRole } from '@/stores/authStore'
import type { Athlete } from '@/types'

export function AthletesPage() {
  const { user, gymId, isGymOwner } = useAuthStore()
  const userRole = user ? extractRole(user) : ''
  const isCoach = userRole === 'COACH'
  const isAdmin = userRole === 'ADMIN'

  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [athleteToDelete, setAthleteToDelete] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    dni: '',
    name: '',
    surname: '',
    birthday: '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
  })
  const [dniError, setDniError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadAthletes = async () => {
    try {
      setLoading(true)
      if (isCoach) {
        if (!gymId) {
          setAthletes([])
          setTotalPages(1)
          return
        }
        const data = await athleteApi.getByGym(gymId)
        setAthletes(data)
        setTotalPages(Math.ceil(data.length / limit) || 1)
      } else {
        const response = await athleteApi.getAll({ page, limit })
        setAthletes(response.data)
        setTotalPages(response.meta?.totalPages ?? 1)
      }
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAthletes()
  }, [page, gymId])

  const handleDeleteClick = (personId: string) => {
    setAthleteToDelete(personId)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!athleteToDelete) return
    try {
      if (isAdmin) {
        await adminAthleteApi.delete(athleteToDelete)
        toast.success('Atleta eliminado correctamente')
      } else {
        await athleteApi.unassignGym(athleteToDelete)
        toast.success('Atleta removido del gimnasio correctamente')
      }
      loadAthletes()
    } catch {
      // handled by interceptor
    } finally {
      setShowDeleteDialog(false)
      setAthleteToDelete(null)
    }
  }

  const handleCreateAthlete = async () => {
    if (!gymId) {
      toast.error('No se encontro el gimnasio')
      return
    }

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
      await coachApi.registerAthlete(gymId, {
        dni: formData.dni,
        name: formData.name,
        surname: formData.surname,
        birthday: formData.birthday,
        gender: formData.gender,
      })
      toast.success('Atleta creado correctamente')
      setShowCreateModal(false)
      setFormData({ dni: '', name: '', surname: '', birthday: '', gender: 'MALE' })
      loadAthletes()
    } catch {
      // handled by interceptor
    } finally {
      setSubmitting(false)
    }
  }

  const isCurrentUser = (athleteDni: string) => {
    return user?.dni === athleteDni
  }

  const columns = [
    { header: 'DNI', accessorKey: 'dni' as const },
    {
      header: 'Nombre',
      accessorKey: 'name' as const,
      cell: ({ row }: { row: { original: Athlete } }) => (
        <div className="flex items-center gap-2">
          <span>{row.original.name}</span>
          {isCurrentUser(row.original.dni) && (
            <Badge variant="secondary" className="text-xs">yo</Badge>
          )}
        </div>
      ),
    },
    { header: 'Apellido', accessorKey: 'surname' as const },
    {
      header: 'Genero',
      accessorKey: 'gender' as const,
      cell: ({ row }: { row: { original: Athlete } }) => (
        <Badge variant="outline">
          {row.original.gender === 'MALE' ? 'Masculino' : 'Femenino'}
        </Badge>
      ),
    },
    {
      header: 'Cumpleaños',
      accessorKey: 'birthday' as const,
      cell: ({ row }: { row: { original: Athlete } }) => {
        const dateStr = row.original.birthday.split('T')[0]
        const [year, month, day] = dateStr.split('-')
        return <span>{day}-{month}-{year}</span>
      },
    },
    {
      header: 'Estado',
      accessorKey: 'status' as const,
      cell: ({ row }: { row: { original: Athlete } }) => (
        <Badge variant={row.original.status ? 'default' : 'destructive'}>
          {row.original.status ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      accessorKey: 'id' as const,
      cell: ({ row }: { row: { original: Athlete } }) => (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Link to={`/profile/athlete/${row.original.id}`}>Perfil</Link>
          </Button>
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Link to={`/admin-athletes/${row.original.id}/edit`}>Admin</Link>
            </Button>
          )}
          {!isAdmin && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Link to={`/athletes/${row.original.person_id}/edit`}>Editar</Link>
            </Button>
          )}
          {isGymOwner && !isAdmin && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteClick(row.original.person_id)}
              className="hover:opacity-80 transition-opacity"
            >
              Expulsar
            </Button>
          )}
        </div>
      ),
    },
  ]

  const filteredAthletes = athletes.filter(
    (athlete) =>
      athlete.name.toLowerCase().includes(search.toLowerCase()) ||
      athlete.surname.toLowerCase().includes(search.toLowerCase()) ||
      athlete.dni.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Atletas</h1>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="hover:opacity-90 transition-opacity"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Atleta
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Search className="h-4 w-4" />
              Buscar Atleta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Buscar por nombre, apellido o DNI..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </CardContent>
        </Card>

        {isCoach && gymId && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Asignar Atleta Existente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PersonSearch gymId={gymId} mode="athlete" onAssignSuccess={loadAthletes} />
            </CardContent>
          </Card>
        )}
      </div>

      <DataTable columns={columns} data={filteredAthletes} loading={loading} />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)} className="confirm-dialog">
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Crear Nuevo Atleta</h2>
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
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateAthlete}
              disabled={submitting}
            >
              {submitting ? 'Creando...' : 'Crear Atleta'}
            </Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Expulsar Atleta"
        description="¿Estas seguro de expulsar este atleta del gimnasio? El atleta sera removido de tu gimnasio."
        confirmText="Expulsar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteDialog(false)
          setAthleteToDelete(null)
        }}
      />
    </div>
  )
}
