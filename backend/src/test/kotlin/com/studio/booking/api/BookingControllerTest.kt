package com.studio.booking.api

import com.fasterxml.jackson.databind.ObjectMapper
import com.studio.booking.domain.Booking
import com.studio.booking.domain.Location
import com.studio.booking.domain.Room
import com.studio.booking.domain.ServiceProvider
import com.studio.booking.service.BookingService
import org.junit.jupiter.api.Test
import org.mockito.kotlin.eq
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

@WebMvcTest(BookingController::class)
class BookingControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockBean
    private lateinit var bookingService: BookingService

    private val location = Location(name = "Test Studio")
    private val provider = ServiceProvider(location = location, name = "Lady Lexi", color = "#EC4899")
    private val room = Room(location = location, name = "Rot", hourlyRate = BigDecimal("70.00"))

    @Test
    fun `createBooking should create and return new booking`() {
        val startTime = LocalDateTime.of(2024, 6, 15, 14, 0)
        val request =
            CreateBookingRequest(
                providerId = provider.id,
                roomId = room.id,
                startTime = startTime,
                durationMinutes = 60,
                clientAlias = "Max",
            )
        val createdBooking =
            Booking(
                provider = provider,
                room = room,
                startTime = startTime,
                durationMinutes = 60,
                clientAlias = "Max",
            )

        whenever(
            bookingService.createBooking(
                providerId = eq(provider.id),
                roomId = eq(room.id),
                startTime = eq(startTime),
                durationMinutes = eq(60),
                clientAlias = eq("Max"),
            ),
        ).thenReturn(createdBooking)

        mockMvc.perform(
            post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.durationMinutes").value(60))
            .andExpect(jsonPath("$.clientAlias").value("Max"))
            .andExpect(jsonPath("$.provider.name").value("Lady Lexi"))
            .andExpect(jsonPath("$.room.name").value("Rot"))
    }

    @Test
    fun `getBooking should return booking by id`() {
        val booking =
            Booking(
                provider = provider,
                room = room,
                startTime = LocalDateTime.of(2024, 6, 15, 14, 0),
                durationMinutes = 60,
                clientAlias = "Max",
            )
        whenever(bookingService.getBooking(booking.id)).thenReturn(booking)

        mockMvc.perform(get("/api/bookings/${booking.id}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.durationMinutes").value(60))
            .andExpect(jsonPath("$.clientAlias").value("Max"))
            .andExpect(jsonPath("$.provider.name").value("Lady Lexi"))
    }

    @Test
    fun `updateBooking should update and return booking`() {
        val startTime = LocalDateTime.of(2024, 6, 15, 15, 0)
        val booking =
            Booking(
                provider = provider,
                room = room,
                startTime = LocalDateTime.of(2024, 6, 15, 14, 0),
                durationMinutes = 60,
                clientAlias = "Max",
            )
        val request =
            UpdateBookingRequest(
                providerId = provider.id,
                roomId = room.id,
                startTime = startTime,
                durationMinutes = 90,
                clientAlias = "Max Updated",
            )
        val updatedBooking =
            Booking(
                provider = provider,
                room = room,
                startTime = startTime,
                durationMinutes = 90,
                clientAlias = "Max Updated",
            )

        whenever(
            bookingService.updateBooking(
                bookingId = eq(booking.id),
                providerId = eq(provider.id),
                roomId = eq(room.id),
                startTime = eq(startTime),
                durationMinutes = eq(90),
                clientAlias = eq("Max Updated"),
            ),
        ).thenReturn(updatedBooking)

        mockMvc.perform(
            put("/api/bookings/${booking.id}")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.durationMinutes").value(90))
            .andExpect(jsonPath("$.clientAlias").value("Max Updated"))
    }

    @Test
    fun `deleteBooking should return no content`() {
        val bookingId = UUID.randomUUID()

        mockMvc.perform(delete("/api/bookings/$bookingId"))
            .andExpect(status().isNoContent)

        verify(bookingService).deleteBooking(bookingId)
    }
}
