import { useState } from 'react'
import { format } from 'date-fns'
import type { BookingListItem, ProviderDetail, RoomDetail, DurationOption } from '../api/types'
import { StatusBadge } from './StatusBadge'

interface BookingTableProps {
  bookings?: BookingListItem[]
  providers: ProviderDetail[]
  rooms: RoomDetail[]
  durationOptions: DurationOption[]
  onEdit: (booking: BookingListItem) => void
  onDelete: (bookingId: string) => void
  onViewInCalendar: (booking: BookingListItem) => void
  onUpdate: (bookingId: string, updates: Partial<BookingListItem>) => Promise<void>
}

interface EditState {
  bookingId: string
  startTime: string
  providerId: string
  roomId: string
  durationMinutes: number
  clientAlias: string
}

export function BookingTable({
  bookings,
  providers,
  rooms,
  durationOptions,
  onEdit,
  onDelete,
  onViewInCalendar,
  onUpdate,
}: BookingTableProps) {
  const [editingBooking, setEditingBooking] = useState<EditState | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">Keine Buchungen gefunden</p>
      </div>
    )
  }

  const handleDelete = (bookingId: string) => {
    if (confirm('Buchung wirklich löschen?')) {
      onDelete(bookingId)
    }
  }

  const startEditing = (booking: BookingListItem) => {
    setEditingBooking({
      bookingId: booking.id,
      startTime: booking.startTime,
      providerId: booking.provider.id,
      roomId: booking.room.id,
      durationMinutes: booking.durationMinutes,
      clientAlias: booking.clientAlias || '',
    })
  }

  const cancelEditing = () => {
    setEditingBooking(null)
  }

  const saveEditing = async () => {
    if (!editingBooking) return

    setIsSaving(true)
    try {
      await onUpdate(editingBooking.bookingId, {
        startTime: editingBooking.startTime,
        provider: providers.find((p) => p.id === editingBooking.providerId)!,
        room: rooms.find((r) => r.id === editingBooking.roomId)!,
        durationMinutes: editingBooking.durationMinutes,
        clientAlias: editingBooking.clientAlias,
      } as Partial<BookingListItem>)
      setEditingBooking(null)
    } catch (error) {
      alert('Fehler beim Speichern: ' + (error as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  const isEditing = (bookingId: string) => editingBooking?.bookingId === bookingId

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white shadow rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge status={booking.status} />
                  <span className="text-sm font-medium text-gray-900">
                    {format(new Date(booking.startTime), 'dd.MM.yyyy HH:mm')}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="inline-block px-2 py-1 rounded text-white text-xs"
                    style={{ backgroundColor: booking.provider.color }}
                  >
                    {booking.provider.name}
                  </span>
                  <span
                    className="inline-block px-2 py-1 rounded text-white text-xs"
                    style={{ backgroundColor: booking.room.color }}
                  >
                    {booking.room.name}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {booking.durationMinutes} min • {booking.totalPrice.toFixed(2)} €
                </div>
                {booking.clientAlias && (
                  <div className="text-sm text-gray-600 mt-1">
                    Kunde: {booking.clientAlias}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <button
                onClick={() => onViewInCalendar(booking)}
                className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
              >
                📅 Kalender
              </button>
              <button
                onClick={() => onEdit(booking)}
                className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                ✏️ Bearbeiten
              </button>
              <button
                onClick={() => handleDelete(booking.id)}
                className="px-3 py-2 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Datum/Zeit
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Provider
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Raum
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Dauer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Client
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Preis
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((booking) => {
                const editing = isEditing(booking.id)
                return (
                  <tr key={booking.id} className={editing ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td
                      className="px-4 py-3 text-sm text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => !editing && startEditing(booking)}
                      title={!editing ? 'Klicken zum Bearbeiten' : ''}
                    >
                      {editing ? (
                        <input
                          type="datetime-local"
                          value={editingBooking!.startTime.slice(0, 16)}
                          onChange={(e) =>
                            setEditingBooking({
                              ...editingBooking!,
                              startTime: e.target.value + ':00',
                            })
                          }
                          className="px-2 py-1 border rounded text-sm w-full"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        format(new Date(booking.startTime), 'dd.MM.yyyy HH:mm')
                      )}
                    </td>
                    <td
                      className="px-4 py-3 cursor-pointer hover:bg-gray-100"
                      onClick={() => !editing && startEditing(booking)}
                      title={!editing ? 'Klicken zum Bearbeiten' : ''}
                    >
                      {editing ? (
                        <select
                          value={editingBooking!.providerId}
                          onChange={(e) =>
                            setEditingBooking({
                              ...editingBooking!,
                              providerId: e.target.value,
                            })
                          }
                          className="px-2 py-1 border rounded text-sm w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {providers.map((provider) => (
                            <option key={provider.id} value={provider.id}>
                              {provider.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className="inline-block px-2 py-1 rounded text-white text-sm"
                          style={{ backgroundColor: booking.provider.color }}
                        >
                          {booking.provider.name}
                        </span>
                      )}
                    </td>
                    <td
                      className="px-4 py-3 cursor-pointer hover:bg-gray-100"
                      onClick={() => !editing && startEditing(booking)}
                      title={!editing ? 'Klicken zum Bearbeiten' : ''}
                    >
                      {editing ? (
                        <select
                          value={editingBooking!.roomId}
                          onChange={(e) =>
                            setEditingBooking({
                              ...editingBooking!,
                              roomId: e.target.value,
                            })
                          }
                          className="px-2 py-1 border rounded text-sm w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {rooms.map((room) => (
                            <option key={room.id} value={room.id}>
                              {room.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className="inline-block px-2 py-1 rounded text-white text-sm"
                          style={{ backgroundColor: booking.room.color }}
                        >
                          {booking.room.name}
                        </span>
                      )}
                    </td>
                    <td
                      className="px-4 py-3 text-sm text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => !editing && startEditing(booking)}
                      title={!editing ? 'Klicken zum Bearbeiten' : ''}
                    >
                      {editing ? (
                        <select
                          value={editingBooking!.durationMinutes}
                          onChange={(e) =>
                            setEditingBooking({
                              ...editingBooking!,
                              durationMinutes: parseInt(e.target.value),
                            })
                          }
                          className="px-2 py-1 border rounded text-sm w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {durationOptions.map((option) => (
                            <option key={option.id} value={option.minutes}>
                              {option.minutes} min
                            </option>
                          ))}
                        </select>
                      ) : (
                        `${booking.durationMinutes} min`
                      )}
                    </td>
                    <td
                      className="px-4 py-3 text-sm text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => !editing && startEditing(booking)}
                      title={!editing ? 'Klicken zum Bearbeiten' : ''}
                    >
                      {editing ? (
                        <input
                          type="text"
                          value={editingBooking!.clientAlias}
                          onChange={(e) =>
                            setEditingBooking({
                              ...editingBooking!,
                              clientAlias: e.target.value,
                            })
                          }
                          placeholder="Kundenname"
                          className="px-2 py-1 border rounded text-sm w-full"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        booking.clientAlias || '-'
                      )}
                    </td>
                    <td
                      className="px-4 py-3 text-sm text-gray-900 cursor-pointer hover:bg-gray-100 font-medium"
                      onClick={() => !editing && onEdit(booking)}
                      title="Klicken zum Bearbeiten (inkl. Upgrades)"
                    >
                      {booking.totalPrice.toFixed(2)} €
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {editing ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => void saveEditing()}
                            disabled={isSaving}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            title="Speichern"
                          >
                            {isSaving ? '...' : '✓'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={isSaving}
                            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                            title="Abbrechen"
                          >
                            ✗
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => onViewInCalendar(booking)}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                            title="Im Kalender anzeigen"
                          >
                            📅
                          </button>
                          <button
                            onClick={() => onEdit(booking)}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                            title="Erweitert bearbeiten (mit Upgrades)"
                          >
                            ⚙️
                          </button>
                          <button
                            onClick={() => handleDelete(booking.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Löschen"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
