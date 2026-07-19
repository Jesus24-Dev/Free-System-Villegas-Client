import { useState, useEffect } from 'react'
import { pagoMovilApi } from '@/api/pagoMovil'
import { gymApi } from '@/api/gyms'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { DniInput } from '@/components/ui/dni-input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { PagoMovil, Gym } from '@/types'

export function PagoMovilPage() {
  const [pagoMovils, setPagoMovils] = useState<PagoMovil[]>([])
  const [gyms, setGyms] = useState<Gym[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedGymId, setSelectedGymId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    bank_to_pay: '',
    dni: '',
    phone: '',
  })

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [pagoMovilToDelete, setPagoMovilToDelete] = useState<string | null>(null)

  const loadGyms = async () => {
    try {
      const data = await gymApi.getAll()
      setGyms(data)
    } catch {
      // handled by interceptor
    }
  }

  const loadAllPagoMovils = async () => {
    try {
      setLoading(true)
      const result = await pagoMovilApi.getAll()
      setPagoMovils(result.data)
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  const loadPagoMovilsByGym = async () => {
    try {
      setLoading(true)
      const data = await pagoMovilApi.getByGym(selectedGymId)
      setPagoMovils(data)
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGyms()
    loadAllPagoMovils()
  }, [])

  useEffect(() => {
    if (selectedGymId) {
      loadPagoMovilsByGym()
    } else {
      loadAllPagoMovils()
    }
  }, [selectedGymId])

  const handleDeleteClick = (id: string) => {
    setPagoMovilToDelete(id)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!pagoMovilToDelete) return
    try {
      await pagoMovilApi.delete(pagoMovilToDelete)
      toast.success('Pago móvil eliminado correctamente')
      if (selectedGymId) {
        loadPagoMovilsByGym()
      } else {
        loadAllPagoMovils()
      }
    } catch {
      // handled by interceptor
    } finally {
      setShowDeleteDialog(false)
      setPagoMovilToDelete(null)
    }
  }

  const handleCreate = async () => {
    if (!formData.bank_to_pay || !formData.dni || !formData.phone) {
      toast.error('Completa todos los campos')
      return
    }
    try {
      await pagoMovilApi.create(selectedGymId, formData)
      toast.success('Pago móvil creado correctamente')
      setShowForm(false)
      setFormData({ bank_to_pay: '', dni: '', phone: '' })
      if (selectedGymId) {
        loadPagoMovilsByGym()
      } else {
        loadAllPagoMovils()
      }
    } catch {
      // handled by interceptor
    }
  }

  const columns = [
    {
      header: 'Banco',
      accessorKey: 'bank_to_pay' as const,
    },
    {
      header: 'DNI',
      accessorKey: 'dni' as const,
    },
    {
      header: 'Teléfono',
      accessorKey: 'phone' as const,
    },
    {
      header: 'Acciones',
      accessorKey: 'id' as const,
      cell: ({ row }: { row: { original: PagoMovil } }) => (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleDeleteClick(row.original.id)}
          className="hover:opacity-80 transition-opacity"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  const filteredPagoMovils = pagoMovils.filter(
    (pm) =>
      pm.dni.toLowerCase().includes(search.toLowerCase()) ||
      pm.phone.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pago Móvil</h1>
        <Button onClick={() => setShowForm(true)} disabled={!selectedGymId} className="hover:opacity-90 transition-opacity">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Pago Móvil
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <Label htmlFor="gym">Gimnasio</Label>
          <Select
            id="gym"
            value={selectedGymId}
            onChange={(e) => setSelectedGymId(e.target.value)}
          >
            <option value="">Seleccionar gimnasio</option>
            {gyms.map((gym) => (
              <option key={gym.id} value={gym.id}>
                {gym.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex-1 max-w-sm">
          <Label htmlFor="search">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              placeholder="DNI o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {showForm && (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
          <h3 className="font-semibold">Nuevo Pago Móvil</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bank">Banco</Label>
              <Input
                id="bank"
                value={formData.bank_to_pay}
                onChange={(e) => setFormData({ ...formData, bank_to_pay: e.target.value })}
                placeholder="Ej: 0102 - Banco de Venezuela"
              />
            </div>
            <div>
              <Label htmlFor="dni">DNI</Label>
              <DniInput
                id="dni"
                value={formData.dni}
                onChange={(value) => setFormData({ ...formData, dni: value })}
                placeholder="12345678"
              />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ej: 04141234567"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} className="hover:opacity-90 transition-opacity">Crear</Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="hover:bg-muted transition-colors">Cancelar</Button>
          </div>
        </div>
      )}

      <DataTable columns={columns} data={filteredPagoMovils} loading={loading} />

      <ConfirmDialog
        open={showDeleteDialog}
        title="Eliminar Pago Móvil"
        description="¿Estás seguro de eliminar este pago móvil? Esta accion no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteDialog(false)
          setPagoMovilToDelete(null)
        }}
      />
    </div>
  )
}
