import { useState, useEffect, useCallback } from 'react'
import { competitionApi, competitionRegistrationApi } from '@/api/competitions'
import { athleteApi } from '@/api/athletes'
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
  const [selectedStatus, setSelectedStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10
  const [athleteGymMap, setAthleteGymMap] = useState<Record<string, string>>({})

  const competitionMap = Object.fromEntries(competitions.map((c) => [c.id, c]))

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

  const loadAthleteGyms = useCallback(async (regs: CompetitionRegistration[]) => {
    if (!isAdmin) return
    const uniqueAthleteIds = [...new Set(regs.map((r) => r.athlete?.id).filter(Boolean))] as string[]
    const gymMap: Record<string, string> = {}
    await Promise.all(
      uniqueAthleteIds.map(async (athleteId) => {
        try {
          const profile = await athleteApi.getProfile(athleteId)
          gymMap[athleteId] = profile.gym?.name || 'Sin gimnasio'
        } catch {
          gymMap[athleteId] = 'Error al cargar'
        }
      })
    )
    setAthleteGymMap(gymMap)
  }, [isAdmin])

  useEffect(() => {
    loadCompetitions()
  }, [])

  useEffect(() => {
    if (isAdmin || gymId) {
      loadRegistrations()
    }
  }, [isAdmin, gymId, loadRegistrations])

  useEffect(() => {
    if (isAdmin && registrations.length > 0) {
      loadAthleteGyms(registrations)
    }
  }, [isAdmin, registrations, loadAthleteGyms])

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
    ...(isAdmin
      ? [
          {
            header: 'Gimnasio',
            accessorKey: 'athlete_gym' as const,
            cell: ({ row }: { row: { original: CompetitionRegistration } }) => {
              const athleteId = row.original.athlete?.id
              return athleteId ? athleteGymMap[athleteId] || 'Cargando...' : 'N/A'
            },
          },
        ]
      : []),
    {
      header: 'Competencia',
      accessorKey: 'competition_name' as const,
      cell: ({ row }: { row: { original: CompetitionRegistration } }) => {
        const compId = row.original.division?.competition_id
        const comp = compId ? competitionMap[compId] : row.original.division?.competition
        return comp?.name || 'N/A'
      },
    },
    {
      header: 'Estado',
      accessorKey: 'competition_status' as const,
      cell: ({ row }: { row: { original: CompetitionRegistration } }) => {
        const compId = row.original.division?.competition_id
        const comp = compId ? competitionMap[compId] : row.original.division?.competition
        const status = comp?.status
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
              const compId = row.original.division?.competition_id
              const comp = compId ? competitionMap[compId] : row.original.division?.competition
              const isOpen = comp?.status === 'OPEN'
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
    const matchesSearch = athleteName.includes(search.toLowerCase())
    if (!selectedStatus) return matchesSearch
    const compId = reg.division?.competition_id
    const comp = compId ? competitionMap[compId] : reg.division?.competition
    return matchesSearch && comp?.status === selectedStatus
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
          <Label htmlFor="status">Filtrar por Estado</Label>
          <Select
            id="status"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value)
              setPage(1)
            }}
          >
            <option value="">Todos los estados</option>
            <option value="OPEN">Abierta</option>
            <option value="CLOSED">Cerrada</option>
            <option value="FINISHED">Finalizada</option>
            <option value="DRAFT">Borrador</option>
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
