import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Dumbbell, Users } from 'lucide-react'
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

  const canAssignAsAthlete = result?.user_id && result?.roles?.includes('ATHLETE') && !result?.athlete_id
  const canAssignAsCoach = result?.user_id && result?.roles?.includes('COACH') && !result?.coach_id

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            placeholder="DNI para asignar..."
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

      {result && (
        <div className="border rounded-md p-3 space-y-2 bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{result.name} {result.surname}</p>
              <p className="text-xs text-muted-foreground">DNI: {result.dni}</p>
            </div>
            <div className="flex gap-1">
              {result.roles?.map((role) => (
                <Badge key={role} variant="outline" className="text-xs">
                  {role === 'ATHLETE' ? 'Atleta' : role === 'COACH' ? 'Coach' : role}
                </Badge>
              ))}
              {!result.user_id && (
                <Badge variant="secondary" className="text-xs">Sin cuenta</Badge>
              )}
            </div>
          </div>

          {!result.user_id ? (
            <p className="text-xs text-muted-foreground">
              Sin cuenta en el sistema
            </p>
          ) : (
            <div className="flex gap-2">
              {canAssignAsAthlete && (
                <Button
                  size="sm"
                  onClick={handleAssignAthlete}
                  disabled={assigning}
                  className="hover:opacity-90 transition-opacity"
                >
                  <Users className="mr-1 h-3 w-3" />
                  Asignar Atleta
                </Button>
              )}
              {result.athlete_id && (
                <Badge variant="default" className="bg-green-600 text-xs">
                  <Users className="mr-1 h-3 w-3" />
                  Ya es Atleta
                </Badge>
              )}
              {canAssignAsCoach && (
                <Button
                  size="sm"
                  onClick={handleAssignCoach}
                  disabled={assigning}
                  className="hover:opacity-90 transition-opacity"
                >
                  <Dumbbell className="mr-1 h-3 w-3" />
                  Asignar Coach
                </Button>
              )}
              {result.coach_id && (
                <Badge variant="default" className="bg-blue-600 text-xs">
                  <Dumbbell className="mr-1 h-3 w-3" />
                  Ya es Coach
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
