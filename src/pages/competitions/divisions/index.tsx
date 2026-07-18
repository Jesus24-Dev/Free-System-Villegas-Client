import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminCompetitionDivisionApi, adminCompetitionApi } from '@/api/adminCompetitions'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { CompetitionDivision, Competition } from '@/types'
import { COMBAT_MODE_OPTIONS, WEIGHT_CATEGORY_OPTIONS } from '@/types'

export function CompetitionDivisionsPage() {
  const [divisions, setDivisions] = useState<CompetitionDivision[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const [divisionsData, competitionsData] = await Promise.all([
        adminCompetitionDivisionApi.getAll(),
        adminCompetitionApi.getAll(),
      ])
      setDivisions(divisionsData)
      setCompetitions(competitionsData)
    } catch {
      toast.error('Error al cargar las divisiones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const getCompetitionName = (competitionId: string) => {
    const competition = competitions.find(c => c.id === competitionId)
    return competition?.name || 'Desconocida'
  }

  const getModeLabel = (mode: string) => {
    return COMBAT_MODE_OPTIONS.find(opt => opt.value === mode)?.label || mode
  }

  const getCategoryLabel = (category: string) => {
    return WEIGHT_CATEGORY_OPTIONS.find(opt => opt.value === category)?.label || category
  }

  const columns = [
    {
      header: 'Competencia',
      accessorKey: 'competition_id' as const,
      cell: ({ row }: { row: { original: CompetitionDivision } }) => (
        <span>{getCompetitionName(row.original.competition_id || '')}</span>
      ),
    },
    {
      header: 'Modo',
      accessorKey: 'mode' as const,
      cell: ({ row }: { row: { original: CompetitionDivision } }) => (
        <span>{getModeLabel(row.original.mode)}</span>
      ),
    },
    {
      header: 'Categoria',
      accessorKey: 'category' as const,
      cell: ({ row }: { row: { original: CompetitionDivision } }) => (
        <Badge variant="secondary">{getCategoryLabel(row.original.category)}</Badge>
      ),
    },
    {
      header: 'Genero',
      accessorKey: 'gender' as const,
      cell: ({ row }: { row: { original: CompetitionDivision } }) => (
        <span>{row.original.gender === 'MALE' ? 'Masculino' : 'Femenino'}</span>
      ),
    },
    {
      header: 'Peso (kg)',
      accessorKey: 'weight' as const,
      cell: ({ row }: { row: { original: CompetitionDivision } }) => (
        <span>{row.original.weight} kg</span>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Divisiones de Competencia</h1>
        <Button asChild>
          <Link to="/competition-divisions/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Division
          </Link>
        </Button>
      </div>

      <DataTable columns={columns} data={divisions} loading={loading} />
    </div>
  )
}