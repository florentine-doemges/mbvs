package com.studio.booking.repository

import com.studio.booking.domain.Booking
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
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

    @Query(
        value = """
        SELECT b.* FROM bookings b
        JOIN rooms r ON r.id = b.room_id
        WHERE r.location_id = :locationId
        AND (CAST(:startDate AS text) IS NULL OR b.start_time >= :startDate)
        AND (CAST(:endDate AS text) IS NULL OR b.start_time <= :endDate)
        AND (CAST(:providerId AS text) IS NULL OR b.provider_id = :providerId)
        AND (CAST(:roomId AS text) IS NULL OR b.room_id = :roomId)
        AND (CAST(:clientSearch AS text) IS NULL OR LOWER(b.client_alias) LIKE '%' || LOWER(:clientSearch) || '%')
        ORDER BY b.start_time DESC
    """,
        countQuery = """
        SELECT COUNT(*) FROM bookings b
        JOIN rooms r ON r.id = b.room_id
        WHERE r.location_id = :locationId
        AND (CAST(:startDate AS text) IS NULL OR b.start_time >= :startDate)
        AND (CAST(:endDate AS text) IS NULL OR b.start_time <= :endDate)
        AND (CAST(:providerId AS text) IS NULL OR b.provider_id = :providerId)
        AND (CAST(:roomId AS text) IS NULL OR b.room_id = :roomId)
        AND (CAST(:clientSearch AS text) IS NULL OR LOWER(b.client_alias) LIKE '%' || LOWER(:clientSearch) || '%')
    """,
        nativeQuery = true,
    )
    fun findWithFilters(
        locationId: UUID,
        startDate: LocalDateTime?,
        endDate: LocalDateTime?,
        providerId: UUID?,
        roomId: UUID?,
        clientSearch: String?,
        pageable: Pageable,
    ): Page<Booking>
}
