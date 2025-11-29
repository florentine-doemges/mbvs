import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useRoom, useCreateRoom, useUpdateRoom } from '../hooks/useRooms'
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

  const [name, setName] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [color, setColor] = useState('#3B82F6')
  const [active, setActive] = useState(true)
  const [sortOrder, setSortOrder] = useState(0)
  const [error, setError] = useState<string | null>(null)

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
          </label>
          <input
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            required
            min="0.01"
            step="0.01"
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="70.00"
          />
        </div>

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
