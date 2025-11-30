package com.studio.booking.service

import com.studio.booking.domain.PriceType
import com.studio.booking.domain.RoomPriceTier
import com.studio.booking.repository.RoomPriceRepository
import com.studio.booking.repository.RoomPriceTierRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.util.UUID

@Service
class PriceTierService(
    private val roomPriceRepository: RoomPriceRepository,
    private val roomPriceTierRepository: RoomPriceTierRepository,
) {
    /**
     * Get all price tiers for a room price
     */
    @Transactional(readOnly = true)
    fun getRoomPriceTiers(roomPriceId: UUID): List<RoomPriceTier> {
        return roomPriceTierRepository.findByRoomPriceIdOrderBySortOrder(roomPriceId)
    }

    /**
     * Create a new price tier
     */
    @Transactional
    fun createPriceTier(
        roomPriceId: UUID,
        fromMinutes: Int,
        toMinutes: Int?,
        priceType: PriceType,
        price: BigDecimal,
        sortOrder: Int,
    ): RoomPriceTier {
        val roomPrice =
            roomPriceRepository.findById(roomPriceId)
                .orElseThrow { IllegalArgumentException("Room price not found: $roomPriceId") }

        // Validate tier doesn't overlap with existing tiers
        validateNoOverlap(roomPriceId, fromMinutes, toMinutes, null)

        val tier =
            RoomPriceTier(
                roomPrice = roomPrice,
                fromMinutes = fromMinutes,
                toMinutes = toMinutes,
                priceType = priceType,
                price = price,
                sortOrder = sortOrder,
            )

        return roomPriceTierRepository.save(tier)
    }

    /**
     * Update an existing price tier
     */
    @Transactional
    fun updatePriceTier(
        tierId: UUID,
        fromMinutes: Int,
        toMinutes: Int?,
        priceType: PriceType,
        price: BigDecimal,
        sortOrder: Int,
    ): RoomPriceTier {
        val existingTier =
            roomPriceTierRepository.findById(tierId)
                .orElseThrow { IllegalArgumentException("Price tier not found: $tierId") }

        // Validate tier doesn't overlap with other tiers (excluding self)
        validateNoOverlap(existingTier.roomPrice.id, fromMinutes, toMinutes, tierId)

        // Create new tier with updated values (tiers are immutable)
        val updatedTier =
            RoomPriceTier(
                id = existingTier.id,
                roomPrice = existingTier.roomPrice,
                fromMinutes = fromMinutes,
                toMinutes = toMinutes,
                priceType = priceType,
                price = price,
                sortOrder = sortOrder,
                createdAt = existingTier.createdAt,
            )

        return roomPriceTierRepository.save(updatedTier)
    }

    /**
     * Delete a price tier
     */
    @Transactional
    fun deletePriceTier(tierId: UUID) {
        if (!roomPriceTierRepository.existsById(tierId)) {
            throw IllegalArgumentException("Price tier not found: $tierId")
        }
        roomPriceTierRepository.deleteById(tierId)
    }

    /**
     * Delete all price tiers for a room price
     */
    @Transactional
    fun deleteAllPriceTiers(roomPriceId: UUID) {
        roomPriceTierRepository.deleteByRoomPriceId(roomPriceId)
    }

    /**
     * Validate that a tier doesn't overlap with existing tiers
     */
    private fun validateNoOverlap(
        roomPriceId: UUID,
        fromMinutes: Int,
        toMinutes: Int?,
        excludeTierId: UUID?,
    ) {
        val existingTiers =
            roomPriceTierRepository.findByRoomPriceIdOrderByFromMinutes(roomPriceId)
                .filter { it.id != excludeTierId }

        for (existing in existingTiers) {
            // Check for overlap
            val newStart = fromMinutes
            val newEnd = toMinutes ?: Int.MAX_VALUE
            val existingStart = existing.fromMinutes
            val existingEnd = existing.toMinutes ?: Int.MAX_VALUE

            if (newStart < existingEnd && newEnd > existingStart) {
                throw IllegalArgumentException(
                    "Price tier overlaps with existing tier: " +
                        "${existing.fromMinutes}-${existing.toMinutes ?: "∞"}",
                )
            }
        }
    }
}
