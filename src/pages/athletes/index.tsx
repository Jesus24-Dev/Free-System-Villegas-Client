import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { athleteApi } from '@/api/athletes'
import { coachApi } from '@/api/coaches'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore, extractRole } from '@/stores/authStore'
import type { Athlete } from '@/types'

export function AthletesPage() {
  const { user, gymId } = useAuthStore()
  const userRole = user ? extractRole(user) : ''
  const isCoach = userRole === 'COACH'

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
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadAthletes()
  }, [page, gymId])

  const loadAthletes = async () => {
    try {
      setLoading(true)
      if (isCoach && gymId) {
        const data = await athleteApi.getByGym(gymId)
        setAthletes(data)
        setTotalPages(Math.ceil(data.length / limit) || 1)
      } else {
        const response = await athleteApi.getAll({ page, limit })
        setAthletes(response.data)
        setTotalPages(response.meta?.totalPages ?? 1)
      }
    } catch (error) {
      toast.error('Error al cargar atletas')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (personId: string) => {
    setAthleteToDelete(personId)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!athleteToDelete) return
    try {
      await athleteApi.delete(athleteToDelete)
      toast.success('Atleta eliminado correctamente')
      loadAthletes()
    } catch (error) {
      toast.error('Error al eliminar atleta')
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

    if (!formData.dni || !formData.name || !formData.surname || !formData.birthday) {
      toast.error('Completa todos los campos requeridos')
      return
    }

    try {
      setSubmitting(true)
      await coachApi.registerAthlete(gymId, {
        dni: formData.dni,
        name: formData.name,
        surname: formData.surname,
        birthday: new Date(formData.birthday).toISOString(),
        gender: formData.gender,
      })
      toast.success('Atleta creado correctamente')
      setShowCreateModal(false)
      setFormData({ dni: '', name: '', surname: '', birthday: '', gender: 'MALE' })
      loadAthletes()
    } catch (error) {
      toast.error('Error al crear atleta')
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    { header: 'DNI', accessorKey: 'dni' as const },
    { header: 'Nombre', accessorKey: 'name' as const },
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
    { header: 'Cumpleaños', accessorKey: 'birthday' as const },
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
            <Link to={`/athletes/${row.original.person_id}/edit`}>Editar</Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteClick(row.original.person_id)}
            className="hover:opacity-80 transition-opacity"
          >
            Eliminar
          </Button>
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Atletas</h1>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="hover:opacity-90 transition-opacity"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Atleta
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar atleta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <DataTable columns={columns} data={filteredAthletes} loading={loading} />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {showCreateModal && (
        <dialog
          open
          className="backdrop:bg-black/50 rounded-lg border shadow-lg p-0 w-full max-w-lg"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false)
          }}
        >
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Crear Nuevo Atleta</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dni">DNI *</Label>
                <Input
                  id="dni"
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  placeholder="Ej: 12345678"
                />
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
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'MALE' | 'FEMALE' })}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  <option value="MALE">Masculino</option>
                  <option value="FEMALE">Femenino</option>
                </select>
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
                className="hover:opacity-90 transition-opacity"
              >
                {submitting ? 'Creando...' : 'Crear Atleta'}
              </Button>
            </div>
          </div>
        </dialog>
      )}

      <ConfirmDialog
        open={showDeleteDialog}
        title="Eliminar Atleta"
        description="¿Estas seguro de eliminar este atleta? Esta accion no se puede deshacer."
        confirmText="Eliminar"
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
