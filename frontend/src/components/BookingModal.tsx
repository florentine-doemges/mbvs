import { useState, useEffect, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { useCreateBooking, useUpdateBooking, useDeleteBooking } from '../hooks/useCalendar'
import type { CalendarBooking, Room, ServiceProvider, DurationOption } from '../api/types'

interface BookingModalProps {
  locationId: string
  mode: 'create' | 'edit'
  booking?: CalendarBooking
  rooms: Room[]
  providers: ServiceProvider[]
  durationOptions: DurationOption[]
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
  durationOptions,
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
  const [selectedOptionId, setSelectedOptionId] = useState<string>('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [clientAlias, setClientAlias] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Get the currently selected duration option
  const selectedOption = useMemo(() => {
    return durationOptions.find((opt) => opt.id === selectedOptionId)
  }, [durationOptions, selectedOptionId])

  // Fixed duration options (dropdown items)
  const fixedOptions = useMemo(() => {
    return durationOptions.filter((opt) => !opt.isVariable)
  }, [durationOptions])

  // Variable duration option (slider)
  const variableOption = useMemo(() => {
    return durationOptions.find((opt) => opt.isVariable)
  }, [durationOptions])

  useEffect(() => {
    if (mode === 'edit' && booking) {
      setProviderId(booking.provider.id)
      const parsedTime = parseISO(booking.startTime)
      setStartDate(format(parsedTime, 'yyyy-MM-dd'))
      setStartTime(format(parsedTime, 'HH:mm'))
      setDurationMinutes(booking.durationMinutes)
      setClientAlias(booking.clientAlias)
      if (prefilledRoomId) setRoomId(prefilledRoomId)

      // Find matching duration option or use variable if exists
      const matchingFixed = fixedOptions.find((opt) => opt.minutes === booking.durationMinutes)
      if (matchingFixed) {
        setSelectedOptionId(matchingFixed.id)
      } else if (variableOption) {
        setSelectedOptionId(variableOption.id)
      } else if (fixedOptions.length > 0) {
        setSelectedOptionId(fixedOptions[0].id)
      }
    } else {
      if (prefilledRoomId) setRoomId(prefilledRoomId)
      if (prefilledTime) {
        const parsedTime = parseISO(prefilledTime)
        setStartDate(format(parsedTime, 'yyyy-MM-dd'))
        setStartTime(format(parsedTime, 'HH:mm'))
      }
      if (providers.length > 0) setProviderId(providers[0].id)
      if (rooms.length > 0 && !prefilledRoomId) setRoomId(rooms[0].id)

      // Default to first fixed option or variable option
      if (fixedOptions.length > 0) {
        const defaultOption = fixedOptions[0]
        setSelectedOptionId(defaultOption.id)
        setDurationMinutes(defaultOption.minutes)
      } else if (variableOption) {
        setSelectedOptionId(variableOption.id)
        setDurationMinutes(variableOption.minMinutes || 60)
      }
    }
  }, [mode, booking, prefilledRoomId, prefilledTime, providers, rooms, fixedOptions, variableOption])

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

        <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-4">
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
            {/* Duration option selection */}
            <div className="space-y-3">
              {/* Fixed duration dropdown */}
              {fixedOptions.length > 0 && (
                <select
                  value={selectedOption?.isVariable ? '' : selectedOptionId}
                  onChange={(e) => {
                    const opt = fixedOptions.find((o) => o.id === e.target.value)
                    if (opt) {
                      setSelectedOptionId(opt.id)
                      setDurationMinutes(opt.minutes)
                    }
                  }}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>
                    Feste Dauer wählen...
                  </option>
                  {fixedOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {/* Variable duration slider */}
              {variableOption && (
                <div
                  className={`p-3 border rounded ${selectedOption?.isVariable ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                >
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="radio"
                      checked={selectedOption?.isVariable || false}
                      onChange={() => {
                        setSelectedOptionId(variableOption.id)
                        setDurationMinutes(variableOption.minMinutes || 60)
                      }}
                      className="text-blue-600"
                    />
                    <span className="text-sm font-medium">{variableOption.label}</span>
                  </label>
                  {selectedOption?.isVariable && (
                    <div className="mt-2">
                      <input
                        type="range"
                        min={variableOption.minMinutes || 30}
                        max={variableOption.maxMinutes || 480}
                        step={variableOption.stepMinutes || 30}
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>{variableOption.minMinutes} Min</span>
                        <span className="font-medium text-blue-600">
                          {Math.floor(durationMinutes / 60)}:{(durationMinutes % 60).toString().padStart(2, '0')} h
                        </span>
                        <span>{variableOption.maxMinutes} Min</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Fallback if no options available */}
              {fixedOptions.length === 0 && !variableOption && (
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  min="30"
                  max="480"
                  step="30"
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </div>
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
                  onClick={() => void handleDelete()}
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
