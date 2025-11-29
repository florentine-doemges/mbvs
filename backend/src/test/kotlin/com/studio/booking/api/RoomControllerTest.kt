package com.studio.booking.api

import com.fasterxml.jackson.databind.ObjectMapper
import com.studio.booking.domain.Location
import com.studio.booking.domain.Room
import com.studio.booking.service.RoomService
import org.junit.jupiter.api.Test
import org.mockito.kotlin.eq
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.math.BigDecimal
import java.util.UUID

@WebMvcTest(RoomController::class)
class RoomControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockBean
    private lateinit var roomService: RoomService

    private val location = Location(name = "Test Studio")
    private val locationId = location.id

    @Test
    fun `getRooms should return list of rooms`() {
        val room1 = Room(location = location, name = "Rot", hourlyRate = BigDecimal("70.00"))
        val room2 = Room(location = location, name = "Blau", hourlyRate = BigDecimal("80.00"))

        whenever(roomService.getRooms(locationId, false)).thenReturn(listOf(room1, room2))
        whenever(roomService.getBookingCount(room1.id)).thenReturn(5)
        whenever(roomService.getBookingCount(room2.id)).thenReturn(3)

        mockMvc.perform(get("/api/locations/$locationId/rooms"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].name").value("Rot"))
            .andExpect(jsonPath("$[0].hourlyRate").value(70.00))
            .andExpect(jsonPath("$[0].bookingCount").value(5))
            .andExpect(jsonPath("$[1].name").value("Blau"))
            .andExpect(jsonPath("$[1].bookingCount").value(3))
    }

    @Test
    fun `getRooms with includeInactive should pass parameter`() {
        whenever(roomService.getRooms(locationId, true)).thenReturn(emptyList())

        mockMvc.perform(get("/api/locations/$locationId/rooms?includeInactive=true"))
            .andExpect(status().isOk)

        verify(roomService).getRooms(locationId, true)
    }

    @Test
    fun `createRoom should create and return new room`() {
        val request =
            CreateRoomRequest(
                name = "Neuer Raum",
                hourlyRate = BigDecimal("75.00"),
                sortOrder = 1,
                color = "#FF5733",
            )
        val createdRoom =
            Room(
                location = location,
                name = "Neuer Raum",
                hourlyRate = BigDecimal("75.00"),
                sortOrder = 1,
                color = "#FF5733",
            )

        whenever(
            roomService.createRoom(
                locationId = eq(locationId),
                name = eq("Neuer Raum"),
                hourlyRate = eq(BigDecimal("75.00")),
                sortOrder = eq(1),
                color = eq("#FF5733"),
            ),
        ).thenReturn(createdRoom)

        mockMvc.perform(
            post("/api/locations/$locationId/rooms")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.name").value("Neuer Raum"))
            .andExpect(jsonPath("$.hourlyRate").value(75.00))
            .andExpect(jsonPath("$.color").value("#FF5733"))
            .andExpect(jsonPath("$.bookingCount").value(0))
    }

    @Test
    fun `getRoom should return room by id`() {
        val room = Room(location = location, name = "Rot", hourlyRate = BigDecimal("70.00"))
        whenever(roomService.getRoom(room.id)).thenReturn(room)
        whenever(roomService.getBookingCount(room.id)).thenReturn(10)

        mockMvc.perform(get("/api/rooms/${room.id}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.name").value("Rot"))
            .andExpect(jsonPath("$.bookingCount").value(10))
    }

    @Test
    fun `updateRoom should update and return room`() {
        val room = Room(location = location, name = "Rot", hourlyRate = BigDecimal("70.00"))
        val request =
            UpdateRoomRequest(
                name = "Rot Updated",
                hourlyRate = BigDecimal("80.00"),
                active = true,
                sortOrder = 2,
                color = "#EF4444",
            )
        val updatedRoom =
            Room(
                location = location,
                name = "Rot Updated",
                hourlyRate = BigDecimal("80.00"),
                sortOrder = 2,
                color = "#EF4444",
            )

        whenever(
            roomService.updateRoom(
                roomId = eq(room.id),
                name = eq("Rot Updated"),
                hourlyRate = eq(BigDecimal("80.00")),
                active = eq(true),
                sortOrder = eq(2),
                color = eq("#EF4444"),
            ),
        ).thenReturn(updatedRoom)
        whenever(roomService.getBookingCount(room.id)).thenReturn(5)

        mockMvc.perform(
            put("/api/rooms/${room.id}")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.name").value("Rot Updated"))
            .andExpect(jsonPath("$.hourlyRate").value(80.00))
    }

    @Test
    fun `deleteRoom should return no content`() {
        val roomId = UUID.randomUUID()

        mockMvc.perform(delete("/api/rooms/$roomId"))
            .andExpect(status().isNoContent)

        verify(roomService).deleteRoom(roomId)
    }
}
