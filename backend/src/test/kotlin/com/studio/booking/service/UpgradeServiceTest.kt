package com.studio.booking.service

import com.studio.booking.domain.Upgrade
import com.studio.booking.repository.UpgradeRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.math.BigDecimal
import java.util.Optional
import java.util.UUID

@ExtendWith(MockitoExtension::class)
class UpgradeServiceTest {
    @Mock
    private lateinit var upgradeRepository: UpgradeRepository

    private lateinit var upgradeService: UpgradeService

    private val upgrade = Upgrade(name = "Test Upgrade", price = BigDecimal("20.00"))

    @BeforeEach
    fun setUp() {
        upgradeService = UpgradeService(upgradeRepository)
    }

    @Test
    fun `getAllUpgrades should return active upgrades by default`() {
        val activeUpgrades = listOf(upgrade)
        whenever(upgradeRepository.findByActiveTrue()).thenReturn(activeUpgrades)

        val result = upgradeService.getAllUpgrades()

        assertEquals(activeUpgrades, result)
        verify(upgradeRepository).findByActiveTrue()
    }

    @Test
    fun `getAllUpgrades should return all upgrades when includeInactive is true`() {
        val allUpgrades = listOf(upgrade, Upgrade(name = "Inactive", price = BigDecimal("15.00"), active = false))
        whenever(upgradeRepository.findAllByOrderByNameAsc()).thenReturn(allUpgrades)

        val result = upgradeService.getAllUpgrades(includeInactive = true)

        assertEquals(allUpgrades, result)
        verify(upgradeRepository).findAllByOrderByNameAsc()
    }

    @Test
    fun `getUpgrade should return upgrade when found`() {
        whenever(upgradeRepository.findById(upgrade.id)).thenReturn(Optional.of(upgrade))

        val result = upgradeService.getUpgrade(upgrade.id)

        assertEquals(upgrade, result)
    }

    @Test
    fun `getUpgrade should throw exception when not found`() {
        val upgradeId = UUID.randomUUID()
        whenever(upgradeRepository.findById(upgradeId)).thenReturn(Optional.empty())

        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                upgradeService.getUpgrade(upgradeId)
            }

        assertEquals("Upgrade nicht gefunden: $upgradeId", exception.message)
    }

    @Test
    fun `createUpgrade should create and return new upgrade`() {
        whenever(upgradeRepository.save(any<Upgrade>())).thenAnswer { it.arguments[0] }

        val result = upgradeService.createUpgrade("New Upgrade", BigDecimal("30.00"))

        assertEquals("New Upgrade", result.name)
        assertEquals(BigDecimal("30.00"), result.price)
        verify(upgradeRepository).save(any<Upgrade>())
    }

    @Test
    fun `updateUpgrade should update and return upgrade`() {
        whenever(upgradeRepository.findById(upgrade.id)).thenReturn(Optional.of(upgrade))
        whenever(upgradeRepository.save(any<Upgrade>())).thenAnswer { it.arguments[0] }

        val result =
            upgradeService.updateUpgrade(
                id = upgrade.id,
                name = "Updated Name",
                price = BigDecimal("25.00"),
                active = false,
            )

        assertEquals("Updated Name", result.name)
        assertEquals(BigDecimal("25.00"), result.price)
        assertEquals(false, result.active)
    }

    @Test
    fun `deleteUpgrade should delete upgrade when exists`() {
        whenever(upgradeRepository.existsById(upgrade.id)).thenReturn(true)

        upgradeService.deleteUpgrade(upgrade.id)

        verify(upgradeRepository).deleteById(upgrade.id)
    }

    @Test
    fun `deleteUpgrade should throw exception when not found`() {
        val upgradeId = UUID.randomUUID()
        whenever(upgradeRepository.existsById(upgradeId)).thenReturn(false)

        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                upgradeService.deleteUpgrade(upgradeId)
            }

        assertEquals("Upgrade nicht gefunden: $upgradeId", exception.message)
    }
}
