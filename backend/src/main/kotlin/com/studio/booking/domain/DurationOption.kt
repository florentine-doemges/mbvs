package com.studio.booking.domain

import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "duration_options")
class DurationOption(
    @Id
    val id: UUID = UUID.randomUUID(),
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    val location: Location,
    var minutes: Int,
    var label: String,
    var isVariable: Boolean = false,
    var minMinutes: Int? = null,
    var maxMinutes: Int? = null,
    var stepMinutes: Int? = null,
    var sortOrder: Int = 0,
    var active: Boolean = true,
    val createdAt: LocalDateTime = LocalDateTime.now(),
)
