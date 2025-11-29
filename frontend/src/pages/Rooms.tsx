import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRooms, useDeleteRoom } from '../hooks/useRooms'
import { LOCATION_ID } from '../App'

export default function Rooms() {
  const [showInactive, setShowInactive] = useState(false)
  const { data: rooms, isLoading, error } = useRooms(LOCATION_ID, showInactive)
  const deleteRoom = useDeleteRoom()

  const handleDelete = async (roomId: string, roomName: string) => {
    if (!confirm(`Möchten Sie den Raum "${roomName}" wirklich löschen?`)) {
      return
    }
    try {
      await deleteRoom.mutateAsync(roomId)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fehler beim Löschen')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Laden...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Fehler beim Laden der Räume</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-semibold">Räume</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded"
            />
            Inaktive anzeigen
          </label>
          <Link
            to="/rooms/new"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Neuer Raum
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left font-medium">Name</th>
              <th className="p-3 text-left font-medium">Farbe</th>
              <th className="p-3 text-right font-medium">Stundensatz</th>
              <th className="p-3 text-center font-medium">Status</th>
              <th className="p-3 text-right font-medium">Buchungen</th>
              <th className="p-3 text-right font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {rooms?.map((room) => (
              <tr
                key={room.id}
                className={`border-t ${!room.active ? 'bg-gray-50 text-gray-500' : ''}`}
              >
                <td className="p-3 font-medium">{room.name}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: room.color }}
                    />
                    <span className="text-sm text-gray-600">{room.color}</span>
                  </div>
                </td>
                <td className="p-3 text-right">
                  {room.hourlyRate.toFixed(2)} €
                </td>
                <td className="p-3 text-center">
                  {room.active ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Aktiv
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                      Inaktiv
                    </span>
                  )}
                </td>
                <td className="p-3 text-right">{room.bookingCount}</td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/rooms/${room.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Bearbeiten
                    </Link>
                    <button
                      onClick={() => void handleDelete(room.id, room.name)}
                      className="text-red-600 hover:text-red-800"
                      disabled={deleteRoom.isPending}
                    >
                      Löschen
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rooms?.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          Keine Räume vorhanden
        </div>
      )}
    </div>
  )
}
