package com.studio.booking.service

import com.studio.booking.domain.Booking
import com.studio.booking.domain.Location
import com.studio.booking.domain.Room
import com.studio.booking.domain.ServiceProvider
import com.studio.booking.repository.BookingRepository
import com.studio.booking.repository.RoomRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@ExtendWith(MockitoExtension::class)
class CalendarServiceTest {
    @Mock
    private lateinit var bookingRepository: BookingRepository

    @Mock
    private lateinit var roomRepository: RoomRepository

    private lateinit var calendarService: CalendarService

    private val location = Location(name = "Test Studio")
    private val room = Room(location = location, name = "Rot", hourlyRate = BigDecimal("70.00"))
    private val provider = ServiceProvider(location = location, name = "Test Provider")

    @BeforeEach
    fun setUp() {
        calendarService = CalendarService(bookingRepository, roomRepository)
    }

    @Test
    fun `getCalendarForDate should return calendar with rooms and bookings`() {
        val date = LocalDate.of(2024, 6, 15)
        val booking =
            Booking(
                provider = provider,
                room = room,
                startTime = LocalDateTime.of(2024, 6, 15, 14, 0),
                durationMinutes = 60,
                restingTimeMinutes = 0,
                clientAlias = "Test Client",
            )

        whenever(roomRepository.findByLocationIdAndActiveTrue(location.id)).thenReturn(listOf(room))
        whenever(bookingRepository.findByLocationAndDate(any(), any(), any())).thenReturn(listOf(booking))

        val result = calendarService.getCalendarForDate(location.id, date)

        assertEquals(date, result.date)
        assertEquals(1, result.rooms.size)
        assertEquals(room.id, result.rooms[0].room.id)
        assertEquals(1, result.rooms[0].bookings.size)
        assertEquals(booking.id, result.rooms[0].bookings[0].id)
    }

    @Test
    fun `getCalendarForDate should return empty bookings for rooms with no bookings`() {
        val date = LocalDate.of(2024, 6, 15)

        whenever(roomRepository.findByLocationIdAndActiveTrue(location.id)).thenReturn(listOf(room))
        whenever(bookingRepository.findByLocationAndDate(any(), any(), any())).thenReturn(emptyList())

        val result = calendarService.getCalendarForDate(location.id, date)

        assertEquals(date, result.date)
        assertEquals(1, result.rooms.size)
        assertEquals(room.id, result.rooms[0].room.id)
        assertEquals(0, result.rooms[0].bookings.size)
    }
}
