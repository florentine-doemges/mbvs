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
    <div className="bg-white p-4 rounded-lg shadow mb-4 flex flex-wrap gap-4">
      {/* Zeitraum */}
      <select
        value={filters.dateRange}
        onChange={(e) =>
          onChange({
            ...filters,
            dateRange: e.target.value as Filters['dateRange'],
          })
        }
        className="px-3 py-2 border rounded"
      >
        <option value="upcoming">Kommende</option>
        <option value="today">Heute</option>
        <option value="week">Diese Woche</option>
        <option value="month">Dieser Monat</option>
        <option value="past">Vergangene</option>
        <option value="all">Alle</option>
        <option value="custom">Benutzerdefiniert</option>
      </select>

      {/* Custom Date Range */}
      {filters.dateRange === 'custom' && (
        <>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) =>
              onChange({ ...filters, startDate: e.target.value || null })
            }
            className="px-3 py-2 border rounded"
            placeholder="Von"
          />
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) =>
              onChange({ ...filters, endDate: e.target.value || null })
            }
            className="px-3 py-2 border rounded"
            placeholder="Bis"
          />
        </>
      )}

      {/* Provider Filter */}
      <select
        value={filters.providerId || ''}
        onChange={(e) =>
          onChange({ ...filters, providerId: e.target.value || null })
        }
        className="px-3 py-2 border rounded"
      >
        <option value="">Alle Provider</option>
        {providers.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* Room Filter */}
      <select
        value={filters.roomId || ''}
        onChange={(e) => onChange({ ...filters, roomId: e.target.value || null })}
        className="px-3 py-2 border rounded"
      >
        <option value="">Alle Räume</option>
        {rooms.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>

      {/* Client Search */}
      <input
        type="text"
        placeholder="Suche nach Client..."
        value={filters.clientSearch}
        onChange={(e) => onChange({ ...filters, clientSearch: e.target.value })}
        className="px-3 py-2 border rounded flex-1 min-w-[200px]"
      />
    </div>
  )
}
