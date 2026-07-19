import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { competitionApi } from '@/api/competitions'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Plus, Search, Download } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore, extractRole } from '@/stores/authStore'
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
  const { user, gymId } = useAuthStore()
  const userRole = user ? extractRole(user) : ''
  const isReadOnly = userRole === 'ATHLETE' || userRole === 'COACH'

  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [competitionToDelete, setCompetitionToDelete] = useState<string | null>(null)
  const [exportingId, setExportingId] = useState<string | null>(null)

  const loadCompetitions = async () => {
    try {
      setLoading(true)
      const data = await competitionApi.getAll({ page, limit })
      setCompetitions(data)
      setTotalPages(Math.ceil(data.length / limit) || 1)
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCompetitions()
  }, [page])

  const handleDeleteClick = (id: string) => {
    setCompetitionToDelete(id)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!competitionToDelete) return
    try {
      await competitionApi.delete(competitionToDelete)
      toast.success('Competencia eliminada correctamente')
      loadCompetitions()
    } catch {
      // handled by interceptor
    } finally {
      setShowDeleteDialog(false)
      setCompetitionToDelete(null)
    }
  }

  const handleExport = async (competitionId: string, competitionName: string) => {
    if (!gymId) return
    try {
      setExportingId(competitionId)
      const blob = await competitionApi.exportByGym(competitionId, gymId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${competitionName}_atletas.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Archivo descargado correctamente')
    } catch {
      // handled by interceptor
    } finally {
      setExportingId(null)
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
          {!isReadOnly && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/competitions/${row.original.id}/edit`}>Editar</Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteClick(row.original.id)}
              >
                Eliminar
              </Button>
            </>
          )}
          {userRole === 'COACH' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport(row.original.id, row.original.name)}
                disabled={exportingId === row.original.id}
              >
                <Download className="mr-1 h-3 w-3" />
                {exportingId === row.original.id ? 'Exportando...' : 'Exportar'}
              </Button>
              {row.original.status === 'OPEN' && (
                <Button variant="default" size="sm" asChild>
                  <Link to={`/competition-registrations?competition=${row.original.id}`}>
                    Registrar
                  </Link>
                </Button>
              )}
            </>
          )}
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
        <h1 className="text-3xl font-bold">Competencias</h1>
        {!isReadOnly && (
          <Button asChild>
            <Link to="/competitions/new">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Competencia
            </Link>
          </Button>
        )}
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

      <ConfirmDialog
        open={showDeleteDialog}
        title="Eliminar Competencia"
        description="¿Estas seguro de eliminar esta competencia? Esta accion no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteDialog(false)
          setCompetitionToDelete(null)
        }}
      />
    </div>
  )
}
