import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { gymApi } from '@/api/gyms'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import type { Gym } from '@/types'

export function GymsPage() {
  const [gyms, setGyms] = useState<Gym[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  useEffect(() => {
    loadGyms()
  }, [page])

  const loadGyms = async () => {
    try {
      setLoading(true)
      const data = await gymApi.getAll({ page, limit })
      setGyms(data)
      setTotalPages(Math.ceil(data.length / limit) || 1)
    } catch (error) {
      toast.error('Error al cargar gimnasios')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este gimnasio?')) {
      try {
        await gymApi.delete(id)
        toast.success('Gimnasio eliminado correctamente')
        loadGyms()
      } catch (error) {
        toast.error('Error al eliminar gimnasio')
      }
    }
  }

  const formatState = (state: string) => {
    return state
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }

  const columns = [
    { header: 'Nombre', accessorKey: 'name' as const },
    { header: 'Direccion', accessorKey: 'address' as const },
    {
      header: 'Estado',
      accessorKey: 'state' as const,
      cell: ({ row }: { row: { original: Gym } }) => (
        <span>{formatState(row.original.state)}</span>
      ),
    },
    {
      header: 'Pago Mensual',
      accessorKey: 'monthly_payment' as const,
      cell: ({ row }: { row: { original: Gym } }) => (
        <span>${row.original.monthly_payment.toFixed(2)}</span>
      ),
    },
    {
      header: 'Acciones',
      accessorKey: 'id' as const,
      cell: ({ row }: { row: { original: Gym } }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/gyms/${row.original.id}/edit`}>Editar</Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ]

  const filteredGyms = gyms.filter(
    (gym) =>
      gym.name.toLowerCase().includes(search.toLowerCase()) ||
      gym.address.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gimnasios</h1>
        <Button asChild>
          <Link to="/gyms/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Gimnasio
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar gimnasio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <DataTable columns={columns} data={filteredGyms} loading={loading} />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
