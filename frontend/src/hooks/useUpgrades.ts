import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/client'
import type { CreateUpgradeRequest, UpdateUpgradeRequest } from '../api/types'

export function useUpgrades(includeInactive = false) {
  return useQuery({
    queryKey: ['upgrades', includeInactive],
    queryFn: () => api.fetchUpgrades(includeInactive),
  })
}

export function useUpgrade(upgradeId: string) {
  return useQuery({
    queryKey: ['upgrade', upgradeId],
    queryFn: () => api.fetchUpgrade(upgradeId),
    enabled: !!upgradeId,
  })
}

export function useCreateUpgrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateUpgradeRequest) => api.createUpgrade(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['upgrades'] })
    },
  })
}

export function useUpdateUpgrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      upgradeId,
      request,
    }: {
      upgradeId: string
      request: UpdateUpgradeRequest
    }) => api.updateUpgrade(upgradeId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['upgrades'] })
      void queryClient.invalidateQueries({ queryKey: ['upgrade'] })
    },
  })
}

export function useDeleteUpgrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (upgradeId: string) => api.deleteUpgrade(upgradeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['upgrades'] })
    },
  })
}
