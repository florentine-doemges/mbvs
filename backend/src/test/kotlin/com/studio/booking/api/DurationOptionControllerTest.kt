package com.studio.booking.api

import com.fasterxml.jackson.databind.ObjectMapper
import com.studio.booking.domain.DurationOption
import com.studio.booking.domain.Location
import com.studio.booking.service.DurationOptionService
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

@WebMvcTest(DurationOptionController::class)
class DurationOptionControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockBean
    private lateinit var durationOptionService: DurationOptionService

    private val location = Location(name = "Test Studio")
    private val locationId = location.id

    @Test
    fun `getDurationOptions should return list of options`() {
        val option1 =
            DurationOption(
                location = location,
                minutes = 60,
                label = "1 Stunde",
                isVariable = false,
                sortOrder = 0,
            )
        val option2 =
            DurationOption(
                location = location,
                minutes = 120,
                label = "2 Stunden",
                isVariable = false,
                sortOrder = 1,
            )

        whenever(durationOptionService.getDurationOptions(locationId, false)).thenReturn(listOf(option1, option2))

        mockMvc.perform(get("/api/locations/$locationId/duration-options"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].label").value("1 Stunde"))
            .andExpect(jsonPath("$[0].minutes").value(60))
            .andExpect(jsonPath("$[0].isVariable").value(false))
            .andExpect(jsonPath("$[1].label").value("2 Stunden"))
            .andExpect(jsonPath("$[1].minutes").value(120))
    }

    @Test
    fun `getDurationOptions with includeInactive should pass parameter`() {
        whenever(durationOptionService.getDurationOptions(locationId, true)).thenReturn(emptyList())

        mockMvc.perform(get("/api/locations/$locationId/duration-options?includeInactive=true"))
            .andExpect(status().isOk)

        verify(durationOptionService).getDurationOptions(locationId, true)
    }

    @Test
    fun `createDurationOption should create fixed duration option`() {
        val request =
            CreateDurationOptionRequest(
                minutes = 90,
                label = "90 Minuten",
                isVariable = false,
                sortOrder = 2,
            )
        val createdOption =
            DurationOption(
                location = location,
                minutes = 90,
                label = "90 Minuten",
                isVariable = false,
                sortOrder = 2,
            )

        whenever(
            durationOptionService.createDurationOption(
                locationId = eq(locationId),
                minutes = eq(90),
                label = eq("90 Minuten"),
                isVariable = eq(false),
                minMinutes = eq(null),
                maxMinutes = eq(null),
                stepMinutes = eq(null),
                sortOrder = eq(2),
            ),
        ).thenReturn(createdOption)

        mockMvc.perform(
            post("/api/locations/$locationId/duration-options")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.label").value("90 Minuten"))
            .andExpect(jsonPath("$.minutes").value(90))
            .andExpect(jsonPath("$.isVariable").value(false))
    }

    @Test
    fun `createDurationOption should create variable duration option`() {
        val request =
            CreateDurationOptionRequest(
                minutes = 0,
                label = "Variable Dauer",
                isVariable = true,
                minMinutes = 30,
                maxMinutes = 480,
                stepMinutes = 30,
                sortOrder = 3,
            )
        val createdOption =
            DurationOption(
                location = location,
                minutes = 0,
                label = "Variable Dauer",
                isVariable = true,
                minMinutes = 30,
                maxMinutes = 480,
                stepMinutes = 30,
                sortOrder = 3,
            )

        whenever(
            durationOptionService.createDurationOption(
                locationId = eq(locationId),
                minutes = eq(0),
                label = eq("Variable Dauer"),
                isVariable = eq(true),
                minMinutes = eq(30),
                maxMinutes = eq(480),
                stepMinutes = eq(30),
                sortOrder = eq(3),
            ),
        ).thenReturn(createdOption)

        mockMvc.perform(
            post("/api/locations/$locationId/duration-options")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.label").value("Variable Dauer"))
            .andExpect(jsonPath("$.isVariable").value(true))
            .andExpect(jsonPath("$.minMinutes").value(30))
            .andExpect(jsonPath("$.maxMinutes").value(480))
            .andExpect(jsonPath("$.stepMinutes").value(30))
    }

    @Test
    fun `getDurationOption should return option by id`() {
        val option =
            DurationOption(
                location = location,
                minutes = 60,
                label = "1 Stunde",
                isVariable = false,
                sortOrder = 0,
            )
        whenever(durationOptionService.getDurationOption(option.id)).thenReturn(option)

        mockMvc.perform(get("/api/duration-options/${option.id}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.label").value("1 Stunde"))
            .andExpect(jsonPath("$.minutes").value(60))
    }

    @Test
    fun `updateDurationOption should update and return option`() {
        val option =
            DurationOption(
                location = location,
                minutes = 60,
                label = "1 Stunde",
                isVariable = false,
                sortOrder = 0,
            )
        val request =
            UpdateDurationOptionRequest(
                minutes = 60,
                label = "Eine Stunde",
                isVariable = false,
                minMinutes = null,
                maxMinutes = null,
                stepMinutes = null,
                sortOrder = 1,
                active = true,
            )
        val updatedOption =
            DurationOption(
                location = location,
                minutes = 60,
                label = "Eine Stunde",
                isVariable = false,
                sortOrder = 1,
            )

        whenever(
            durationOptionService.updateDurationOption(
                optionId = eq(option.id),
                minutes = eq(60),
                label = eq("Eine Stunde"),
                isVariable = eq(false),
                minMinutes = eq(null),
                maxMinutes = eq(null),
                stepMinutes = eq(null),
                sortOrder = eq(1),
                active = eq(true),
            ),
        ).thenReturn(updatedOption)

        mockMvc.perform(
            put("/api/duration-options/${option.id}")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.label").value("Eine Stunde"))
            .andExpect(jsonPath("$.sortOrder").value(1))
    }

    @Test
    fun `deleteDurationOption should return no content`() {
        val optionId = UUID.randomUUID()

        mockMvc.perform(delete("/api/duration-options/$optionId"))
            .andExpect(status().isNoContent)

        verify(durationOptionService).deleteDurationOption(optionId)
    }
}
