package com.studio.booking.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.math.BigDecimal
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "billing_item_upgrades")
class BillingItemUpgrade(
    @Id
    val id: UUID = UUID.randomUUID(),
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "billing_item_id", nullable = false)
    val billingItem: BillingItem,
    // Frozen upgrade data
    @Column(name = "frozen_upgrade_name", nullable = false)
    val frozenUpgradeName: String,
    @Column(name = "frozen_quantity", nullable = false)
    val frozenQuantity: Int,
    // Price reference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "upgrade_price_id", nullable = false)
    val upgradePrice: UpgradePrice,
    @Column(name = "frozen_upgrade_price_amount", precision = 10, scale = 2, nullable = false)
    val frozenUpgradePriceAmount: BigDecimal,
    // Calculated total
    @Column(name = "total_amount", precision = 10, scale = 2, nullable = false)
    val totalAmount: BigDecimal,
    @Column(name = "created_at", nullable = false, columnDefinition = "TIMESTAMPTZ")
    val createdAt: OffsetDateTime = OffsetDateTime.now(),
)
