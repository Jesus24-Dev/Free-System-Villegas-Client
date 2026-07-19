import { useState, useEffect } from 'react'
import { adminUserApi } from '@/api/admin'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@/types'

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await adminUserApi.getAll({ page, limit })
      setUsers(response.data)
      setTotalPages(response.totalPages)
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [page])

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return
    try {
      await adminUserApi.delete(userToDelete)
      toast.success('Usuario eliminado correctamente')
      loadUsers()
    } catch {
      // handled by interceptor
    } finally {
      setShowDeleteDialog(false)
      setUserToDelete(null)
    }
  }

  const columns = [
    { header: 'Email', accessorKey: 'email' as const },
    {
      header: 'Rol',
      accessorKey: 'role' as const,
      cell: ({ row }: { row: { original: User } }) => (
        <Badge variant={row.original.role === 'ADMIN' ? 'default' : 'secondary'}>
          {row.original.role}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      accessorKey: 'id' as const,
      cell: ({ row }: { row: { original: User } }) => (
        <div className="flex gap-1">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteClick(row.original.id)}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ]

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Usuarios</h1>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="max-w-sm"
        />
      </div>

      <DataTable columns={columns} data={filteredUsers} loading={loading} />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={showDeleteDialog}
        title="Eliminar Usuario"
        description="¿Estas seguro de eliminar este usuario? Esta accion no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteDialog(false)
          setUserToDelete(null)
        }}
      />
    </div>
  )
}