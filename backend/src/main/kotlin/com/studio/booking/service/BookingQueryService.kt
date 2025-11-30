package com.studio.booking.service

import com.studio.booking.domain.BookingUpgrade
import com.studio.booking.repository.BookingRepository
import com.studio.booking.repository.RoomPriceRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

@Service
class BookingQueryService(
    private val bookingRepository: BookingRepository,
    private val priceCalculationService: PriceCalculationService,
    private val roomPriceRepository: RoomPriceRepository,
) {
    fun findBookingsWithFilters(
        locationId: UUID,
        startDate: LocalDate?,
        endDate: LocalDate?,
        providerId: UUID?,
        roomId: UUID?,
        clientSearch: String?,
        status: BookingStatus?,
        pageable: Pageable,
    ): Page<BookingListItem> {
        val startDateTime = startDate?.atStartOfDay()
        val endDateTime = endDate?.atTime(23, 59, 59)

        val now = LocalDateTime.now()
        val actualStartDate =
            when (status) {
                BookingStatus.UPCOMING -> now
                else -> startDateTime
            }
        val actualEndDate =
            when (status) {
                BookingStatus.PAST -> now
                else -> endDateTime
            }

        val bookings =
            bookingRepository.findWithFilters(
                locationId = locationId,
                startDate = actualStartDate,
                endDate = actualEndDate,
                providerId = providerId,
                roomId = roomId,
                clientSearch = clientSearch?.takeIf { it.isNotBlank() },
                pageable = pageable,
            )

        return bookings.map { booking ->
            BookingListItem(
                id = booking.id,
                startTime = booking.startTime,
                endTime = booking.totalEndTime(),
                durationMinutes = booking.durationMinutes,
                restingTimeMinutes = booking.restingTimeMinutes,
                clientAlias = booking.clientAlias,
                provider =
                    ProviderInfo(
                        id = booking.provider.id,
                        name = booking.provider.name,
                        color = booking.provider.color,
                    ),
                room =
                    RoomInfo(
                        id = booking.room.id,
                        name = booking.room.name,
                        color = booking.room.color,
                        hourlyRate = booking.room.hourlyRate,
                    ),
                upgrades = booking.bookingUpgrades.toList(),
                status = calculateStatus(booking.startTime),
                totalPrice = calculateTotalPrice(booking),
            )
        }
    }

    private fun calculateStatus(startTime: LocalDateTime): BookingStatus {
        val today = LocalDate.now()
        val bookingDate = startTime.toLocalDate()

        return when {
            bookingDate.isBefore(today) -> BookingStatus.PAST
            bookingDate.isEqual(today) -> BookingStatus.TODAY
            else -> BookingStatus.UPCOMING
        }
    }

    private fun calculateTotalPrice(booking: com.studio.booking.domain.Booking): java.math.BigDecimal {
        // Get the current room price (the one that was active at booking time or is currently active)
        // For simplicity, we use the current price. In a real system, you'd want to store the price at booking time.
        val currentPrice = roomPriceRepository.findByRoomIdAndValidToIsNull(booking.room.id)

        val roomPrice =
            if (currentPrice != null) {
                // Use tiered pricing if available
                priceCalculationService.calculateRoomPrice(currentPrice, booking.durationMinutes)
            } else {
                // Fallback to simple hourly rate
                val hours =
                    booking.durationMinutes
                        .toBigDecimal()
                        .divide(60.toBigDecimal(), 2, java.math.RoundingMode.HALF_UP)
                booking.room.hourlyRate.multiply(hours)
            }

        val upgradesPrice =
            booking.bookingUpgrades.sumOf {
                it.upgrade.price.multiply(it.quantity.toBigDecimal())
            }
        return roomPrice.add(upgradesPrice)
    }
}

enum class BookingStatus {
    UPCOMING,
    TODAY,
    PAST,
}

data class BookingListItem(
    val id: UUID,
    val startTime: LocalDateTime,
    val endTime: LocalDateTime,
    val durationMinutes: Int,
    val restingTimeMinutes: Int,
    val clientAlias: String,
    val provider: ProviderInfo,
    val room: RoomInfo,
    val upgrades: List<BookingUpgrade>,
    val status: BookingStatus,
    val totalPrice: java.math.BigDecimal,
)

data class ProviderInfo(
    val id: UUID,
    val name: String,
    val color: String,
)

data class RoomInfo(
    val id: UUID,
    val name: String,
    val color: String,
    val hourlyRate: java.math.BigDecimal,
)
