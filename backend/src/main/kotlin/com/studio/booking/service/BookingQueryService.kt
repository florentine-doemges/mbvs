package com.studio.booking.service

import com.studio.booking.domain.BookingUpgrade
import com.studio.booking.repository.BookingRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

@Service
class BookingQueryService(
    private val bookingRepository: BookingRepository,
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
                totalPrice = calculateTotalPrice(booking.durationMinutes, booking.room.hourlyRate, booking.bookingUpgrades),
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

    private fun calculateTotalPrice(
        durationMinutes: Int,
        hourlyRate: java.math.BigDecimal,
        bookingUpgrades: Set<BookingUpgrade>,
    ): java.math.BigDecimal {
        val hours = durationMinutes.toBigDecimal().divide(60.toBigDecimal(), 2, java.math.RoundingMode.HALF_UP)
        val roomPrice = hourlyRate.multiply(hours)
        val upgradesPrice = bookingUpgrades.sumOf { it.upgrade.price.multiply(it.quantity.toBigDecimal()) }
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
