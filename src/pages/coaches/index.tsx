import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { coachApi } from '@/api/coaches'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore, extractRole } from '@/stores/authStore'
import type { Coach } from '@/types'

export function CoachesPage() {
  const { user, gymId } = useAuthStore()
  const userRole = user ? extractRole(user) : ''
  const isCoach = userRole === 'COACH'

  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  useEffect(() => {
    loadCoaches()
  }, [page, gymId])

  const loadCoaches = async () => {
    try {
      setLoading(true)
      if (isCoach && gymId) {
        const data = await coachApi.getByGym(gymId)
        setCoaches(data)
        setTotalPages(Math.ceil(data.length / limit) || 1)
      } else {
        const data = await coachApi.getAll({ page, limit })
        setCoaches(data)
        setTotalPages(Math.ceil(data.length / limit) || 1)
      }
    } catch (error) {
      toast.error('Error al cargar entrenadores')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este entrenador?')) {
      try {
        await coachApi.delete(id)
        toast.success('Entrenador eliminado correctamente')
        loadCoaches()
      } catch (error) {
        toast.error('Error al eliminar entrenador')
      }
    }
  }

  const isCurrentUser = (coachDni: string) => {
    return user?.dni === coachDni
  }

  const columns = [
    { header: 'DNI', accessorKey: 'dni' as const },
    {
      header: 'Nombre',
      accessorKey: 'name' as const,
      cell: ({ row }: { row: { original: Coach } }) => (
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
      cell: ({ row }: { row: { original: Coach } }) => (
        <Badge variant="outline">
          {row.original.gender === 'MALE' ? 'Masculino' : 'Femenino'}
        </Badge>
      ),
    },
    { header: 'Cumpleaños', accessorKey: 'birthday' as const },
    {
      header: 'Estado',
      accessorKey: 'status' as const,
      cell: ({ row }: { row: { original: Coach } }) => (
        <Badge variant={row.original.status ? 'default' : 'destructive'}>
          {row.original.status ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      accessorKey: 'id' as const,
      cell: ({ row }: { row: { original: Coach } }) => (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Link to={`/coaches/${row.original.id}/edit`}>Editar</Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
            className="hover:opacity-80 transition-opacity"
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ]

  const filteredCoaches = coaches.filter(
    (coach) =>
      coach.name.toLowerCase().includes(search.toLowerCase()) ||
      coach.surname.toLowerCase().includes(search.toLowerCase()) ||
      coach.dni.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Entrenadores</h1>
        <Button asChild className="hover:opacity-90 transition-opacity">
          <Link to="/coaches/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Entrenador
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar entrenador..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <DataTable columns={columns} data={filteredCoaches} loading={loading} />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
