import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { gymApi } from '@/api/gyms'
import { DataTable, type Column } from '@/components/tables/DataTable'
import { Pagination } from '@/components/tables/Pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Plus, Search } from 'lucide-react'
import type { Gym } from '@/types'

export function GymList() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const limit = 10

  const { data, isLoading } = useQuery({
    queryKey: ['gyms', page, limit, search],
    queryFn: () => gymApi.getAll({ page, limit, search }),
  })

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'name',
      header: 'Nombre',
    },
    {
      key: 'address',
      header: 'Direccion',
    },
    {
      key: 'phone',
      header: 'Telefono',
    },
    {
      key: 'coach.person.name',
      header: 'Entrenador',
      render: (item) => {
        const gym = item as unknown as Gym
        return gym.coach?.person
          ? `${gym.coach.person.name} ${gym.coach.person.surname}`
          : 'Sin asignar'
      },
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (item) => {
        const gym = item as unknown as Gym
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/gyms/${gym.id}/edit`)
            }}
          >
            Editar
          </Button>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gimnasios</h1>
          <p className="text-muted-foreground">Gestiona tus gimnasios</p>
        </div>
        <Button onClick={() => navigate('/gyms/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Gimnasio
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={(data?.data as Record<string, unknown>[]) ?? []}
            isLoading={isLoading}
            onRowClick={(item) => {
              const gym = item as unknown as Gym
              navigate(`/gyms/${gym.id}/edit`)
            }}
            emptyMessage="No se encontraron gimnasios"
          />
          {data?.meta && (
            <div className="mt-4">
              <Pagination
                page={data.meta.page}
                totalPages={data.meta.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
