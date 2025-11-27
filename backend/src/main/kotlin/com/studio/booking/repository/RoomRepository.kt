package com.studio.booking.repository

import com.studio.booking.domain.Room
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface RoomRepository : JpaRepository<Room, UUID> {
    fun findByLocationIdAndActiveTrue(locationId: UUID): List<Room>
}
