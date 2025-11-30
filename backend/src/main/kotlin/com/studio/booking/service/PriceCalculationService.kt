package com.studio.booking.service

import com.studio.booking.domain.PriceType
import com.studio.booking.domain.RoomPrice
import com.studio.booking.domain.RoomPriceTier
import com.studio.booking.repository.RoomPriceTierRepository
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode
import java.util.UUID

/**
 * Service for calculating prices with tiered pricing support
 */
@Service
class PriceCalculationService(
    private val roomPriceTierRepository: RoomPriceTierRepository,
) {
    /**
     * Calculate room price for a given duration.
     *
     * If the room price has tiers configured, uses tiered pricing.
     * Otherwise, falls back to simple hourly rate calculation.
     *
     * Example calculation for 90 minutes with tiers:
     * - Tier 1: 0-30 min FIXED 75€ → 75€
     * - Tier 2: 30+ min HOURLY 120€ → 60 min × 120€/h = 120€
     * Total: 195€
     */
    fun calculateRoomPrice(
        roomPrice: RoomPrice,
        durationMinutes: Int,
    ): BigDecimal {
        val tiers = roomPriceTierRepository.findByRoomPriceIdOrderByFromMinutes(roomPrice.id)

        return if (tiers.isEmpty()) {
            // Fallback: Use simple hourly rate (backwards compatibility)
            calculateHourlyRate(roomPrice.price, durationMinutes)
        } else {
            // Use tiered pricing
            calculateTieredPrice(tiers, durationMinutes)
        }
    }

    /**
     * Calculate price using simple hourly rate
     */
    private fun calculateHourlyRate(
        hourlyRate: BigDecimal,
        durationMinutes: Int,
    ): BigDecimal {
        val durationHours =
            BigDecimal(durationMinutes)
                .divide(BigDecimal(60), 4, RoundingMode.HALF_UP)
        return hourlyRate
            .multiply(durationHours)
            .setScale(2, RoundingMode.HALF_UP)
    }

    /**
     * Calculate price using tiered pricing
     *
     * Algorithm:
     * 1. Sort tiers by fromMinutes
     * 2. For each tier, calculate how many minutes fall into it
     * 3. Apply tier's pricing (FIXED or HOURLY)
     * 4. Sum up all tier prices
     */
    fun calculateTieredPrice(
        tiers: List<RoomPriceTier>,
        durationMinutes: Int,
    ): BigDecimal {
        if (tiers.isEmpty()) {
            throw IllegalArgumentException("Tiers list cannot be empty")
        }

        val sortedTiers = tiers.sortedBy { it.fromMinutes }
        var totalPrice = BigDecimal.ZERO
        var currentPosition = 0

        for (tier in sortedTiers) {
            val minutesInTier = tier.getMinutesInTier(durationMinutes, currentPosition)

            if (minutesInTier <= 0) {
                continue
            }

            val tierPrice =
                when (tier.priceType) {
                    PriceType.FIXED -> {
                        // Fixed price for this tier
                        tier.price
                    }

                    PriceType.HOURLY -> {
                        // Hourly rate applied to minutes in this tier
                        val hours =
                            BigDecimal(minutesInTier)
                                .divide(BigDecimal(60), 4, RoundingMode.HALF_UP)
                        tier.price.multiply(hours)
                    }
                }

            totalPrice = totalPrice.add(tierPrice)

            // Move position forward
            val tierEnd = tier.toMinutes ?: durationMinutes
            currentPosition = minOf(tierEnd, durationMinutes)

            // Stop if we've covered the entire duration
            if (currentPosition >= durationMinutes) {
                break
            }
        }

        return totalPrice.setScale(2, RoundingMode.HALF_UP)
    }

    /**
     * Calculate preview prices for common durations
     * Useful for UI display
     */
    fun calculatePricePreview(
        roomPrice: RoomPrice,
    ): Map<Int, BigDecimal> {
        val previewDurations = listOf(15, 30, 60, 90, 120, 180, 240)
        return previewDurations.associateWith { duration ->
            calculateRoomPrice(roomPrice, duration)
        }
    }
}
