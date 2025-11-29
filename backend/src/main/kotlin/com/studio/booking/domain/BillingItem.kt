package com.studio.booking.domain

import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import java.math.BigDecimal
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "billing_items")
class BillingItem(
    @Id
    val id: UUID = UUID.randomUUID(),
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "billing_id", nullable = false)
    val billing: Billing,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    val booking: Booking,
    // Frozen booking data
    @Column(name = "frozen_start_time", nullable = false, columnDefinition = "TIMESTAMPTZ")
    val frozenStartTime: OffsetDateTime,
    @Column(name = "frozen_end_time", nullable = false, columnDefinition = "TIMESTAMPTZ")
    val frozenEndTime: OffsetDateTime,
    @Column(name = "frozen_duration_minutes", nullable = false)
    val frozenDurationMinutes: Int,
    @Column(name = "frozen_resting_time_minutes", nullable = false)
    val frozenRestingTimeMinutes: Int,
    @Column(name = "frozen_client_alias")
    val frozenClientAlias: String?,
    @Column(name = "frozen_room_name", nullable = false)
    val frozenRoomName: String,
    // Price references
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_price_id", nullable = false)
    val roomPrice: RoomPrice,
    @Column(name = "frozen_room_price_amount", precision = 10, scale = 2, nullable = false)
    val frozenRoomPriceAmount: BigDecimal,
    // Calculated totals
    @Column(name = "subtotal_room", precision = 10, scale = 2, nullable = false)
    val subtotalRoom: BigDecimal,
    @Column(name = "subtotal_upgrades", precision = 10, scale = 2, nullable = false)
    var subtotalUpgrades: BigDecimal = BigDecimal.ZERO,
    @Column(name = "total_amount", precision = 10, scale = 2, nullable = false)
    var totalAmount: BigDecimal,
    @Column(name = "created_at", nullable = false, columnDefinition = "TIMESTAMPTZ")
    val createdAt: OffsetDateTime = OffsetDateTime.now(),
    @OneToMany(
        mappedBy = "billingItem",
        cascade = [CascadeType.ALL],
        orphanRemoval = true,
        fetch = FetchType.LAZY,
    )
    val upgrades: MutableList<BillingItemUpgrade> = mutableListOf(),
) {
    fun addUpgrade(upgrade: BillingItemUpgrade) {
        upgrades.add(upgrade)
    }

    fun calculateTotalAmount(): BigDecimal {
        subtotalUpgrades = upgrades.sumOf { it.totalAmount }
        totalAmount = subtotalRoom + subtotalUpgrades
        return totalAmount
    }
}
