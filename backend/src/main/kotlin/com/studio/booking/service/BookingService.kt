package com.studio.booking.service

import com.studio.booking.domain.Booking
import com.studio.booking.repository.BookingRepository
import com.studio.booking.repository.RoomRepository
import com.studio.booking.repository.ServiceProviderRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.UUID

@Service
@Transactional
open class BookingService(
    private val bookingRepository: BookingRepository,
    private val roomRepository: RoomRepository,
    private val providerRepository: ServiceProviderRepository
) {
    companion object {
        val VALID_DURATIONS = setOf(30, 60, 90, 120)
    }

    open fun createBooking(
        providerId: UUID,
        roomId: UUID,
        startTime: LocalDateTime,
        durationMinutes: Int,
        clientAlias: String
    ): Booking {
        validateDuration(durationMinutes)
        validateStartTimeNotInPast(startTime)

        val provider = providerRepository.findById(providerId)
            .orElseThrow { IllegalArgumentException("Provider nicht gefunden") }
        if (!provider.active) {
            throw IllegalArgumentException("Provider ist nicht aktiv")
        }

        val room = roomRepository.findById(roomId)
            .orElseThrow { IllegalArgumentException("Raum nicht gefunden") }
        if (!room.active) {
            throw IllegalArgumentException("Raum ist nicht aktiv")
        }

        val endTime = startTime.plusMinutes(durationMinutes.toLong())
        validateNoOverlap(roomId, startTime, endTime, UUID.randomUUID())

        val booking = Booking(
            provider = provider,
            room = room,
            startTime = startTime,
            durationMinutes = durationMinutes,
            clientAlias = clientAlias
        )

        return bookingRepository.save(booking)
    }

    open fun updateBooking(
        bookingId: UUID,
        providerId: UUID,
        roomId: UUID,
        startTime: LocalDateTime,
        durationMinutes: Int,
        clientAlias: String
    ): Booking {
        validateDuration(durationMinutes)

        val booking = bookingRepository.findById(bookingId)
            .orElseThrow { IllegalArgumentException("Buchung nicht gefunden") }

        val provider = providerRepository.findById(providerId)
            .orElseThrow { IllegalArgumentException("Provider nicht gefunden") }
        if (!provider.active) {
            throw IllegalArgumentException("Provider ist nicht aktiv")
        }

        val room = roomRepository.findById(roomId)
            .orElseThrow { IllegalArgumentException("Raum nicht gefunden") }
        if (!room.active) {
            throw IllegalArgumentException("Raum ist nicht aktiv")
        }

        val endTime = startTime.plusMinutes(durationMinutes.toLong())
        validateNoOverlap(roomId, startTime, endTime, bookingId)

        val updatedBooking = Booking(
            id = booking.id,
            provider = provider,
            room = room,
            startTime = startTime,
            durationMinutes = durationMinutes,
            clientAlias = clientAlias,
            createdAt = booking.createdAt
        )

        return bookingRepository.save(updatedBooking)
    }

    open fun deleteBooking(bookingId: UUID) {
        if (!bookingRepository.existsById(bookingId)) {
            throw IllegalArgumentException("Buchung nicht gefunden")
        }
        bookingRepository.deleteById(bookingId)
    }

    open fun getBooking(bookingId: UUID): Booking {
        return bookingRepository.findById(bookingId)
            .orElseThrow { IllegalArgumentException("Buchung nicht gefunden") }
    }

    private fun validateDuration(durationMinutes: Int) {
        if (durationMinutes !in VALID_DURATIONS) {
            throw IllegalArgumentException("Dauer muss 30, 60, 90 oder 120 Minuten sein")
        }
    }

    private fun validateStartTimeNotInPast(startTime: LocalDateTime) {
        if (startTime.isBefore(LocalDateTime.now())) {
            throw IllegalArgumentException("Startzeit darf nicht in der Vergangenheit liegen")
        }
    }

    private fun validateNoOverlap(roomId: UUID, startTime: LocalDateTime, endTime: LocalDateTime, excludeBookingId: UUID) {
        val hasOverlap = bookingRepository.existsOverlappingBooking(roomId, startTime, endTime, excludeBookingId)
        if (hasOverlap) {
            throw IllegalArgumentException("Der Raum ist zu dieser Zeit bereits gebucht")
        }
    }
}
