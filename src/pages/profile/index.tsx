import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { athleteApi } from '@/api/athletes'
import { coachApi } from '@/api/coaches'
import { gymApi } from '@/api/gyms'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, User, Dumbbell, CreditCard, Trophy } from 'lucide-react'
import type { AthleteProfile, CoachProfile, Gym } from '@/types'

export function ProfilePage() {
  const { id, type } = useParams<{ id: string; type: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [athleteProfile, setAthleteProfile] = useState<AthleteProfile | null>(null)
  const [coachProfile, setCoachProfile] = useState<CoachProfile | null>(null)
  const [coachGym, setCoachGym] = useState<Gym | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      if (!id || !type) return

      try {
        setLoading(true)
        if (type === 'athlete') {
          const profile = await athleteApi.getProfile(id)
          setAthleteProfile(profile)
        } else if (type === 'coach') {
          const [profile, gymData] = await Promise.all([
            coachApi.getProfile(id),
            coachApi.getProfile(id).then(p => p.gym_id ? gymApi.getById(p.gym_id) : null)
          ])
          setCoachProfile(profile)
          setCoachGym(gymData)
        }
      } catch {
        // handled by interceptor
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [id, type])

  const formatDate = (date: string) => {
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
  }

  const hasGym = (gym: AthleteProfile['gym']) => {
    return gym && Object.keys(gym).length > 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Cargando perfil...</div>
      </div>
    )
  }

  if (type === 'athlete' && athleteProfile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Perfil del Atleta</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Datos Personales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nombre:</span>
                <span className="font-medium">{athleteProfile.personal.name} {athleteProfile.personal.surname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">DNI:</span>
                <span className="font-medium">{athleteProfile.personal.dni}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha de Nacimiento:</span>
                <span className="font-medium">{formatDate(athleteProfile.personal.birthday)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Género:</span>
                <Badge variant="outline">
                  {athleteProfile.personal.gender === 'MALE' ? 'Masculino' : 'Femenino'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Dumbbell className="h-4 w-4" />
                Gimnasio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {hasGym(athleteProfile.gym) ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nombre:</span>
                    <span className="font-medium">{athleteProfile.gym.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dirección:</span>
                    <span className="font-medium">{athleteProfile.gym.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado:</span>
                    <span className="font-medium">{athleteProfile.gym.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mensualidad:</span>
                    <span className="font-medium">${athleteProfile.gym.monthly_payment}</span>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-4">No asignado a un gimnasio</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Pagos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {athleteProfile.payments.length > 0 ? (
                <div className="space-y-2">
                  {athleteProfile.payments.map((payment, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">{formatDate(payment.date)}</span>
                      <span className="text-sm font-medium">${payment.amount}</span>
                      <Badge variant={payment.confirmed ? 'default' : 'secondary'}>
                        {payment.confirmed ? 'Confirmado' : 'Pendiente'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No hay pagos registrados</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Competiciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {athleteProfile.competitions.length > 0 ? (
                <div className="space-y-2">
                  {athleteProfile.competitions.map((comp, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">{comp.competition}</span>
                      <Badge variant="outline">{comp.division.mode}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No hay competiciones registradas</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (type === 'coach' && coachProfile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Perfil del Entrenador</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Datos Personales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nombre:</span>
                <span className="font-medium">{coachProfile.name} {coachProfile.surname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">DNI:</span>
                <span className="font-medium">{coachProfile.dni}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha de Nacimiento:</span>
                <span className="font-medium">{formatDate(coachProfile.birthday)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Género:</span>
                <Badge variant="outline">
                  {coachProfile.gender === 'MALE' ? 'Masculino' : 'Femenino'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado:</span>
                <Badge variant={coachProfile.status ? 'default' : 'destructive'}>
                  {coachProfile.status ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Dumbbell className="h-4 w-4" />
                Gimnasio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {coachGym ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nombre:</span>
                    <span className="font-medium">{coachGym.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dirección:</span>
                    <span className="font-medium">{coachGym.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado:</span>
                    <span className="font-medium">{coachGym.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mensualidad:</span>
                    <span className="font-medium">${coachGym.monthly_payment}</span>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-4">No asignado a un gimnasio</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Perfil no encontrado</h1>
      </div>
      <p className="text-muted-foreground">No se pudo cargar el perfil solicitado.</p>
    </div>
  )
}
