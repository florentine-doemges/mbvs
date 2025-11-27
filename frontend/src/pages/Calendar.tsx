import { useState } from 'react'
import { format, addDays, subDays, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import { useCalendar, useRooms, useProviders } from '../hooks/useCalendar'
import BookingModal from '../components/BookingModal'
import type { CalendarBooking } from '../api/types'

interface CalendarProps {
  locationId: string
  selectedDate: Date
  onDateChange: (date: Date) => void
}

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = Math.floor(i / 2) + 10
  const minutes = (i % 2) * 30
  return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
})

const ROOM_COLORS: Record<string, string> = {
  'Rot': 'bg-red-200 border-red-400 hover:bg-red-300',
  'Blau': 'bg-blue-200 border-blue-400 hover:bg-blue-300',
  'Gelb': 'bg-yellow-200 border-yellow-400 hover:bg-yellow-300',
  'Klinik': 'bg-purple-200 border-purple-400 hover:bg-purple-300',
  'Outdoor': 'bg-green-200 border-green-400 hover:bg-green-300',
}

interface ModalState {
  isOpen: boolean
  mode: 'create' | 'edit'
  booking?: CalendarBooking
  prefilledRoomId?: string
  prefilledTime?: string
}

export default function Calendar({ locationId, selectedDate, onDateChange }: CalendarProps) {
  const { data: calendar, isLoading: calendarLoading, error: calendarError } = useCalendar(locationId, selectedDate)
  const { data: rooms } = useRooms(locationId)
  const { data: providers } = useProviders(locationId)

  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: 'create',
  })

  const handlePrevDay = () => onDateChange(subDays(selectedDate, 1))
  const handleNextDay = () => onDateChange(addDays(selectedDate, 1))
  const handleToday = () => onDateChange(new Date())

  const handleSlotClick = (roomId: string, timeSlot: string) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    setModalState({
      isOpen: true,
      mode: 'create',
      prefilledRoomId: roomId,
      prefilledTime: `${dateStr}T${timeSlot}:00`,
    })
  }

  const handleBookingClick = (booking: CalendarBooking, roomId: string) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      booking,
      prefilledRoomId: roomId,
    })
  }

  const handleCloseModal = () => {
    setModalState({ isOpen: false, mode: 'create' })
  }

  const getBookingAtSlot = (bookings: CalendarBooking[], slotIndex: number) => {
    for (const booking of bookings) {
      const startTime = parseISO(booking.startTime)
      const startSlot = (startTime.getHours() - 10) * 2 + (startTime.getMinutes() >= 30 ? 1 : 0)
      if (slotIndex === startSlot) {
        return { booking, isStart: true, span: booking.durationMinutes / 30 }
      }
      const endSlot = startSlot + booking.durationMinutes / 30
      if (slotIndex > startSlot && slotIndex < endSlot) {
        return { booking, isStart: false, span: 0 }
      }
    }
    return null
  }

  if (calendarLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Laden...</div>
      </div>
    )
  }

  if (calendarError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Fehler beim Laden des Kalenders</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDay}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded"
          >
            &larr;
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded"
          >
            Heute
          </button>
          <button
            onClick={handleNextDay}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded"
          >
            &rarr;
          </button>
        </div>
        <div className="text-lg font-semibold">
          {format(selectedDate, 'EEEE, d. MMMM yyyy', { locale: de })}
        </div>
        <input
          type="date"
          value={format(selectedDate, 'yyyy-MM-dd')}
          onChange={(e) => onDateChange(new Date(e.target.value))}
          className="px-3 py-2 border rounded"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1200px] w-full border-collapse">
          <thead>
            <tr>
              <th className="bg-gray-50 p-2 border-b border-r font-semibold text-left w-24">
                Raum
              </th>
              {TIME_SLOTS.map((slot) => (
                <th
                  key={slot}
                  className="bg-gray-50 p-2 border-b text-center text-sm font-medium min-w-[60px]"
                >
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calendar?.rooms.map((room) => (
              <tr key={room.id}>
                <td className="p-2 border-b border-r font-medium bg-gray-50">
                  {room.name}
                </td>
                {TIME_SLOTS.map((slot, slotIndex) => {
                  const bookingInfo = getBookingAtSlot(room.bookings, slotIndex)

                  if (bookingInfo && !bookingInfo.isStart) {
                    return null
                  }

                  if (bookingInfo && bookingInfo.isStart) {
                    const colorClass = ROOM_COLORS[room.name] || 'bg-gray-200 border-gray-400 hover:bg-gray-300'
                    return (
                      <td
                        key={`${room.id}-${slot}`}
                        colSpan={bookingInfo.span}
                        className="border-b border-r p-0"
                      >
                        <div
                          className={`${colorClass} border-2 rounded m-1 p-2 cursor-pointer text-xs h-[52px] overflow-hidden`}
                          onClick={() => handleBookingClick(bookingInfo.booking, room.id)}
                        >
                          <div className="font-semibold truncate">
                            {bookingInfo.booking.provider.name}
                          </div>
                          {bookingInfo.booking.clientAlias && (
                            <div className="truncate text-gray-600">
                              {bookingInfo.booking.clientAlias}
                            </div>
                          )}
                        </div>
                      </td>
                    )
                  }

                  return (
                    <td
                      key={`${room.id}-${slot}`}
                      className="border-b border-r min-h-[60px] h-[60px] hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSlotClick(room.id, slot)}
                    />
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalState.isOpen && rooms && providers && (
        <BookingModal
          locationId={locationId}
          mode={modalState.mode}
          booking={modalState.booking}
          rooms={rooms}
          providers={providers}
          prefilledRoomId={modalState.prefilledRoomId}
          prefilledTime={modalState.prefilledTime}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
