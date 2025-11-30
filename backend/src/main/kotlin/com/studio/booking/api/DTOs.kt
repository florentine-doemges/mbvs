package com.studio.booking.api

import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.OffsetDateTime
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
    val restingTimeMinutes: Int,
    val clientAlias: String,
    val upgrades: List<BookingUpgradeDto>,
    val createdAt: LocalDateTime,
)

data class CreateBookingRequest(
    val providerId: UUID,
    val roomId: UUID,
    val startTime: LocalDateTime,
    val durationMinutes: Int,
    val restingTimeMinutes: Int = 0,
    val clientAlias: String = "",
    // Map of upgradeId -> quantity
    val upgrades: Map<String, Int> = emptyMap(),
)

data class UpdateBookingRequest(
    val providerId: UUID,
    val roomId: UUID,
    val startTime: LocalDateTime,
    val durationMinutes: Int,
    val restingTimeMinutes: Int = 0,
    val clientAlias: String = "",
    // Map of upgradeId -> quantity
    val upgrades: Map<String, Int> = emptyMap(),
)

// Calendar DTOs
data class CalendarBookingDto(
    val id: UUID,
    val startTime: LocalDateTime,
    val durationMinutes: Int,
    val restingTimeMinutes: Int,
    val provider: ServiceProviderDto,
    val clientAlias: String,
    val upgrades: List<BookingUpgradeDto>,
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

// Booking List DTOs
data class BookingListItemDto(
    val id: UUID,
    val startTime: LocalDateTime,
    val endTime: LocalDateTime,
    val durationMinutes: Int,
    val restingTimeMinutes: Int,
    val clientAlias: String,
    val provider: ProviderInfoDto,
    val room: RoomInfoDto,
    val upgrades: List<BookingUpgradeDto>,
    val status: String,
    val totalPrice: BigDecimal,
)

data class ProviderInfoDto(
    val id: UUID,
    val name: String,
    val color: String,
)

data class RoomInfoDto(
    val id: UUID,
    val name: String,
    val color: String,
    val hourlyRate: BigDecimal,
)

data class BookingListResponse(
    val content: List<BookingListItemDto>,
    val page: PageInfo,
)

data class PageInfo(
    val number: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int,
)

// Upgrade DTOs
data class UpgradeDto(
    val id: UUID,
    val name: String,
    val price: BigDecimal,
    val active: Boolean,
)

data class BookingUpgradeDto(
    val upgrade: UpgradeDto,
    val quantity: Int,
)

data class CreateUpgradeRequest(
    val name: String,
    val price: BigDecimal,
)

data class UpdateUpgradeRequest(
    val name: String,
    val price: BigDecimal,
    val active: Boolean,
)

// Location DTOs
data class LocationDto(
    val id: UUID,
    val name: String,
)

// Error response
data class ErrorResponse(
    val message: String,
)

// Price History DTOs
data class RoomPriceDto(
    val id: UUID,
    val roomId: UUID,
    val price: BigDecimal,
    val validFrom: OffsetDateTime,
    val validTo: OffsetDateTime?,
    val createdAt: OffsetDateTime,
)

data class UpgradePriceDto(
    val id: UUID,
    val upgradeId: UUID,
    val price: BigDecimal,
    val validFrom: OffsetDateTime,
    val validTo: OffsetDateTime?,
    val createdAt: OffsetDateTime,
)

data class UpdatePriceRequest(
    val price: BigDecimal,
    val validFrom: OffsetDateTime,
)

// Price Tier DTOs
data class RoomPriceTierDto(
    val id: UUID,
    val roomPriceId: UUID,
    val fromMinutes: Int,
    val toMinutes: Int?,
    // FIXED or HOURLY
    val priceType: String,
    val price: BigDecimal,
    val sortOrder: Int,
    val createdAt: OffsetDateTime,
)

data class CreatePriceTierRequest(
    val fromMinutes: Int,
    val toMinutes: Int?,
    // FIXED or HOURLY
    val priceType: String,
    val price: BigDecimal,
    val sortOrder: Int = 0,
)

data class UpdatePriceTierRequest(
    val fromMinutes: Int,
    val toMinutes: Int?,
    // FIXED or HOURLY
    val priceType: String,
    val price: BigDecimal,
    val sortOrder: Int,
)

data class PricePreviewDto(
    val durationMinutes: Int,
    val price: BigDecimal,
)

// Billing DTOs
data class BillingDto(
    val id: UUID,
    val serviceProvider: ServiceProviderDto,
    val periodStart: OffsetDateTime,
    val periodEnd: OffsetDateTime,
    val totalAmount: BigDecimal,
    val invoiceDocumentUrl: String?,
    val createdAt: OffsetDateTime,
    val itemCount: Int,
)

data class BillingDetailDto(
    val id: UUID,
    val serviceProvider: ServiceProviderDto,
    val periodStart: OffsetDateTime,
    val periodEnd: OffsetDateTime,
    val totalAmount: BigDecimal,
    val invoiceDocumentUrl: String?,
    val createdAt: OffsetDateTime,
    val items: List<BillingItemDto>,
)

data class BillingItemDto(
    val id: UUID,
    val bookingId: UUID,
    val frozenStartTime: OffsetDateTime,
    val frozenEndTime: OffsetDateTime,
    val frozenDurationMinutes: Int,
    val frozenRestingTimeMinutes: Int,
    val frozenClientAlias: String?,
    val frozenRoomName: String,
    val frozenRoomPriceAmount: BigDecimal,
    val subtotalRoom: BigDecimal,
    val subtotalUpgrades: BigDecimal,
    val totalAmount: BigDecimal,
    val upgrades: List<BillingItemUpgradeDto>,
)

data class BillingItemUpgradeDto(
    val id: UUID,
    val frozenUpgradeName: String,
    val frozenQuantity: Int,
    val frozenUpgradePriceAmount: BigDecimal,
    val totalAmount: BigDecimal,
)

data class CreateBillingRequest(
    val bookingIds: List<UUID>,
    val periodStart: OffsetDateTime,
    val periodEnd: OffsetDateTime,
)
