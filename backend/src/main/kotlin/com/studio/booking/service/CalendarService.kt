package com.studio.booking.service

import com.studio.booking.domain.Booking
import com.studio.booking.domain.Room
import com.studio.booking.repository.BookingRepository
import com.studio.booking.repository.RoomRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.UUID

data class CalendarDay(
    val date: LocalDate,
    val rooms: List<RoomWithBookings>
)

data class RoomWithBookings(
    val room: Room,
    val bookings: List<Booking>
)

@Service
@Transactional(readOnly = true)
open class CalendarService(
    private val bookingRepository: BookingRepository,
    private val roomRepository: RoomRepository
) {
    open fun getCalendarForDate(locationId: UUID, date: LocalDate): CalendarDay {
        val rooms = roomRepository.findByLocationIdAndActiveTrue(locationId)
        val startOfDay = date.atStartOfDay()
        val endOfDay = date.plusDays(1).atStartOfDay()

        val bookings = bookingRepository.findByLocationAndDate(locationId, startOfDay, endOfDay)
        val bookingsByRoom = bookings.groupBy { it.room.id }

        val roomsWithBookings = rooms.map { room ->
            RoomWithBookings(
                room = room,
                bookings = bookingsByRoom[room.id] ?: emptyList()
            )
        }

        return CalendarDay(date = date, rooms = roomsWithBookings)
    }
}
