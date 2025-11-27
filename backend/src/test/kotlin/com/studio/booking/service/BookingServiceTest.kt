package com.studio.booking.service

import com.studio.booking.domain.Booking
import com.studio.booking.domain.Location
import com.studio.booking.domain.Room
import com.studio.booking.domain.ServiceProvider
import com.studio.booking.repository.BookingRepository
import com.studio.booking.repository.RoomRepository
import com.studio.booking.repository.ServiceProviderRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.Optional
import java.util.UUID

@ExtendWith(MockitoExtension::class)
class BookingServiceTest {

    @Mock
    private lateinit var bookingRepository: BookingRepository

    @Mock
    private lateinit var roomRepository: RoomRepository

    @Mock
    private lateinit var providerRepository: ServiceProviderRepository

    private lateinit var bookingService: BookingService

    private val location = Location(name = "Test Studio")
    private val room = Room(location = location, name = "Rot", hourlyRate = BigDecimal("70.00"))
    private val provider = ServiceProvider(name = "Test Provider")

    @BeforeEach
    fun setUp() {
        bookingService = BookingService(bookingRepository, roomRepository, providerRepository)
    }

    @Test
    fun `createBooking should create booking when no overlap exists`() {
        val startTime = LocalDateTime.now().plusHours(1)
        whenever(providerRepository.findById(provider.id)).thenReturn(Optional.of(provider))
        whenever(roomRepository.findById(room.id)).thenReturn(Optional.of(room))
        whenever(bookingRepository.existsOverlappingBooking(any(), any(), any(), any())).thenReturn(false)
        whenever(bookingRepository.save(any<Booking>())).thenAnswer { it.arguments[0] }

        val booking = bookingService.createBooking(
            providerId = provider.id,
            roomId = room.id,
            startTime = startTime,
            durationMinutes = 60,
            clientAlias = "Test Client"
        )

        assertEquals(provider.id, booking.provider.id)
        assertEquals(room.id, booking.room.id)
        assertEquals(60, booking.durationMinutes)
        assertEquals("Test Client", booking.clientAlias)
    }

    @Test
    fun `createBooking should throw exception when overlap exists`() {
        val startTime = LocalDateTime.now().plusHours(1)
        whenever(providerRepository.findById(provider.id)).thenReturn(Optional.of(provider))
        whenever(roomRepository.findById(room.id)).thenReturn(Optional.of(room))
        whenever(bookingRepository.existsOverlappingBooking(any(), any(), any(), any())).thenReturn(true)

        val exception = assertThrows(IllegalArgumentException::class.java) {
            bookingService.createBooking(
                providerId = provider.id,
                roomId = room.id,
                startTime = startTime,
                durationMinutes = 60,
                clientAlias = "Test Client"
            )
        }

        assertEquals("Der Raum ist zu dieser Zeit bereits gebucht", exception.message)
    }

    @Test
    fun `createBooking should throw exception for invalid duration`() {
        val exception = assertThrows(IllegalArgumentException::class.java) {
            bookingService.createBooking(
                providerId = provider.id,
                roomId = room.id,
                startTime = LocalDateTime.now().plusHours(1),
                durationMinutes = 45,
                clientAlias = "Test Client"
            )
        }

        assertEquals("Dauer muss 30, 60, 90 oder 120 Minuten sein", exception.message)
    }

    @Test
    fun `createBooking should throw exception for start time in past`() {
        val exception = assertThrows(IllegalArgumentException::class.java) {
            bookingService.createBooking(
                providerId = provider.id,
                roomId = room.id,
                startTime = LocalDateTime.now().minusHours(1),
                durationMinutes = 60,
                clientAlias = "Test Client"
            )
        }

        assertEquals("Startzeit darf nicht in der Vergangenheit liegen", exception.message)
    }

    @Test
    fun `createBooking should throw exception when provider not found`() {
        whenever(providerRepository.findById(any())).thenReturn(Optional.empty())

        val exception = assertThrows(IllegalArgumentException::class.java) {
            bookingService.createBooking(
                providerId = UUID.randomUUID(),
                roomId = room.id,
                startTime = LocalDateTime.now().plusHours(1),
                durationMinutes = 60,
                clientAlias = "Test Client"
            )
        }

        assertEquals("Provider nicht gefunden", exception.message)
    }

    @Test
    fun `createBooking should throw exception when provider is inactive`() {
        val inactiveProvider = ServiceProvider(name = "Inactive", active = false)
        whenever(providerRepository.findById(inactiveProvider.id)).thenReturn(Optional.of(inactiveProvider))

        val exception = assertThrows(IllegalArgumentException::class.java) {
            bookingService.createBooking(
                providerId = inactiveProvider.id,
                roomId = room.id,
                startTime = LocalDateTime.now().plusHours(1),
                durationMinutes = 60,
                clientAlias = "Test Client"
            )
        }

        assertEquals("Provider ist nicht aktiv", exception.message)
    }

    @Test
    fun `createBooking should throw exception when room not found`() {
        whenever(providerRepository.findById(provider.id)).thenReturn(Optional.of(provider))
        whenever(roomRepository.findById(any())).thenReturn(Optional.empty())

        val exception = assertThrows(IllegalArgumentException::class.java) {
            bookingService.createBooking(
                providerId = provider.id,
                roomId = UUID.randomUUID(),
                startTime = LocalDateTime.now().plusHours(1),
                durationMinutes = 60,
                clientAlias = "Test Client"
            )
        }

        assertEquals("Raum nicht gefunden", exception.message)
    }

    @Test
    fun `createBooking should throw exception when room is inactive`() {
        val inactiveRoom = Room(location = location, name = "Inactive", hourlyRate = BigDecimal("70.00"), active = false)
        whenever(providerRepository.findById(provider.id)).thenReturn(Optional.of(provider))
        whenever(roomRepository.findById(inactiveRoom.id)).thenReturn(Optional.of(inactiveRoom))

        val exception = assertThrows(IllegalArgumentException::class.java) {
            bookingService.createBooking(
                providerId = provider.id,
                roomId = inactiveRoom.id,
                startTime = LocalDateTime.now().plusHours(1),
                durationMinutes = 60,
                clientAlias = "Test Client"
            )
        }

        assertEquals("Raum ist nicht aktiv", exception.message)
    }

    @Test
    fun `deleteBooking should throw exception when booking not found`() {
        whenever(bookingRepository.existsById(any())).thenReturn(false)

        val exception = assertThrows(IllegalArgumentException::class.java) {
            bookingService.deleteBooking(UUID.randomUUID())
        }

        assertEquals("Buchung nicht gefunden", exception.message)
    }
}
