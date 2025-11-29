package com.studio.booking.service

import com.studio.booking.domain.Location
import com.studio.booking.repository.LocationRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.whenever
import java.util.Optional
import java.util.UUID

@ExtendWith(MockitoExtension::class)
class LocationServiceTest {
    @Mock
    private lateinit var locationRepository: LocationRepository

    private lateinit var locationService: LocationService

    private val location = Location(name = "Test Studio")

    @BeforeEach
    fun setUp() {
        locationService = LocationService(locationRepository)
    }

    @Test
    fun `getLocation should return location when found`() {
        whenever(locationRepository.findById(location.id)).thenReturn(Optional.of(location))

        val result = locationService.getLocation(location.id)

        assertEquals(location, result)
    }

    @Test
    fun `getLocation should throw exception when not found`() {
        val locationId = UUID.randomUUID()
        whenever(locationRepository.findById(locationId)).thenReturn(Optional.empty())

        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                locationService.getLocation(locationId)
            }

        assertEquals("Location nicht gefunden: $locationId", exception.message)
    }
}
