package com.studio.booking.repository

import com.studio.booking.domain.RoomPrice
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.OffsetDateTime
import java.util.UUID

interface RoomPriceRepository : JpaRepository<RoomPrice, UUID> {
    /**
     * Find all price history for a room, ordered by valid_from descending
     */
    fun findByRoomIdOrderByValidFromDesc(roomId: UUID): List<RoomPrice>

    /**
     * Find the currently valid price for a room (where valid_to is NULL)
     */
    fun findByRoomIdAndValidToIsNull(roomId: UUID): RoomPrice?

    /**
     * Find the price valid at a specific point in time
     */
    @Query(
        """
        SELECT rp FROM RoomPrice rp
        WHERE rp.room.id = :roomId
        AND rp.validFrom <= :timestamp
        AND (rp.validTo IS NULL OR rp.validTo > :timestamp)
    """,
    )
    fun findByRoomIdAndValidAt(
        @Param("roomId") roomId: UUID,
        @Param("timestamp") timestamp: OffsetDateTime,
    ): RoomPrice?
}
