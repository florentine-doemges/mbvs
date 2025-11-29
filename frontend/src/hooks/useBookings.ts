import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { fetchBookings } from '../api/client'

export interface BookingFilters {
  dateRange: 'upcoming' | 'today' | 'week' | 'month' | 'past' | 'all' | 'custom'
  startDate: string | null
  endDate: string | null
  providerId: string | null
  roomId: string | null
  clientSearch: string
}

export function useBookings(
  locationId: string,
  filters: BookingFilters,
  page: number = 0,
) {
  const queryParams = buildQueryParams(filters, page)

  return useQuery({
    queryKey: ['bookings', locationId, queryParams],
    queryFn: () => fetchBookings(locationId, queryParams),
    placeholderData: keepPreviousData,
  })
}

function buildQueryParams(
  filters: BookingFilters,
  page: number,
): Record<string, string> {
  const params: Record<string, string> = { page: String(page), size: '50' }

  // Date Range Logic
  const now = new Date()

  if (filters.dateRange === 'today') {
    params.startDate = format(now, 'yyyy-MM-dd')
    params.endDate = format(now, 'yyyy-MM-dd')
  } else if (filters.dateRange === 'week') {
    params.startDate = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    params.endDate = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  } else if (filters.dateRange === 'month') {
    params.startDate = format(startOfMonth(now), 'yyyy-MM-dd')
    params.endDate = format(endOfMonth(now), 'yyyy-MM-dd')
  } else if (filters.dateRange === 'custom') {
    if (filters.startDate) params.startDate = filters.startDate
    if (filters.endDate) params.endDate = filters.endDate
  }

  // Status Filter
  if (filters.dateRange === 'upcoming') params.status = 'upcoming'
  if (filters.dateRange === 'past') params.status = 'past'

  // Entity Filters
  if (filters.providerId) params.providerId = filters.providerId
  if (filters.roomId) params.roomId = filters.roomId
  if (filters.clientSearch) params.clientSearch = filters.clientSearch

  return params
}
