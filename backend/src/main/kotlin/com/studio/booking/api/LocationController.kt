package com.studio.booking.api

import com.studio.booking.service.LocationService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/locations")
class LocationController(
    private val locationService: LocationService,
) {
    @GetMapping("/{id}")
    fun getLocation(
        @PathVariable id: UUID,
    ): LocationDto = locationService.getLocation(id).toDto()
}
