package com.studio.booking.service

import com.studio.booking.domain.RoomPrice
import com.studio.booking.domain.UpgradePrice
import com.studio.booking.repository.RoomPriceRepository
import com.studio.booking.repository.RoomRepository
import com.studio.booking.repository.UpgradePriceRepository
import com.studio.booking.repository.UpgradeRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.OffsetDateTime
import java.util.UUID

@Service
class PriceService(
    private val roomPriceRepository: RoomPriceRepository,
    private val upgradePriceRepository: UpgradePriceRepository,
    private val roomRepository: RoomRepository,
    private val upgradeRepository: UpgradeRepository,
) {
    /**
     * Updates a room's price by closing the current price period and creating a new one
     */
    @Transactional
    fun updateRoomPrice(
        roomId: UUID,
        newPrice: BigDecimal,
        validFrom: OffsetDateTime,
    ): RoomPrice {
        val room =
            roomRepository.findById(roomId)
                .orElseThrow { IllegalArgumentException("Room not found: $roomId") }

        // Close the current price period
        val currentPrice = roomPriceRepository.findByRoomIdAndValidToIsNull(roomId)
        currentPrice?.let {
            // Only close if the new price starts after the current price
            if (validFrom.isAfter(it.validFrom)) {
                it.validTo = validFrom
                roomPriceRepository.save(it)
            } else {
                throw IllegalArgumentException("New price valid_from must be after current price valid_from")
            }
        }

        // Create new price
        val newRoomPrice =
            RoomPrice(
                room = room,
                price = newPrice,
                validFrom = validFrom,
                validTo = null,
            )

        return roomPriceRepository.save(newRoomPrice)
    }

    /**
     * Updates an upgrade's price by closing the current price period and creating a new one
     */
    @Transactional
    fun updateUpgradePrice(
        upgradeId: UUID,
        newPrice: BigDecimal,
        validFrom: OffsetDateTime,
    ): UpgradePrice {
        val upgrade =
            upgradeRepository.findById(upgradeId)
                .orElseThrow { IllegalArgumentException("Upgrade not found: $upgradeId") }

        // Close the current price period
        val currentPrice = upgradePriceRepository.findByUpgradeIdAndValidToIsNull(upgradeId)
        currentPrice?.let {
            // Only close if the new price starts after the current price
            if (validFrom.isAfter(it.validFrom)) {
                it.validTo = validFrom
                upgradePriceRepository.save(it)
            } else {
                throw IllegalArgumentException("New price valid_from must be after current price valid_from")
            }
        }

        // Create new price
        val newUpgradePrice =
            UpgradePrice(
                upgrade = upgrade,
                price = newPrice,
                validFrom = validFrom,
                validTo = null,
            )

        return upgradePriceRepository.save(newUpgradePrice)
    }

    /**
     * Get price history for a room
     */
    fun getRoomPriceHistory(roomId: UUID): List<RoomPrice> {
        return roomPriceRepository.findByRoomIdOrderByValidFromDesc(roomId)
    }

    /**
     * Get price history for an upgrade
     */
    fun getUpgradePriceHistory(upgradeId: UUID): List<UpgradePrice> {
        return upgradePriceRepository.findByUpgradeIdOrderByValidFromDesc(upgradeId)
    }

    /**
     * Get the room price valid at a specific point in time
     */
    fun getRoomPriceAt(
        roomId: UUID,
        timestamp: OffsetDateTime,
    ): RoomPrice? {
        return roomPriceRepository.findByRoomIdAndValidAt(roomId, timestamp)
    }

    /**
     * Get the upgrade price valid at a specific point in time
     */
    fun getUpgradePriceAt(
        upgradeId: UUID,
        timestamp: OffsetDateTime,
    ): UpgradePrice? {
        return upgradePriceRepository.findByUpgradeIdAndValidAt(upgradeId, timestamp)
    }

    /**
     * Get the current price for a room
     */
    fun getCurrentRoomPrice(roomId: UUID): RoomPrice? {
        return roomPriceRepository.findByRoomIdAndValidToIsNull(roomId)
    }

    /**
     * Get the current price for an upgrade
     */
    fun getCurrentUpgradePrice(upgradeId: UUID): UpgradePrice? {
        return upgradePriceRepository.findByUpgradeIdAndValidToIsNull(upgradeId)
    }
}
