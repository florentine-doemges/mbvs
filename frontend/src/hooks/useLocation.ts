import { useQuery } from '@tanstack/react-query'
import * as api from '../api/client'

export function useLocation(locationId: string) {
  return useQuery({
    queryKey: ['location', locationId],
    queryFn: () => api.fetchLocation(locationId),
    staleTime: Infinity, // Location name changes very rarely
  })
}
