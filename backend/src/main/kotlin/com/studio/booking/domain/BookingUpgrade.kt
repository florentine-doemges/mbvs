package com.studio.booking.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.IdClass
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.io.Serializable
import java.util.UUID

@Entity
@Table(name = "booking_upgrades")
@IdClass(BookingUpgradeId::class)
class BookingUpgrade(
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    val booking: Booking,
    @Id
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "upgrade_id")
    val upgrade: Upgrade,
    @Column(nullable = false)
    var quantity: Int = 1,
)

data class BookingUpgradeId(
    val booking: UUID? = null,
    val upgrade: UUID? = null,
) : Serializable
