import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { coachApi } from '@/api/coaches'
import { athleteApi } from '@/api/athletes'
import { gymApi } from '@/api/gyms'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { PersonSearch } from '@/components/PersonSearch'
import { Search, UserPlus, ArrowUpCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore, extractRole } from '@/stores/authStore'
import type { Coach, Athlete } from '@/types'

export function CoachesPage() {
  const { user, gymId, isGymOwner } = useAuthStore()
  const userRole = user ? extractRole(user) : ''
  const isCoach = userRole === 'COACH'

  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [gymOwnerId, setGymOwnerId] = useState<string | null>(null)
  const limit = 10

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [coachToDelete, setCoachToDelete] = useState<string | null>(null)

  const [gymAthletes, setGymAthletes] = useState<Athlete[]>([])
  const [promoting, setPromoting] = useState<string | null>(null)

  const loadCoaches = async () => {
    try {
      setLoading(true)
      if (isCoach && gymId) {
        const [data, gymDetails] = await Promise.all([
          coachApi.getByGym(gymId),
          gymApi.getById(gymId)
        ])
        setCoaches(data)
        setGymOwnerId(gymDetails.owner?.id || null)
        setTotalPages(Math.ceil(data.length / limit) || 1)
      } else {
        const data = await coachApi.getAll({ page, limit })
        setCoaches(data)
        setTotalPages(Math.ceil(data.length / limit) || 1)
      }
    } catch {
      toast.error('Error al cargar entrenadores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCoaches()
  }, [page, gymId])

  const loadGymAthletes = async () => {
    if (!isGymOwner || !gymId) return
    try {
      const data = await athleteApi.getByGym(gymId)
      setGymAthletes(data)
    } catch {
      toast.error('Error al cargar atletas del gimnasio')
    }
  }

  useEffect(() => {
    if (isGymOwner && gymId) {
      loadGymAthletes()
    }
  }, [isGymOwner, gymId])

  const handlePromoteToCoach = async (athleteId: string) => {
    try {
      setPromoting(athleteId)
      await athleteApi.promoteToCoach(athleteId)
      toast.success('Atleta promovido a entrenador exitosamente')
      loadGymAthletes()
      loadCoaches()
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } }
      const message = axiosError?.response?.data?.message || 'Error al promover atleta'
      toast.error(message)
    } finally {
      setPromoting(null)
    }
  }

  const handleDeleteClick = (id: string) => {
    setCoachToDelete(id)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!coachToDelete) return
    try {
      await coachApi.unassignGym(coachToDelete)
      toast.success('Entrenador removido del gimnasio correctamente')
      loadCoaches()
    } catch {
      toast.error('Error al remover entrenador del gimnasio')
    } finally {
      setShowDeleteDialog(false)
      setCoachToDelete(null)
    }
  }

  const isCurrentUser = (coachDni: string) => {
    return user?.dni === coachDni
  }

  const isCoachGymOwner = (coachId: string) => {
    return gymOwnerId === coachId
  }

  const getRowClassName = (coach: Coach) => {
    if (isCoachGymOwner(coach.id)) {
      return 'bg-amber-50 dark:bg-amber-950/30'
    }
    return ''
  }

  const columns = [
    { header: 'DNI', accessorKey: 'dni' as const },
    {
      header: 'Nombre',
      accessorKey: 'name' as const,
      cell: ({ row }: { row: { original: Coach } }) => (
        <div className="flex items-center gap-2">
          <span>{row.original.name}</span>
          {isCoachGymOwner(row.original.id) && (
            <Badge variant="default" className="text-xs bg-amber-500 hover:bg-amber-600">Dueño</Badge>
          )}
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
    {
      header: 'Cumpleaños',
      accessorKey: 'birthday' as const,
      cell: ({ row }: { row: { original: Coach } }) => {
        const dateStr = row.original.birthday.split('T')[0]
        const [year, month, day] = dateStr.split('-')
        return <span>{day}-{month}-{year}</span>
      },
    },
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
            <Link to={`/profile/coach/${row.original.id}`}>Perfil</Link>
          </Button>
          {isGymOwner && !isCoachGymOwner(row.original.id) && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteClick(row.original.id)}
              className="hover:opacity-80 transition-opacity"
            >
              Expulsar
            </Button>
          )}
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Entrenadores</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Search className="h-4 w-4" />
              Buscar Entrenador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Buscar por nombre, apellido o DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </CardContent>
        </Card>

        {isCoach && gymId && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Asignar Coach Existente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PersonSearch gymId={gymId} onAssignSuccess={loadCoaches} />
            </CardContent>
          </Card>
        )}

        {isGymOwner && gymId && gymAthletes.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ArrowUpCircle className="h-4 w-4" />
                Promover Atleta a Entrenador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {gymAthletes.map((athlete) => (
                  <div key={athlete.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="text-sm">
                      <span className="font-medium">{athlete.name} {athlete.surname}</span>
                      <span className="text-muted-foreground ml-2">({athlete.dni})</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePromoteToCoach(athlete.id)}
                      disabled={promoting === athlete.id}
                      className="hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <ArrowUpCircle className="mr-1 h-3 w-3" />
                      {promoting === athlete.id ? 'Promoviendo...' : 'Promover'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <DataTable columns={columns} data={filteredCoaches} loading={loading} rowClassName={getRowClassName} />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={showDeleteDialog}
        title="Expulsar Entrenador"
        description="¿Estas seguro de expulsar este entrenador del gimnasio? El entrenador sera removido de tu gimnasio."
        confirmText="Expulsar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteDialog(false)
          setCoachToDelete(null)
        }}
      />
    </div>
  )
}
