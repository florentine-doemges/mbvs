package com.studio.booking.repository

import com.studio.booking.domain.Room
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.util.UUID

interface RoomRepository : JpaRepository<Room, UUID> {
    fun findByLocationIdAndActiveTrue(locationId: UUID): List<Room>

    fun findByLocationIdOrderBySortOrderAsc(locationId: UUID): List<Room>

    fun findByLocationIdAndActiveTrueOrderBySortOrderAsc(locationId: UUID): List<Room>

    fun existsByLocationIdAndNameIgnoreCase(
        locationId: UUID,
        name: String,
    ): Boolean

    fun existsByLocationIdAndNameIgnoreCaseAndIdNot(
        locationId: UUID,
        name: String,
        id: UUID,
    ): Boolean

    @Query("SELECT MAX(r.sortOrder) FROM Room r WHERE r.location.id = :locationId")
    fun findMaxSortOrderByLocationId(locationId: UUID): Int?
}
