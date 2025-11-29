package com.studio.booking.service

import com.studio.booking.domain.Location
import com.studio.booking.repository.LocationRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional(readOnly = true)
class LocationService(
    private val locationRepository: LocationRepository,
) {
    fun getLocation(id: UUID): Location =
        locationRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Location nicht gefunden: $id") }
}
