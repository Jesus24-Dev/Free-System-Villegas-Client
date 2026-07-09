import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { competitionApi } from '@/api/competitions'
import { DataTable, type Column } from '@/components/tables/DataTable'
import { Pagination } from '@/components/tables/Pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search } from 'lucide-react'
import type { Competition } from '@/types'

const statusLabels: Record<string, string> = {
  UPCOMING: 'Proxima',
  IN_PROGRESS: 'En Curso',
  COMPLETED: 'Finalizada',
  CANCELLED: 'Cancelada',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  UPCOMING: 'secondary',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
}

export function CompetitionList() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const limit = 10

  const { data, isLoading } = useQuery({
    queryKey: ['competitions', page, limit, search],
    queryFn: () => competitionApi.getAll({ page, limit, search }),
  })

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'name',
      header: 'Nombre',
    },
    {
      key: 'date',
      header: 'Fecha',
      render: (item) => {
        const comp = item as unknown as Competition
        return new Date(comp.date).toLocaleDateString('es-VE')
      },
    },
    {
      key: 'location',
      header: 'Ubicacion',
    },
    {
      key: 'status',
      header: 'Estado',
      render: (item) => {
        const comp = item as unknown as Competition
        return (
          <Badge variant={statusVariants[comp.status] ?? 'default'}>
            {statusLabels[comp.status] ?? comp.status}
          </Badge>
        )
      },
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (item) => {
        const comp = item as unknown as Competition
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/competitions/${comp.id}/edit`)
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
          <h1 className="text-3xl font-bold">Competencias</h1>
          <p className="text-muted-foreground">Gestiona tus competencias</p>
        </div>
        <Button onClick={() => navigate('/competitions/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Competencia
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
              const comp = item as unknown as Competition
              navigate(`/competitions/${comp.id}/edit`)
            }}
            emptyMessage="No se encontraron competencias"
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
