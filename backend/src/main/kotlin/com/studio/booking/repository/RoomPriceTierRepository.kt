package com.studio.booking.repository

import com.studio.booking.domain.RoomPriceTier
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface RoomPriceTierRepository : JpaRepository<RoomPriceTier, UUID> {
    /**
     * Find all price tiers for a given room price, ordered by sort_order
     */
    fun findByRoomPriceIdOrderBySortOrder(roomPriceId: UUID): List<RoomPriceTier>

    /**
     * Find all price tiers for a given room price, ordered by fromMinutes
     */
    fun findByRoomPriceIdOrderByFromMinutes(roomPriceId: UUID): List<RoomPriceTier>

    /**
     * Delete all price tiers for a given room price
     */
    fun deleteByRoomPriceId(roomPriceId: UUID)

    /**
     * Check if any price tiers exist for a room price
     */
    fun existsByRoomPriceId(roomPriceId: UUID): Boolean
}
