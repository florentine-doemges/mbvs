package com.studio.booking.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "bookings")
class Booking(
    @Id
    val id: UUID = UUID.randomUUID(),
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    val provider: ServiceProvider,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    val room: Room,
    @Column(name = "start_time")
    var startTime: LocalDateTime,
    @Column(name = "duration_minutes")
    var durationMinutes: Int,
    @Column(name = "client_alias", columnDefinition = "varchar(255)")
    var clientAlias: String = "",
    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now(),
) {
    fun endTime(): LocalDateTime = startTime.plusMinutes(durationMinutes.toLong())
}
