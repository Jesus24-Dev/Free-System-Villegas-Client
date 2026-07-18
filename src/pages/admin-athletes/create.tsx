import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAthleteApi, adminPersonApi, type CreateAthleteDto, type Person } from '@/api/admin'
import { gymApi } from '@/api/gyms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import type { Gym } from '@/types'

export function CreateAthletePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [persons, setPersons] = useState<Person[]>([])
  const [gyms, setGyms] = useState<Gym[]>([])
  const [searchDni, setSearchDni] = useState('')
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)

  const [formData, setFormData] = useState<CreateAthleteDto>({
    person_id: '',
    gym_id: undefined,
  })

  const loadData = async () => {
    try {
      const [personsResponse, gymsData] = await Promise.all([
        adminPersonApi.getAll({ page: 1, limit: 100 }),
        gymApi.getAll(),
      ])
      setPersons(personsResponse.data)
      setGyms(gymsData)
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSearchPerson = () => {
    const person = persons.find(p => p.dni.toLowerCase() === searchDni.toLowerCase())
    if (person) {
      setSelectedPerson(person)
      setFormData({ ...formData, person_id: person.id })
    } else {
      setSelectedPerson(null)
      toast.error('Persona no encontrada')
    }
  }

  const handleSubmit = async () => {
    if (!formData.person_id) {
      toast.error('Debe seleccionar una persona')
      return
    }

    try {
      setSaving(true)
      await adminAthleteApi.create(formData)
      toast.success('Atleta creado correctamente')
      navigate('/admin-athletes')
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando datos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Crear Atleta</h1>
        <p className="text-muted-foreground">
          Completa los datos para crear un nuevo atleta
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Atleta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="search-dni">Buscar Persona por DNI *</Label>
            <div className="flex gap-2">
              <Input
                id="search-dni"
                value={searchDni}
                onChange={(e) => setSearchDni(e.target.value)}
                placeholder="Ingrese el DNI"
              />
              <Button type="button" onClick={handleSearchPerson}>
                Buscar
              </Button>
            </div>
          </div>

          {selectedPerson && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium">Persona seleccionada:</h4>
              <p className="text-sm text-muted-foreground">
                {selectedPerson.name} {selectedPerson.surname} - {selectedPerson.dni}
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="gym_id">Gimnasio (opcional)</Label>
            <Select
              id="gym_id"
              value={formData.gym_id || ''}
              onChange={(e) => setFormData({ ...formData, gym_id: e.target.value || undefined })}
            >
              <option value="">Sin gimnasio</option>
              {gyms.map((gym) => (
                <option key={gym.id} value={gym.id}>
                  {gym.name}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => navigate('/admin-athletes')}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={saving || !formData.person_id}
        >
          {saving ? 'Creando...' : 'Crear Atleta'}
        </Button>
      </div>
    </div>
  )
}