import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/client'
import type { CreatePriceTierRequest, UpdatePriceTierRequest } from '../api/types'

export function usePriceTiers(roomId: string, priceId: string) {
  return useQuery({
    queryKey: ['priceTiers', roomId, priceId],
    queryFn: () => api.fetchPriceTiers(priceId),
    enabled: !!roomId && !!priceId,
  })
}

export function usePricePreview(roomId: string, priceId: string) {
  return useQuery({
    queryKey: ['pricePreview', roomId, priceId],
    queryFn: () => api.fetchPricePreview(roomId, priceId),
    enabled: !!roomId && !!priceId,
  })
}

export function useCreatePriceTier(roomId: string, priceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreatePriceTierRequest) =>
      api.createPriceTier(priceId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['priceTiers', roomId, priceId] })
      void queryClient.invalidateQueries({ queryKey: ['pricePreview', roomId, priceId] })
    },
  })
}

export function useUpdatePriceTier(roomId: string, priceId: string, tierId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: UpdatePriceTierRequest) =>
      api.updatePriceTier(tierId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['priceTiers', roomId, priceId] })
      void queryClient.invalidateQueries({ queryKey: ['pricePreview', roomId, priceId] })
    },
  })
}

export function useDeletePriceTier(roomId: string, priceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (tierId: string) => api.deletePriceTier(tierId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['priceTiers', roomId, priceId] })
      void queryClient.invalidateQueries({ queryKey: ['pricePreview', roomId, priceId] })
    },
  })
}
