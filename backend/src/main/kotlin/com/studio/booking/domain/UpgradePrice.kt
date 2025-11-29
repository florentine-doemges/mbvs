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
@Table(name = "upgrade_prices")
class UpgradePrice(
    @Id
    val id: UUID = UUID.randomUUID(),
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "upgrade_id", nullable = false)
    val upgrade: Upgrade,
    @Column(name = "price", precision = 10, scale = 2, nullable = false)
    val price: BigDecimal,
    @Column(name = "valid_from", nullable = false, columnDefinition = "TIMESTAMPTZ")
    val validFrom: OffsetDateTime,
    @Column(name = "valid_to", columnDefinition = "TIMESTAMPTZ")
    var validTo: OffsetDateTime? = null,
    @Column(name = "created_at", nullable = false, columnDefinition = "TIMESTAMPTZ")
    val createdAt: OffsetDateTime = OffsetDateTime.now(),
) {
    /**
     * Checks if this price is valid at the given point in time
     */
    fun isValidAt(timestamp: OffsetDateTime): Boolean {
        return !timestamp.isBefore(validFrom) &&
            (validTo == null || timestamp.isBefore(validTo))
    }

    /**
     * Checks if this price is currently valid
     */
    fun isCurrentlyValid(): Boolean = isValidAt(OffsetDateTime.now())
}
