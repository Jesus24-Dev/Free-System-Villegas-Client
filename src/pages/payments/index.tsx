import { useState, useEffect } from 'react'
import { gymPaymentApi } from '@/api/gymPayments'
import { athleteApi } from '@/api/athletes'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Trash2, Check, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore, extractRole } from '@/stores/authStore'
import type { GymPayment, Athlete } from '@/types'

export function PaymentsPage() {
  const { user, gymId } = useAuthStore()
  const userRole = user ? extractRole(user) : ''
  const isCoach = userRole === 'COACH'

  const [payments, setPayments] = useState<GymPayment[]>([])
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    day_payed: '',
    amount: '',
    athlete_id: '',
    gym_id: '',
    payment_reference: '',
  })
  const limit = 10

  useEffect(() => {
    loadPayments()
  }, [page, gymId])

  const loadPayments = async () => {
    try {
      setLoading(true)
      if (isCoach && gymId) {
        const data = await gymPaymentApi.getAll({ gym_id: gymId })
        setPayments(data)
      } else {
        const data = await gymPaymentApi.getAll()
        setPayments(data)
      }
      setTotalPages(Math.ceil(payments.length / limit) || 1)
    } catch (error) {
      toast.error('Error al cargar pagos')
    } finally {
      setLoading(false)
    }
  }

  const loadAthletes = async () => {
    try {
      if (isCoach && gymId) {
        const data = await athleteApi.getByGym(gymId)
        setAthletes(data)
      } else {
        const response = await athleteApi.getAll()
        setAthletes(response.data)
      }
    } catch (error) {
      toast.error('Error al cargar atletas')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este pago?')) {
      try {
        await gymPaymentApi.delete(id)
        toast.success('Pago eliminado correctamente')
        loadPayments()
      } catch (error) {
        toast.error('Error al eliminar pago')
      }
    }
  }

  const handleConfirm = async (id: string) => {
    if (window.confirm('¿Confirmar este pago?')) {
      try {
        await gymPaymentApi.confirm(id)
        toast.success('Pago confirmado correctamente')
        loadPayments()
      } catch (error) {
        toast.error('Error al confirmar pago')
      }
    }
  }

  const handleOpenForm = (payment?: GymPayment) => {
    loadAthletes()
    if (payment) {
      setEditingId(payment.id)
      setFormData({
        day_payed: payment.day_payed.split('T')[0],
        amount: payment.amount.toString(),
        athlete_id: payment.athlete_id,
        gym_id: payment.gym_id,
        payment_reference: payment.payment_reference || '',
      })
    } else {
      setEditingId(null)
      setFormData({
        day_payed: new Date().toISOString().split('T')[0],
        amount: '',
        athlete_id: '',
        gym_id: gymId || '',
        payment_reference: '',
      })
    }
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!formData.day_payed || !formData.amount || !formData.athlete_id || !formData.gym_id) {
      toast.error('Completa todos los campos requeridos')
      return
    }
    try {
      const payload = {
        day_payed: new Date(formData.day_payed).toISOString(),
        amount: parseFloat(formData.amount),
        athlete_id: formData.athlete_id,
        gym_id: formData.gym_id,
        payment_reference: formData.payment_reference || undefined,
      }
      if (editingId) {
        await gymPaymentApi.update(editingId, payload)
        toast.success('Pago actualizado correctamente')
      } else {
        await gymPaymentApi.create(payload)
        toast.success('Pago creado correctamente')
      }
      setShowForm(false)
      loadPayments()
    } catch (error) {
      toast.error(editingId ? 'Error al actualizar pago' : 'Error al crear pago')
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-VE')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(amount)
  }

  const getAthleteName = (athleteId: string) => {
    const athlete = athletes.find(a => a.id === athleteId)
    return athlete ? `${athlete.name} ${athlete.surname}` : athleteId
  }

  const columns = [
    {
      header: 'Atleta',
      accessorKey: 'athlete_id' as const,
      cell: ({ row }: { row: { original: GymPayment } }) => (
        <div>
          <p className="font-medium">{getAthleteName(row.original.athlete_id)}</p>
        </div>
      ),
    },
    {
      header: 'Fecha',
      accessorKey: 'day_payed' as const,
      cell: ({ row }: { row: { original: GymPayment } }) => (
        <span className="text-muted-foreground">{formatDate(row.original.day_payed)}</span>
      ),
    },
    {
      header: 'Monto',
      accessorKey: 'amount' as const,
      cell: ({ row }: { row: { original: GymPayment } }) => (
        <span className="font-semibold">{formatCurrency(row.original.amount)}</span>
      ),
    },
    {
      header: 'Referencia',
      accessorKey: 'payment_reference' as const,
      cell: ({ row }: { row: { original: GymPayment } }) => (
        <Badge variant="outline">{row.original.payment_reference || 'S/R'}</Badge>
      ),
    },
    {
      header: 'Estado',
      accessorKey: 'id' as const,
      cell: () => (
        <Badge variant="default">Registrado</Badge>
      ),
    },
    {
      header: 'Acciones',
      accessorKey: 'id' as const,
      cell: ({ row }: { row: { original: GymPayment } }) => (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleConfirm(row.original.id)}
            title="Confirmar"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenForm(row.original)}
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const filteredPayments = payments.filter(
    (payment) => {
      const reference = payment.payment_reference || ''
      const athleteName = getAthleteName(payment.athlete_id).toLowerCase()
      return (
        reference.toLowerCase().includes(search.toLowerCase()) ||
        athleteName.includes(search.toLowerCase())
      )
    }
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pagos de Gimnasio</h1>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Pago
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por atleta o referencia..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {showForm && (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
          <h3 className="font-semibold">{editingId ? 'Editar Pago' : 'Nuevo Pago'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="day_payed">Fecha de Pago</Label>
              <Input
                id="day_payed"
                type="date"
                value={formData.day_payed}
                onChange={(e) => setFormData({ ...formData, day_payed: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="amount">Monto (BsD)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="athlete">Atleta</Label>
              <select
                id="athlete"
                value={formData.athlete_id}
                onChange={(e) => setFormData({ ...formData, athlete_id: e.target.value })}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="">Seleccionar atleta</option>
                {athletes.map((athlete) => (
                  <option key={athlete.id} value={athlete.id}>
                    {athlete.name} {athlete.surname}
                  </option>
                ))}
              </select>
            </div>
            {!isCoach && (
              <div>
                <Label htmlFor="gym_id">Gimnasio</Label>
                <Input
                  id="gym_id"
                  value={formData.gym_id}
                  disabled
                />
              </div>
            )}
            <div className="col-span-2">
              <Label htmlFor="reference">Referencia de Pago</Label>
              <Input
                id="reference"
                value={formData.payment_reference}
                onChange={(e) => setFormData({ ...formData, payment_reference: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit}>{editingId ? 'Actualizar' : 'Crear'}</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      <DataTable columns={columns} data={filteredPayments} loading={loading} />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
