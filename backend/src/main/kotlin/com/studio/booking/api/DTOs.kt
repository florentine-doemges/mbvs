package com.studio.booking.api

import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

// Room DTOs
data class RoomDto(
    val id: UUID,
    val name: String,
    val hourlyRate: BigDecimal,
)

data class RoomDetailDto(
    val id: UUID,
    val name: String,
    val hourlyRate: BigDecimal,
    val active: Boolean,
    val sortOrder: Int,
    val color: String,
    val bookingCount: Long,
)

data class CreateRoomRequest(
    val name: String,
    val hourlyRate: BigDecimal,
    val sortOrder: Int? = null,
    val color: String? = null,
)

data class UpdateRoomRequest(
    val name: String,
    val hourlyRate: BigDecimal,
    val active: Boolean,
    val sortOrder: Int,
    val color: String,
)

// ServiceProvider DTOs
data class ServiceProviderDto(
    val id: UUID,
    val name: String,
)

data class ProviderDetailDto(
    val id: UUID,
    val name: String,
    val active: Boolean,
    val sortOrder: Int,
    val color: String,
    val bookingCount: Long,
)

data class CreateProviderRequest(
    val name: String,
    val sortOrder: Int? = null,
    val color: String? = null,
)

data class UpdateProviderRequest(
    val name: String,
    val active: Boolean,
    val sortOrder: Int,
    val color: String,
)

// DurationOption DTOs
data class DurationOptionDto(
    val id: UUID,
    val minutes: Int,
    val label: String,
    val isVariable: Boolean,
    val minMinutes: Int?,
    val maxMinutes: Int?,
    val stepMinutes: Int?,
    val sortOrder: Int,
    val active: Boolean,
)

data class CreateDurationOptionRequest(
    val minutes: Int,
    val label: String,
    val isVariable: Boolean = false,
    val minMinutes: Int? = null,
    val maxMinutes: Int? = null,
    val stepMinutes: Int? = null,
    val sortOrder: Int? = null,
)

data class UpdateDurationOptionRequest(
    val minutes: Int,
    val label: String,
    val isVariable: Boolean,
    val minMinutes: Int?,
    val maxMinutes: Int?,
    val stepMinutes: Int?,
    val sortOrder: Int,
    val active: Boolean,
)

// Booking DTOs
data class BookingDto(
    val id: UUID,
    val provider: ServiceProviderDto,
    val room: RoomDto,
    val startTime: LocalDateTime,
    val durationMinutes: Int,
    val clientAlias: String,
    val createdAt: LocalDateTime,
)

data class CreateBookingRequest(
    val providerId: UUID,
    val roomId: UUID,
    val startTime: LocalDateTime,
    val durationMinutes: Int,
    val clientAlias: String = "",
)

data class UpdateBookingRequest(
    val providerId: UUID,
    val roomId: UUID,
    val startTime: LocalDateTime,
    val durationMinutes: Int,
    val clientAlias: String = "",
)

// Calendar DTOs
data class CalendarBookingDto(
    val id: UUID,
    val startTime: LocalDateTime,
    val durationMinutes: Int,
    val provider: ServiceProviderDto,
    val clientAlias: String,
)

data class CalendarRoomDto(
    val id: UUID,
    val name: String,
    val color: String,
    val bookings: List<CalendarBookingDto>,
)

data class CalendarDayDto(
    val date: LocalDate,
    val rooms: List<CalendarRoomDto>,
)

// Error response
data class ErrorResponse(
    val message: String,
)
