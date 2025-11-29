package com.studio.booking.service

import com.studio.booking.domain.DurationOption
import com.studio.booking.domain.Location
import com.studio.booking.repository.DurationOptionRepository
import com.studio.booking.repository.LocationRepository
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
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class DurationOptionServiceTest {
    @Mock
    private lateinit var durationOptionRepository: DurationOptionRepository

    @Mock
    private lateinit var locationRepository: LocationRepository

    private lateinit var durationOptionService: DurationOptionService

    private val location = Location(name = "Test Studio")

    @BeforeEach
    fun setUp() {
        durationOptionService = DurationOptionService(durationOptionRepository, locationRepository)
    }

    @Test
    fun `getDurationOptions should return ordered list`() {
        val options =
            listOf(
                DurationOption(location = location, minutes = 60, label = "1 Stunde", sortOrder = 1),
                DurationOption(location = location, minutes = 120, label = "2 Stunden", sortOrder = 2),
            )
        whenever(durationOptionRepository.findByLocationIdOrderBySortOrderAsc(location.id)).thenReturn(options)

        val result = durationOptionService.getDurationOptions(location.id, includeInactive = true)

        assertEquals(2, result.size)
        assertEquals("1 Stunde", result[0].label)
        assertEquals("2 Stunden", result[1].label)
    }

    @Test
    fun `createDurationOption should create fixed duration successfully`() {
        whenever(locationRepository.findById(location.id)).thenReturn(Optional.of(location))
        whenever(durationOptionRepository.findMaxSortOrderByLocationId(location.id)).thenReturn(2)
        whenever(durationOptionRepository.save(any<DurationOption>())).thenAnswer { it.arguments[0] }

        val option =
            durationOptionService.createDurationOption(
                locationId = location.id,
                minutes = 90,
                label = "1,5 Stunden",
                isVariable = false,
                minMinutes = null,
                maxMinutes = null,
                stepMinutes = null,
                sortOrder = null,
            )

        assertEquals(90, option.minutes)
        assertEquals("1,5 Stunden", option.label)
        assertEquals(false, option.isVariable)
        assertEquals(3, option.sortOrder)
    }

    @Test
    fun `createDurationOption should create variable duration successfully`() {
        whenever(locationRepository.findById(location.id)).thenReturn(Optional.of(location))
        whenever(durationOptionRepository.findMaxSortOrderByLocationId(location.id)).thenReturn(3)
        whenever(durationOptionRepository.save(any<DurationOption>())).thenAnswer { it.arguments[0] }

        val option =
            durationOptionService.createDurationOption(
                locationId = location.id,
                minutes = 0,
                label = "Variable",
                isVariable = true,
                minMinutes = 30,
                maxMinutes = 240,
                stepMinutes = 30,
                sortOrder = null,
            )

        assertEquals(0, option.minutes)
        assertEquals(true, option.isVariable)
        assertEquals(30, option.minMinutes)
        assertEquals(240, option.maxMinutes)
        assertEquals(30, option.stepMinutes)
    }

    @Test
    fun `createDurationOption should throw exception when variable has no min`() {
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                durationOptionService.createDurationOption(
                    locationId = location.id,
                    minutes = 0,
                    label = "Variable",
                    isVariable = true,
                    minMinutes = null,
                    maxMinutes = 240,
                    stepMinutes = 30,
                    sortOrder = null,
                )
            }

        assert(exception.message!!.contains("Minimum, Maximum und Schrittweite"))
    }

    @Test
    fun `createDurationOption should throw exception when max less than min`() {
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                durationOptionService.createDurationOption(
                    locationId = location.id,
                    minutes = 0,
                    label = "Variable",
                    isVariable = true,
                    minMinutes = 120,
                    maxMinutes = 60,
                    stepMinutes = 30,
                    sortOrder = null,
                )
            }

        assertEquals("Maximum muss größer als Minimum sein", exception.message)
    }

    @Test
    fun `deleteDurationOption should throw exception when last active`() {
        val option = DurationOption(location = location, minutes = 60, label = "1 Stunde", active = true)
        whenever(durationOptionRepository.findById(option.id)).thenReturn(Optional.of(option))
        whenever(durationOptionRepository.countByLocationIdAndActiveTrue(location.id)).thenReturn(1)

        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                durationOptionService.deleteDurationOption(option.id)
            }

        assertEquals("Mindestens eine Dauer-Option muss aktiv bleiben", exception.message)
    }

    @Test
    fun `deleteDurationOption should delete when not last active`() {
        val option = DurationOption(location = location, minutes = 60, label = "1 Stunde", active = true)
        whenever(durationOptionRepository.findById(option.id)).thenReturn(Optional.of(option))
        whenever(durationOptionRepository.countByLocationIdAndActiveTrue(location.id)).thenReturn(3)

        durationOptionService.deleteDurationOption(option.id)

        verify(durationOptionRepository).delete(option)
    }

    @Test
    fun `updateDurationOption should throw exception when deactivating last option`() {
        val option = DurationOption(location = location, minutes = 60, label = "1 Stunde", active = true)
        whenever(durationOptionRepository.findById(option.id)).thenReturn(Optional.of(option))
        whenever(durationOptionRepository.countByLocationIdAndActiveTrue(location.id)).thenReturn(1)

        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                durationOptionService.updateDurationOption(
                    optionId = option.id,
                    minutes = 60,
                    label = "1 Stunde",
                    isVariable = false,
                    minMinutes = null,
                    maxMinutes = null,
                    stepMinutes = null,
                    sortOrder = 1,
                    active = false,
                )
            }

        assertEquals("Mindestens eine Dauer-Option muss aktiv bleiben", exception.message)
    }
}
