package com.studio.booking.api

import com.studio.booking.service.RoomService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api")
class RoomController(
    private val roomService: RoomService,
) {
    @GetMapping("/locations/{locationId}/rooms")
    fun getRooms(
        @PathVariable locationId: UUID,
        @RequestParam(defaultValue = "false") includeInactive: Boolean,
    ): List<RoomDetailDto> {
        return roomService.getRooms(locationId, includeInactive)
            .map { it.toDetailDto(roomService.getBookingCount(it.id)) }
    }

    @PostMapping("/locations/{locationId}/rooms")
    @ResponseStatus(HttpStatus.CREATED)
    fun createRoom(
        @PathVariable locationId: UUID,
        @RequestBody request: CreateRoomRequest,
    ): RoomDetailDto {
        val room =
            roomService.createRoom(
                locationId = locationId,
                name = request.name,
                hourlyRate = request.hourlyRate,
                sortOrder = request.sortOrder,
                color = request.color,
            )
        return room.toDetailDto(0)
    }

    @GetMapping("/rooms/{roomId}")
    fun getRoom(
        @PathVariable roomId: UUID,
    ): RoomDetailDto {
        val room = roomService.getRoom(roomId)
        return room.toDetailDto(roomService.getBookingCount(roomId))
    }

    @PutMapping("/rooms/{roomId}")
    fun updateRoom(
        @PathVariable roomId: UUID,
        @RequestBody request: UpdateRoomRequest,
    ): RoomDetailDto {
        val room =
            roomService.updateRoom(
                roomId = roomId,
                name = request.name,
                hourlyRate = request.hourlyRate,
                active = request.active,
                sortOrder = request.sortOrder,
                color = request.color,
            )
        return room.toDetailDto(roomService.getBookingCount(roomId))
    }

    @DeleteMapping("/rooms/{roomId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteRoom(
        @PathVariable roomId: UUID,
    ) {
        roomService.deleteRoom(roomId)
    }
}
