import { useState, useEffect } from 'react'
import { adminPersonApi } from '@/api/admin'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import type { Person } from '@/types'

export function PersonsPage() {
  const [persons, setPersons] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [personToDelete, setPersonToDelete] = useState<string | null>(null)

  const loadPersons = async () => {
    try {
      setLoading(true)
      const response = await adminPersonApi.getAll({ page, limit })
      setPersons(response.data)
      setTotalPages(response.totalPages)
    } catch {
      toast.error('Error al cargar personas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPersons()
  }, [page])

  const handleDeleteClick = (id: string) => {
    setPersonToDelete(id)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!personToDelete) return
    try {
      await adminPersonApi.delete(personToDelete)
      toast.success('Persona eliminada correctamente')
      loadPersons()
    } catch {
      toast.error('Error al eliminar persona')
    } finally {
      setShowDeleteDialog(false)
      setPersonToDelete(null)
    }
  }

  const columns = [
    { header: 'DNI', accessorKey: 'dni' as const },
    { header: 'Nombre', accessorKey: 'name' as const },
    { header: 'Apellido', accessorKey: 'surname' as const },
    {
      header: 'Genero',
      accessorKey: 'gender' as const,
      cell: ({ row }: { row: { original: Person } }) => (
        <Badge variant="outline">
          {row.original.gender === 'MALE' ? 'Masculino' : 'Femenino'}
        </Badge>
      ),
    },
    {
      header: 'Fecha Nac.',
      accessorKey: 'birthday' as const,
      cell: ({ row }: { row: { original: Person } }) => {
        const dateStr = row.original.birthday.split('T')[0]
        const [year, month, day] = dateStr.split('-')
        return <span>{day}-{month}-{year}</span>
      },
    },
    {
      header: 'Estado',
      accessorKey: 'status' as const,
      cell: ({ row }: { row: { original: Person } }) => (
        <Badge variant={row.original.status ? 'default' : 'destructive'}>
          {row.original.status ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      accessorKey: 'id' as const,
      cell: ({ row }: { row: { original: Person } }) => (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleDeleteClick(row.original.id)}
        >
          Eliminar
        </Button>
      ),
    },
  ]

  const filteredPersons = persons.filter(
    (person) =>
      person.name.toLowerCase().includes(search.toLowerCase()) ||
      person.surname.toLowerCase().includes(search.toLowerCase()) ||
      person.dni.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Personas</h1>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, apellido o DNI..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <DataTable columns={columns} data={filteredPersons} loading={loading} />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={showDeleteDialog}
        title="Eliminar Persona"
        description="¿Estas seguro de eliminar esta persona? Esta accion no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteDialog(false)
          setPersonToDelete(null)
        }}
      />
    </div>
  )
}