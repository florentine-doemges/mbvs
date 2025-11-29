package com.studio.booking.service

import com.studio.booking.domain.Booking
import com.studio.booking.repository.BookingRepository
import com.studio.booking.repository.DurationOptionRepository
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
    private val providerRepository: ServiceProviderRepository,
    private val durationOptionRepository: DurationOptionRepository,
) {
    open fun createBooking(
        providerId: UUID,
        roomId: UUID,
        startTime: LocalDateTime,
        durationMinutes: Int,
        clientAlias: String,
    ): Booking {
        val room =
            roomRepository.findById(roomId)
                .orElseThrow { IllegalArgumentException("Raum nicht gefunden") }
        if (!room.active) {
            throw IllegalArgumentException("Raum ist nicht aktiv")
        }

        validateDuration(durationMinutes, room.location.id)
        validateStartTimeNotInPast(startTime)

        val provider =
            providerRepository.findById(providerId)
                .orElseThrow { IllegalArgumentException("Provider nicht gefunden") }
        if (!provider.active) {
            throw IllegalArgumentException("Provider ist nicht aktiv")
        }

        val endTime = startTime.plusMinutes(durationMinutes.toLong())
        validateNoOverlap(roomId, startTime, endTime, UUID.randomUUID())

        val booking =
            Booking(
                provider = provider,
                room = room,
                startTime = startTime,
                durationMinutes = durationMinutes,
                clientAlias = clientAlias,
            )

        return bookingRepository.save(booking)
    }

    open fun updateBooking(
        bookingId: UUID,
        providerId: UUID,
        roomId: UUID,
        startTime: LocalDateTime,
        durationMinutes: Int,
        clientAlias: String,
    ): Booking {
        val booking =
            bookingRepository.findById(bookingId)
                .orElseThrow { IllegalArgumentException("Buchung nicht gefunden") }

        val room =
            roomRepository.findById(roomId)
                .orElseThrow { IllegalArgumentException("Raum nicht gefunden") }
        if (!room.active) {
            throw IllegalArgumentException("Raum ist nicht aktiv")
        }

        validateDuration(durationMinutes, room.location.id)

        val provider =
            providerRepository.findById(providerId)
                .orElseThrow { IllegalArgumentException("Provider nicht gefunden") }
        if (!provider.active) {
            throw IllegalArgumentException("Provider ist nicht aktiv")
        }

        val endTime = startTime.plusMinutes(durationMinutes.toLong())
        validateNoOverlap(roomId, startTime, endTime, bookingId)

        val updatedBooking =
            Booking(
                id = booking.id,
                provider = provider,
                room = room,
                startTime = startTime,
                durationMinutes = durationMinutes,
                clientAlias = clientAlias,
                createdAt = booking.createdAt,
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

    private fun validateDuration(
        durationMinutes: Int,
        locationId: UUID,
    ) {
        val options = durationOptionRepository.findByLocationIdAndActiveTrueOrderBySortOrderAsc(locationId)

        val isValid =
            options.any { option ->
                if (option.isVariable) {
                    val min = option.minMinutes ?: 0
                    val max = option.maxMinutes ?: Int.MAX_VALUE
                    val step = option.stepMinutes ?: 1
                    durationMinutes in min..max && (durationMinutes - min) % step == 0
                } else {
                    option.minutes == durationMinutes
                }
            }

        if (!isValid) {
            val validOptions =
                options.map { option ->
                    if (option.isVariable) {
                        "${option.minMinutes}-${option.maxMinutes} Min (${option.stepMinutes}er Schritte)"
                    } else {
                        "${option.minutes} Min"
                    }
                }.joinToString(", ")
            throw IllegalArgumentException("Ungültige Dauer. Erlaubt: $validOptions")
        }
    }

    private fun validateStartTimeNotInPast(startTime: LocalDateTime) {
        if (startTime.isBefore(LocalDateTime.now())) {
            throw IllegalArgumentException("Startzeit darf nicht in der Vergangenheit liegen")
        }
    }

    private fun validateNoOverlap(
        roomId: UUID,
        startTime: LocalDateTime,
        endTime: LocalDateTime,
        excludeBookingId: UUID,
    ) {
        val hasOverlap = bookingRepository.existsOverlappingBooking(roomId, startTime, endTime, excludeBookingId)
        if (hasOverlap) {
            throw IllegalArgumentException("Der Raum ist zu dieser Zeit bereits gebucht")
        }
    }
}
