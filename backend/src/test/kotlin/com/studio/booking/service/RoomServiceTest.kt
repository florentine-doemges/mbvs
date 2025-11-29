package com.studio.booking.service

import com.studio.booking.domain.Location
import com.studio.booking.domain.Room
import com.studio.booking.repository.BookingRepository
import com.studio.booking.repository.LocationRepository
import com.studio.booking.repository.RoomRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.math.BigDecimal
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class RoomServiceTest {
    @Mock
    private lateinit var roomRepository: RoomRepository

    @Mock
    private lateinit var locationRepository: LocationRepository

    @Mock
    private lateinit var bookingRepository: BookingRepository

    private lateinit var roomService: RoomService

    private val location = Location(name = "Test Studio")

    @BeforeEach
    fun setUp() {
        roomService = RoomService(roomRepository, locationRepository, bookingRepository)
    }

    @Test
    fun `createRoom should create room successfully`() {
        whenever(locationRepository.findById(location.id)).thenReturn(Optional.of(location))
        whenever(roomRepository.existsByLocationIdAndNameIgnoreCase(location.id, "Neuer Raum")).thenReturn(false)
        whenever(roomRepository.findMaxSortOrderByLocationId(location.id)).thenReturn(5)
        whenever(roomRepository.save(any<Room>())).thenAnswer { it.arguments[0] }

        val room =
            roomService.createRoom(
                locationId = location.id,
                name = "Neuer Raum",
                hourlyRate = BigDecimal("75.00"),
                sortOrder = null,
                color = "#FF5733",
            )

        assertEquals("Neuer Raum", room.name)
        assertEquals(BigDecimal("75.00"), room.hourlyRate)
        assertEquals(6, room.sortOrder)
        assertEquals("#FF5733", room.color)
    }

    @Test
    fun `createRoom should throw exception when name is duplicate`() {
        whenever(locationRepository.findById(location.id)).thenReturn(Optional.of(location))
        whenever(roomRepository.existsByLocationIdAndNameIgnoreCase(location.id, "Existing")).thenReturn(true)

        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                roomService.createRoom(
                    locationId = location.id,
                    name = "Existing",
                    hourlyRate = BigDecimal("75.00"),
                    sortOrder = null,
                    color = null,
                )
            }

        assertEquals("Ein Raum mit diesem Namen existiert bereits", exception.message)
    }

    @Test
    fun `createRoom should throw exception when name is empty`() {
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                roomService.createRoom(
                    locationId = location.id,
                    name = "  ",
                    hourlyRate = BigDecimal("75.00"),
                    sortOrder = null,
                    color = null,
                )
            }

        assertEquals("Name darf nicht leer sein", exception.message)
    }

    @Test
    fun `createRoom should throw exception when hourly rate is zero`() {
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                roomService.createRoom(
                    locationId = location.id,
                    name = "Test",
                    hourlyRate = BigDecimal.ZERO,
                    sortOrder = null,
                    color = null,
                )
            }

        assertEquals("Stundensatz muss größer als 0 sein", exception.message)
    }

    @Test
    fun `createRoom should throw exception when color has invalid format`() {
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                roomService.createRoom(
                    locationId = location.id,
                    name = "Test",
                    hourlyRate = BigDecimal("75.00"),
                    sortOrder = null,
                    color = "red",
                )
            }

        assertEquals("Farbe muss im Format #RRGGBB sein", exception.message)
    }

    @Test
    fun `updateRoom should update room successfully`() {
        val room =
            Room(
                location = location,
                name = "Rot",
                hourlyRate = BigDecimal("70.00"),
                active = true,
                sortOrder = 1,
                color = "#FF0000",
            )
        whenever(roomRepository.findById(room.id)).thenReturn(Optional.of(room))
        whenever(
            roomRepository.existsByLocationIdAndNameIgnoreCaseAndIdNot(
                location.id,
                "Rot Updated",
                room.id,
            ),
        ).thenReturn(false)
        whenever(roomRepository.save(any<Room>())).thenAnswer { it.arguments[0] }

        val updated =
            roomService.updateRoom(
                roomId = room.id,
                name = "Rot Updated",
                hourlyRate = BigDecimal("80.00"),
                active = true,
                sortOrder = 2,
                color = "#EF4444",
            )

        assertEquals("Rot Updated", updated.name)
        assertEquals(BigDecimal("80.00"), updated.hourlyRate)
        assertEquals(2, updated.sortOrder)
        assertEquals("#EF4444", updated.color)
    }

    @Test
    fun `deleteRoom should soft delete when has past bookings`() {
        val room = Room(location = location, name = "Rot", hourlyRate = BigDecimal("70.00"))
        whenever(roomRepository.findById(room.id)).thenReturn(Optional.of(room))
        whenever(bookingRepository.countFutureBookingsByRoomId(any(), any())).thenReturn(0)
        whenever(bookingRepository.countByRoomId(room.id)).thenReturn(5)
        whenever(roomRepository.save(any<Room>())).thenAnswer { it.arguments[0] }

        roomService.deleteRoom(room.id)

        assertEquals(false, room.active)
    }

    @Test
    fun `deleteRoom should hard delete when no bookings`() {
        val room = Room(location = location, name = "Rot", hourlyRate = BigDecimal("70.00"))
        whenever(roomRepository.findById(room.id)).thenReturn(Optional.of(room))
        whenever(bookingRepository.countFutureBookingsByRoomId(any(), any())).thenReturn(0)
        whenever(bookingRepository.countByRoomId(room.id)).thenReturn(0)

        roomService.deleteRoom(room.id)

        verify(roomRepository).delete(room)
    }

    @Test
    fun `deleteRoom should throw exception when has future bookings`() {
        val room = Room(location = location, name = "Rot", hourlyRate = BigDecimal("70.00"))
        whenever(roomRepository.findById(room.id)).thenReturn(Optional.of(room))
        whenever(bookingRepository.countFutureBookingsByRoomId(any(), any())).thenReturn(3)

        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                roomService.deleteRoom(room.id)
            }

        assert(exception.message!!.contains("3 zukünftige Buchungen"))
    }
}
