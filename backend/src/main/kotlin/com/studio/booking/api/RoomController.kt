package com.studio.booking.api

import com.studio.booking.repository.RoomRepository
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/locations/{locationId}/rooms")
class RoomController(
    private val roomRepository: RoomRepository
) {
    @GetMapping
    fun getRooms(@PathVariable locationId: UUID): List<RoomDto> {
        return roomRepository.findByLocationIdAndActiveTrue(locationId)
            .map { it.toDto() }
    }
}
