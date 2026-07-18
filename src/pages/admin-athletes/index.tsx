import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminAthleteApi, type AthleteWithPerson } from '@/api/admin'
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

export function AdminAthletesPage() {
  const [athletes, setAthletes] = useState<AthleteWithPerson[]>([])
  const [gyms, setGyms] = useState<Gym[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [athleteToDelete, setAthleteToDelete] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const [athletesResponse, gymsData] = await Promise.all([
        adminAthleteApi.getAll({ page, limit }),
        gymApi.getAll(),
      ])
      setAthletes(athletesResponse.data)
      setTotalPages(athletesResponse.totalPages)
      setGyms(gymsData)
    } catch {
      toast.error('Error al cargar atletas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page])

  const handleDeleteClick = (id: string) => {
    setAthleteToDelete(id)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!athleteToDelete) return
    try {
      await adminAthleteApi.delete(athleteToDelete)
      toast.success('Atleta eliminado correctamente')
      loadData()
    } catch {
      toast.error('Error al eliminar atleta')
    } finally {
      setShowDeleteDialog(false)
      setAthleteToDelete(null)
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
      cell: ({ row }: { row: { original: AthleteWithPerson } }) => (
        <span>{row.original.person.dni}</span>
      ),
    },
    {
      header: 'Nombre',
      accessorKey: 'person.name' as const,
      cell: ({ row }: { row: { original: AthleteWithPerson } }) => (
        <span>{row.original.person.name} {row.original.person.surname}</span>
      ),
    },
    {
      header: 'Genero',
      accessorKey: 'person.gender' as const,
      cell: ({ row }: { row: { original: AthleteWithPerson } }) => (
        <Badge variant="outline">
          {row.original.person.gender === 'MALE' ? 'Masculino' : 'Femenino'}
        </Badge>
      ),
    },
    {
      header: 'Gimnasio',
      accessorKey: 'gym_id' as const,
      cell: ({ row }: { row: { original: AthleteWithPerson } }) => (
        <span>{getGymName(row.original.gym_id)}</span>
      ),
    },
    {
      header: 'Acciones',
      accessorKey: 'id' as const,
      cell: ({ row }: { row: { original: AthleteWithPerson } }) => (
        <div className="flex gap-1">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/admin-athletes/${row.original.id}/edit`}>Editar</Link>
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

  const filteredAthletes = athletes.filter(
    (athlete) =>
      athlete.person.name.toLowerCase().includes(search.toLowerCase()) ||
      athlete.person.surname.toLowerCase().includes(search.toLowerCase()) ||
      athlete.person.dni.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Atletas (Admin)</h1>
        <Button asChild>
          <Link to="/admin-athletes/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Atleta
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, apellido o DNI..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <DataTable columns={columns} data={filteredAthletes} loading={loading} />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

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