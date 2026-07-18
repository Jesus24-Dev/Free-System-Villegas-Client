import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { DniInput } from '@/components/ui/dni-input'
import { Users, Trophy, Dumbbell, CreditCard, Plus, Check, X, MapPin, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { athleteApi } from '@/api/athletes'
import { coachApi } from '@/api/coaches'
import { gymApi } from '@/api/gyms'
import { competitionApi } from '@/api/competitions'
import { gymPaymentApi } from '@/api/gymPayments'
import { pagoMovilApi } from '@/api/pagoMovil'
import type { AthleteProfile, GymDetails, Gym, PagoMovil } from '@/types'

export function Dashboard() {
  const { user, getEffectiveRole } = useAuthStore()
  const userRole = user ? getEffectiveRole() : ''

  if (userRole === 'ATHLETE') {
    return <AthleteDashboard userId={user?.id || ''} />
  }

  if (userRole === 'COACH') {
    return <CoachDashboard />
  }

  return <AdminDashboard />
}

function AdminDashboard() {
  const [counts, setCounts] = useState({ athletes: 0, coaches: 0, gyms: 0, competitions: 0 })
  const [loading, setLoading] = useState(true)

  const loadCounts = async () => {
    try {
      setLoading(true)
      const [athletes, coaches, gyms, competitions] = await Promise.all([
        athleteApi.getAll(),
        coachApi.getAll(),
        gymApi.getAll(),
        competitionApi.getAll(),
      ])
      setCounts({
        athletes: athletes.data.length,
        coaches: coaches.length,
        gyms: gyms.length,
        competitions: competitions.length,
      })
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCounts()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Panel de Control</h1>
        <p className="text-muted-foreground">Bienvenido a Free System Villegas</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atletas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '--' : counts.athletes}</div>
            <Link to="/athletes">
              <Button variant="link" className="px-0 text-sm">Ver todos</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrenadores</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '--' : counts.coaches}</div>
            <Link to="/coaches">
              <Button variant="link" className="px-0 text-sm">Ver todos</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gimnasios</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '--' : counts.gyms}</div>
            <Link to="/gyms">
              <Button variant="link" className="px-0 text-sm">Ver todos</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Competencias</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '--' : counts.competitions}</div>
            <Link to="/competitions">
              <Button variant="link" className="px-0 text-sm">Ver todas</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Tus acciones recientes apareceran aqui</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Sin actividad reciente</p>
        </CardContent>
      </Card>
    </div>
  )
}

function CoachDashboard() {
  const { user, setGymContext, setUserFromProfile, hasAnyRole } = useAuthStore()
  const [gymDetails, setGymDetails] = useState<GymDetails | null>(null)
  const [gymInfo, setGymInfo] = useState<Gym | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [competitionsCount, setCompetitionsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gymId, setGymId] = useState<string | null>(null)
  const [registering, setRegistering] = useState(false)

  const isAlreadyAthlete = hasAnyRole(['ATHLETE'])

  const [pagoMovils, setPagoMovils] = useState<PagoMovil[]>([])
  const [showPagoForm, setShowPagoForm] = useState(false)
  const [pagoFormData, setPagoFormData] = useState({
    bank_to_pay: '',
    dni: '',
    phone: '',
  })
  const [pagoToDelete, setPagoToDelete] = useState<string | null>(null)
  const [showDeletePagoDialog, setShowDeletePagoDialog] = useState(false)

  const loadCoachData = async () => {
    if (!user) return

    try {
      setLoading(true)

      const coachMe = await coachApi.getMe()

      if (!coachMe.gym_id) {
        setError('No tienes un gimnasio asignado')
        setLoading(false)
        return
      }

      const [gym, details, competitions, pagoMovilsData] = await Promise.all([
        gymApi.getById(coachMe.gym_id),
        gymApi.getDetails(coachMe.gym_id),
        competitionApi.getAll(),
        pagoMovilApi.getByGym(coachMe.gym_id),
      ])

      const owner = gym.owner?.id === coachMe.id
      setGymInfo(gym)
      setIsOwner(owner)
      setGymId(coachMe.gym_id)
      setGymContext(coachMe.gym_id, owner)
      setCompetitionsCount(competitions.length)
      setGymDetails(details)
      setPagoMovils(pagoMovilsData)
    } catch {
      setError('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const loadPagoMovils = async () => {
    if (!gymId) return
    try {
      const data = await pagoMovilApi.getByGym(gymId)
      setPagoMovils(data)
    } catch {
      // handled by interceptor
    }
  }

  const handleCreatePagoMovil = async () => {
    if (!gymId) return
    if (!pagoFormData.bank_to_pay || !pagoFormData.dni || !pagoFormData.phone) {
      toast.error('Completa todos los campos')
      return
    }
    try {
      await pagoMovilApi.create(gymId, pagoFormData)
      toast.success('Pago movil creado correctamente')
      setShowPagoForm(false)
      setPagoFormData({ bank_to_pay: '', dni: '', phone: '' })
      loadPagoMovils()
    } catch {
      // handled by interceptor
    }
  }

  const handleDeletePagoMovil = async () => {
    if (!pagoToDelete) return
    try {
      await pagoMovilApi.delete(pagoToDelete)
      toast.success('Pago movil eliminado correctamente')
      loadPagoMovils()
    } catch {
      // handled by interceptor
    } finally {
      setShowDeletePagoDialog(false)
      setPagoToDelete(null)
    }
  }

  const handleRegisterAsAthlete = async () => {
    try {
      setRegistering(true)
      const updatedProfile = await coachApi.registerAsAthlete()
      setUserFromProfile(updatedProfile)
      toast.success('Te has registrado como atleta exitosamente')
    } catch {
      // handled by interceptor
    } finally {
      setRegistering(false)
    }
  }

  useEffect(() => {
    loadCoachData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Panel de Entrenador</h1>
          <p className="text-muted-foreground">Cargando informacion de tu gimnasio...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Panel de Entrenador</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
        <Card>
          <CardContent className="py-6">
            <div className="flex flex-col items-center gap-4">
              <p className="text-muted-foreground text-center">
                Para comenzar a gestionar tu gimnasio, primero debes registrar uno.
              </p>
              <Link to="/gyms/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Gimnasio
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Panel de Entrenador</h1>
        <p className="text-muted-foreground">
          {gymInfo ? `Gimnasio: ${gymInfo.name}` : 'Informacion de tu gimnasio'}
        </p>
      </div>

      {gymInfo && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mi Gimnasio</CardTitle>
            <div className="flex items-center gap-2">
              {isOwner && (
                <Button variant="outline" size="sm" asChild className="hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Link to={`/gyms/${gymInfo.id}/edit`}>
                    <Pencil className="mr-1 h-3 w-3" />
                    Editar
                  </Link>
                </Button>
              )}
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{gymInfo.name}</div>
              <p className="text-sm text-muted-foreground">{gymInfo.address}</p>
              <p className="text-sm text-muted-foreground">
                {gymInfo.state.replace(/_/g, ' ')}
              </p>
              <p className="text-sm font-medium">
                Mensualidad: ${gymInfo.monthly_payment}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isAlreadyAthlete && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Participar como Atleta</h3>
                <p className="text-sm text-muted-foreground">
                  Registrate como atleta para participar en competencias
                </p>
              </div>
              <Button
                onClick={handleRegisterAsAthlete}
                disabled={registering}
                className="hover:opacity-90 transition-opacity"
              >
                {registering ? 'Registrando...' : 'Activar como Atleta'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atletas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gymDetails ? gymDetails.athletes.length : '--'}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Link to="/athletes">
                <Button variant="link" className="px-0 text-sm">Ver todos</Button>
              </Link>
              {isOwner && (
                <Link to="/athletes/new">
                  <Button variant="link" className="px-0 text-sm">
                    <Plus className="mr-1 h-3 w-3" />
                    Nuevo
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrenadores</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gymDetails ? gymDetails.coaches.length : '--'}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Link to="/coaches">
                <Button variant="link" className="px-0 text-sm">Ver todos</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Competencias</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{competitionsCount}</div>
            <Link to="/competitions">
              <Button variant="link" className="px-0 text-sm">Ver todas</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">Metodos de Pago Movil</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </div>
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPagoForm(true)}
              className="hover:opacity-90 transition-opacity"
            >
              <Plus className="mr-1 h-4 w-4" />
              Nuevo
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {showPagoForm && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/50 mb-4">
              <h4 className="font-semibold text-sm">Nuevo Metodo de Pago Movil</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bank">Banco</Label>
                  <Input
                    id="bank"
                    value={pagoFormData.bank_to_pay}
                    onChange={(e) => setPagoFormData({ ...pagoFormData, bank_to_pay: e.target.value })}
                    placeholder="Ej: 0102 - Banco de Venezuela"
                  />
                </div>
                <div>
                  <Label htmlFor="dni">DNI</Label>
                  <DniInput
                    id="dni"
                    value={pagoFormData.dni}
                    onChange={(value) => setPagoFormData({ ...pagoFormData, dni: value })}
                    placeholder="12345678"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefono</Label>
                  <Input
                    id="phone"
                    value={pagoFormData.phone}
                    onChange={(e) => setPagoFormData({ ...pagoFormData, phone: e.target.value })}
                    placeholder="Ej: 04141234567"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreatePagoMovil} size="sm">
                  <Check className="mr-1 h-4 w-4" />
                  Crear
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowPagoForm(false)
                    setPagoFormData({ bank_to_pay: '', dni: '', phone: '' })
                  }}
                >
                  <X className="mr-1 h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {pagoMovils.length === 0 ? (
            <p className="text-muted-foreground text-sm">No hay metodos de pago movil registrados</p>
          ) : (
            <div className="space-y-2">
              {pagoMovils.map((pm) => (
                <div key={pm.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{pm.bank_to_pay}</p>
                    <p className="text-xs text-muted-foreground">DNI: {pm.dni} | Tel: {pm.phone}</p>
                  </div>
                  {isOwner && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setPagoToDelete(pm.id)
                        setShowDeletePagoDialog(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showDeletePagoDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeletePagoDialog(false)
              setPagoToDelete(null)
            }
          }}
        >
          <div className="bg-background rounded-lg p-6 space-y-4 max-w-md">
            <h3 className="font-semibold">Eliminar Metodo de Pago Movil</h3>
            <p className="text-sm text-muted-foreground">
              ¿Estas seguro de eliminar este metodo de pago movil? Esta accion no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeletePagoDialog(false)
                  setPagoToDelete(null)
                }}
              >
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeletePagoMovil}>
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AthleteDashboard({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<AthleteProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentData, setPaymentData] = useState({
    day_payed: new Date().toISOString().split('T')[0],
    amount: '',
    payment_reference: '',
  })
  const [pagoMovils, setPagoMovils] = useState<PagoMovil[]>([])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await athleteApi.getProfile(userId)
      setProfile(data)

      if (data.gym && Object.keys(data.gym).length > 0 && data.gym.id_gym) {
        try {
          const pagoData = await pagoMovilApi.getByGym(data.gym.id_gym)
          setPagoMovils(pagoData)
        } catch {
          // Silently fail - pago movils are optional
        }
      }
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [userId])

  const handleCreatePayment = async () => {
    if (!profile?.gym || Object.keys(profile.gym).length === 0 || !paymentData.amount || !profile.gym.id_gym || !paymentData.payment_reference) {
      toast.error('Completa todos los campos')
      return
    }
    try {
      await gymPaymentApi.create({
        day_payed: new Date(paymentData.day_payed).toISOString(),
        amount: parseFloat(paymentData.amount),
        athlete_id: profile.id,
        gym_id: profile.gym.id_gym,
        payment_reference: paymentData.payment_reference,
      })
      toast.success('Pago registrado correctamente')
      setShowPaymentForm(false)
      setPaymentData({
        day_payed: new Date().toISOString().split('T')[0],
        amount: '',
        payment_reference: '',
      })
      loadProfile()
    } catch {
      // handled by interceptor
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-VE')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mi Panel</h1>
          <p className="text-muted-foreground">Cargando informacion...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mi Panel</h1>
          <p className="text-muted-foreground">No se pudo cargar tu perfil</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold">Mi Panel</h1>
        <p className="text-muted-foreground">
          Hola, {profile.personal.name} {profile.personal.surname}
        </p>
      </div>

      {profile.gym && Object.keys(profile.gym).length > 0 ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mi Gimnasio</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{profile.gym.name}</div>
              <p className="text-sm text-muted-foreground">{profile.gym.address}</p>
              <p className="text-sm text-muted-foreground">{profile.gym.state}</p>
              <p className="text-sm font-medium">Mensualidad: {formatCurrency(profile.gym.monthly_payment)}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-6">
            <p className="text-muted-foreground text-center">
              Aun no tienes un gimnasio asignado. Un entrenador te asignara pronto.
            </p>
          </CardContent>
        </Card>
      )}

      {profile.gym && Object.keys(profile.gym).length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registrar Pago</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {pagoMovils.length > 0 && (
              <div className="mb-4 p-3 border rounded-lg bg-muted/50">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Datos de pago movil de tu gimnasio:
                </p>
                <div className="space-y-1">
                  {pagoMovils.map((pm) => (
                    <div key={pm.id} className="text-sm">
                      <span className="font-medium">{pm.bank_to_pay}</span>
                      <span className="text-muted-foreground"> | DNI: {pm.dni} | Tel: {pm.phone}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!showPaymentForm ? (
              <Button onClick={() => setShowPaymentForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Registrar Pago
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="day_payed">Fecha</Label>
                    <Input
                      id="day_payed"
                      type="date"
                      value={paymentData.day_payed}
                      onChange={(e) => setPaymentData({ ...paymentData, day_payed: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Monto (BsD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reference">Referencia</Label>
                    <Input
                      id="reference"
                      value={paymentData.payment_reference}
                      onChange={(e) => setPaymentData({ ...paymentData, payment_reference: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreatePayment}>
                    <Check className="mr-2 h-4 w-4" />
                    Confirmar
                  </Button>
                  <Button variant="outline" onClick={() => setShowPaymentForm(false)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Mis Pagos</CardTitle>
          <CardDescription>Historial de pagos realizados</CardDescription>
        </CardHeader>
        <CardContent>
          {!profile.payments || profile.payments.length === 0 ? (
            <p className="text-muted-foreground text-sm">Sin pagos registrados</p>
          ) : (
            <div className="space-y-2">
              {profile.payments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{formatDate(payment.date)}</p>
                    <p className="text-xs text-muted-foreground">Ref: {payment.reference}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(payment.amount)}</p>
                    <Badge variant={payment.confirmed ? 'default' : 'secondary'}>
                      {payment.confirmed ? 'Confirmado' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mis Competencias</CardTitle>
          <CardDescription>Competencias en las que participas</CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden">
          {!profile.competitions || profile.competitions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No estas inscrito en ninguna competencia</p>
          ) : (
            <div className="space-y-2">
              {profile.competitions.map((comp, index) => (
                <div key={index} className="flex items-center justify-between gap-4 border-b pb-2 last:border-0 min-w-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{comp.competition}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {comp.division.mode} - {comp.division.category} - {comp.division.weight}kg
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant={comp.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {comp.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
