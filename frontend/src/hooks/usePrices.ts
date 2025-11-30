import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/client'

export function useRoomPriceHistory(roomId: string) {
  return useQuery({
    queryKey: ['roomPriceHistory', roomId],
    queryFn: () => api.fetchRoomPriceHistory(roomId),
    enabled: !!roomId,
  })
}

export function useCurrentRoomPrice(roomId: string) {
  return useQuery({
    queryKey: ['currentRoomPrice', roomId],
    queryFn: () => api.fetchCurrentRoomPrice(roomId),
    enabled: !!roomId,
  })
}

export function useUpgradePriceHistory(upgradeId: string) {
  return useQuery({
    queryKey: ['upgradePriceHistory', upgradeId],
    queryFn: () => api.fetchUpgradePriceHistory(upgradeId),
    enabled: !!upgradeId,
  })
}

export function useCurrentUpgradePrice(upgradeId: string) {
  return useQuery({
    queryKey: ['currentUpgradePrice', upgradeId],
    queryFn: () => api.fetchCurrentUpgradePrice(upgradeId),
    enabled: !!upgradeId,
  })
}

export function useAddRoomPrice(roomId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (price: number) => api.addRoomPrice(roomId, price),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['roomPriceHistory', roomId] })
      void queryClient.invalidateQueries({ queryKey: ['currentRoomPrice', roomId] })
      void queryClient.invalidateQueries({ queryKey: ['rooms'] })
    },
  })
}

export function useAddUpgradePrice(upgradeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (price: number) => api.addUpgradePrice(upgradeId, price),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['upgradePriceHistory', upgradeId] })
      void queryClient.invalidateQueries({ queryKey: ['currentUpgradePrice', upgradeId] })
      void queryClient.invalidateQueries({ queryKey: ['upgrades'] })
    },
  })
}
