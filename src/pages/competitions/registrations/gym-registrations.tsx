import { useState, useEffect, useCallback } from 'react'
import { competitionApi, competitionRegistrationApi } from '@/api/competitions'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore, extractRole } from '@/stores/authStore'
import type { Competition, CompetitionRegistration, CombatMode, WeightCategory } from '@/types'
import { COMBAT_MODE_OPTIONS, WEIGHT_CATEGORY_OPTIONS } from '@/types'

const combatModeLabels: Record<CombatMode, string> = Object.fromEntries(
  COMBAT_MODE_OPTIONS.map((opt) => [opt.value, opt.label])
) as Record<CombatMode, string>

const weightCategoryLabels: Record<WeightCategory, string> = Object.fromEntries(
  WEIGHT_CATEGORY_OPTIONS.map((opt) => [opt.value, opt.label])
) as Record<WeightCategory, string>

export function GymRegistrationsPage() {
  const { user, gymId } = useAuthStore()
  const userRole = user ? extractRole(user) : ''
  const isAdmin = userRole === 'ADMIN'

  const [registrations, setRegistrations] = useState<CompetitionRegistration[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCompetitionId, setSelectedCompetitionId] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inscripciones del Gimnasio</h1>
      </div>

      <div className="flex items-center gap-4">
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
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={filteredRegistrations} loading={loading} />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
