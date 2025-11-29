package com.studio.booking.service

import com.studio.booking.domain.Room
import com.studio.booking.repository.BookingRepository
import com.studio.booking.repository.LocationRepository
import com.studio.booking.repository.RoomRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

@Service
@Transactional
open class RoomService(
    private val roomRepository: RoomRepository,
    private val locationRepository: LocationRepository,
    private val bookingRepository: BookingRepository,
) {
    open fun getRooms(
        locationId: UUID,
        includeInactive: Boolean = false,
    ): List<Room> {
        return if (includeInactive) {
            roomRepository.findByLocationIdOrderBySortOrderAsc(locationId)
        } else {
            roomRepository.findByLocationIdAndActiveTrueOrderBySortOrderAsc(locationId)
        }
    }

    open fun getRoom(roomId: UUID): Room {
        return roomRepository.findById(roomId)
            .orElseThrow { IllegalArgumentException("Raum nicht gefunden") }
    }

    open fun createRoom(
        locationId: UUID,
        name: String,
        hourlyRate: BigDecimal,
        sortOrder: Int?,
        color: String?,
    ): Room {
        validateName(name)
        validateHourlyRate(hourlyRate)
        color?.let { validateColor(it) }

        val location =
            locationRepository.findById(locationId)
                .orElseThrow { IllegalArgumentException("Standort nicht gefunden") }

        if (roomRepository.existsByLocationIdAndNameIgnoreCase(locationId, name)) {
            throw IllegalArgumentException("Ein Raum mit diesem Namen existiert bereits")
        }

        val effectiveSortOrder = sortOrder ?: ((roomRepository.findMaxSortOrderByLocationId(locationId) ?: 0) + 1)

        val room =
            Room(
                location = location,
                name = name.trim(),
                hourlyRate = hourlyRate,
                sortOrder = effectiveSortOrder,
                color = color ?: "#3B82F6",
            )

        return roomRepository.save(room)
    }

    open fun updateRoom(
        roomId: UUID,
        name: String,
        hourlyRate: BigDecimal,
        active: Boolean,
        sortOrder: Int,
        color: String,
    ): Room {
        validateName(name)
        validateHourlyRate(hourlyRate)
        validateColor(color)

        val room =
            roomRepository.findById(roomId)
                .orElseThrow { IllegalArgumentException("Raum nicht gefunden") }

        if (roomRepository.existsByLocationIdAndNameIgnoreCaseAndIdNot(room.location.id, name, roomId)) {
            throw IllegalArgumentException("Ein Raum mit diesem Namen existiert bereits")
        }

        room.name = name.trim()
        room.hourlyRate = hourlyRate
        room.active = active
        room.sortOrder = sortOrder
        room.color = color
        room.updatedAt = LocalDateTime.now()

        return roomRepository.save(room)
    }

    open fun deleteRoom(roomId: UUID) {
        val room =
            roomRepository.findById(roomId)
                .orElseThrow { IllegalArgumentException("Raum nicht gefunden") }

        val futureBookings = bookingRepository.countFutureBookingsByRoomId(roomId, LocalDateTime.now())
        if (futureBookings > 0) {
            throw IllegalArgumentException(
                "Raum kann nicht gelöscht werden, da noch $futureBookings zukünftige Buchungen " +
                    "existieren. Bitte deaktivieren Sie den Raum stattdessen.",
            )
        }

        val totalBookings = bookingRepository.countByRoomId(roomId)
        if (totalBookings > 0) {
            room.active = false
            room.updatedAt = LocalDateTime.now()
            roomRepository.save(room)
        } else {
            roomRepository.delete(room)
        }
    }

    open fun getBookingCount(roomId: UUID): Long {
        return bookingRepository.countByRoomId(roomId)
    }

    private fun validateName(name: String) {
        val trimmed = name.trim()
        if (trimmed.isEmpty()) {
            throw IllegalArgumentException("Name darf nicht leer sein")
        }
        if (trimmed.length > 100) {
            throw IllegalArgumentException("Name darf maximal 100 Zeichen lang sein")
        }
    }

    private fun validateHourlyRate(hourlyRate: BigDecimal) {
        if (hourlyRate <= BigDecimal.ZERO) {
            throw IllegalArgumentException("Stundensatz muss größer als 0 sein")
        }
        if (hourlyRate.scale() > 2) {
            throw IllegalArgumentException("Stundensatz darf maximal 2 Dezimalstellen haben")
        }
    }

    private fun validateColor(color: String) {
        if (!color.matches(Regex("^#[0-9A-Fa-f]{6}$"))) {
            throw IllegalArgumentException("Farbe muss im Format #RRGGBB sein")
        }
    }
}
