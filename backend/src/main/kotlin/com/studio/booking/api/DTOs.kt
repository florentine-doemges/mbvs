package com.studio.booking.api

import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

data class RoomDto(
    val id: UUID,
    val name: String,
    val hourlyRate: BigDecimal
)

data class ServiceProviderDto(
    val id: UUID,
    val name: String
)

data class BookingDto(
    val id: UUID,
    val provider: ServiceProviderDto,
    val room: RoomDto,
    val startTime: LocalDateTime,
    val durationMinutes: Int,
    val clientAlias: String,
    val createdAt: LocalDateTime
)

data class CreateBookingRequest(
    val providerId: UUID,
    val roomId: UUID,
    val startTime: LocalDateTime,
    val durationMinutes: Int,
    val clientAlias: String = ""
)

data class UpdateBookingRequest(
    val providerId: UUID,
    val roomId: UUID,
    val startTime: LocalDateTime,
    val durationMinutes: Int,
    val clientAlias: String = ""
)

data class CalendarBookingDto(
    val id: UUID,
    val startTime: LocalDateTime,
    val durationMinutes: Int,
    val provider: ServiceProviderDto,
    val clientAlias: String
)

data class CalendarRoomDto(
    val id: UUID,
    val name: String,
    val bookings: List<CalendarBookingDto>
)

data class CalendarDayDto(
    val date: LocalDate,
    val rooms: List<CalendarRoomDto>
)

data class ErrorResponse(
    val message: String
)
