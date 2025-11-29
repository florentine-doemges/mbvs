import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/client'
import type {
  CreateDurationOptionRequest,
  UpdateDurationOptionRequest,
} from '../api/types'

export function useDurationOptions(locationId: string, includeInactive = false) {
  return useQuery({
    queryKey: ['duration-options', locationId, includeInactive],
    queryFn: () => api.fetchDurationOptions(locationId, includeInactive),
  })
}

export function useDurationOption(optionId: string) {
  return useQuery({
    queryKey: ['duration-option', optionId],
    queryFn: () => api.fetchDurationOption(optionId),
    enabled: !!optionId,
  })
}

export function useCreateDurationOption(locationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateDurationOptionRequest) =>
      api.createDurationOption(locationId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['duration-options'] })
    },
  })
}

export function useUpdateDurationOption() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      optionId,
      request,
    }: {
      optionId: string
      request: UpdateDurationOptionRequest
    }) => api.updateDurationOption(optionId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['duration-options'] })
      void queryClient.invalidateQueries({ queryKey: ['duration-option'] })
    },
  })
}

export function useDeleteDurationOption() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (optionId: string) => api.deleteDurationOption(optionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['duration-options'] })
    },
  })
}
