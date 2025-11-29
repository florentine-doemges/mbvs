package com.studio.booking.repository

import com.studio.booking.domain.Booking
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.time.LocalDateTime
import java.util.UUID

interface BookingRepository : JpaRepository<Booking, UUID> {
    @Query(
        """
        SELECT b FROM Booking b
        WHERE b.room.location.id = :locationId
        AND b.startTime >= :startOfDay
        AND b.startTime < :endOfDay
    """,
    )
    fun findByLocationAndDate(
        locationId: UUID,
        startOfDay: LocalDateTime,
        endOfDay: LocalDateTime,
    ): List<Booking>

    @Query(
        """
        SELECT COUNT(b) > 0 FROM Booking b
        WHERE b.room.id = :roomId
        AND b.id != :excludeBookingId
        AND b.startTime < :endTime
        AND FUNCTION('TIMESTAMPADD', MINUTE, b.durationMinutes, b.startTime) > :startTime
    """,
    )
    fun existsOverlappingBooking(
        roomId: UUID,
        startTime: LocalDateTime,
        endTime: LocalDateTime,
        excludeBookingId: UUID,
    ): Boolean

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.room.id = :roomId")
    fun countByRoomId(roomId: UUID): Long

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.room.id = :roomId AND b.startTime >= :now")
    fun countFutureBookingsByRoomId(
        roomId: UUID,
        now: LocalDateTime,
    ): Long

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.provider.id = :providerId")
    fun countByProviderId(providerId: UUID): Long

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.provider.id = :providerId AND b.startTime >= :now")
    fun countFutureBookingsByProviderId(
        providerId: UUID,
        now: LocalDateTime,
    ): Long
}
