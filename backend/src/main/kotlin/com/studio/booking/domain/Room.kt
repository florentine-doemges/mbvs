package com.studio.booking.domain

import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.math.BigDecimal
import java.util.UUID

@Entity
@Table(name = "rooms")
class Room(
    @Id
    val id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    val location: Location,

    val name: String,
    val hourlyRate: BigDecimal,
    val active: Boolean = true
)
