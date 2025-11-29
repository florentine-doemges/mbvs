package com.studio.booking.service

import com.studio.booking.domain.Location
import com.studio.booking.domain.ServiceProvider
import com.studio.booking.repository.BookingRepository
import com.studio.booking.repository.LocationRepository
import com.studio.booking.repository.ServiceProviderRepository
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
class ProviderServiceTest {
    @Mock
    private lateinit var providerRepository: ServiceProviderRepository

    @Mock
    private lateinit var locationRepository: LocationRepository

    @Mock
    private lateinit var bookingRepository: BookingRepository

    private lateinit var providerService: ProviderService

    private val location = Location(name = "Test Studio")

    @BeforeEach
    fun setUp() {
        providerService = ProviderService(providerRepository, locationRepository, bookingRepository)
    }

    @Test
    fun `createProvider should create provider successfully`() {
        whenever(locationRepository.findById(location.id)).thenReturn(Optional.of(location))
        whenever(providerRepository.existsByLocationIdAndNameIgnoreCase(location.id, "Lady Test")).thenReturn(false)
        whenever(providerRepository.findMaxSortOrderByLocationId(location.id)).thenReturn(3)
        whenever(providerRepository.save(any<ServiceProvider>())).thenAnswer { it.arguments[0] }

        val provider =
            providerService.createProvider(
                locationId = location.id,
                name = "Lady Test",
                sortOrder = null,
                color = "#EC4899",
            )

        assertEquals("Lady Test", provider.name)
        assertEquals(4, provider.sortOrder)
        assertEquals("#EC4899", provider.color)
    }

    @Test
    fun `createProvider should throw exception when name is duplicate`() {
        whenever(locationRepository.findById(location.id)).thenReturn(Optional.of(location))
        whenever(providerRepository.existsByLocationIdAndNameIgnoreCase(location.id, "Existing")).thenReturn(true)

        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                providerService.createProvider(
                    locationId = location.id,
                    name = "Existing",
                    sortOrder = null,
                    color = null,
                )
            }

        assertEquals("Ein Provider mit diesem Namen existiert bereits", exception.message)
    }

    @Test
    fun `createProvider should throw exception when name is empty`() {
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                providerService.createProvider(
                    locationId = location.id,
                    name = "  ",
                    sortOrder = null,
                    color = null,
                )
            }

        assertEquals("Name darf nicht leer sein", exception.message)
    }

    @Test
    fun `updateProvider should update provider successfully`() {
        val provider =
            ServiceProvider(
                location = location,
                name = "Lady Lexi",
                active = true,
                sortOrder = 1,
                color = "#EC4899",
            )
        whenever(providerRepository.findById(provider.id)).thenReturn(Optional.of(provider))
        whenever(
            providerRepository.existsByLocationIdAndNameIgnoreCaseAndIdNot(
                location.id,
                "Lady Lexi Updated",
                provider.id,
            ),
        ).thenReturn(false)
        whenever(providerRepository.save(any<ServiceProvider>())).thenAnswer { it.arguments[0] }

        val updated =
            providerService.updateProvider(
                providerId = provider.id,
                name = "Lady Lexi Updated",
                active = true,
                sortOrder = 2,
                color = "#F97316",
            )

        assertEquals("Lady Lexi Updated", updated.name)
        assertEquals(2, updated.sortOrder)
        assertEquals("#F97316", updated.color)
    }

    @Test
    fun `deleteProvider should soft delete when has past bookings`() {
        val provider = ServiceProvider(location = location, name = "Lady Lexi")
        whenever(providerRepository.findById(provider.id)).thenReturn(Optional.of(provider))
        whenever(bookingRepository.countFutureBookingsByProviderId(any(), any())).thenReturn(0)
        whenever(bookingRepository.countByProviderId(provider.id)).thenReturn(10)
        whenever(providerRepository.save(any<ServiceProvider>())).thenAnswer { it.arguments[0] }

        providerService.deleteProvider(provider.id)

        assertEquals(false, provider.active)
    }

    @Test
    fun `deleteProvider should hard delete when no bookings`() {
        val provider = ServiceProvider(location = location, name = "Lady Lexi")
        whenever(providerRepository.findById(provider.id)).thenReturn(Optional.of(provider))
        whenever(bookingRepository.countFutureBookingsByProviderId(any(), any())).thenReturn(0)
        whenever(bookingRepository.countByProviderId(provider.id)).thenReturn(0)

        providerService.deleteProvider(provider.id)

        verify(providerRepository).delete(provider)
    }

    @Test
    fun `deleteProvider should throw exception when has future bookings`() {
        val provider = ServiceProvider(location = location, name = "Lady Lexi")
        whenever(providerRepository.findById(provider.id)).thenReturn(Optional.of(provider))
        whenever(bookingRepository.countFutureBookingsByProviderId(any(), any())).thenReturn(5)

        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                providerService.deleteProvider(provider.id)
            }

        assert(exception.message!!.contains("5 zukünftige Buchungen"))
    }
}
