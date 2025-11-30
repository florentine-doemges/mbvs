package com.studio.booking.service

import com.studio.booking.domain.Location
import com.studio.booking.domain.PriceType
import com.studio.booking.domain.Room
import com.studio.booking.domain.RoomPrice
import com.studio.booking.domain.RoomPriceTier
import com.studio.booking.repository.RoomPriceRepository
import com.studio.booking.repository.RoomPriceTierRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.*
import java.math.BigDecimal
import java.time.OffsetDateTime
import java.util.*

@DisplayName("PriceTierService Tests")
class PriceTierServiceTest {
    private lateinit var roomPriceRepository: RoomPriceRepository
    private lateinit var roomPriceTierRepository: RoomPriceTierRepository
    private lateinit var priceTierService: PriceTierService
    private lateinit var location: Location
    private lateinit var room: Room
    private lateinit var roomPrice: RoomPrice
    private val roomPriceId = UUID.randomUUID()

    @BeforeEach
    fun setUp() {
        roomPriceRepository = mock()
        roomPriceTierRepository = mock()
        priceTierService = PriceTierService(roomPriceRepository, roomPriceTierRepository)
        location = Location(name = "Test Studio")
        room = Room(location = location, name = "Test Room", hourlyRate = BigDecimal("70.00"))

        roomPrice =
            RoomPrice(
                id = roomPriceId,
                room = room,
                price = BigDecimal("70.00"),
                validFrom = OffsetDateTime.now().minusDays(1),
            )
    }

    @Test
    @DisplayName("createPriceTier should create a new tier")
    fun testCreatePriceTier() {
        whenever(roomPriceRepository.findById(roomPriceId)).thenReturn(Optional.of(roomPrice))
        whenever(roomPriceTierRepository.findByRoomPriceIdOrderByFromMinutes(roomPriceId))
            .thenReturn(emptyList())
        whenever(roomPriceTierRepository.save(any<RoomPriceTier>())).thenAnswer { it.arguments[0] }

        val tier =
            priceTierService.createPriceTier(
                roomPriceId = roomPriceId,
                fromMinutes = 0,
                toMinutes = 60,
                priceType = PriceType.FIXED,
                price = BigDecimal("50.00"),
                sortOrder = 0,
            )

        assertNotNull(tier)
        assertEquals(0, tier.fromMinutes)
        assertEquals(60, tier.toMinutes)
        assertEquals(PriceType.FIXED, tier.priceType)
        assertEquals(BigDecimal("50.00"), tier.price)
        verify(roomPriceTierRepository).save(any<RoomPriceTier>())
    }

    @Test
    @DisplayName("createPriceTier should throw exception when room price not found")
    fun testCreatePriceTierRoomPriceNotFound() {
        whenever(roomPriceRepository.findById(roomPriceId)).thenReturn(Optional.empty())

        val exception =
            assertThrows<IllegalArgumentException> {
                priceTierService.createPriceTier(
                    roomPriceId = roomPriceId,
                    fromMinutes = 0,
                    toMinutes = 60,
                    priceType = PriceType.FIXED,
                    price = BigDecimal("50.00"),
                    sortOrder = 0,
                )
            }

        assertTrue(exception.message!!.contains("Room price not found"))
    }

    @Test
    @DisplayName("createPriceTier should throw exception on overlapping tiers")
    fun testCreatePriceTierOverlap() {
        val existingTier =
            RoomPriceTier(
                roomPrice = roomPrice,
                fromMinutes = 0,
                toMinutes = 60,
                priceType = PriceType.FIXED,
                price = BigDecimal("50.00"),
            )

        whenever(roomPriceRepository.findById(roomPriceId)).thenReturn(Optional.of(roomPrice))
        whenever(roomPriceTierRepository.findByRoomPriceIdOrderByFromMinutes(roomPriceId))
            .thenReturn(listOf(existingTier))

        val exception =
            assertThrows<IllegalArgumentException> {
                priceTierService.createPriceTier(
                    roomPriceId = roomPriceId,
                    fromMinutes = 30,
                    toMinutes = 90,
                    priceType = PriceType.FIXED,
                    price = BigDecimal("60.00"),
                    sortOrder = 1,
                )
            }

        assertTrue(exception.message!!.contains("overlap"))
    }

    @Test
    @DisplayName("updatePriceTier should update existing tier")
    fun testUpdatePriceTier() {
        val tierId = UUID.randomUUID()
        val existingTier =
            RoomPriceTier(
                id = tierId,
                roomPrice = roomPrice,
                fromMinutes = 0,
                toMinutes = 60,
                priceType = PriceType.FIXED,
                price = BigDecimal("50.00"),
            )

        whenever(roomPriceTierRepository.findById(tierId)).thenReturn(Optional.of(existingTier))
        whenever(roomPriceTierRepository.findByRoomPriceIdOrderByFromMinutes(roomPriceId))
            .thenReturn(listOf(existingTier))
        whenever(roomPriceTierRepository.save(any<RoomPriceTier>())).thenAnswer { it.arguments[0] }

        val updatedTier =
            priceTierService.updatePriceTier(
                tierId = tierId,
                fromMinutes = 0,
                toMinutes = 90,
                priceType = PriceType.HOURLY,
                price = BigDecimal("80.00"),
                sortOrder = 0,
            )

        assertEquals(90, updatedTier.toMinutes)
        assertEquals(PriceType.HOURLY, updatedTier.priceType)
        assertEquals(BigDecimal("80.00"), updatedTier.price)
        verify(roomPriceTierRepository).save(any<RoomPriceTier>())
    }

    @Test
    @DisplayName("updatePriceTier should throw exception when tier not found")
    fun testUpdatePriceTierNotFound() {
        val tierId = UUID.randomUUID()
        whenever(roomPriceTierRepository.findById(tierId)).thenReturn(Optional.empty())

        val exception =
            assertThrows<IllegalArgumentException> {
                priceTierService.updatePriceTier(
                    tierId = tierId,
                    fromMinutes = 0,
                    toMinutes = 60,
                    priceType = PriceType.FIXED,
                    price = BigDecimal("50.00"),
                    sortOrder = 0,
                )
            }

        assertTrue(exception.message!!.contains("Price tier not found"))
    }

    @Test
    @DisplayName("deletePriceTier should delete existing tier")
    fun testDeletePriceTier() {
        val tierId = UUID.randomUUID()

        whenever(roomPriceTierRepository.existsById(tierId)).thenReturn(true)

        priceTierService.deletePriceTier(tierId)

        verify(roomPriceTierRepository).deleteById(tierId)
    }

    @Test
    @DisplayName("deletePriceTier should throw exception when tier not found")
    fun testDeletePriceTierNotFound() {
        val tierId = UUID.randomUUID()
        whenever(roomPriceTierRepository.existsById(tierId)).thenReturn(false)

        val exception =
            assertThrows<IllegalArgumentException> {
                priceTierService.deletePriceTier(tierId)
            }

        assertTrue(exception.message!!.contains("Price tier not found"))
    }

    @Test
    @DisplayName("getRoomPriceTiers should return all tiers for a room price")
    fun testGetRoomPriceTiers() {
        val tier1 =
            RoomPriceTier(
                roomPrice = roomPrice,
                fromMinutes = 0,
                toMinutes = 60,
                priceType = PriceType.FIXED,
                price = BigDecimal("50.00"),
                sortOrder = 0,
            )
        val tier2 =
            RoomPriceTier(
                roomPrice = roomPrice,
                fromMinutes = 60,
                toMinutes = null,
                priceType = PriceType.HOURLY,
                price = BigDecimal("100.00"),
                sortOrder = 1,
            )

        whenever(roomPriceTierRepository.findByRoomPriceIdOrderBySortOrder(roomPriceId))
            .thenReturn(listOf(tier1, tier2))

        val tiers = priceTierService.getRoomPriceTiers(roomPriceId)

        assertEquals(2, tiers.size)
        assertEquals(0, tiers[0].fromMinutes)
        assertEquals(60, tiers[1].fromMinutes)
    }

    @Test
    @DisplayName("deleteAllPriceTiers should delete all tiers for a room price")
    fun testDeleteAllPriceTiers() {
        priceTierService.deleteAllPriceTiers(roomPriceId)

        verify(roomPriceTierRepository).deleteByRoomPriceId(roomPriceId)
    }
}
