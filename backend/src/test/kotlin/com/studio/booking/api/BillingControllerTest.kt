package com.studio.booking.api

import com.fasterxml.jackson.databind.ObjectMapper
import com.studio.booking.domain.Billing
import com.studio.booking.domain.BillingItem
import com.studio.booking.domain.Booking
import com.studio.booking.domain.Location
import com.studio.booking.domain.Room
import com.studio.booking.domain.RoomPrice
import com.studio.booking.domain.ServiceProvider
import com.studio.booking.service.BillingService
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.verify
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
import java.time.LocalDateTime
import java.time.OffsetDateTime
import java.time.ZoneId
import java.util.UUID

@WebMvcTest(BillingController::class)
class BillingControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockBean
    private lateinit var billingService: BillingService

    private val location = Location(id = UUID.fromString("11111111-1111-1111-1111-111111111111"), name = "Test Studio")
    private val provider1 =
        ServiceProvider(
            id = UUID.fromString("22222222-2222-2222-2222-222222222222"),
            location = location,
            name = "Provider 1",
            color = "#EC4899",
        )
    private val provider2 =
        ServiceProvider(
            id = UUID.fromString("33333333-3333-3333-3333-333333333333"),
            location = location,
            name = "Provider 2",
            color = "#10B981",
        )
    private val room =
        Room(
            id = UUID.fromString("44444444-4444-4444-4444-444444444444"),
            location = location,
            name = "Rot",
            hourlyRate = BigDecimal("70.00"),
        )

    @Test
    fun `createBillings should create and return billings`() {
        val periodStart = OffsetDateTime.now().minusDays(7)
        val periodEnd = OffsetDateTime.now()
        val bookingIds = listOf(UUID.randomUUID(), UUID.randomUUID())

        val request =
            CreateBillingRequest(
                bookingIds = bookingIds,
                periodStart = periodStart,
                periodEnd = periodEnd,
            )

        val billing1 =
            Billing(
                serviceProvider = provider1,
                periodStart = periodStart,
                periodEnd = periodEnd,
                totalAmount = BigDecimal("140.00"),
            )

        val billing2 =
            Billing(
                serviceProvider = provider2,
                periodStart = periodStart,
                periodEnd = periodEnd,
                totalAmount = BigDecimal("70.00"),
            )

        whenever(
            billingService.createBillings(
                bookingIds = any(),
                periodStart = any(),
                periodEnd = any(),
            ),
        ).thenReturn(listOf(billing1, billing2))

        mockMvc.perform(
            post("/api/billings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].serviceProvider.name").value("Provider 1"))
            .andExpect(jsonPath("$[0].totalAmount").value(140.00))
            .andExpect(jsonPath("$[0].itemCount").value(0))
            .andExpect(jsonPath("$[1].serviceProvider.name").value("Provider 2"))
            .andExpect(jsonPath("$[1].totalAmount").value(70.00))
    }

    @Test
    fun `createBillings should handle single billing`() {
        val periodStart = OffsetDateTime.now().minusDays(7)
        val periodEnd = OffsetDateTime.now()
        val bookingIds = listOf(UUID.randomUUID())

        val request =
            CreateBillingRequest(
                bookingIds = bookingIds,
                periodStart = periodStart,
                periodEnd = periodEnd,
            )

        val billing =
            Billing(
                serviceProvider = provider1,
                periodStart = periodStart,
                periodEnd = periodEnd,
                totalAmount = BigDecimal("70.00"),
            )

        whenever(
            billingService.createBillings(
                bookingIds = any(),
                periodStart = any(),
                periodEnd = any(),
            ),
        ).thenReturn(listOf(billing))

        mockMvc.perform(
            post("/api/billings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].serviceProvider.name").value("Provider 1"))
            .andExpect(jsonPath("$[0].totalAmount").value(70.00))
    }

    @Test
    fun `getAllBillings should return all billings`() {
        val periodStart = OffsetDateTime.now().minusDays(7)
        val periodEnd = OffsetDateTime.now()

        val billing1 =
            Billing(
                serviceProvider = provider1,
                periodStart = periodStart,
                periodEnd = periodEnd,
                totalAmount = BigDecimal("140.00"),
            )

        val billing2 =
            Billing(
                serviceProvider = provider2,
                periodStart = periodStart.minusDays(7),
                periodEnd = periodStart,
                totalAmount = BigDecimal("70.00"),
            )

        whenever(billingService.getAllBillings()).thenReturn(listOf(billing1, billing2))

        mockMvc.perform(get("/api/billings"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].serviceProvider.name").value("Provider 1"))
            .andExpect(jsonPath("$[1].serviceProvider.name").value("Provider 2"))
    }

    @Test
    fun `getAllBillings should filter by service provider`() {
        val periodStart = OffsetDateTime.now().minusDays(7)
        val periodEnd = OffsetDateTime.now()

        val billing =
            Billing(
                serviceProvider = provider1,
                periodStart = periodStart,
                periodEnd = periodEnd,
                totalAmount = BigDecimal("140.00"),
            )

        whenever(billingService.getBillingsByServiceProvider(provider1.id)).thenReturn(listOf(billing))

        mockMvc.perform(get("/api/billings?serviceProviderId=${provider1.id}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].serviceProvider.name").value("Provider 1"))
            .andExpect(jsonPath("$[0].totalAmount").value(140.00))

        verify(billingService).getBillingsByServiceProvider(provider1.id)
    }

    @Test
    fun `getBillingById should return detailed billing`() {
        val billingId = UUID.randomUUID()
        val periodStart = OffsetDateTime.now().minusDays(7)
        val periodEnd = OffsetDateTime.now()

        val booking =
            Booking(
                provider = provider1,
                room = room,
                startTime = LocalDateTime.now().minusDays(3),
                durationMinutes = 60,
                restingTimeMinutes = 0,
                clientAlias = "Client 1",
            )

        val roomPrice =
            RoomPrice(
                room = room,
                price = BigDecimal("70.00"),
                validFrom = periodStart.minusDays(30),
                validTo = null,
            )

        val billing =
            Billing(
                id = billingId,
                serviceProvider = provider1,
                periodStart = periodStart,
                periodEnd = periodEnd,
                totalAmount = BigDecimal("70.00"),
            )

        val startTime = booking.startTime.atZone(ZoneId.systemDefault()).toOffsetDateTime()
        val endTime = booking.endTime().atZone(ZoneId.systemDefault()).toOffsetDateTime()

        val billingItem =
            BillingItem(
                billing = billing,
                booking = booking,
                frozenStartTime = startTime,
                frozenEndTime = endTime,
                frozenDurationMinutes = 60,
                frozenRestingTimeMinutes = 0,
                frozenClientAlias = "Client 1",
                frozenRoomName = "Rot",
                roomPrice = roomPrice,
                frozenRoomPriceAmount = BigDecimal("70.00"),
                subtotalRoom = BigDecimal("70.00"),
                totalAmount = BigDecimal("70.00"),
            )

        billing.addItem(billingItem)

        whenever(billingService.getBillingById(billingId)).thenReturn(billing)

        mockMvc.perform(get("/api/billings/$billingId"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(billingId.toString()))
            .andExpect(jsonPath("$.serviceProvider.name").value("Provider 1"))
            .andExpect(jsonPath("$.totalAmount").value(70.00))
            .andExpect(jsonPath("$.items.length()").value(1))
            .andExpect(jsonPath("$.items[0].frozenClientAlias").value("Client 1"))
            .andExpect(jsonPath("$.items[0].frozenRoomName").value("Rot"))
            .andExpect(jsonPath("$.items[0].frozenDurationMinutes").value(60))
            .andExpect(jsonPath("$.items[0].subtotalRoom").value(70.00))
            .andExpect(jsonPath("$.items[0].totalAmount").value(70.00))
    }

    @Test
    fun `getBillingItems should return items for billing`() {
        val billingId = UUID.randomUUID()

        val booking =
            Booking(
                provider = provider1,
                room = room,
                startTime = LocalDateTime.now().minusDays(3),
                durationMinutes = 60,
                restingTimeMinutes = 0,
                clientAlias = "Client 1",
            )

        val roomPrice =
            RoomPrice(
                room = room,
                price = BigDecimal("70.00"),
                validFrom = OffsetDateTime.now().minusDays(30),
                validTo = null,
            )

        val billing =
            Billing(
                id = billingId,
                serviceProvider = provider1,
                periodStart = OffsetDateTime.now().minusDays(7),
                periodEnd = OffsetDateTime.now(),
                totalAmount = BigDecimal("70.00"),
            )

        val startTime = booking.startTime.atZone(ZoneId.systemDefault()).toOffsetDateTime()
        val endTime = booking.endTime().atZone(ZoneId.systemDefault()).toOffsetDateTime()

        val billingItem =
            BillingItem(
                billing = billing,
                booking = booking,
                frozenStartTime = startTime,
                frozenEndTime = endTime,
                frozenDurationMinutes = 60,
                frozenRestingTimeMinutes = 0,
                frozenClientAlias = "Client 1",
                frozenRoomName = "Rot",
                roomPrice = roomPrice,
                frozenRoomPriceAmount = BigDecimal("70.00"),
                subtotalRoom = BigDecimal("70.00"),
                totalAmount = BigDecimal("70.00"),
            )

        whenever(billingService.getBillingItems(billingId)).thenReturn(listOf(billingItem))

        mockMvc.perform(get("/api/billings/$billingId/items"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].frozenClientAlias").value("Client 1"))
            .andExpect(jsonPath("$[0].frozenRoomName").value("Rot"))
            .andExpect(jsonPath("$[0].frozenDurationMinutes").value(60))
            .andExpect(jsonPath("$[0].subtotalRoom").value(70.00))
            .andExpect(jsonPath("$[0].totalAmount").value(70.00))
    }

    @Test
    fun `getBillingItems should return empty list when no items`() {
        val billingId = UUID.randomUUID()

        whenever(billingService.getBillingItems(billingId)).thenReturn(emptyList())

        mockMvc.perform(get("/api/billings/$billingId/items"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(0))
    }
}
