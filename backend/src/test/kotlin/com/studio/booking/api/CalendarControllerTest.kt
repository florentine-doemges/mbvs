package com.studio.booking.api

import com.studio.booking.domain.Booking
import com.studio.booking.domain.Location
import com.studio.booking.domain.Room
import com.studio.booking.domain.ServiceProvider
import com.studio.booking.service.CalendarDay
import com.studio.booking.service.CalendarService
import com.studio.booking.service.RoomWithBookings
import org.junit.jupiter.api.Test
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@WebMvcTest(CalendarController::class)
class CalendarControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var calendarService: CalendarService

    private val location = Location(name = "Test Studio")
    private val locationId = location.id

    @Test
    fun `getCalendar should return calendar day with rooms and bookings`() {
        val date = LocalDate.of(2024, 6, 15)
        val provider = ServiceProvider(location = location, name = "Lady Lexi", color = "#EC4899")
        val room1 = Room(location = location, name = "Rot", hourlyRate = BigDecimal("70.00"), color = "#EF4444")
        val room2 = Room(location = location, name = "Blau", hourlyRate = BigDecimal("70.00"), color = "#3B82F6")

        val booking1 =
            Booking(
                provider = provider,
                room = room1,
                startTime = LocalDateTime.of(2024, 6, 15, 10, 0),
                durationMinutes = 60,
                clientAlias = "Max",
            )
        val booking2 =
            Booking(
                provider = provider,
                room = room1,
                startTime = LocalDateTime.of(2024, 6, 15, 14, 0),
                durationMinutes = 120,
                clientAlias = "Anna",
            )

        val calendarDay =
            CalendarDay(
                date = date,
                rooms =
                    listOf(
                        RoomWithBookings(room = room1, bookings = listOf(booking1, booking2)),
                        RoomWithBookings(room = room2, bookings = emptyList()),
                    ),
            )

        whenever(calendarService.getCalendarForDate(locationId, date)).thenReturn(calendarDay)

        mockMvc.perform(get("/api/locations/$locationId/calendar?date=2024-06-15"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.date").value("2024-06-15"))
            .andExpect(jsonPath("$.rooms[0].name").value("Rot"))
            .andExpect(jsonPath("$.rooms[0].color").value("#EF4444"))
            .andExpect(jsonPath("$.rooms[0].bookings[0].clientAlias").value("Max"))
            .andExpect(jsonPath("$.rooms[0].bookings[0].durationMinutes").value(60))
            .andExpect(jsonPath("$.rooms[0].bookings[0].provider.name").value("Lady Lexi"))
            .andExpect(jsonPath("$.rooms[0].bookings[1].clientAlias").value("Anna"))
            .andExpect(jsonPath("$.rooms[1].name").value("Blau"))
            .andExpect(jsonPath("$.rooms[1].bookings").isEmpty)
    }

    @Test
    fun `getCalendar should return empty rooms when no bookings`() {
        val date = LocalDate.of(2024, 6, 16)
        val room = Room(location = location, name = "Rot", hourlyRate = BigDecimal("70.00"), color = "#EF4444")

        val calendarDay =
            CalendarDay(
                date = date,
                rooms = listOf(RoomWithBookings(room = room, bookings = emptyList())),
            )

        whenever(calendarService.getCalendarForDate(locationId, date)).thenReturn(calendarDay)

        mockMvc.perform(get("/api/locations/$locationId/calendar?date=2024-06-16"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.date").value("2024-06-16"))
            .andExpect(jsonPath("$.rooms[0].name").value("Rot"))
            .andExpect(jsonPath("$.rooms[0].bookings").isEmpty)
    }
}
