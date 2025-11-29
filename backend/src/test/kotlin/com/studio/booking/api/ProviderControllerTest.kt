package com.studio.booking.api

import com.fasterxml.jackson.databind.ObjectMapper
import com.studio.booking.domain.Location
import com.studio.booking.domain.ServiceProvider
import com.studio.booking.service.ProviderService
import org.junit.jupiter.api.Test
import org.mockito.kotlin.eq
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

@WebMvcTest(ProviderController::class)
class ProviderControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockBean
    private lateinit var providerService: ProviderService

    private val location = Location(name = "Test Studio")
    private val locationId = location.id

    @Test
    fun `getProviders should return list of providers`() {
        val provider1 = ServiceProvider(location = location, name = "Lady Lexi", color = "#EC4899")
        val provider2 = ServiceProvider(location = location, name = "Mistress Bella", color = "#8B5CF6")

        whenever(providerService.getProviders(locationId, false)).thenReturn(listOf(provider1, provider2))
        whenever(providerService.getBookingCount(provider1.id)).thenReturn(10)
        whenever(providerService.getBookingCount(provider2.id)).thenReturn(5)

        mockMvc.perform(get("/api/locations/$locationId/providers"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].name").value("Lady Lexi"))
            .andExpect(jsonPath("$[0].color").value("#EC4899"))
            .andExpect(jsonPath("$[0].bookingCount").value(10))
            .andExpect(jsonPath("$[1].name").value("Mistress Bella"))
            .andExpect(jsonPath("$[1].bookingCount").value(5))
    }

    @Test
    fun `getProviders with includeInactive should pass parameter`() {
        whenever(providerService.getProviders(locationId, true)).thenReturn(emptyList())

        mockMvc.perform(get("/api/locations/$locationId/providers?includeInactive=true"))
            .andExpect(status().isOk)

        verify(providerService).getProviders(locationId, true)
    }

    @Test
    fun `createProvider should create and return new provider`() {
        val request =
            CreateProviderRequest(
                name = "Neue Domina",
                sortOrder = 1,
                color = "#F97316",
            )
        val createdProvider =
            ServiceProvider(
                location = location,
                name = "Neue Domina",
                sortOrder = 1,
                color = "#F97316",
            )

        whenever(
            providerService.createProvider(
                locationId = eq(locationId),
                name = eq("Neue Domina"),
                sortOrder = eq(1),
                color = eq("#F97316"),
            ),
        ).thenReturn(createdProvider)

        mockMvc.perform(
            post("/api/locations/$locationId/providers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.name").value("Neue Domina"))
            .andExpect(jsonPath("$.color").value("#F97316"))
            .andExpect(jsonPath("$.bookingCount").value(0))
    }

    @Test
    fun `getProvider should return provider by id`() {
        val provider = ServiceProvider(location = location, name = "Lady Lexi", color = "#EC4899")
        whenever(providerService.getProvider(provider.id)).thenReturn(provider)
        whenever(providerService.getBookingCount(provider.id)).thenReturn(20)

        mockMvc.perform(get("/api/providers/${provider.id}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.name").value("Lady Lexi"))
            .andExpect(jsonPath("$.bookingCount").value(20))
    }

    @Test
    fun `updateProvider should update and return provider`() {
        val provider = ServiceProvider(location = location, name = "Lady Lexi", color = "#EC4899")
        val request =
            UpdateProviderRequest(
                name = "Lady Lexi Updated",
                active = true,
                sortOrder = 2,
                color = "#A855F7",
            )
        val updatedProvider =
            ServiceProvider(
                location = location,
                name = "Lady Lexi Updated",
                sortOrder = 2,
                color = "#A855F7",
            )

        whenever(
            providerService.updateProvider(
                providerId = eq(provider.id),
                name = eq("Lady Lexi Updated"),
                active = eq(true),
                sortOrder = eq(2),
                color = eq("#A855F7"),
            ),
        ).thenReturn(updatedProvider)
        whenever(providerService.getBookingCount(provider.id)).thenReturn(15)

        mockMvc.perform(
            put("/api/providers/${provider.id}")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.name").value("Lady Lexi Updated"))
            .andExpect(jsonPath("$.color").value("#A855F7"))
    }

    @Test
    fun `deleteProvider should return no content`() {
        val providerId = UUID.randomUUID()

        mockMvc.perform(delete("/api/providers/$providerId"))
            .andExpect(status().isNoContent)

        verify(providerService).deleteProvider(providerId)
    }
}
