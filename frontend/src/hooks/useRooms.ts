import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/client'
import type { CreateRoomRequest, UpdateRoomRequest } from '../api/types'

export function useRooms(locationId: string, includeInactive = false) {
  return useQuery({
    queryKey: ['rooms', locationId, includeInactive],
    queryFn: () => api.fetchRooms(locationId, includeInactive),
  })
}

export function useRoom(roomId: string) {
  return useQuery({
    queryKey: ['room', roomId],
    queryFn: () => api.fetchRoom(roomId),
    enabled: !!roomId,
  })
}

export function useCreateRoom(locationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateRoomRequest) => api.createRoom(locationId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rooms'] })
      void queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

export function useUpdateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roomId, request }: { roomId: string; request: UpdateRoomRequest }) =>
      api.updateRoom(roomId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rooms'] })
      void queryClient.invalidateQueries({ queryKey: ['room'] })
      void queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

export function useDeleteRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roomId: string) => api.deleteRoom(roomId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rooms'] })
      void queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}
