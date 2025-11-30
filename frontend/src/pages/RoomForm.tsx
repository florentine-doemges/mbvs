import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { useRoom, useCreateRoom, useUpdateRoom } from '../hooks/useRooms'
import { useRoomPriceHistory, useAddRoomPrice } from '../hooks/usePrices'
import { LOCATION_ID } from '../App'

const DEFAULT_COLORS = [
  '#EF4444',
  '#F97316',
  '#EAB308',
  '#22C55E',
  '#14B8A6',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
]

export default function RoomForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const { data: room, isLoading } = useRoom(id || '')
  const createRoom = useCreateRoom(LOCATION_ID)
  const updateRoom = useUpdateRoom()
  const { data: priceHistory } = useRoomPriceHistory(id || '')
  const addPrice = useAddRoomPrice(id || '')

  const [name, setName] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [color, setColor] = useState('#3B82F6')
  const [active, setActive] = useState(true)
  const [sortOrder, setSortOrder] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isEditingPrice, setIsEditingPrice] = useState(false)
  const [newPrice, setNewPrice] = useState('')

  useEffect(() => {
    if (room) {
      setName(room.name)
      setHourlyRate(room.hourlyRate.toString())
      setColor(room.color)
      setActive(room.active)
      setSortOrder(room.sortOrder)
    }
  }, [room])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const rate = parseFloat(hourlyRate)
    if (isNaN(rate) || rate <= 0) {
      setError('Bitte geben Sie einen gültigen Stundensatz ein')
      return
    }

    try {
      if (isEditing && id) {
        await updateRoom.mutateAsync({
          roomId: id,
          request: {
            name,
            hourlyRate: rate,
            active,
            sortOrder,
            color,
          },
        })
      } else {
        await createRoom.mutateAsync({
          name,
          hourlyRate: rate,
          color,
        })
      }
      void navigate('/rooms')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    }
  }

  const handleAddPrice = async () => {
    setError(null)
    const price = parseFloat(newPrice)
    if (isNaN(price) || price <= 0) {
      setError('Bitte geben Sie einen gültigen Preis ein')
      return
    }

    try {
      await addPrice.mutateAsync(price)
      setNewPrice('')
      setIsEditingPrice(false)
      // Update the hourlyRate field to show the new current price
      setHourlyRate(price.toString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Hinzufügen des Preises')
    }
  }

  const handleSelectHistoricalPrice = (price: number) => {
    setNewPrice(price.toString())
    setIsEditingPrice(true)
  }

  if (isEditing && isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Laden...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">
          {isEditing ? 'Raum bearbeiten' : 'Neuer Raum'}
        </h2>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-6">
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="z.B. Rot, Blau, Klinik..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stundensatz (€) *
            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditingPrice(!isEditingPrice)}
                className="ml-2 text-sm text-blue-600 hover:text-blue-800"
              >
                {isEditingPrice ? '✗ Abbrechen' : '✏️ Preis ändern'}
              </button>
            )}
          </label>
          {!isEditing || !isEditingPrice ? (
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              required
              min="0.01"
              step="0.01"
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="70.00"
              readOnly={isEditing}
            />
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  min="0.01"
                  step="0.01"
                  className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Neuer Preis"
                />
                <button
                  type="button"
                  onClick={() => void handleAddPrice()}
                  disabled={addPrice.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {addPrice.isPending ? 'Speichern...' : '✓ Speichern'}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Der neue Preis gilt ab sofort. Der alte Preis bleibt in der Historie erhalten.
              </p>
            </div>
          )}
        </div>

        {isEditing && priceHistory && priceHistory.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preishistorie
            </label>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Preis
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Gültig von
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Gültig bis
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Aktion
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {priceHistory.map((price) => (
                    <tr key={price.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">
                        {price.price.toFixed(2)} €
                        {!price.validTo && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                            Aktuell
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {format(new Date(price.validFrom), 'dd.MM.yyyy HH:mm', { locale: de })}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {price.validTo
                          ? format(new Date(price.validTo), 'dd.MM.yyyy HH:mm', { locale: de })
                          : '-'}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {price.validTo && (
                          <button
                            type="button"
                            onClick={() => handleSelectHistoricalPrice(price.price)}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            Als neuen Preis übernehmen
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Farbe
          </label>
          <div className="flex items-center gap-4">
            <div className="flex gap-2 flex-wrap">
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    color === c ? 'border-gray-800 ring-2 ring-offset-2 ring-blue-500' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <span className="text-sm text-gray-600">{color}</span>
          </div>
        </div>

        {isEditing && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sortierung
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                min="0"
                className="w-32 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Niedrigere Werte erscheinen zuerst im Kalender
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">Aktiv</span>
              </label>
              <p className="mt-1 text-sm text-gray-500">
                Inaktive Räume können nicht mehr gebucht werden
              </p>
            </div>
          </>
        )}

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => void navigate('/rooms')}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={createRoom.isPending || updateRoom.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {createRoom.isPending || updateRoom.isPending ? 'Speichern...' : 'Speichern'}
          </button>
        </div>
      </form>
    </div>
  )
}
