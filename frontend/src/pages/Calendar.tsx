import { useState } from 'react'
import { format, addDays, subDays, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import { useCalendar, useProviders, useUpdateBooking } from '../hooks/useCalendar'
import { useRooms } from '../hooks/useRooms'
import { useDurationOptions } from '../hooks/useDurationOptions'
import { LOCATION_ID } from '../App'
import BookingModal from '../components/BookingModal'
import type { CalendarBooking } from '../api/types'

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = Math.floor(i / 2) + 10
  const minutes = (i % 2) * 30
  return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
})

interface ModalState {
  isOpen: boolean
  mode: 'create' | 'edit'
  booking?: CalendarBooking
  prefilledRoomId?: string
  prefilledTime?: string
}

interface DragData {
  booking: CalendarBooking
  roomId: string
}

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const {
    data: calendar,
    isLoading: calendarLoading,
    error: calendarError,
  } = useCalendar(LOCATION_ID, selectedDate)
  const { data: rooms } = useRooms(LOCATION_ID)
  const { data: providers } = useProviders(LOCATION_ID)
  const { data: durationOptions } = useDurationOptions(LOCATION_ID)
  const updateBookingMutation = useUpdateBooking(LOCATION_ID)

  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: 'create',
  })
  const [draggedBooking, setDraggedBooking] = useState<DragData | null>(null)
  const [dropTarget, setDropTarget] = useState<{ roomId: string; time: string } | null>(null)

  const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1))
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1))
  const handleToday = () => setSelectedDate(new Date())

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

  const handleDragStart = (booking: CalendarBooking, roomId: string) => {
    setDraggedBooking({ booking, roomId })
  }

  const handleDragEnd = () => {
    setDraggedBooking(null)
    setDropTarget(null)
  }

  const handleDragOver = (e: React.DragEvent, roomId: string, timeSlot: string) => {
    e.preventDefault()
    setDropTarget({ roomId, time: timeSlot })
  }

  const handleDragLeave = () => {
    setDropTarget(null)
  }

  const handleDrop = async (e: React.DragEvent, roomId: string, timeSlot: string) => {
    e.preventDefault()
    setDropTarget(null)

    if (!draggedBooking) return

    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const newStartTime = `${dateStr}T${timeSlot}:00`

    // Don't update if dropped on the same slot
    if (
      draggedBooking.roomId === roomId &&
      draggedBooking.booking.startTime === newStartTime
    ) {
      setDraggedBooking(null)
      return
    }

    try {
      await updateBookingMutation.mutateAsync({
        id: draggedBooking.booking.id,
        request: {
          providerId: draggedBooking.booking.provider.id,
          roomId: roomId,
          startTime: newStartTime,
          durationMinutes: draggedBooking.booking.durationMinutes,
          clientAlias: draggedBooking.booking.clientAlias || '',
        },
      })
    } catch (error) {
      alert('Fehler beim Verschieben: ' + (error as Error).message)
    } finally {
      setDraggedBooking(null)
    }
  }

  const getBookingAtSlot = (bookings: CalendarBooking[], slotIndex: number) => {
    for (const booking of bookings) {
      const startTime = parseISO(booking.startTime)
      const startSlot =
        (startTime.getHours() - 10) * 2 + (startTime.getMinutes() >= 30 ? 1 : 0)
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

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 59, g: 130, b: 246 }
  }

  const getBookingStyle = (color: string) => {
    const rgb = hexToRgb(color)
    return {
      backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
      borderColor: color,
    }
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
      {/* Header - Mobile optimized */}
      <div className="p-3 md:p-4 border-b space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={handlePrevDay}
              className="px-2 md:px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm md:text-base"
            >
              &larr;
            </button>
            <button
              onClick={handleToday}
              className="px-2 md:px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded text-sm md:text-base"
            >
              Heute
            </button>
            <button
              onClick={handleNextDay}
              className="px-2 md:px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm md:text-base"
            >
              &rarr;
            </button>
          </div>
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="px-2 md:px-3 py-2 border rounded text-sm md:text-base"
          />
        </div>
        <div className="text-base md:text-lg font-semibold text-center md:text-left">
          {format(selectedDate, 'EEEE, d. MMMM yyyy', { locale: de })}
        </div>
      </div>

      {/* Calendar table with improved mobile scrolling */}
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full w-full border-collapse" style={{ minWidth: '800px' }}>
          <thead>
            <tr>
              <th className="bg-gray-50 p-1 md:p-2 border-b border-r font-semibold text-left text-xs md:text-sm sticky left-0 z-10 w-16 md:w-24">
                Raum
              </th>
              {TIME_SLOTS.map((slot) => (
                <th
                  key={slot}
                  className="bg-gray-50 p-1 md:p-2 border-b text-center text-xs md:text-sm font-medium min-w-[50px] md:min-w-[60px]"
                >
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calendar?.rooms.map((room) => (
              <tr key={room.id}>
                <td className="p-1 md:p-2 border-b border-r font-medium bg-gray-50 sticky left-0 z-10 text-xs md:text-sm">
                  <div className="flex items-center gap-1 md:gap-2">
                    <div
                      className="w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: room.color }}
                    />
                    <span className="truncate">{room.name}</span>
                  </div>
                </td>
                {TIME_SLOTS.map((slot, slotIndex) => {
                  const bookingInfo = getBookingAtSlot(room.bookings, slotIndex)

                  if (bookingInfo && !bookingInfo.isStart) {
                    return null
                  }

                  if (bookingInfo && bookingInfo.isStart) {
                    const style = getBookingStyle(room.color)
                    const isDragging =
                      draggedBooking?.booking.id === bookingInfo.booking.id
                    return (
                      <td
                        key={`${room.id}-${slot}`}
                        colSpan={bookingInfo.span}
                        className="border-b border-r p-0"
                      >
                        <div
                          draggable
                          onDragStart={() => handleDragStart(bookingInfo.booking, room.id)}
                          onDragEnd={handleDragEnd}
                          className={`border-2 rounded m-0.5 md:m-1 p-1 md:p-2 cursor-move text-[10px] md:text-xs h-[40px] md:h-[52px] overflow-hidden hover:opacity-80 ${
                            isDragging ? 'opacity-50' : ''
                          }`}
                          style={style}
                          onClick={() => handleBookingClick(bookingInfo.booking, room.id)}
                        >
                          <div className="font-semibold truncate leading-tight">
                            {bookingInfo.booking.provider.name}
                          </div>
                          {bookingInfo.booking.clientAlias && (
                            <div className="truncate text-gray-600 leading-tight">
                              {bookingInfo.booking.clientAlias}
                            </div>
                          )}
                        </div>
                      </td>
                    )
                  }

                  const isDropTarget =
                    dropTarget?.roomId === room.id && dropTarget?.time === slot

                  return (
                    <td
                      key={`${room.id}-${slot}`}
                      className={`border-b border-r min-h-[40px] h-[40px] md:min-h-[60px] md:h-[60px] cursor-pointer ${
                        isDropTarget
                          ? 'bg-blue-200 border-blue-400'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => handleSlotClick(room.id, slot)}
                      onDragOver={(e) => handleDragOver(e, room.id, slot)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => void handleDrop(e, room.id, slot)}
                    />
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
          </div>
        </div>
      </div>

      {modalState.isOpen && rooms && providers && durationOptions && (
        <BookingModal
          locationId={LOCATION_ID}
          mode={modalState.mode}
          booking={modalState.booking}
          rooms={rooms}
          providers={providers}
          durationOptions={durationOptions}
          prefilledRoomId={modalState.prefilledRoomId}
          prefilledTime={modalState.prefilledTime}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
