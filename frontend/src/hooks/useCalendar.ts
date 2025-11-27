import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  fetchCalendar,
  fetchRooms,
  fetchProviders,
  createBooking,
  updateBooking,
  deleteBooking,
} from '../api/client'
import type { CreateBookingRequest, UpdateBookingRequest } from '../api/types'

export function useCalendar(locationId: string, date: Date) {
  const dateString = format(date, 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['calendar', locationId, dateString],
    queryFn: () => fetchCalendar(locationId, dateString),
  })
}

export function useRooms(locationId: string) {
  return useQuery({
    queryKey: ['rooms', locationId],
    queryFn: () => fetchRooms(locationId),
  })
}

export function useProviders(locationId: string) {
  return useQuery({
    queryKey: ['providers', locationId],
    queryFn: () => fetchProviders(locationId),
  })
}

export function useCreateBooking(locationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateBookingRequest) => createBooking(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', locationId] })
    },
  })
}

export function useUpdateBooking(locationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateBookingRequest }) =>
      updateBooking(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', locationId] })
    },
  })
}

export function useDeleteBooking(locationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookingId: string) => deleteBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', locationId] })
    },
  })
}
