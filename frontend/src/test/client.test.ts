import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  fetchRooms,
  fetchRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  fetchProviders,
  fetchProvider,
  createProvider,
  updateProvider,
  deleteProvider,
  fetchDurationOptions,
  createDurationOption,
  updateDurationOption,
  deleteDurationOption,
  fetchCalendar,
  fetchBooking,
  createBooking,
  updateBooking,
  deleteBooking,
} from '../api/client'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rooms', () => {
    it('fetchRooms calls correct endpoint', async () => {
      const mockRooms = [{ id: '1', name: 'Rot' }]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRooms),
      })

      const result = await fetchRooms('loc-1')
      expect(mockFetch).toHaveBeenCalledWith('/api/locations/loc-1/rooms?includeInactive=false')
      expect(result).toEqual(mockRooms)
    })

    it('fetchRooms includes inactive when requested', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })

      await fetchRooms('loc-1', true)
      expect(mockFetch).toHaveBeenCalledWith('/api/locations/loc-1/rooms?includeInactive=true')
    })

    it('fetchRoom calls correct endpoint', async () => {
      const mockRoom = { id: '1', name: 'Rot' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRoom),
      })

      const result = await fetchRoom('room-1')
      expect(mockFetch).toHaveBeenCalledWith('/api/rooms/room-1')
      expect(result).toEqual(mockRoom)
    })

    it('createRoom sends POST request', async () => {
      const mockRoom = { id: '1', name: 'Neu' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRoom),
      })

      const result = await createRoom('loc-1', { name: 'Neu', hourlyRate: 70 })
      expect(mockFetch).toHaveBeenCalledWith('/api/locations/loc-1/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Neu', hourlyRate: 70 }),
      })
      expect(result).toEqual(mockRoom)
    })

    it('updateRoom sends PUT request', async () => {
      const mockRoom = { id: '1', name: 'Updated' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRoom),
      })

      const request = { name: 'Updated', hourlyRate: 80, active: true, sortOrder: 1, color: '#FF0000' }
      const result = await updateRoom('room-1', request)
      expect(mockFetch).toHaveBeenCalledWith('/api/rooms/room-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })
      expect(result).toEqual(mockRoom)
    })

    it('deleteRoom sends DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })

      await deleteRoom('room-1')
      expect(mockFetch).toHaveBeenCalledWith('/api/rooms/room-1', { method: 'DELETE' })
    })

    it('deleteRoom throws on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Cannot delete' }),
      })

      await expect(deleteRoom('room-1')).rejects.toThrow('Cannot delete')
    })
  })

  describe('Providers', () => {
    it('fetchProviders calls correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })

      await fetchProviders('loc-1')
      expect(mockFetch).toHaveBeenCalledWith('/api/locations/loc-1/providers?includeInactive=false')
    })

    it('fetchProvider calls correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'p1' }),
      })

      await fetchProvider('p1')
      expect(mockFetch).toHaveBeenCalledWith('/api/providers/p1')
    })

    it('createProvider sends POST request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'p1' }),
      })

      await createProvider('loc-1', { name: 'New Provider' })
      expect(mockFetch).toHaveBeenCalledWith('/api/locations/loc-1/providers', expect.any(Object))
    })

    it('updateProvider sends PUT request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'p1' }),
      })

      await updateProvider('p1', { name: 'Updated', active: true, sortOrder: 1, color: '#000' })
      expect(mockFetch).toHaveBeenCalledWith('/api/providers/p1', expect.any(Object))
    })

    it('deleteProvider sends DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })

      await deleteProvider('p1')
      expect(mockFetch).toHaveBeenCalledWith('/api/providers/p1', { method: 'DELETE' })
    })

    it('deleteProvider throws on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Has bookings' }),
      })

      await expect(deleteProvider('p1')).rejects.toThrow('Has bookings')
    })
  })

  describe('Duration Options', () => {
    it('fetchDurationOptions calls correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })

      await fetchDurationOptions('loc-1')
      expect(mockFetch).toHaveBeenCalledWith('/api/locations/loc-1/duration-options?includeInactive=false')
    })

    it('createDurationOption sends POST request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'd1' }),
      })

      await createDurationOption('loc-1', { minutes: 60, label: '1 Stunde', isVariable: false })
      expect(mockFetch).toHaveBeenCalledWith('/api/locations/loc-1/duration-options', expect.any(Object))
    })

    it('updateDurationOption sends PUT request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'd1' }),
      })

      await updateDurationOption('d1', {
        minutes: 60,
        label: 'Updated',
        isVariable: false,
        sortOrder: 1,
        active: true,
      })
      expect(mockFetch).toHaveBeenCalledWith('/api/duration-options/d1', expect.any(Object))
    })

    it('deleteDurationOption sends DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })

      await deleteDurationOption('d1')
      expect(mockFetch).toHaveBeenCalledWith('/api/duration-options/d1', { method: 'DELETE' })
    })

    it('deleteDurationOption throws on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Last option' }),
      })

      await expect(deleteDurationOption('d1')).rejects.toThrow('Last option')
    })
  })

  describe('Calendar', () => {
    it('fetchCalendar calls correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ date: '2024-01-01', rooms: [] }),
      })

      await fetchCalendar('loc-1', '2024-01-01')
      expect(mockFetch).toHaveBeenCalledWith('/api/locations/loc-1/calendar?date=2024-01-01')
    })
  })

  describe('Bookings', () => {
    it('fetchBooking calls correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'b1' }),
      })

      await fetchBooking('b1')
      expect(mockFetch).toHaveBeenCalledWith('/api/bookings/b1')
    })

    it('createBooking sends POST request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'b1' }),
      })

      await createBooking({
        providerId: 'p1',
        roomId: 'r1',
        startTime: '2024-01-01T10:00:00',
        durationMinutes: 60,
        clientAlias: 'Max',
      })
      expect(mockFetch).toHaveBeenCalledWith('/api/bookings', expect.any(Object))
    })

    it('updateBooking sends PUT request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'b1' }),
      })

      await updateBooking('b1', {
        providerId: 'p1',
        roomId: 'r1',
        startTime: '2024-01-01T11:00:00',
        durationMinutes: 90,
        clientAlias: 'Max',
      })
      expect(mockFetch).toHaveBeenCalledWith('/api/bookings/b1', expect.any(Object))
    })

    it('deleteBooking sends DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })

      await deleteBooking('b1')
      expect(mockFetch).toHaveBeenCalledWith('/api/bookings/b1', { method: 'DELETE' })
    })

    it('deleteBooking throws on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Not found' }),
      })

      await expect(deleteBooking('b1')).rejects.toThrow('Not found')
    })
  })

  describe('Error handling', () => {
    it('throws error with message from API on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Validation failed' }),
      })

      await expect(fetchRooms('loc-1')).rejects.toThrow('Validation failed')
    })
  })
})
