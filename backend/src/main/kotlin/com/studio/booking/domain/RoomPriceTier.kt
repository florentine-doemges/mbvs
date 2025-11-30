package com.studio.booking.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.math.BigDecimal
import java.time.OffsetDateTime
import java.util.UUID

/**
 * Price tier for a room price.
 * Allows defining different prices based on booking duration.
 *
 * Example 1: Fixed prices for time blocks
 * - 0-30 min: 75€ (FIXED)
 * - 30+ min: 120€/hour (HOURLY)
 *
 * Example 2: Hourly rate tiers
 * - 0-180 min: 70€/hour (HOURLY)
 * - 180+ min: 60€/hour (HOURLY)
 */
@Entity
@Table(name = "room_price_tiers")
class RoomPriceTier(
    @Id
    val id: UUID = UUID.randomUUID(),
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_price_id", nullable = false)
    val roomPrice: RoomPrice,
    @Column(name = "from_minutes", nullable = false)
    val fromMinutes: Int,
    @Column(name = "to_minutes")
    val toMinutes: Int?,
    @Enumerated(EnumType.STRING)
    @Column(name = "price_type", nullable = false, length = 20)
    val priceType: PriceType,
    @Column(name = "price", precision = 10, scale = 2, nullable = false)
    val price: BigDecimal,
    @Column(name = "sort_order", nullable = false)
    val sortOrder: Int = 0,
    @Column(name = "created_at", nullable = false, columnDefinition = "TIMESTAMPTZ")
    val createdAt: OffsetDateTime = OffsetDateTime.now(),
) {
    init {
        require(fromMinutes >= 0) { "fromMinutes must be >= 0" }
        val endMinutes = toMinutes
        require(endMinutes == null || endMinutes > fromMinutes) {
            "toMinutes must be > fromMinutes"
        }
        require(price > BigDecimal.ZERO) { "price must be > 0" }
    }

    /**
     * Checks if this tier covers the given duration point
     */
    fun covers(minutes: Int): Boolean {
        val endMinutes = toMinutes
        return minutes >= fromMinutes && (endMinutes == null || minutes < endMinutes)
    }

    /**
     * Calculates how many minutes of a booking fall into this tier
     */
    fun getMinutesInTier(
        bookingDurationMinutes: Int,
        currentPosition: Int,
    ): Int {
        // Skip if tier is before current position
        val endMinutes = toMinutes
        if (endMinutes != null && endMinutes <= currentPosition) {
            return 0
        }

        val tierStart = maxOf(fromMinutes, currentPosition)
        val tierEnd = endMinutes ?: bookingDurationMinutes

        val minutesInTier = minOf(tierEnd, bookingDurationMinutes) - tierStart

        return maxOf(0, minutesInTier)
    }
}

/**
 * Type of pricing for a tier
 */
enum class PriceType {
    /**
     * Fixed price for the entire duration range
     * Example: 0-30 minutes = 75€ (total)
     */
    FIXED,

    /**
     * Hourly rate applied to the duration in this tier
     * Example: 30+ minutes = 120€ per hour
     */
    HOURLY,
}
