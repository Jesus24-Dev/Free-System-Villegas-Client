import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminCoachApi, type CoachWithPerson } from '@/api/admin'
import { gymApi } from '@/api/gyms'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import type { Gym } from '@/types'

export function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<CoachWithPerson[]>([])
  const [gyms, setGyms] = useState<Gym[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [coachToDelete, setCoachToDelete] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const [coachesResponse, gymsData] = await Promise.all([
        adminCoachApi.getAll({ page, limit }),
        gymApi.getAll(),
      ])
      setCoaches(coachesResponse.data)
      setTotalPages(coachesResponse.totalPages)
      setGyms(gymsData)
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page])

  const handleDeleteClick = (id: string) => {
    setCoachToDelete(id)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!coachToDelete) return
    try {
      await adminCoachApi.delete(coachToDelete)
      toast.success('Entrenador eliminado correctamente')
      loadData()
    } catch {
      // handled by interceptor
    } finally {
      setShowDeleteDialog(false)
      setCoachToDelete(null)
    }
  }

  const getGymName = (gymId?: string) => {
    if (!gymId) return 'Sin gimnasio'
    const gym = gyms.find(g => g.id === gymId)
    return gym?.name || 'Desconocido'
  }

  const columns = [
    {
      header: 'DNI',
      accessorKey: 'person.dni' as const,
      cell: ({ row }: { row: { original: CoachWithPerson } }) => (
        <span>{row.original.person.dni}</span>
      ),
    },
    {
      header: 'Nombre',
      accessorKey: 'person.name' as const,
      cell: ({ row }: { row: { original: CoachWithPerson } }) => (
        <span>{row.original.person.name} {row.original.person.surname}</span>
      ),
    },
    {
      header: 'Genero',
      accessorKey: 'person.gender' as const,
      cell: ({ row }: { row: { original: CoachWithPerson } }) => (
        <Badge variant="outline">
          {row.original.person.gender === 'MALE' ? 'Masculino' : 'Femenino'}
        </Badge>
      ),
    },
    {
      header: 'Gimnasio',
      accessorKey: 'gym_id' as const,
      cell: ({ row }: { row: { original: CoachWithPerson } }) => (
        <span>{getGymName(row.original.gym_id)}</span>
      ),
    },
    {
      header: 'Acciones',
      accessorKey: 'id' as const,
      cell: ({ row }: { row: { original: CoachWithPerson } }) => (
        <div className="flex gap-1">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/admin-coaches/${row.original.id}/edit`}>Editar</Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteClick(row.original.id)}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ]

  const filteredCoaches = coaches.filter(
    (coach) =>
      coach.person.name.toLowerCase().includes(search.toLowerCase()) ||
      coach.person.surname.toLowerCase().includes(search.toLowerCase()) ||
      coach.person.dni.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Entrenadores (Admin)</h1>
        <Button asChild>
          <Link to="/admin-coaches/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Entrenador
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, apellido o DNI..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="max-w-sm"
        />
      </div>

      <DataTable columns={columns} data={filteredCoaches} loading={loading} emptyMessage={search ? 'No se encontraron entrenadores para tu búsqueda' : undefined} />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={showDeleteDialog}
        title="Eliminar Entrenador"
        description="¿Estas seguro de eliminar este entrenador? Esta accion no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteDialog(false)
          setCoachToDelete(null)
        }}
      />
    </div>
  )
}