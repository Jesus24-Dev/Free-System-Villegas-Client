import { useState, useEffect } from 'react'
import { competitionApi, competitionRegistrationApi, competitionDivisionApi } from '@/api/competitions'
import { athleteApi } from '@/api/athletes'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore, extractRole } from '@/stores/authStore'
import type { Competition, CompetitionRegistration, CompetitionDivision, Athlete, CombatMode, WeightCategory } from '@/types'
import { COMBAT_MODE_OPTIONS, WEIGHT_CATEGORY_OPTIONS } from '@/types'

const combatModeLabels: Record<CombatMode, string> = Object.fromEntries(
  COMBAT_MODE_OPTIONS.map(opt => [opt.value, opt.label])
) as Record<CombatMode, string>

const weightCategoryLabels: Record<WeightCategory, string> = Object.fromEntries(
  WEIGHT_CATEGORY_OPTIONS.map(opt => [opt.value, opt.label])
) as Record<WeightCategory, string>

export function CompetitionRegistrationsPage() {
  const { user } = useAuthStore()
  const userRole = user ? extractRole(user) : ''
  const isAthlete = userRole === 'ATHLETE'

  const [registrations, setRegistrations] = useState<CompetitionRegistration[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [divisions, setDivisions] = useState<CompetitionDivision[]>([])
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedCompetitionId, setSelectedCompetitionId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ athlete_id: '', division_id: '' })
  const limit = 10

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [registrationToDelete, setRegistrationToDelete] = useState<string | null>(null)

  useEffect(() => {
    loadCompetitions()
  }, [])

  useEffect(() => {
    if (selectedCompetitionId) {
      loadRegistrations()
      loadDivisions(selectedCompetitionId)
    }
  }, [selectedCompetitionId, page])

  const loadCompetitions = async () => {
    try {
      const data = await competitionApi.getAll()
      setCompetitions(data)
    } catch (error) {
      toast.error('Error al cargar competencias')
    }
  }

  const loadRegistrations = async () => {
    try {
      setLoading(true)
      const params: { competition_id?: string; page?: number; limit?: number } = {}
      if (selectedCompetitionId) params.competition_id = selectedCompetitionId
      const data = await competitionRegistrationApi.getAll(params)
      setRegistrations(data)
      setTotalPages(Math.ceil(data.length / limit) || 1)
    } catch (error) {
      toast.error('Error al cargar inscripciones')
    } finally {
      setLoading(false)
    }
  }

  const loadDivisions = async (competitionId: string) => {
    try {
      const data = await competitionDivisionApi.getAll({ competition_id: competitionId })
      setDivisions(data)
    } catch (error) {
      toast.error('Error al cargar divisiones')
    }
  }

  const loadAthletes = async () => {
    try {
      const response = await athleteApi.getAll()
      setAthletes(response.data)
    } catch (error) {
      toast.error('Error al cargar atletas')
    }
  }

  const handleDeleteClick = (id: string) => {
    setRegistrationToDelete(id)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!registrationToDelete) return
    try {
      await competitionRegistrationApi.delete(registrationToDelete)
      toast.success('Inscripción eliminada correctamente')
      loadRegistrations()
    } catch (error) {
      toast.error('Error al eliminar inscripción')
    } finally {
      setShowDeleteDialog(false)
      setRegistrationToDelete(null)
    }
  }

  const handleOpenForm = () => {
    loadAthletes()
    setFormData({ athlete_id: '', division_id: '' })
    setShowForm(true)
  }

  const handleCreate = async () => {
    if (!formData.athlete_id || !formData.division_id) {
      toast.error('Selecciona un atleta y una división')
      return
    }
    try {
      await competitionRegistrationApi.create(formData)
      toast.success('Inscripción creada correctamente')
      setShowForm(false)
      loadRegistrations()
    } catch (error) {
      toast.error('Error al crear inscripción')
    }
  }

  const columns = [
    {
      header: 'Atleta',
      accessorKey: 'id' as const,
      cell: ({ row }: { row: { original: CompetitionRegistration } }) => {
        const athlete = row.original.athlete
        return athlete ? `${athlete.name} ${athlete.surname}` : 'N/A'
      },
    },
    {
      header: 'Género',
      accessorKey: 'id' as const,
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
      header: 'Modo',
      accessorKey: 'id' as const,
      cell: ({ row }: { row: { original: CompetitionRegistration } }) => {
        const division = row.original.division
        return division ? combatModeLabels[division.mode] || division.mode : 'N/A'
      },
    },
    {
      header: 'Categoría',
      accessorKey: 'id' as const,
      cell: ({ row }: { row: { original: CompetitionRegistration } }) => {
        const division = row.original.division
        return division ? weightCategoryLabels[division.category] || division.category : 'N/A'
      },
    },
    {
      header: 'Peso',
      accessorKey: 'id' as const,
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
            cell: ({ row }: { row: { original: CompetitionRegistration } }) => (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteClick(row.original.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ),
          },
        ]
      : []),
  ]

  const filteredRegistrations = registrations.filter(
    (reg) => {
      const athleteName = reg.athlete ? `${reg.athlete.name} ${reg.athlete.surname}`.toLowerCase() : ''
      return athleteName.includes(search.toLowerCase())
    }
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inscripciones a Competencias</h1>
        {!isAthlete && (
          <Button onClick={handleOpenForm} disabled={!selectedCompetitionId}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Inscripción
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <Label htmlFor="competition">Competencia</Label>
          <Select
            id="competition"
            value={selectedCompetitionId}
            onChange={(e) => {
              setSelectedCompetitionId(e.target.value)
              setPage(1)
            }}
          >
            <option value="">Seleccionar competencia</option>
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

      {showForm && (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
          <h3 className="font-semibold">Nueva Inscripción</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="athlete">Atleta</Label>
              <Select
                id="athlete"
                value={formData.athlete_id}
                onChange={(e) => setFormData({ ...formData, athlete_id: e.target.value })}
              >
                <option value="">Seleccionar atleta</option>
                {athletes.map((athlete) => (
                  <option key={athlete.id} value={athlete.id}>
                    {athlete.name} {athlete.surname}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="division">División</Label>
              <Select
                id="division"
                value={formData.division_id}
                onChange={(e) => setFormData({ ...formData, division_id: e.target.value })}
              >
                <option value="">Seleccionar división</option>
                {divisions.map((div) => (
                  <option key={div.id} value={div.id}>
                    {combatModeLabels[div.mode]} - {weightCategoryLabels[div.category]} - {div.weight}kg
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate}>Crear</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      <DataTable columns={columns} data={filteredRegistrations} loading={loading} />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={showDeleteDialog}
        title="Eliminar Inscripción"
        description="¿Estas seguro de eliminar esta inscripción? Esta accion no se puede deshacer."
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
