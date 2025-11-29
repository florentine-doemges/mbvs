import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useRooms,
  useRoom,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
} from '../hooks/useRooms'
import {
  useProviders,
  useProvider,
  useCreateProvider,
  useUpdateProvider,
  useDeleteProvider,
} from '../hooks/useProviders'
import {
  useDurationOptions,
  useCreateDurationOption,
  useUpdateDurationOption,
  useDeleteDurationOption,
} from '../hooks/useDurationOptions'
import {
  useCalendar,
  useCreateBooking,
  useUpdateBooking,
  useDeleteBooking,
} from '../hooks/useCalendar'
import * as client from '../api/client'
import type { ReactNode } from 'react'

vi.mock('../api/client')

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useRooms hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('useRooms fetches rooms', async () => {
    const mockRooms = [{ id: '1', name: 'Rot', hourlyRate: 70 }]
    vi.mocked(client.fetchRooms).mockResolvedValueOnce(mockRooms as never)

    const { result } = renderHook(() => useRooms('loc-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockRooms)
  })

  it('useRoom fetches single room', async () => {
    const mockRoom = { id: '1', name: 'Rot', hourlyRate: 70 }
    vi.mocked(client.fetchRoom).mockResolvedValueOnce(mockRoom as never)

    const { result } = renderHook(() => useRoom('1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockRoom)
  })

  it('useCreateRoom returns mutation', () => {
    const { result } = renderHook(() => useCreateRoom('loc-1'), {
      wrapper: createWrapper(),
    })

    expect(result.current.mutateAsync).toBeDefined()
  })

  it('useUpdateRoom returns mutation', () => {
    const { result } = renderHook(() => useUpdateRoom(), {
      wrapper: createWrapper(),
    })

    expect(result.current.mutateAsync).toBeDefined()
  })

  it('useDeleteRoom returns mutation', () => {
    const { result } = renderHook(() => useDeleteRoom(), {
      wrapper: createWrapper(),
    })

    expect(result.current.mutateAsync).toBeDefined()
  })
})

describe('useProviders hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('useProviders fetches providers', async () => {
    const mockProviders = [{ id: 'p1', name: 'Lady Lexi' }]
    vi.mocked(client.fetchProviders).mockResolvedValueOnce(mockProviders as never)

    const { result } = renderHook(() => useProviders('loc-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockProviders)
  })

  it('useProvider fetches single provider', async () => {
    const mockProvider = { id: 'p1', name: 'Lady Lexi' }
    vi.mocked(client.fetchProvider).mockResolvedValueOnce(mockProvider as never)

    const { result } = renderHook(() => useProvider('p1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockProvider)
  })

  it('useCreateProvider returns mutation', () => {
    const { result } = renderHook(() => useCreateProvider('loc-1'), {
      wrapper: createWrapper(),
    })

    expect(result.current.mutateAsync).toBeDefined()
  })

  it('useUpdateProvider returns mutation', () => {
    const { result } = renderHook(() => useUpdateProvider(), {
      wrapper: createWrapper(),
    })

    expect(result.current.mutateAsync).toBeDefined()
  })

  it('useDeleteProvider returns mutation', () => {
    const { result } = renderHook(() => useDeleteProvider(), {
      wrapper: createWrapper(),
    })

    expect(result.current.mutateAsync).toBeDefined()
  })
})

describe('useDurationOptions hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('useDurationOptions fetches options', async () => {
    const mockOptions = [{ id: 'd1', minutes: 60, label: '1 Stunde' }]
    vi.mocked(client.fetchDurationOptions).mockResolvedValueOnce(mockOptions as never)

    const { result } = renderHook(() => useDurationOptions('loc-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockOptions)
  })

  it('useCreateDurationOption returns mutation', () => {
    const { result } = renderHook(() => useCreateDurationOption('loc-1'), {
      wrapper: createWrapper(),
    })

    expect(result.current.mutateAsync).toBeDefined()
  })

  it('useUpdateDurationOption returns mutation', () => {
    const { result } = renderHook(() => useUpdateDurationOption(), {
      wrapper: createWrapper(),
    })

    expect(result.current.mutateAsync).toBeDefined()
  })

  it('useDeleteDurationOption returns mutation', () => {
    const { result } = renderHook(() => useDeleteDurationOption(), {
      wrapper: createWrapper(),
    })

    expect(result.current.mutateAsync).toBeDefined()
  })
})

describe('useCalendar hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('useCalendar fetches calendar data', async () => {
    const mockCalendar = { date: '2024-01-01', rooms: [] }
    vi.mocked(client.fetchCalendar).mockResolvedValueOnce(mockCalendar as never)

    const { result } = renderHook(() => useCalendar('loc-1', new Date('2024-01-01')), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockCalendar)
  })

  it('useCalendar accepts Date object', async () => {
    const mockCalendar = { date: '2024-01-01', rooms: [] }
    vi.mocked(client.fetchCalendar).mockResolvedValueOnce(mockCalendar as never)

    const { result } = renderHook(() => useCalendar('loc-1', new Date('2024-01-01')), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockCalendar)
  })

  it('useCreateBooking returns mutation', () => {
    const { result } = renderHook(() => useCreateBooking('loc-1'), {
      wrapper: createWrapper(),
    })

    expect(result.current.mutateAsync).toBeDefined()
  })

  it('useCreateBooking can mutate', async () => {
    vi.mocked(client.createBooking).mockResolvedValueOnce({ id: 'b1' } as never)

    const { result } = renderHook(() => useCreateBooking('loc-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      providerId: 'p1',
      roomId: 'r1',
      startTime: '2024-01-01T10:00:00',
      durationMinutes: 60,
      clientAlias: 'Test',
    })

    expect(client.createBooking).toHaveBeenCalled()
  })

  it('useUpdateBooking returns mutation', () => {
    const { result } = renderHook(() => useUpdateBooking('loc-1'), {
      wrapper: createWrapper(),
    })

    expect(result.current.mutateAsync).toBeDefined()
  })

  it('useUpdateBooking can mutate', async () => {
    vi.mocked(client.updateBooking).mockResolvedValueOnce({ id: 'b1' } as never)

    const { result } = renderHook(() => useUpdateBooking('loc-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      id: 'b1',
      request: {
        providerId: 'p1',
        roomId: 'r1',
        startTime: '2024-01-01T10:00:00',
        durationMinutes: 60,
        clientAlias: 'Test',
      },
    })

    expect(client.updateBooking).toHaveBeenCalled()
  })

  it('useDeleteBooking returns mutation', () => {
    const { result } = renderHook(() => useDeleteBooking('loc-1'), {
      wrapper: createWrapper(),
    })

    expect(result.current.mutateAsync).toBeDefined()
  })

  it('useDeleteBooking can mutate', async () => {
    vi.mocked(client.deleteBooking).mockResolvedValueOnce(undefined as never)

    const { result } = renderHook(() => useDeleteBooking('loc-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('b1')

    expect(client.deleteBooking).toHaveBeenCalledWith('b1')
  })
})

describe('useProviders from useCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches providers', async () => {
    const mockProviders = [{ id: 'p1', name: 'Test Provider' }]
    vi.mocked(client.fetchProviders).mockResolvedValueOnce(mockProviders as never)

    // Import useProviders from useCalendar
    const { useProviders: useProvidersFromCalendar } = await import('../hooks/useCalendar')

    const { result } = renderHook(() => useProvidersFromCalendar('loc-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockProviders)
  })
})
