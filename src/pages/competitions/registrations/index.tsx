import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { competitionApi, competitionRegistrationApi } from '@/api/competitions'
import { athleteApi } from '@/api/athletes'
import { weightApi } from '@/api/weights'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Plus, Search, Trash2, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore, extractRole } from '@/stores/authStore'
import type {
  Competition,
  CompetitionRegistration,
  Athlete,
  WeightCategoryResponse,
  CombatMode,
  WeightCategory,
} from '@/types'
import { COMBAT_MODE_OPTIONS, WEIGHT_CATEGORY_OPTIONS } from '@/types'

const combatModeLabels: Record<CombatMode, string> = Object.fromEntries(
  COMBAT_MODE_OPTIONS.map((opt) => [opt.value, opt.label])
) as Record<CombatMode, string>

const weightCategoryLabels: Record<WeightCategory, string> = Object.fromEntries(
  WEIGHT_CATEGORY_OPTIONS.map((opt) => [opt.value, opt.label])
) as Record<WeightCategory, string>

function calculateAge(birthday: string): number {
  const birth = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

function getWeightCategoryByAge(age: number): WeightCategory | null {
  if (age >= 7 && age <= 9) return 'CH'
  if (age >= 10 && age <= 12) return 'YC'
  if (age >= 13 && age <= 15) return 'OC'
  if (age >= 16 && age <= 18) return 'J'
  if (age >= 19 && age <= 40) return 'S'
  if (age >= 41 && age <= 55) return 'M'
  return null
}

interface PendingRegistration {
  athleteId: string
  athleteName: string
  age: number
  ageCategory: WeightCategory
  mode: CombatMode
  category: WeightCategory
  weight: number
}

export function CompetitionRegistrationsPage() {
  const [searchParams] = useSearchParams()
  const initialCompetitionId = searchParams.get('competition') || ''

  const { user, gymId } = useAuthStore()
  const userRole = user ? extractRole(user) : ''
  const isCoach = userRole === 'COACH'
  const isAthlete = userRole === 'ATHLETE'

  const [registrations, setRegistrations] = useState<CompetitionRegistration[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [weights, setWeights] = useState<WeightCategoryResponse[]>([])
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingWeights, setLoadingWeights] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCompetitionId, setSelectedCompetitionId] = useState(initialCompetitionId)
  const [showForm, setShowForm] = useState(false)
  const [selectedAthleteId, setSelectedAthleteId] = useState('')
  const [selectedWeightIndex, setSelectedWeightIndex] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [registrationToDelete, setRegistrationToDelete] = useState<string | null>(null)

  const selectedAthlete = athletes.find((a) => a.id === selectedAthleteId)
  const selectedCompetition = competitions.find((c) => c.id === selectedCompetitionId)

  const loadCompetitions = async () => {
    try {
      const data = await competitionApi.getAll({ status: 'OPEN' })
      setCompetitions(data)
    } catch {
      toast.error('Error al cargar competencias')
    }
  }

  const loadRegistrations = useCallback(async () => {
    if (!selectedCompetitionId) return
    try {
      setLoading(true)
      if (isCoach && gymId) {
        const result = await competitionRegistrationApi.getByGymAndCompetition(gymId, selectedCompetitionId, {
          page,
          limit,
        })
        setRegistrations(result.data)
        setTotalPages(result.meta.totalPages || 1)
      } else {
        const result = await competitionRegistrationApi.getByCompetition(selectedCompetitionId, {
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
  }, [selectedCompetitionId, isCoach, gymId, page, limit])

  const loadAthletes = useCallback(async () => {
    if (!gymId) {
      toast.error('No tienes un gimnasio asignado')
      return
    }
    try {
      const data = await athleteApi.getByGym(gymId)
      setAthletes(data)
    } catch {
      toast.error('Error al cargar atletas del gimnasio')
    }
  }, [gymId])

  const loadWeights = useCallback(async (gender: string, category: WeightCategory) => {
    setLoadingWeights(true)
    try {
      const data = await weightApi.getAll({ gender, category })
      setWeights(data)
    } catch {
      toast.error('Error al cargar pesos disponibles')
    } finally {
      setLoadingWeights(false)
    }
  }, [])

  useEffect(() => {
    loadCompetitions()
  }, [])

  useEffect(() => {
    if (selectedCompetitionId) {
      setPage(1)
      loadRegistrations()
    }
  }, [selectedCompetitionId, loadRegistrations])

  useEffect(() => {
    if (selectedAthlete) {
      const age = calculateAge(selectedAthlete.birthday)
      const category = getWeightCategoryByAge(age)
      if (category) {
        loadWeights(selectedAthlete.gender, category)
      } else {
        setWeights([])
        toast.error('El atleta no pertenece a ninguna categoría de edad válida (7-55 años)')
      }
      setSelectedWeightIndex('')
    } else {
      setWeights([])
      setSelectedWeightIndex('')
    }
  }, [selectedAthlete, loadWeights])

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
    } catch {
      toast.error('Error al eliminar inscripción')
    } finally {
      setShowDeleteDialog(false)
      setRegistrationToDelete(null)
    }
  }

  const handleOpenForm = async () => {
    await loadAthletes()
    setSelectedAthleteId('')
    setSelectedWeightIndex('')
    setPendingRegistrations([])
    setShowForm(true)
  }

  const handleAddToPending = () => {
    if (!selectedAthlete || selectedWeightIndex === '') {
      toast.error('Selecciona un atleta y un peso')
      return
    }

    const weight = weights[parseInt(selectedWeightIndex)]
    if (!weight || !weight.mode || !weight.category) {
      toast.error('Datos de peso incompletos')
      return
    }

    const alreadyExists = pendingRegistrations.some(
      (p) =>
        p.athleteId === selectedAthlete.id &&
        p.mode === weight.mode &&
        p.category === weight.category
    )

    if (alreadyExists) {
      toast.error('Esta inscripción ya está en la lista')
      return
    }

    setPendingRegistrations([
      ...pendingRegistrations,
      {
        athleteId: selectedAthlete.id,
        athleteName: `${selectedAthlete.name} ${selectedAthlete.surname}`,
        age: calculateAge(selectedAthlete.birthday),
        ageCategory: weight.category,
        mode: weight.mode,
        category: weight.category,
        weight: weight.weight || 0,
      },
    ])

    setSelectedAthleteId('')
    setSelectedWeightIndex('')
  }

  const handleRemovePending = (index: number) => {
    setPendingRegistrations(pendingRegistrations.filter((_, i) => i !== index))
  }

  const handleConfirmRegistrations = async () => {
    if (!selectedCompetitionId || pendingRegistrations.length === 0) {
      toast.error('No hay inscripciones pendientes')
      return
    }

    let successCount = 0
    let errorCount = 0

    for (const pending of pendingRegistrations) {
      try {
        await competitionApi.registerAthlete(selectedCompetitionId, pending.athleteId, {
          mode: pending.mode,
          category: pending.category,
          weight: pending.weight,
        })
        successCount++
      } catch {
        errorCount++
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} inscripción(es) creada(s) correctamente`)
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} inscripción(es) fallaron`)
    }

    setPendingRegistrations([])
    setShowForm(false)
    loadRegistrations()
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
        return division
          ? weightCategoryLabels[division.category] || division.category
          : 'N/A'
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

  const filteredRegistrations = registrations.filter((reg) => {
    const athleteName = reg.athlete
      ? `${reg.athlete.name} ${reg.athlete.surname}`.toLowerCase()
      : ''
    return athleteName.includes(search.toLowerCase())
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inscripciones a Competencias</h1>
        {isCoach && (
          <Button onClick={handleOpenForm} disabled={!selectedCompetitionId}>
            <Plus className="mr-2 h-4 w-4" />
            Registrar Atleta
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
              setSearch('')
            }}
          >
            <option value="">Seleccionar competencia</option>
            {competitions.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {comp.name}
              </option>
            ))}
          </Select>
          {selectedCompetition && (
            <p className="text-xs text-muted-foreground mt-1">
              Estado: {selectedCompetition.status === 'OPEN' ? 'Abierta' : selectedCompetition.status}
            </p>
          )}
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
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Registrar Atleta en Competencia</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false)
                setPendingRegistrations([])
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="athlete">Atleta</Label>
              <Select
                id="athlete"
                value={selectedAthleteId}
                onChange={(e) => setSelectedAthleteId(e.target.value)}
              >
                <option value="">Seleccionar atleta</option>
                {athletes.map((athlete) => (
                  <option key={athlete.id} value={athlete.id}>
                    {athlete.name} {athlete.surname}
                  </option>
                ))}
              </Select>
              {selectedAthlete && (
                <p className="text-xs text-muted-foreground mt-1">
                  Edad: {calculateAge(selectedAthlete.birthday)} años -{' '}
                  Categoría: {getWeightCategoryByAge(calculateAge(selectedAthlete.birthday))
                    ? weightCategoryLabels[getWeightCategoryByAge(calculateAge(selectedAthlete.birthday))!]
                    : 'N/A'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="weight">Peso / Modalidad</Label>
              <Select
                id="weight"
                value={selectedWeightIndex}
                onChange={(e) => setSelectedWeightIndex(e.target.value)}
                disabled={!selectedAthleteId || loadingWeights}
              >
                <option value="">
                  {loadingWeights
                    ? 'Cargando pesos...'
                    : selectedAthleteId
                      ? 'Seleccionar peso'
                      : 'Primero selecciona un atleta'}
                </option>
                {weights.map((w, index) => (
                  <option key={w.id || index} value={index}>
                    {combatModeLabels[w.mode as CombatMode] || w.mode} -{' '}
                    {weightCategoryLabels[w.category as WeightCategory] || w.category} - {w.weight}kg
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleAddToPending}
                disabled={!selectedAthleteId || selectedWeightIndex === ''}
              >
                <Plus className="mr-1 h-4 w-4" />
                Agregar
              </Button>
            </div>
          </div>

          {pendingRegistrations.length > 0 && (
            <div className="space-y-2">
              <Label>Inscripciones Pendientes</Label>
              <div className="border rounded-md divide-y">
                {pendingRegistrations.map((pending, index) => (
                  <div
                    key={`${pending.athleteId}-${pending.mode}-${pending.category}`}
                    className="flex items-center justify-between p-2"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">{pending.athleteName}</span>
                      <span className="text-xs text-muted-foreground">{pending.age} años</span>
                      <Badge variant="outline">
                        {weightCategoryLabels[pending.ageCategory]}
                      </Badge>
                      <Badge variant="outline">
                        {combatModeLabels[pending.mode]}
                      </Badge>
                      <Badge variant="secondary">
                        {weightCategoryLabels[pending.category]}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{pending.weight}kg</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePending(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button onClick={handleConfirmRegistrations}>
                  <Check className="mr-2 h-4 w-4" />
                  Confirmar Inscripciones ({pendingRegistrations.length})
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <DataTable columns={columns} data={filteredRegistrations} loading={loading} />

      {selectedCompetitionId && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}

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
