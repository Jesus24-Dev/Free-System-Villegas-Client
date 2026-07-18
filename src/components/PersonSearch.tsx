import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DniInput } from '@/components/ui/dni-input'
import { Badge } from '@/components/ui/badge'
import { Search, Dumbbell, Users, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { personApi } from '@/api/persons'
import { coachApi } from '@/api/coaches'

interface PersonSearchProps {
  gymId: string
  mode: 'athlete' | 'coach'
  onAssignSuccess: () => void
}

export function PersonSearch({ gymId, mode, onAssignSuccess }: PersonSearchProps) {
  const [dni, setDni] = useState('')
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState<{
    id: string
    dni: string
    name: string
    surname: string
    has_gym: boolean
  } | null>(null)
  const [assigning, setAssigning] = useState(false)

  const handleSearch = async () => {
    if (!dni.trim()) {
      toast.error('Ingresa un DNI')
      return
    }

    try {
      setSearching(true)
      setResult(null)

      if (mode === 'coach') {
        const data = await personApi.getCoachGymByDni(dni.trim())
        setResult(data)
      } else {
        const data = await personApi.getAthleteGymByDni(dni.trim())
        setResult(data)
      }
    } catch {
      toast.error('Persona no encontrada')
    } finally {
      setSearching(false)
    }
  }

  const handleAssignAthlete = async (athleteId: string) => {
    try {
      setAssigning(true)
      await coachApi.assignAthleteToGym(gymId, athleteId)
      toast.success('Atleta asignado correctamente')
      setResult(null)
      setDni('')
      onAssignSuccess()
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } }
      const message = axiosError?.response?.data?.message || 'Error al asignar atleta'
      toast.error(message)
    } finally {
      setAssigning(false)
    }
  }

  const handleAssignCoach = async (coachId: string) => {
    try {
      setAssigning(true)
      await coachApi.assignCoachToGym(gymId, coachId)
      toast.success('Entrenador asignado correctamente')
      setResult(null)
      setDni('')
      onAssignSuccess()
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } }
      const message = axiosError?.response?.data?.message || 'Error al asignar entrenador'
      toast.error(message)
    } finally {
      setAssigning(false)
    }
  }

  const renderResult = () => {
    if (!result) return null

    if (mode === 'athlete') {
      const athleteResult = result as {
        id: string
        dni: string
        name: string
        surname: string
        athlete_id: string
        has_gym: boolean
      }

      return (
        <div className="border rounded-md p-3 space-y-2 bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{result.name} {result.surname}</p>
              <p className="text-xs text-muted-foreground">DNI: {result.dni}</p>
            </div>
            <Badge variant="outline" className="text-xs">Atleta</Badge>
          </div>

          {athleteResult.has_gym ? (
            <Badge variant="default" className="bg-green-600 text-xs">
              <Users className="mr-1 h-3 w-3" />
              Ya tiene gimnasio asignado
            </Badge>
          ) : (
            <Button
              size="sm"
              onClick={() => handleAssignAthlete(athleteResult.athlete_id)}
              disabled={assigning}
              className="hover:opacity-90 transition-opacity"
            >
              <Users className="mr-1 h-3 w-3" />
              Asignar a mi gimnasio
            </Button>
          )}
        </div>
      )
    }

    const coachResult = result as {
      id: string
      dni: string
      name: string
      surname: string
      coach_id: string
      has_gym: boolean
      owns_gym: boolean
    }

    return (
      <div className="border rounded-md p-3 space-y-2 bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{result.name} {result.surname}</p>
            <p className="text-xs text-muted-foreground">DNI: {result.dni}</p>
          </div>
          <Badge variant="outline" className="text-xs">Coach</Badge>
        </div>

        {coachResult.owns_gym ? (
          <Badge variant="default" className="bg-blue-600 text-xs">
            <Building2 className="mr-1 h-3 w-3" />
            Dueño de gimnasio
          </Badge>
        ) : coachResult.has_gym ? (
          <Badge variant="default" className="bg-green-600 text-xs">
            <Dumbbell className="mr-1 h-3 w-3" />
            Asignado a otro gimnasio
          </Badge>
        ) : (
          <Button
            size="sm"
            onClick={() => handleAssignCoach(coachResult.coach_id)}
            disabled={assigning}
            className="hover:opacity-90 transition-opacity"
          >
            <Dumbbell className="mr-1 h-3 w-3" />
            Asignar a mi gimnasio
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <DniInput
            value={dni}
            onChange={(value) => setDni(value)}
            placeholder="12345678"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={searching}
          size="sm"
          className="hover:opacity-90 transition-opacity"
        >
          <Search className="mr-1 h-4 w-4" />
          {searching ? '...' : 'Buscar'}
        </Button>
      </div>

      {renderResult()}
    </div>
  )
}
