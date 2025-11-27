import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { useCreateBooking, useUpdateBooking, useDeleteBooking } from '../hooks/useCalendar'
import type { CalendarBooking, Room, ServiceProvider } from '../api/types'
import { DURATION_OPTIONS } from '../api/types'

interface BookingModalProps {
  locationId: string
  mode: 'create' | 'edit'
  booking?: CalendarBooking
  rooms: Room[]
  providers: ServiceProvider[]
  prefilledRoomId?: string
  prefilledTime?: string
  onClose: () => void
}

export default function BookingModal({
  locationId,
  mode,
  booking,
  rooms,
  providers,
  prefilledRoomId,
  prefilledTime,
  onClose,
}: BookingModalProps) {
  const createMutation = useCreateBooking(locationId)
  const updateMutation = useUpdateBooking(locationId)
  const deleteMutation = useDeleteBooking(locationId)

  const [providerId, setProviderId] = useState('')
  const [roomId, setRoomId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [clientAlias, setClientAlias] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (mode === 'edit' && booking) {
      setProviderId(booking.provider.id)
      const parsedTime = parseISO(booking.startTime)
      setStartDate(format(parsedTime, 'yyyy-MM-dd'))
      setStartTime(format(parsedTime, 'HH:mm'))
      setDurationMinutes(booking.durationMinutes)
      setClientAlias(booking.clientAlias)
      if (prefilledRoomId) setRoomId(prefilledRoomId)
    } else {
      if (prefilledRoomId) setRoomId(prefilledRoomId)
      if (prefilledTime) {
        const parsedTime = parseISO(prefilledTime)
        setStartDate(format(parsedTime, 'yyyy-MM-dd'))
        setStartTime(format(parsedTime, 'HH:mm'))
      }
      if (providers.length > 0) setProviderId(providers[0].id)
      if (rooms.length > 0 && !prefilledRoomId) setRoomId(rooms[0].id)
    }
  }, [mode, booking, prefilledRoomId, prefilledTime, providers, rooms])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!providerId || !roomId || !startDate || !startTime) {
      setError('Bitte alle Pflichtfelder ausfüllen')
      return
    }

    const startTimeISO = `${startDate}T${startTime}:00`

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync({
          providerId,
          roomId,
          startTime: startTimeISO,
          durationMinutes,
          clientAlias,
        })
      } else if (booking) {
        await updateMutation.mutateAsync({
          id: booking.id,
          request: {
            providerId,
            roomId,
            startTime: startTimeISO,
            durationMinutes,
            clientAlias,
          },
        })
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    }
  }

  const handleDelete = async () => {
    if (!booking || !confirm('Buchung wirklich löschen?')) return

    try {
      await deleteMutation.mutateAsync(booking.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const isDeleting = deleteMutation.isPending

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">
            {mode === 'create' ? 'Neue Buchung' : 'Buchung bearbeiten'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider *
            </label>
            <select
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Bitte wählen...</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Raum *
            </label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Bitte wählen...</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.hourlyRate}€/h)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Datum *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Uhrzeit *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                step="1800"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dauer *
            </label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kunde (optional)
            </label>
            <input
              type="text"
              value={clientAlias}
              onChange={(e) => setClientAlias(e.target.value)}
              placeholder="z.B. Max, Stammgast"
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-between pt-4">
            <div>
              {mode === 'edit' && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? 'Löschen...' : 'Löschen'}
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Speichern...' : 'Speichern'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
