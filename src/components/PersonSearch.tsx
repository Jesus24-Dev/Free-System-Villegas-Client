import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Dumbbell, Users, Building2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { personApi } from '@/api/persons'
import { coachApi } from '@/api/coaches'
import type { PersonByDniResponse } from '@/types'

interface PersonSearchProps {
  gymId: string
  onAssignSuccess: () => void
}

export function PersonSearch({ gymId, onAssignSuccess }: PersonSearchProps) {
  const [dni, setDni] = useState('')
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState<PersonByDniResponse | null>(null)
  const [assigning, setAssigning] = useState(false)

  const handleSearch = async () => {
    if (!dni.trim()) {
      toast.error('Ingresa un DNI')
      return
    }

    try {
      setSearching(true)
      setResult(null)
      const data = await personApi.getByDni(dni.trim())
      setResult(data)
    } catch {
      toast.error('Error al buscar persona')
    } finally {
      setSearching(false)
    }
  }

  const handleAssignAthlete = async () => {
    if (!result?.athlete_id) return

    try {
      setAssigning(true)
      await coachApi.assignAthleteToGym(gymId, result.athlete_id)
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

  const handleAssignCoach = async () => {
    if (!result?.coach_id) return

    try {
      setAssigning(true)
      await coachApi.assignCoachToGym(gymId, result.coach_id)
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

    const isAthlete = result.roles?.includes('ATHLETE')
    const isCoach = result.roles?.includes('COACH')

    return (
      <div className="border rounded-md p-3 space-y-2 bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{result.name} {result.surname}</p>
            <p className="text-xs text-muted-foreground">DNI: {result.dni}</p>
          </div>
          <div className="flex gap-1">
            {isAthlete && <Badge variant="outline" className="text-xs">Atleta</Badge>}
            {isCoach && <Badge variant="outline" className="text-xs">Coach</Badge>}
            {!result.user_id && (
              <Badge variant="secondary" className="text-xs">Sin cuenta</Badge>
            )}
          </div>
        </div>

        {/* Sin cuenta */}
        {!result.user_id && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="h-3 w-3" />
            <span>Esta persona no tiene cuenta. Debe registrarse primero.</span>
          </div>
        )}

        {/* Atleta */}
        {result.user_id && isAthlete && (
          <>
            {result.has_gym ? (
              <Badge variant="default" className="bg-green-600 text-xs">
                <Users className="mr-1 h-3 w-3" />
                Ya tiene gimnasio asignado
              </Badge>
            ) : (
              <Button
                size="sm"
                onClick={handleAssignAthlete}
                disabled={assigning}
                className="hover:opacity-90 transition-opacity"
              >
                <Users className="mr-1 h-3 w-3" />
                Asignar a mi gimnasio
              </Button>
            )}
          </>
        )}

        {/* Coach */}
        {result.user_id && isCoach && (
          <>
            {result.owns_gym ? (
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-blue-600 text-xs">
                  <Building2 className="mr-1 h-3 w-3" />
                  Dueño de gimnasio
                </Badge>
              </div>
            ) : result.has_gym ? (
              <Badge variant="default" className="bg-green-600 text-xs">
                <Dumbbell className="mr-1 h-3 w-3" />
                Asignado a otro gimnasio
              </Badge>
            ) : (
              <Button
                size="sm"
                onClick={handleAssignCoach}
                disabled={assigning}
                className="hover:opacity-90 transition-opacity"
              >
                <Dumbbell className="mr-1 h-3 w-3" />
                Asignar a mi gimnasio
              </Button>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            placeholder="DNI para buscar..."
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
