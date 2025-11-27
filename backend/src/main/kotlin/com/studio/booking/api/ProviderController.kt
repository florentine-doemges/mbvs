package com.studio.booking.api

import com.studio.booking.repository.ServiceProviderRepository
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/locations/{locationId}/providers")
class ProviderController(
    private val providerRepository: ServiceProviderRepository
) {
    @GetMapping
    fun getProviders(@PathVariable locationId: UUID): List<ServiceProviderDto> {
        return providerRepository.findByActiveTrue()
            .map { it.toDto() }
    }
}
