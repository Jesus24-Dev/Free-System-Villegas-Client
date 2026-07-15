import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { gymApi } from '@/api/gyms'
import { adminGymApi } from '@/api/admin'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
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

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [gymToDelete, setGymToDelete] = useState<string | null>(null)

  const loadGyms = async () => {
    try {
      setLoading(true)
      const data = await gymApi.getAll({ page, limit })
      setGyms(data)
      setTotalPages(Math.ceil(data.length / limit) || 1)
    } catch {
      toast.error('Error al cargar gimnasios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGyms()
  }, [page])

  const handleDeleteClick = (id: string) => {
    setGymToDelete(id)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!gymToDelete) return
    try {
      await adminGymApi.delete(gymToDelete)
      toast.success('Gimnasio eliminado correctamente')
      loadGyms()
    } catch {
      toast.error('Error al eliminar gimnasio')
    } finally {
      setShowDeleteDialog(false)
      setGymToDelete(null)
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
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Link to={`/gyms/${row.original.id}/edit`}>Editar</Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteClick(row.original.id)}
            className="hover:opacity-80 transition-opacity"
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
        <Button asChild className="hover:opacity-90 transition-opacity">
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

      <ConfirmDialog
        open={showDeleteDialog}
        title="Eliminar Gimnasio"
        description="¿Estas seguro de eliminar este gimnasio? Esta accion no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteDialog(false)
          setGymToDelete(null)
        }}
      />
    </div>
  )
}
