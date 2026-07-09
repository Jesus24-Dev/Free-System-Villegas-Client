import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { athleteApi } from '@/api/athletes'
import { DataTable, type Column } from '@/components/tables/DataTable'
import { Pagination } from '@/components/tables/Pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search } from 'lucide-react'
import type { Athlete } from '@/types'

export function AthleteList() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const limit = 10

  const { data, isLoading } = useQuery({
    queryKey: ['athletes', page, limit, search],
    queryFn: () => athleteApi.getAll({ page, limit, search }),
  })

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'person.name',
      header: 'Nombre',
      render: (item) => {
        const athlete = item as unknown as Athlete
        return `${athlete.person?.name} ${athlete.person?.surname}`
      },
    },
    {
      key: 'person.dni',
      header: 'DNI',
      render: (item) => {
        const athlete = item as unknown as Athlete
        return athlete.person?.dni
      },
    },
    {
      key: 'gym.name',
      header: 'Gimnasio',
      render: (item) => {
        const athlete = item as unknown as Athlete
        return athlete.gym?.name
      },
    },
    {
      key: 'person.gender',
      header: 'Genero',
      render: (item) => {
        const athlete = item as unknown as Athlete
        return athlete.person?.gender === 'M' ? 'Masculino' : 'Femenino'
      },
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (item) => {
        const athlete = item as unknown as Athlete
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/athletes/${athlete.id}/edit`)
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
          <h1 className="text-3xl font-bold">Atletas</h1>
          <p className="text-muted-foreground">Gestiona tus atletas</p>
        </div>
        <Button onClick={() => navigate('/athletes/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Atleta
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
            data={(data?.data as Record<string, unknown>[]) ?? []}
            isLoading={isLoading}
            onRowClick={(item) => {
              const athlete = item as unknown as Athlete
              navigate(`/athletes/${athlete.id}/edit`)
            }}
            emptyMessage="No se encontraron atletas"
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
