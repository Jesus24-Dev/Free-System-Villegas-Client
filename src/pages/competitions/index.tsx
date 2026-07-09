import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { competitionApi } from '@/api/competitions'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import type { Competition, CompetitionStatus } from '@/types'

const statusLabels: Record<CompetitionStatus, string> = {
  DRAFT: 'Borrador',
  OPEN: 'Abierta',
  CLOSED: 'Cerrada',
  FINISHED: 'Finalizada',
}

const statusVariants: Record<CompetitionStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'secondary',
  OPEN: 'default',
  CLOSED: 'destructive',
  FINISHED: 'outline',
}

export function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  useEffect(() => {
    loadCompetitions()
  }, [page])

  const loadCompetitions = async () => {
    try {
      setLoading(true)
      const data = await competitionApi.getAll({ page, limit })
      setCompetitions(data)
      setTotalPages(Math.ceil(data.length / limit) || 1)
    } catch (error) {
      toast.error('Error al cargar competencias')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta competencia?')) {
      try {
        await competitionApi.delete(id)
        toast.success('Competencia eliminada correctamente')
        loadCompetitions()
      } catch (error) {
        toast.error('Error al eliminar competencia')
      }
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-VE')
  }

  const columns = [
    { header: 'Nombre', accessorKey: 'name' as const },
    { header: 'Ubicacion', accessorKey: 'location' as const },
    {
      header: 'Inicio Inscripciones',
      accessorKey: 'inscription_begin_at' as const,
      cell: ({ row }: { row: { original: Competition } }) => (
        <span>{formatDate(row.original.inscription_begin_at)}</span>
      ),
    },
    {
      header: 'Fin Inscripciones',
      accessorKey: 'inscription_end_at' as const,
      cell: ({ row }: { row: { original: Competition } }) => (
        <span>{formatDate(row.original.inscription_end_at)}</span>
      ),
    },
    {
      header: 'Estado',
      accessorKey: 'status' as const,
      cell: ({ row }: { row: { original: Competition } }) => (
        <Badge variant={statusVariants[row.original.status]}>
          {statusLabels[row.original.status]}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      accessorKey: 'id' as const,
      cell: ({ row }: { row: { original: Competition } }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/competitions/${row.original.id}/edit`}>Editar</Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ]

  const filteredCompetitions = competitions.filter(
    (competition) =>
      competition.name.toLowerCase().includes(search.toLowerCase()) ||
      competition.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Competencias</h1>
        <Button asChild>
          <Link to="/competitions/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Competencia
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar competencia..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <DataTable columns={columns} data={filteredCompetitions} loading={loading} />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
