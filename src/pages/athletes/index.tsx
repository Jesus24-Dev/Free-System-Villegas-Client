import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { athleteApi } from '@/api/athletes'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

  const handleDelete = async (personId: string) => {
    if (window.confirm('¿Estás seguro de eliminar este atleta?')) {
      try {
        await athleteApi.delete(personId)
        toast.success('Atleta eliminado correctamente')
        loadAthletes()
      } catch (error) {
        toast.error('Error al eliminar atleta')
      }
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
            onClick={() => handleDelete(row.original.person_id)}
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
        <Button asChild className="hover:opacity-90 transition-opacity">
          <Link to="/athletes/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Atleta
          </Link>
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
    </div>
  )
}
