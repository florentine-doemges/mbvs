package com.studio.booking.repository

import com.studio.booking.domain.Booking
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.time.LocalDateTime
import java.util.UUID

interface BookingRepository : JpaRepository<Booking, UUID> {

    @Query("""
        SELECT b FROM Booking b
        WHERE b.room.location.id = :locationId
        AND b.startTime >= :startOfDay
        AND b.startTime < :endOfDay
    """)
    fun findByLocationAndDate(
        locationId: UUID,
        startOfDay: LocalDateTime,
        endOfDay: LocalDateTime
    ): List<Booking>

    @Query("""
        SELECT b FROM Booking b
        WHERE b.room.id = :roomId
        AND b.id != :excludeBookingId
        AND (
            (b.startTime < :endTime AND b.startTime >= :startTime) OR
            (b.startTime + b.durationMinutes * 60000 > :startTime AND b.startTime < :startTime) OR
            (b.startTime <= :startTime AND b.startTime + b.durationMinutes * 60000 >= :endTime)
        )
    """)
    fun findOverlappingBookings(
        roomId: UUID,
        startTime: LocalDateTime,
        endTime: LocalDateTime,
        excludeBookingId: UUID
    ): List<Booking>

    @Query("""
        SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM Booking b
        WHERE b.room.id = :roomId
        AND b.id != :excludeBookingId
        AND b.startTime < :endTime
        AND (b.startTime + (b.durationMinutes * INTERVAL '1 minute')) > :startTime
    """)
    fun existsOverlappingBooking(
        roomId: UUID,
        startTime: LocalDateTime,
        endTime: LocalDateTime,
        excludeBookingId: UUID
    ): Boolean
}
