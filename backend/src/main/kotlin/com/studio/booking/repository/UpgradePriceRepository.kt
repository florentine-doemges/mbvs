package com.studio.booking.repository

import com.studio.booking.domain.UpgradePrice
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.OffsetDateTime
import java.util.UUID

interface UpgradePriceRepository : JpaRepository<UpgradePrice, UUID> {
    /**
     * Find all price history for an upgrade, ordered by valid_from descending
     */
    fun findByUpgradeIdOrderByValidFromDesc(upgradeId: UUID): List<UpgradePrice>

    /**
     * Find the currently valid price for an upgrade (where valid_to is NULL)
     */
    fun findByUpgradeIdAndValidToIsNull(upgradeId: UUID): UpgradePrice?

    /**
     * Find the price valid at a specific point in time
     */
    @Query(
        """
        SELECT up FROM UpgradePrice up
        WHERE up.upgrade.id = :upgradeId
        AND up.validFrom <= :timestamp
        AND (up.validTo IS NULL OR up.validTo > :timestamp)
    """,
    )
    fun findByUpgradeIdAndValidAt(
        @Param("upgradeId") upgradeId: UUID,
        @Param("timestamp") timestamp: OffsetDateTime,
    ): UpgradePrice?
}
