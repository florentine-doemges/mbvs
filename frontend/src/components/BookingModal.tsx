import { useState, useEffect, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { useCreateBooking, useUpdateBooking, useDeleteBooking } from '../hooks/useCalendar'
import { useUpgrades } from '../hooks/useUpgrades'
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
  const { data: upgrades = [] } = useUpgrades(false)

  const [providerId, setProviderId] = useState('')
  const [roomId, setRoomId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [selectedOptionId, setSelectedOptionId] = useState<string>('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [restingTimeMinutes, setRestingTimeMinutes] = useState(0)
  const [clientAlias, setClientAlias] = useState('')
  const [selectedUpgradeQuantities, setSelectedUpgradeQuantities] = useState<Record<string, number>>({})
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
      setRestingTimeMinutes(booking.restingTimeMinutes)
      setClientAlias(booking.clientAlias)
      const upgradeQuantities = booking.upgrades.reduce((acc, bu) => {
        acc[bu.upgrade.id] = bu.quantity
        return acc
      }, {} as Record<string, number>)
      setSelectedUpgradeQuantities(upgradeQuantities)
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
          restingTimeMinutes,
          clientAlias,
          upgrades: selectedUpgradeQuantities,
        })
      } else if (booking) {
        await updateMutation.mutateAsync({
          id: booking.id,
          request: {
            providerId,
            roomId,
            startTime: startTimeISO,
            durationMinutes,
            restingTimeMinutes,
            clientAlias,
            upgrades: selectedUpgradeQuantities,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] md:max-h-[85vh] flex flex-col">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b flex-shrink-0">
          <h2 className="text-lg md:text-xl font-semibold">
            {mode === 'create' ? 'Neue Buchung' : 'Buchung bearbeiten'}
          </h2>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col flex-1 min-h-0">
          <div className="p-4 md:p-6 space-y-3 md:space-y-4 overflow-y-auto flex-1">
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
              Liegezeit (Minuten)
            </label>
            <input
              type="number"
              value={restingTimeMinutes}
              onChange={(e) => setRestingTimeMinutes(Number(e.target.value) || 0)}
              min="0"
              max="120"
              step="5"
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
            <p className="mt-1 text-sm text-gray-500">
              Zusätzliche Liegezeit nach der Buchung
            </p>
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

          {upgrades.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upgrades (optional)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-3">
                {upgrades.map((upgrade) => {
                  const quantity = selectedUpgradeQuantities[upgrade.id] || 0
                  return (
                    <div key={upgrade.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="font-medium">{upgrade.name}</div>
                        <div className="text-sm text-gray-600">
                          {new Intl.NumberFormat('de-DE', {
                            style: 'currency',
                            currency: 'EUR',
                          }).format(upgrade.price)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newQuantity = Math.max(0, quantity - 1)
                            if (newQuantity === 0) {
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              const { [upgrade.id]: _, ...rest } = selectedUpgradeQuantities
                              setSelectedUpgradeQuantities(rest)
                            } else {
                              setSelectedUpgradeQuantities({
                                ...selectedUpgradeQuantities,
                                [upgrade.id]: newQuantity,
                              })
                            }
                          }}
                          className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                          disabled={quantity === 0}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUpgradeQuantities({
                              ...selectedUpgradeQuantities,
                              [upgrade.id]: quantity + 1,
                            })
                          }}
                          className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-2 p-4 md:p-6 border-t flex-shrink-0">
            <div className="order-2 sm:order-1">
              {mode === 'edit' && (
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  disabled={isDeleting}
                  className="w-full sm:w-auto px-3 md:px-4 py-2 text-sm md:text-base bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? 'Löschen...' : 'Löschen'}
                </button>
              )}
            </div>
            <div className="flex gap-2 order-1 sm:order-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-3 md:px-4 py-2 text-sm md:text-base bg-gray-200 rounded hover:bg-gray-300"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-3 md:px-4 py-2 text-sm md:text-base bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
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
