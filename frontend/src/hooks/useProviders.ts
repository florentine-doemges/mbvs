import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/client'
import type { CreateProviderRequest, UpdateProviderRequest } from '../api/types'

export function useProviders(locationId: string, includeInactive = false) {
  return useQuery({
    queryKey: ['providers', locationId, includeInactive],
    queryFn: () => api.fetchProviders(locationId, includeInactive),
  })
}

export function useProvider(providerId: string) {
  return useQuery({
    queryKey: ['provider', providerId],
    queryFn: () => api.fetchProvider(providerId),
    enabled: !!providerId,
  })
}

export function useCreateProvider(locationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateProviderRequest) => api.createProvider(locationId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['providers'] })
    },
  })
}

export function useUpdateProvider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      providerId,
      request,
    }: {
      providerId: string
      request: UpdateProviderRequest
    }) => api.updateProvider(providerId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['providers'] })
      void queryClient.invalidateQueries({ queryKey: ['provider'] })
    },
  })
}

export function useDeleteProvider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (providerId: string) => api.deleteProvider(providerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['providers'] })
    },
  })
}
