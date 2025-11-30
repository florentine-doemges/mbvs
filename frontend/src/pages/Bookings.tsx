import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useBookings, type BookingFilters } from '../hooks/useBookings'
import { useRooms } from '../hooks/useRooms'
import { useProviders } from '../hooks/useProviders'
import { useDeleteBooking, useUpdateBooking } from '../hooks/useCalendar'
import { BookingFilters as Filters } from '../components/BookingFilters'
import { BookingTable } from '../components/BookingTable'
import BookingModal from '../components/BookingModal'
import { useDurationOptions } from '../hooks/useDurationOptions'
import type { BookingListItem } from '../api/types'

const LOCATION_ID = '11111111-1111-1111-1111-111111111111'

export default function Bookings() {
  const navigate = useNavigate()

  const [filters, setFilters] = useState<BookingFilters>({
    dateRange: 'upcoming',
    startDate: null,
    endDate: null,
    providerId: null,
    roomId: null,
    clientSearch: '',
  })

  const [page, setPage] = useState(0)
  const [selectedBooking, setSelectedBooking] = useState<BookingListItem | null>(
    null,
  )
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Data fetching
  const { data: bookingsData, isLoading } = useBookings(LOCATION_ID, filters, page)
  const { data: rooms = [] } = useRooms(LOCATION_ID)
  const { data: providers = [] } = useProviders(LOCATION_ID)
  const { data: durationOptions = [] } = useDurationOptions(LOCATION_ID)

  const deleteMutation = useDeleteBooking(LOCATION_ID)
  const updateMutation = useUpdateBooking(LOCATION_ID)

  const handleEdit = (booking: BookingListItem) => {
    setSelectedBooking(booking)
    setIsEditModalOpen(true)
  }

  const handleDelete = async (bookingId: string) => {
    try {
      await deleteMutation.mutateAsync(bookingId)
    } catch (error) {
      alert('Fehler beim Löschen: ' + (error as Error).message)
    }
  }

  const handleViewInCalendar = (booking: BookingListItem) => {
    const date = format(new Date(booking.startTime), 'yyyy-MM-dd')
    void navigate(`/calendar?date=${date}`)
  }

  const handleUpdate = async (bookingId: string, updates: Partial<BookingListItem>): Promise<void> => {
    await updateMutation.mutateAsync({
      id: bookingId,
      request: {
        providerId: updates.provider!.id,
        roomId: updates.room!.id,
        startTime: updates.startTime!,
        durationMinutes: updates.durationMinutes!,
        clientAlias: updates.clientAlias || '',
      },
    })
  }

  const handlePreviousPage = () => {
    if (page > 0) setPage(page - 1)
  }

  const handleNextPage = () => {
    if (bookingsData && page < bookingsData.page.totalPages - 1) {
      setPage(page + 1)
    }
  }

  return (
    <div className="p-3 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Buchungsübersicht</h1>

      {/* Filters */}
      <Filters
        filters={filters}
        onChange={setFilters}
        providers={providers}
        rooms={rooms}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Lädt...</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <>
          <BookingTable
            bookings={bookingsData?.content}
            providers={providers}
            rooms={rooms}
            durationOptions={durationOptions}
            onEdit={handleEdit}
            onDelete={(id) => void handleDelete(id)}
            onViewInCalendar={handleViewInCalendar}
            onUpdate={handleUpdate}
          />

          {/* Pagination */}
          {bookingsData && bookingsData.page.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow">
              <div className="text-sm text-gray-700">
                Seite {bookingsData.page.number + 1} von{' '}
                {bookingsData.page.totalPages} ({bookingsData.page.totalElements}{' '}
                Buchungen gesamt)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={page === 0}
                  className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ← Zurück
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={page >= bookingsData.page.totalPages - 1}
                  className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Weiter →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedBooking && (
        <BookingModal
          locationId={LOCATION_ID}
          mode="edit"
          booking={{
            id: selectedBooking.id,
            provider: {
              id: selectedBooking.provider.id,
              name: selectedBooking.provider.name,
            },
            startTime: selectedBooking.startTime,
            durationMinutes: selectedBooking.durationMinutes,
            restingTimeMinutes: selectedBooking.restingTimeMinutes,
            clientAlias: selectedBooking.clientAlias,
            upgrades: selectedBooking.upgrades,
          }}
          prefilledRoomId={selectedBooking.room.id}
          providers={providers}
          rooms={rooms}
          durationOptions={durationOptions}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedBooking(null)
          }}
        />
      )}
    </div>
  )
}
