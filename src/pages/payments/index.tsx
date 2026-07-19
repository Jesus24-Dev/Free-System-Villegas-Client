import { useState, useEffect } from 'react'
import { gymPaymentApi } from '@/api/gymPayments'
import { athleteApi } from '@/api/athletes'
import { adminGymPaymentApi } from '@/api/admin'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Plus, Search, Trash2, Check, Pencil, Clock, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore, extractRole } from '@/stores/authStore'
import type { GymPayment, Athlete } from '@/types'

type PaymentFilter = 'all' | 'pending' | 'confirmed'

export function PaymentsPage() {
  const { user, gymId } = useAuthStore()
  const userRole = user ? extractRole(user) : ''
  const isCoach = userRole === 'COACH'
  const isAdmin = userRole === 'ADMIN'

  const [payments, setPayments] = useState<GymPayment[]>([])
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<PaymentFilter>('pending')
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

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [paymentToConfirm, setPaymentToConfirm] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      let paymentsData: GymPayment[] = []
      let athletesData: Athlete[] = []

      if (isCoach) {
        if (!gymId) {
          setPayments([])
          setAthletes([])
          setTotalPages(1)
          return
        }
        const [paymentsResult, athletesResult] = await Promise.all([
          gymPaymentApi.getByGym(gymId),
          athleteApi.getByGym(gymId),
        ])
        paymentsData = paymentsResult
        athletesData = athletesResult
      } else {
        paymentsData = await gymPaymentApi.getAll()
        const response = await athleteApi.getAll()
        athletesData = response.data
      }

      setPayments(paymentsData)
      setAthletes(athletesData)
      setTotalPages(Math.ceil(paymentsData.length / limit) || 1)
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page, gymId])

  const handleDeleteClick = (id: string) => {
    setPaymentToDelete(id)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!paymentToDelete) return
    try {
      if (isAdmin) {
        await adminGymPaymentApi.delete(paymentToDelete)
      } else {
        await gymPaymentApi.delete(paymentToDelete)
      }
      toast.success('Pago eliminado correctamente')
      loadData()
    } catch {
      // handled by interceptor
    } finally {
      setShowDeleteDialog(false)
      setPaymentToDelete(null)
    }
  }

  const handleConfirmClick = (id: string) => {
    setPaymentToConfirm(id)
    setShowConfirmDialog(true)
  }

  const handleConfirmPayment = async () => {
    if (!paymentToConfirm) return
    try {
      await gymPaymentApi.confirm(paymentToConfirm)
      toast.success('Pago confirmado correctamente')
      loadData()
    } catch {
      // handled by interceptor
    } finally {
      setShowConfirmDialog(false)
      setPaymentToConfirm(null)
    }
  }

  const handleOpenForm = (payment?: GymPayment) => {
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
        if (isAdmin) {
          await adminGymPaymentApi.update(editingId, payload)
        } else {
          await gymPaymentApi.update(editingId, payload)
        }
        toast.success('Pago actualizado correctamente')
      } else {
        await gymPaymentApi.create(payload)
        toast.success('Pago creado correctamente')
      }
      setShowForm(false)
      loadData()
    } catch {
      // handled by interceptor
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-VE')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(amount)
  }

  const getAthleteName = (payment: GymPayment) => {
    if (payment.athlete) return `${payment.athlete.name} ${payment.athlete.surname}`
    const athlete = athletes.find(a => a.id === payment.athlete_id)
    return athlete ? `${athlete.name} ${athlete.surname}` : 'Atleta desconocido'
  }

  const getAthleteDni = (payment: GymPayment) => {
    if (payment.athlete) return payment.athlete.dni
    const athlete = athletes.find(a => a.id === payment.athlete_id)
    return athlete?.dni || ''
  }

  const pendingPayments = payments.filter(p => !p.isConfirmed)
  const confirmedPayments = payments.filter(p => p.isConfirmed)

  const getFilteredPayments = () => {
    let filtered: GymPayment[]
    switch (filter) {
      case 'pending':
        filtered = pendingPayments
        break
      case 'confirmed':
        filtered = confirmedPayments
        break
      default:
        filtered = payments
    }

    return filtered.filter(payment => {
      const athleteName = getAthleteName(payment).toLowerCase()
      const reference = (payment.payment_reference || '').toLowerCase()
      return athleteName.includes(search.toLowerCase()) || reference.includes(search.toLowerCase())
    })
  }

  const filteredPayments = getFilteredPayments()

  const columns = [
    {
      header: 'Atleta',
      accessorKey: 'athlete_id' as const,
      cell: ({ row }: { row: { original: GymPayment } }) => {
        const athleteName = getAthleteName(row.original)
        const athleteDni = getAthleteDni(row.original)
        return (
          <div className="flex flex-col">
            <span className="font-medium">{athleteName}</span>
            {athleteDni && (
              <span className="text-xs text-muted-foreground">DNI: {athleteDni}</span>
            )}
          </div>
        )
      },
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
      accessorKey: 'isConfirmed' as const,
      cell: ({ row }: { row: { original: GymPayment } }) => (
        row.original.isConfirmed ? (
          <Badge variant="success">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Confirmado
          </Badge>
        ) : (
          <Badge variant="warning">
            <Clock className="mr-1 h-3 w-3" />
            Por confirmar
          </Badge>
        )
      ),
    },
    {
      header: 'Acciones',
      accessorKey: 'id' as const,
      cell: ({ row }: { row: { original: GymPayment } }) => (
        isCoach ? (
          <div className="flex gap-1">
            {!row.original.isConfirmed && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConfirmClick(row.original.id)}
                title="Confirmar pago"
                className="hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenForm(row.original)}
              title="Editar pago"
              className="hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteClick(row.original.id)}
              title="Eliminar pago"
              className="hover:opacity-80 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : null
      ),
    },
  ]

  const pendingCount = pendingPayments.length
  const confirmedCount = confirmedPayments.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pagos de Gimnasio</h1>
        {isCoach && (
          <Button onClick={() => handleOpenForm()} className="hover:opacity-90 transition-opacity">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Pago
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
            className={filter === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
          >
            <Clock className="mr-1 h-4 w-4" />
            Por confirmar ({pendingCount})
          </Button>
          <Button
            variant={filter === 'confirmed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('confirmed')}
            className={filter === 'confirmed' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <CheckCircle2 className="mr-1 h-4 w-4" />
            Confirmados ({confirmedCount})
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todos ({payments.length})
          </Button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por atleta o referencia..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="max-w-sm"
          />
        </div>
      </div>

      {showForm && isCoach && (
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
              <Select
                id="athlete"
                value={formData.athlete_id}
                onChange={(e) => setFormData({ ...formData, athlete_id: e.target.value })}
              >
                <option value="">Seleccionar atleta</option>
                {athletes.map((athlete) => (
                  <option key={athlete.id} value={athlete.id}>
                    {athlete.name} {athlete.surname}
                  </option>
                ))}
              </Select>
            </div>
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
            <Button onClick={handleSubmit} className="hover:opacity-90 transition-opacity">
              {editingId ? 'Actualizar' : 'Crear'}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="hover:bg-muted transition-colors">
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <DataTable columns={columns} data={filteredPayments} loading={loading} />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {isCoach && (
        <>
          <ConfirmDialog
            open={showDeleteDialog}
            title="Eliminar Pago"
            description="¿Estas seguro de eliminar este pago? Esta accion no se puede deshacer."
            confirmText="Eliminar"
            cancelText="Cancelar"
            variant="destructive"
            onConfirm={handleDeleteConfirm}
            onCancel={() => {
              setShowDeleteDialog(false)
              setPaymentToDelete(null)
            }}
          />

          <ConfirmDialog
            open={showConfirmDialog}
            title="Confirmar Pago"
            description="¿Confirmar este pago? Se marcara como confirmado."
            confirmText="Confirmar"
            cancelText="Cancelar"
            variant="default"
            onConfirm={handleConfirmPayment}
            onCancel={() => {
              setShowConfirmDialog(false)
              setPaymentToConfirm(null)
            }}
          />
        </>
      )}
    </div>
  )
}
