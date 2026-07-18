import { useState } from 'react'

interface UsePaginationProps {
  initialPage?: number
  initialLimit?: number
}

export function usePagination({ initialPage = 1, initialLimit = 10 }: UsePaginationProps = {}) {
  const [page, setPage] = useState(initialPage)
  const [limit] = useState(initialLimit)

  const nextPage = () => setPage((p) => p + 1)
  const prevPage = () => setPage((p) => Math.max(1, p - 1))
  const goToPage = (newPage: number) => setPage(newPage)

  return {
    page,
    limit,
    nextPage,
    prevPage,
    goToPage,
  }
}
