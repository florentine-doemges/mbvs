import { format } from 'date-fns'
import type { BookingListItem } from '../api/types'
import { StatusBadge } from './StatusBadge'

interface BookingTableProps {
  bookings?: BookingListItem[]
  onEdit: (booking: BookingListItem) => void
  onDelete: (bookingId: string) => void
  onViewInCalendar: (booking: BookingListItem) => void
}

export function BookingTable({
  bookings,
  onEdit,
  onDelete,
  onViewInCalendar,
}: BookingTableProps) {
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
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {format(new Date(booking.startTime), 'dd.MM.yyyy HH:mm')}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block px-2 py-1 rounded text-white text-sm"
                      style={{ backgroundColor: booking.provider.color }}
                    >
                      {booking.provider.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block px-2 py-1 rounded text-white text-sm"
                      style={{ backgroundColor: booking.room.color }}
                    >
                      {booking.room.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {booking.durationMinutes} min
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {booking.clientAlias || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {booking.totalPrice.toFixed(2)} €
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
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
                      title="Bearbeiten"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(booking.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Löschen"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
