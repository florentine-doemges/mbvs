package com.studio.booking.service

import com.studio.booking.domain.Location
import com.studio.booking.domain.Room
import com.studio.booking.domain.RoomPrice
import com.studio.booking.domain.Upgrade
import com.studio.booking.domain.UpgradePrice
import com.studio.booking.repository.RoomPriceRepository
import com.studio.booking.repository.RoomRepository
import com.studio.booking.repository.UpgradePriceRepository
import com.studio.booking.repository.UpgradeRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.whenever
import java.math.BigDecimal
import java.time.OffsetDateTime

@ExtendWith(MockitoExtension::class)
class PriceServiceTest {
    @Mock
    private lateinit var roomPriceRepository: RoomPriceRepository

    @Mock
    private lateinit var upgradePriceRepository: UpgradePriceRepository

    @Mock
    private lateinit var roomRepository: RoomRepository

    @Mock
    private lateinit var upgradeRepository: UpgradeRepository

    private lateinit var priceService: PriceService

    private val location = Location(name = "Test Studio")
    private val room = Room(location = location, name = "Rot", hourlyRate = BigDecimal("70.00"))
    private val upgrade = Upgrade(name = "Test Upgrade", price = BigDecimal("20.00"))

    @BeforeEach
    fun setUp() {
        priceService =
            PriceService(
                roomPriceRepository,
                upgradePriceRepository,
                roomRepository,
                upgradeRepository,
            )
    }

    @Test
    fun `getRoomPriceHistory should return price history ordered by validFrom desc`() {
        val now = OffsetDateTime.now()
        val price1 =
            RoomPrice(
                room = room,
                price = BigDecimal("70.00"),
                validFrom = now.minusDays(30),
                validTo = now.minusDays(15),
            )
        val price2 =
            RoomPrice(
                room = room,
                price = BigDecimal("75.00"),
                validFrom = now.minusDays(15),
                validTo = null,
            )

        whenever(roomPriceRepository.findByRoomIdOrderByValidFromDesc(room.id))
            .thenReturn(listOf(price2, price1))

        val result = priceService.getRoomPriceHistory(room.id)

        assertEquals(2, result.size)
        assertEquals(price2, result[0])
        assertEquals(price1, result[1])
    }

    @Test
    fun `getUpgradePriceHistory should return price history ordered by validFrom desc`() {
        val now = OffsetDateTime.now()
        val price1 =
            UpgradePrice(
                upgrade = upgrade,
                price = BigDecimal("20.00"),
                validFrom = now.minusDays(30),
                validTo = now.minusDays(15),
            )
        val price2 =
            UpgradePrice(
                upgrade = upgrade,
                price = BigDecimal("25.00"),
                validFrom = now.minusDays(15),
                validTo = null,
            )

        whenever(upgradePriceRepository.findByUpgradeIdOrderByValidFromDesc(upgrade.id))
            .thenReturn(listOf(price2, price1))

        val result = priceService.getUpgradePriceHistory(upgrade.id)

        assertEquals(2, result.size)
        assertEquals(price2, result[0])
        assertEquals(price1, result[1])
    }

    @Test
    fun `getCurrentRoomPrice should return current price`() {
        val now = OffsetDateTime.now()
        val currentPrice =
            RoomPrice(
                room = room,
                price = BigDecimal("75.00"),
                validFrom = now.minusDays(15),
                validTo = null,
            )

        whenever(roomPriceRepository.findByRoomIdAndValidToIsNull(room.id))
            .thenReturn(currentPrice)

        val result = priceService.getCurrentRoomPrice(room.id)

        assertEquals(currentPrice, result)
    }

    @Test
    fun `getCurrentUpgradePrice should return current price`() {
        val now = OffsetDateTime.now()
        val currentPrice =
            UpgradePrice(
                upgrade = upgrade,
                price = BigDecimal("25.00"),
                validFrom = now.minusDays(15),
                validTo = null,
            )

        whenever(upgradePriceRepository.findByUpgradeIdAndValidToIsNull(upgrade.id))
            .thenReturn(currentPrice)

        val result = priceService.getCurrentUpgradePrice(upgrade.id)

        assertEquals(currentPrice, result)
    }

    @Test
    fun `getRoomPriceAt should return price valid at timestamp`() {
        val timestamp = OffsetDateTime.now().minusDays(10)
        val price =
            RoomPrice(
                room = room,
                price = BigDecimal("75.00"),
                validFrom = OffsetDateTime.now().minusDays(15),
                validTo = null,
            )

        whenever(roomPriceRepository.findByRoomIdAndValidAt(room.id, timestamp))
            .thenReturn(price)

        val result = priceService.getRoomPriceAt(room.id, timestamp)

        assertEquals(price, result)
    }

    @Test
    fun `getUpgradePriceAt should return price valid at timestamp`() {
        val timestamp = OffsetDateTime.now().minusDays(10)
        val price =
            UpgradePrice(
                upgrade = upgrade,
                price = BigDecimal("25.00"),
                validFrom = OffsetDateTime.now().minusDays(15),
                validTo = null,
            )

        whenever(upgradePriceRepository.findByUpgradeIdAndValidAt(upgrade.id, timestamp))
            .thenReturn(price)

        val result = priceService.getUpgradePriceAt(upgrade.id, timestamp)

        assertEquals(price, result)
    }
}
