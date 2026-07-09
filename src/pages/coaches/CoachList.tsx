import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { coachApi } from '@/api/coaches'
import { DataTable, type Column } from '@/components/tables/DataTable'
import { Pagination } from '@/components/tables/Pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Plus, Search } from 'lucide-react'
import type { Coach } from '@/types'

export function CoachList() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const limit = 10

  const { data, isLoading } = useQuery({
    queryKey: ['coaches', page, limit, search],
    queryFn: () => coachApi.getAll({ page, limit, search }),
  })

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'person.name',
      header: 'Nombre',
      render: (item) => {
        const coach = item as unknown as Coach
        return `${coach.person?.name} ${coach.person?.surname}`
      },
    },
    {
      key: 'person.dni',
      header: 'DNI',
      render: (item) => {
        const coach = item as unknown as Coach
        return coach.person?.dni
      },
    },
    {
      key: 'person.gender',
      header: 'Genero',
      render: (item) => {
        const coach = item as unknown as Coach
        return coach.person?.gender === 'M' ? 'Masculino' : 'Femenino'
      },
    },
    {
      key: 'gym.name',
      header: 'Gimnasio',
      render: (item) => {
        const coach = item as unknown as Coach
        return coach.gym?.name || 'Sin asignar'
      },
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (item) => {
        const coach = item as unknown as Coach
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/coaches/${coach.id}/edit`)
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
          <h1 className="text-3xl font-bold">Entrenadores</h1>
          <p className="text-muted-foreground">Gestiona tus entrenadores</p>
        </div>
        <Button onClick={() => navigate('/coaches/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Entrenador
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o DNI..."
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data={(data?.data as any[]) ?? []}
            isLoading={isLoading}
            onRowClick={(item) => {
              const coach = item as unknown as Coach
              navigate(`/coaches/${coach.id}/edit`)
            }}
            emptyMessage="No se encontraron entrenadores"
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
