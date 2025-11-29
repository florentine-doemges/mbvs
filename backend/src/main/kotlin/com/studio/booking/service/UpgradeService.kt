package com.studio.booking.service

import com.studio.booking.domain.Upgrade
import com.studio.booking.repository.UpgradeRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.util.UUID

@Service
@Transactional
class UpgradeService(
    private val upgradeRepository: UpgradeRepository,
) {
    fun getAllUpgrades(includeInactive: Boolean = false): List<Upgrade> =
        if (includeInactive) {
            upgradeRepository.findAllByOrderByNameAsc()
        } else {
            upgradeRepository.findByActiveTrue()
        }

    fun getUpgrade(id: UUID): Upgrade =
        upgradeRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Upgrade nicht gefunden: $id") }

    fun createUpgrade(
        name: String,
        price: BigDecimal,
    ): Upgrade {
        val upgrade =
            Upgrade(
                name = name,
                price = price,
                active = true,
            )
        return upgradeRepository.save(upgrade)
    }

    fun updateUpgrade(
        id: UUID,
        name: String,
        price: BigDecimal,
        active: Boolean,
    ): Upgrade {
        val upgrade = getUpgrade(id)
        upgrade.name = name
        upgrade.price = price
        upgrade.active = active
        return upgradeRepository.save(upgrade)
    }

    fun deleteUpgrade(id: UUID) {
        if (!upgradeRepository.existsById(id)) {
            throw IllegalArgumentException("Upgrade nicht gefunden: $id")
        }
        upgradeRepository.deleteById(id)
    }
}
