import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Users, Building2, Trophy, Dumbbell, CreditCard, Plus, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore, extractRole } from '@/stores/authStore'
import { athleteApi } from '@/api/athletes'
import { coachApi } from '@/api/coaches'
import { gymApi } from '@/api/gyms'
import { competitionApi } from '@/api/competitions'
import { gymPaymentApi } from '@/api/gymPayments'
import type { AthleteProfile } from '@/types'

export function Dashboard() {
  const { user } = useAuthStore()
  const userRole = user ? extractRole(user) : ''

  if (userRole === 'ATHLETE') {
    return <AthleteDashboard userId={user?.id || ''} />
  }

  return <AdminCoachDashboard />
}

function AdminCoachDashboard() {
  const [counts, setCounts] = useState({ athletes: 0, coaches: 0, gyms: 0, competitions: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCounts()
  }, [])

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
    } catch (error) {
      toast.error('Error al cargar estadisticas')
    } finally {
      setLoading(false)
    }
  }

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
            <Building2 className="h-4 w-4 text-muted-foreground" />
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

function AthleteDashboard({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<AthleteProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentData, setPaymentData] = useState({
    day_payed: new Date().toISOString().split('T')[0],
    amount: '',
    payment_reference: '',
  })

  useEffect(() => {
    loadProfile()
  }, [userId])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await athleteApi.getProfile(userId)
      setProfile(data)
    } catch (error) {
      toast.error('Error al cargar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePayment = async () => {
    if (!profile?.gym || !paymentData.amount) {
      toast.error('Completa todos los campos')
      return
    }
    try {
      await gymPaymentApi.create({
        day_payed: new Date(paymentData.day_payed).toISOString(),
        amount: parseFloat(paymentData.amount),
        athlete_id: userId,
        gym_id: '', // Will be resolved by backend
        payment_reference: paymentData.payment_reference || undefined,
      })
      toast.success('Pago registrado correctamente')
      setShowPaymentForm(false)
      setPaymentData({
        day_payed: new Date().toISOString().split('T')[0],
        amount: '',
        payment_reference: '',
      })
      loadProfile()
    } catch (error) {
      toast.error('Error al registrar pago')
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Panel</h1>
        <p className="text-muted-foreground">
          Hola, {profile.personal.name} {profile.personal.surname}
        </p>
      </div>

      {/* Gym Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mi Gimnasio</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {profile.gym ? (
            <div className="space-y-2">
              <div className="text-2xl font-bold">{profile.gym.name}</div>
              <p className="text-sm text-muted-foreground">{profile.gym.address}</p>
              <p className="text-sm text-muted-foreground">{profile.gym.state}</p>
              <p className="text-sm font-medium">Mensualidad: {formatCurrency(profile.gym.monthly_payment)}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">No tienes gimnasio asignado</p>
          )}
        </CardContent>
      </Card>

      {/* Payment Registration */}
      {profile.gym && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registrar Pago</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
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

      {/* Payments History */}
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

      {/* Competitions */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Competencias</CardTitle>
          <CardDescription>Competencias en las que participas</CardDescription>
        </CardHeader>
        <CardContent>
          {!profile.competitions || profile.competitions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No estas inscrito en ninguna competencia</p>
          ) : (
            <div className="space-y-2">
              {profile.competitions.map((comp, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{comp.competition}</p>
                    <p className="text-xs text-muted-foreground">
                      {comp.division.mode} - {comp.division.category} - {comp.division.weight}kg
                    </p>
                  </div>
                  <div className="text-right">
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
