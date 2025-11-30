package com.studio.booking.api

import com.fasterxml.jackson.databind.ObjectMapper
import com.studio.booking.domain.Location
import com.studio.booking.domain.Room
import com.studio.booking.domain.RoomPrice
import com.studio.booking.domain.Upgrade
import com.studio.booking.domain.UpgradePrice
import com.studio.booking.service.PriceService
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.math.BigDecimal
import java.time.OffsetDateTime
import java.util.UUID

@WebMvcTest(PriceController::class)
class PriceControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockBean
    private lateinit var priceService: PriceService

    private val location = Location(id = UUID.fromString("11111111-1111-1111-1111-111111111111"), name = "Test Studio")
    private val room =
        Room(
            id = UUID.fromString("22222222-2222-2222-2222-222222222222"),
            location = location,
            name = "Rot",
            hourlyRate = BigDecimal("70.00"),
        )
    private val upgrade =
        Upgrade(
            id = UUID.fromString("33333333-3333-3333-3333-333333333333"),
            name = "Test Upgrade",
            price = BigDecimal("20.00"),
        )

    @Test
    fun `getRoomPriceHistory should return price history`() {
        val now = OffsetDateTime.now()
        val price1 =
            RoomPrice(
                room = room,
                price = BigDecimal("70.00"),
                validFrom = now.minusDays(30),
                validTo = now.minusDays(15),
            )
        val price2 = RoomPrice(room = room, price = BigDecimal("75.00"), validFrom = now.minusDays(15), validTo = null)

        whenever(priceService.getRoomPriceHistory(room.id)).thenReturn(listOf(price2, price1))

        mockMvc.perform(get("/api/rooms/${room.id}/prices"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].price").value(75.00))
            .andExpect(jsonPath("$[1].price").value(70.00))
    }

    @Test
    fun `getCurrentRoomPrice should return current price when found`() {
        val now = OffsetDateTime.now()
        val currentPrice =
            RoomPrice(
                room = room,
                price = BigDecimal("75.00"),
                validFrom = now.minusDays(15),
                validTo = null,
            )

        whenever(priceService.getCurrentRoomPrice(room.id)).thenReturn(currentPrice)

        mockMvc.perform(get("/api/rooms/${room.id}/prices/current"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.price").value(75.00))
    }

    @Test
    fun `getCurrentRoomPrice should return 404 when not found`() {
        whenever(priceService.getCurrentRoomPrice(room.id)).thenReturn(null)

        mockMvc.perform(get("/api/rooms/${room.id}/prices/current"))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `getRoomPriceAt should return price at timestamp when found`() {
        val timestamp = OffsetDateTime.now().minusDays(10)
        val price =
            RoomPrice(
                room = room,
                price = BigDecimal("75.00"),
                validFrom = OffsetDateTime.now().minusDays(15),
                validTo = null,
            )

        whenever(priceService.getRoomPriceAt(room.id, timestamp)).thenReturn(price)

        mockMvc.perform(
            get("/api/rooms/${room.id}/prices/at")
                .param("timestamp", timestamp.toString()),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.price").value(75.00))
    }

    @Test
    fun `getRoomPriceAt should return 404 when not found`() {
        val timestamp = OffsetDateTime.now().minusDays(10)
        whenever(priceService.getRoomPriceAt(room.id, timestamp)).thenReturn(null)

        mockMvc.perform(
            get("/api/rooms/${room.id}/prices/at")
                .param("timestamp", timestamp.toString()),
        )
            .andExpect(status().isNotFound)
    }

    @Test
    fun `updateRoomPrice should create new price`() {
        val newPrice = BigDecimal("80.00")
        val validFrom = OffsetDateTime.now()
        val request = UpdatePriceRequest(price = newPrice, validFrom = validFrom)
        val createdPrice = RoomPrice(room = room, price = newPrice, validFrom = validFrom, validTo = null)

        whenever(priceService.updateRoomPrice(any(), any(), any())).thenReturn(createdPrice)

        mockMvc.perform(
            post("/api/rooms/${room.id}/prices")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.price").value(80.00))
    }

    @Test
    fun `getUpgradePriceHistory should return price history`() {
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

        whenever(priceService.getUpgradePriceHistory(upgrade.id)).thenReturn(listOf(price2, price1))

        mockMvc.perform(get("/api/upgrades/${upgrade.id}/prices"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].price").value(25.00))
            .andExpect(jsonPath("$[1].price").value(20.00))
    }

    @Test
    fun `getCurrentUpgradePrice should return current price when found`() {
        val now = OffsetDateTime.now()
        val currentPrice =
            UpgradePrice(
                upgrade = upgrade,
                price = BigDecimal("25.00"),
                validFrom = now.minusDays(15),
                validTo = null,
            )

        whenever(priceService.getCurrentUpgradePrice(upgrade.id)).thenReturn(currentPrice)

        mockMvc.perform(get("/api/upgrades/${upgrade.id}/prices/current"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.price").value(25.00))
    }

    @Test
    fun `getCurrentUpgradePrice should return 404 when not found`() {
        whenever(priceService.getCurrentUpgradePrice(upgrade.id)).thenReturn(null)

        mockMvc.perform(get("/api/upgrades/${upgrade.id}/prices/current"))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `getUpgradePriceAt should return price at timestamp when found`() {
        val timestamp = OffsetDateTime.now().minusDays(10)
        val price =
            UpgradePrice(
                upgrade = upgrade,
                price = BigDecimal("25.00"),
                validFrom = OffsetDateTime.now().minusDays(15),
                validTo = null,
            )

        whenever(priceService.getUpgradePriceAt(upgrade.id, timestamp)).thenReturn(price)

        mockMvc.perform(
            get("/api/upgrades/${upgrade.id}/prices/at")
                .param("timestamp", timestamp.toString()),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.price").value(25.00))
    }

    @Test
    fun `getUpgradePriceAt should return 404 when not found`() {
        val timestamp = OffsetDateTime.now().minusDays(10)
        whenever(priceService.getUpgradePriceAt(upgrade.id, timestamp)).thenReturn(null)

        mockMvc.perform(
            get("/api/upgrades/${upgrade.id}/prices/at")
                .param("timestamp", timestamp.toString()),
        )
            .andExpect(status().isNotFound)
    }

    @Test
    fun `updateUpgradePrice should create new price`() {
        val newPrice = BigDecimal("30.00")
        val validFrom = OffsetDateTime.now()
        val request = UpdatePriceRequest(price = newPrice, validFrom = validFrom)
        val createdPrice = UpgradePrice(upgrade = upgrade, price = newPrice, validFrom = validFrom, validTo = null)

        whenever(priceService.updateUpgradePrice(any(), any(), any())).thenReturn(createdPrice)

        mockMvc.perform(
            post("/api/upgrades/${upgrade.id}/prices")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.price").value(30.00))
    }
}
