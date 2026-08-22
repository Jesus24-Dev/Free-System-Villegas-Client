import { Loader2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Column<T> {
  header: string
  accessorKey: string
  cell?: (info: { row: { original: T } }) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  onRowClick?: (row: T) => void
  rowClassName?: (row: T, index: number) => string
  emptyMessage?: string
}

export function DataTable<T extends object>({
  columns,
  data,
  loading,
  onRowClick,
  rowClassName,
  emptyMessage = 'No hay datos disponibles',
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">{emptyMessage}</div>
      </div>
    )
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.accessorKey}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={index}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'cursor-pointer' : rowClassName ? rowClassName(row, index) : undefined}
            >
              {columns.map((column) => (
                <TableCell key={column.accessorKey}>
                  {column.cell
                    ? column.cell({ row: { original: row } })
                    : String((row as Record<string, unknown>)[column.accessorKey] ?? '')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
