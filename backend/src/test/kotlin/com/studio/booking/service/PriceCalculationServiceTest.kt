package com.studio.booking.service

import com.studio.booking.domain.Location
import com.studio.booking.domain.PriceType
import com.studio.booking.domain.Room
import com.studio.booking.domain.RoomPrice
import com.studio.booking.domain.RoomPriceTier
import com.studio.booking.repository.RoomPriceTierRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import java.math.BigDecimal
import java.time.OffsetDateTime
import java.util.UUID

@DisplayName("PriceCalculationService Unit Tests")
class PriceCalculationServiceTest {
    private lateinit var roomPriceTierRepository: RoomPriceTierRepository
    private lateinit var priceCalculationService: PriceCalculationService
    private lateinit var location: Location
    private lateinit var room: Room
    private lateinit var roomPrice: RoomPrice

    @BeforeEach
    fun setUp() {
        roomPriceTierRepository = mock()
        priceCalculationService = PriceCalculationService(roomPriceTierRepository)
        location = Location(name = "Test Studio")
        room = Room(location = location, name = "Test Room", hourlyRate = BigDecimal("70.00"))
        roomPrice =
            RoomPrice(
                id = UUID.randomUUID(),
                room = room,
                price = BigDecimal("70.00"),
                validFrom = OffsetDateTime.now().minusDays(1),
            )
    }

    @Test
    @DisplayName("calculateRoomPrice with no tiers should use hourly rate")
    fun testCalculateRoomPriceNoTiers() {
        whenever(roomPriceTierRepository.findByRoomPriceIdOrderByFromMinutes(any())).thenReturn(emptyList())

        // 120 minutes = 2 hours, 2 * 70 = 140
        val result = priceCalculationService.calculateRoomPrice(roomPrice, 120)

        assertEquals(BigDecimal("140.00"), result)
    }

    @Test
    @DisplayName("calculateRoomPrice with tiers should use tiered pricing")
    fun testCalculateRoomPriceWithTiers() {
        val tier =
            RoomPriceTier(
                roomPrice = roomPrice,
                fromMinutes = 0,
                toMinutes = null,
                priceType = PriceType.FIXED,
                price = BigDecimal("100.00"),
            )

        whenever(roomPriceTierRepository.findByRoomPriceIdOrderByFromMinutes(any())).thenReturn(listOf(tier))

        val result = priceCalculationService.calculateRoomPrice(roomPrice, 60)

        assertEquals(BigDecimal("100.00"), result)
    }

    @Test
    @DisplayName("calculateRoomPrice for 30 minutes with hourly rate")
    fun testCalculateRoomPrice30Minutes() {
        whenever(roomPriceTierRepository.findByRoomPriceIdOrderByFromMinutes(any())).thenReturn(emptyList())

        // 30 minutes = 0.5 hours, 0.5 * 70 = 35
        val result = priceCalculationService.calculateRoomPrice(roomPrice, 30)

        assertEquals(BigDecimal("35.00"), result)
    }

    @Test
    @DisplayName("calculateRoomPrice for 90 minutes with hourly rate")
    fun testCalculateRoomPrice90Minutes() {
        whenever(roomPriceTierRepository.findByRoomPriceIdOrderByFromMinutes(any())).thenReturn(emptyList())

        // 90 minutes = 1.5 hours, 1.5 * 70 = 105
        val result = priceCalculationService.calculateRoomPrice(roomPrice, 90)

        assertEquals(BigDecimal("105.00"), result)
    }

    @Test
    @DisplayName("calculateRoomPrice for 15 minutes with hourly rate")
    fun testCalculateRoomPrice15Minutes() {
        whenever(roomPriceTierRepository.findByRoomPriceIdOrderByFromMinutes(any())).thenReturn(emptyList())

        // 15 minutes = 0.25 hours, 0.25 * 70 = 17.50
        val result = priceCalculationService.calculateRoomPrice(roomPrice, 15)

        assertEquals(BigDecimal("17.50"), result)
    }

    @Test
    @DisplayName("calculateRoomPrice with mixed tiered pricing")
    fun testCalculateRoomPriceMixedTiers() {
        val tier1 =
            RoomPriceTier(
                roomPrice = roomPrice,
                fromMinutes = 0,
                toMinutes = 60,
                priceType = PriceType.FIXED,
                price = BigDecimal("50.00"),
            )
        val tier2 =
            RoomPriceTier(
                roomPrice = roomPrice,
                fromMinutes = 60,
                toMinutes = null,
                priceType = PriceType.HOURLY,
                price = BigDecimal("100.00"),
            )

        whenever(roomPriceTierRepository.findByRoomPriceIdOrderByFromMinutes(any()))
            .thenReturn(listOf(tier1, tier2))

        // 120 minutes: 60 min @ FIXED 50€ + 60 min @ 100€/h = 50 + 100 = 150
        val result = priceCalculationService.calculateRoomPrice(roomPrice, 120)

        assertEquals(BigDecimal("150.00"), result)
    }
}
