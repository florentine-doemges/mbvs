package com.studio.booking.service

import com.studio.booking.domain.ServiceProvider
import com.studio.booking.repository.BookingRepository
import com.studio.booking.repository.LocationRepository
import com.studio.booking.repository.ServiceProviderRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.UUID

@Service
@Transactional
open class ProviderService(
    private val providerRepository: ServiceProviderRepository,
    private val locationRepository: LocationRepository,
    private val bookingRepository: BookingRepository,
) {
    open fun getProviders(
        locationId: UUID,
        includeInactive: Boolean = false,
    ): List<ServiceProvider> {
        return if (includeInactive) {
            providerRepository.findByLocationIdOrderBySortOrderAsc(locationId)
        } else {
            providerRepository.findByLocationIdAndActiveTrueOrderBySortOrderAsc(locationId)
        }
    }

    open fun getProvider(providerId: UUID): ServiceProvider {
        return providerRepository.findById(providerId)
            .orElseThrow { IllegalArgumentException("Provider nicht gefunden") }
    }

    open fun createProvider(
        locationId: UUID,
        name: String,
        sortOrder: Int?,
        color: String?,
    ): ServiceProvider {
        validateName(name)
        color?.let { validateColor(it) }

        val location =
            locationRepository.findById(locationId)
                .orElseThrow { IllegalArgumentException("Standort nicht gefunden") }

        if (providerRepository.existsByLocationIdAndNameIgnoreCase(locationId, name)) {
            throw IllegalArgumentException("Ein Provider mit diesem Namen existiert bereits")
        }

        val effectiveSortOrder =
            sortOrder
                ?: ((providerRepository.findMaxSortOrderByLocationId(locationId) ?: 0) + 1)

        val provider =
            ServiceProvider(
                location = location,
                name = name.trim(),
                sortOrder = effectiveSortOrder,
                color = color ?: "#10B981",
            )

        return providerRepository.save(provider)
    }

    open fun updateProvider(
        providerId: UUID,
        name: String,
        active: Boolean,
        sortOrder: Int,
        color: String,
    ): ServiceProvider {
        validateName(name)
        validateColor(color)

        val provider =
            providerRepository.findById(providerId)
                .orElseThrow { IllegalArgumentException("Provider nicht gefunden") }

        if (providerRepository.existsByLocationIdAndNameIgnoreCaseAndIdNot(
                provider.location.id,
                name,
                providerId,
            )
        ) {
            throw IllegalArgumentException("Ein Provider mit diesem Namen existiert bereits")
        }

        provider.name = name.trim()
        provider.active = active
        provider.sortOrder = sortOrder
        provider.color = color
        provider.updatedAt = LocalDateTime.now()

        return providerRepository.save(provider)
    }

    open fun deleteProvider(providerId: UUID) {
        val provider =
            providerRepository.findById(providerId)
                .orElseThrow { IllegalArgumentException("Provider nicht gefunden") }

        val futureBookings = bookingRepository.countFutureBookingsByProviderId(providerId, LocalDateTime.now())
        if (futureBookings > 0) {
            throw IllegalArgumentException(
                "Provider kann nicht gelöscht werden, da noch $futureBookings zukünftige Buchungen existieren. " +
                    "Bitte deaktivieren Sie den Provider stattdessen.",
            )
        }

        val totalBookings = bookingRepository.countByProviderId(providerId)
        if (totalBookings > 0) {
            provider.active = false
            provider.updatedAt = LocalDateTime.now()
            providerRepository.save(provider)
        } else {
            providerRepository.delete(provider)
        }
    }

    open fun getBookingCount(providerId: UUID): Long {
        return bookingRepository.countByProviderId(providerId)
    }

    private fun validateName(name: String) {
        val trimmed = name.trim()
        if (trimmed.isEmpty()) {
            throw IllegalArgumentException("Name darf nicht leer sein")
        }
        if (trimmed.length > 100) {
            throw IllegalArgumentException("Name darf maximal 100 Zeichen lang sein")
        }
    }

    private fun validateColor(color: String) {
        if (!color.matches(Regex("^#[0-9A-Fa-f]{6}$"))) {
            throw IllegalArgumentException("Farbe muss im Format #RRGGBB sein")
        }
    }
}
