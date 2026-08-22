import { useState, useEffect, useCallback } from 'react'
import { competitionApi, competitionRegistrationApi } from '@/api/competitions'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore, extractRole } from '@/stores/authStore'
import type { Competition, CompetitionRegistration, CompetitionStatus, CombatMode, WeightCategory } from '@/types'
import { COMBAT_MODE_OPTIONS, WEIGHT_CATEGORY_OPTIONS } from '@/types'

const combatModeLabels: Record<CombatMode, string> = Object.fromEntries(
  COMBAT_MODE_OPTIONS.map((opt) => [opt.value, opt.label])
) as Record<CombatMode, string>

const weightCategoryLabels: Record<WeightCategory, string> = Object.fromEntries(
  WEIGHT_CATEGORY_OPTIONS.map((opt) => [opt.value, opt.label])
) as Record<WeightCategory, string>

const competitionStatusLabels: Record<CompetitionStatus, string> = {
  DRAFT: 'Borrador',
  OPEN: 'Abierta',
  CLOSED: 'Cerrada',
  FINISHED: 'Finalizada',
}

export function GymRegistrationsPage() {
  const { user, gymId } = useAuthStore()
  const userRole = user ? extractRole(user) : ''
  const isAdmin = userRole === 'ADMIN'
  const isAthlete = userRole === 'ATHLETE'

  const [registrations, setRegistrations] = useState<CompetitionRegistration[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCompetitionId, setSelectedCompetitionId] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [registrationToDelete, setRegistrationToDelete] = useState<{ athleteId: string; competitionId: string; divisionId: string } | null>(null)

  const loadCompetitions = async () => {
    try {
      const data = await competitionApi.getAll()
      setCompetitions(data)
    } catch {
      toast.error('Error al cargar competencias')
    }
  }

  const loadRegistrations = useCallback(async () => {
    try {
      setLoading(true)

      if (isAdmin) {
        if (selectedCompetitionId) {
          const result = await competitionRegistrationApi.getByCompetition(selectedCompetitionId, {
            page,
            limit,
          })
          setRegistrations(result.data)
          setTotalPages(result.meta.totalPages || 1)
        } else {
          const data = await competitionRegistrationApi.getAll()
          setRegistrations(data)
          setTotalPages(1)
        }
        return
      }

      if (!gymId) return

      if (selectedCompetitionId) {
        const result = await competitionRegistrationApi.getByGymAndCompetition(gymId, selectedCompetitionId, {
          page,
          limit,
        })
        setRegistrations(result.data)
        setTotalPages(result.meta.totalPages || 1)
      } else {
        const result = await competitionRegistrationApi.getByGym(gymId, {
          page,
          limit,
        })
        setRegistrations(result.data)
        setTotalPages(result.meta.totalPages || 1)
      }
    } catch {
      toast.error('Error al cargar inscripciones')
    } finally {
      setLoading(false)
    }
  }, [isAdmin, gymId, selectedCompetitionId, page, limit])

  useEffect(() => {
    loadCompetitions()
  }, [])

  useEffect(() => {
    if (isAdmin || gymId) {
      loadRegistrations()
    }
  }, [isAdmin, gymId, loadRegistrations])

  const handleDeleteClick = (registration: CompetitionRegistration) => {
    const competitionId = registration.division?.competition_id || registration.division?.competition?.id
    if (!competitionId || !registration.athlete?.id || !registration.division?.id) return
    setRegistrationToDelete({
      athleteId: registration.athlete.id,
      competitionId,
      divisionId: registration.division.id,
    })
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!registrationToDelete) return
    try {
      await competitionRegistrationApi.removeByAthleteAndCompetition(
        registrationToDelete.athleteId,
        registrationToDelete.competitionId,
        registrationToDelete.divisionId
      )
      toast.success('Inscripción eliminada correctamente')
      loadRegistrations()
    } catch {
      toast.error('Error al eliminar inscripción')
    } finally {
      setShowDeleteDialog(false)
      setRegistrationToDelete(null)
    }
  }

  const columns = [
    {
      header: 'Atleta',
      accessorKey: 'athlete_name' as const,
      cell: ({ row }: { row: { original: CompetitionRegistration } }) => {
        const athlete = row.original.athlete
        return athlete ? `${athlete.name} ${athlete.surname}` : 'N/A'
      },
    },
    {
      header: 'Género',
      accessorKey: 'athlete_gender' as const,
      cell: ({ row }: { row: { original: CompetitionRegistration } }) => {
        const athlete = row.original.athlete
        return (
          <Badge variant={athlete?.gender === 'MALE' ? 'default' : 'secondary'}>
            {athlete?.gender === 'MALE' ? 'Masculino' : 'Femenino'}
          </Badge>
        )
      },
    },
    {
      header: 'Competencia',
      accessorKey: 'competition_name' as const,
      cell: ({ row }: { row: { original: CompetitionRegistration } }) => {
        const division = row.original.division
        return division?.competition?.name || 'N/A'
      },
    },
    {
      header: 'Estado',
      accessorKey: 'competition_status' as const,
      cell: ({ row }: { row: { original: CompetitionRegistration } }) => {
        const status = row.original.division?.competition?.status
        if (!status) return 'N/A'
        return (
          <Badge variant={status === 'OPEN' ? 'default' : status === 'CLOSED' ? 'destructive' : 'secondary'}>
            {competitionStatusLabels[status]}
          </Badge>
        )
      },
    },
    {
      header: 'Modo',
      accessorKey: 'division_mode' as const,
      cell: ({ row }: { row: { original: CompetitionRegistration } }) => {
        const division = row.original.division
        return division ? combatModeLabels[division.mode] || division.mode : 'N/A'
      },
    },
    {
      header: 'Categoría',
      accessorKey: 'division_category' as const,
      cell: ({ row }: { row: { original: CompetitionRegistration } }) => {
        const division = row.original.division
        return division
          ? weightCategoryLabels[division.category] || division.category
          : 'N/A'
      },
    },
    {
      header: 'Peso',
      accessorKey: 'division_weight' as const,
      cell: ({ row }: { row: { original: CompetitionRegistration } }) => {
        const division = row.original.division
        return division ? `${division.weight} kg` : 'N/A'
      },
    },
    ...(!isAthlete
      ? [
          {
            header: 'Acciones',
            accessorKey: 'id' as const,
            cell: ({ row }: { row: { original: CompetitionRegistration } }) => {
              const isOpen = row.original.division?.competition?.status === 'OPEN'
              return (
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={!isOpen}
                  title={isOpen ? 'Eliminar inscripción' : 'Solo se pueden eliminar inscripciones de competencias abiertas'}
                  onClick={() => handleDeleteClick(row.original)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )
            },
          },
        ]
      : []),
  ]

  const filteredRegistrations = registrations.filter((reg) => {
    const athleteName = reg.athlete
      ? `${reg.athlete.name} ${reg.athlete.surname}`.toLowerCase()
      : ''
    return athleteName.includes(search.toLowerCase())
  })

  if (!isAdmin && !gymId) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Inscripciones del Gimnasio</h1>
        <p className="text-muted-foreground">No tienes un gimnasio asignado.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Inscripciones del Gimnasio</h1>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 max-w-sm">
          <Label htmlFor="competition">Filtrar por Competencia</Label>
          <Select
            id="competition"
            value={selectedCompetitionId}
            onChange={(e) => {
              setSelectedCompetitionId(e.target.value)
              setPage(1)
            }}
          >
            <option value="">Todas las competencias</option>
            {competitions.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {comp.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex-1 max-w-sm">
          <Label htmlFor="search">Buscar atleta</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Nombre del atleta..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={filteredRegistrations} loading={loading} emptyMessage={search ? 'No se encontraron inscripciones para tu búsqueda' : undefined} />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={showDeleteDialog}
        title="Eliminar Inscripción"
        description="¿Estás seguro de eliminar esta inscripción? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteDialog(false)
          setRegistrationToDelete(null)
        }}
      />
    </div>
  )
}
