import type { BookingFilters as Filters } from '../hooks/useBookings'
import type { ProviderDetail, RoomDetail } from '../api/types'

interface BookingFiltersProps {
  filters: Filters
  onChange: (filters: Filters) => void
  providers: ProviderDetail[]
  rooms: RoomDetail[]
}

export function BookingFilters({
  filters,
  onChange,
  providers,
  rooms,
}: BookingFiltersProps) {
  return (
    <div className="bg-white p-3 md:p-4 rounded-lg shadow mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Zeitraum */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1 md:hidden">
            Zeitraum
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) =>
              onChange({
                ...filters,
                dateRange: e.target.value as Filters['dateRange'],
              })
            }
            className="w-full px-3 py-2 border rounded text-sm"
          >
            <option value="upcoming">Kommende</option>
            <option value="today">Heute</option>
            <option value="week">Diese Woche</option>
            <option value="month">Dieser Monat</option>
            <option value="past">Vergangene</option>
            <option value="all">Alle</option>
            <option value="custom">Benutzerdefiniert</option>
          </select>
        </div>

        {/* Custom Date Range */}
        {filters.dateRange === 'custom' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 md:hidden">
                Von
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) =>
                  onChange({ ...filters, startDate: e.target.value || null })
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Von"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 md:hidden">
                Bis
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) =>
                  onChange({ ...filters, endDate: e.target.value || null })
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Bis"
              />
            </div>
          </>
        )}

        {/* Provider Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1 md:hidden">
            Provider
          </label>
          <select
            value={filters.providerId || ''}
            onChange={(e) =>
              onChange({ ...filters, providerId: e.target.value || null })
            }
            className="w-full px-3 py-2 border rounded text-sm"
          >
            <option value="">Alle Provider</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Room Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1 md:hidden">
            Raum
          </label>
          <select
            value={filters.roomId || ''}
            onChange={(e) => onChange({ ...filters, roomId: e.target.value || null })}
            className="w-full px-3 py-2 border rounded text-sm"
          >
            <option value="">Alle Räume</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Client Search */}
        <div className="md:col-span-2 lg:col-span-1">
          <label className="block text-xs font-medium text-gray-700 mb-1 md:hidden">
            Client
          </label>
          <input
            type="text"
            placeholder="Suche nach Client..."
            value={filters.clientSearch}
            onChange={(e) => onChange({ ...filters, clientSearch: e.target.value })}
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>
      </div>
    </div>
  )
}
