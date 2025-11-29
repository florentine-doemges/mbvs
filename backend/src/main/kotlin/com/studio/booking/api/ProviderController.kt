package com.studio.booking.api

import com.studio.booking.service.ProviderService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api")
class ProviderController(
    private val providerService: ProviderService,
) {
    @GetMapping("/locations/{locationId}/providers")
    fun getProviders(
        @PathVariable locationId: UUID,
        @RequestParam(defaultValue = "false") includeInactive: Boolean,
    ): List<ProviderDetailDto> {
        return providerService.getProviders(locationId, includeInactive)
            .map { it.toDetailDto(providerService.getBookingCount(it.id)) }
    }

    @PostMapping("/locations/{locationId}/providers")
    @ResponseStatus(HttpStatus.CREATED)
    fun createProvider(
        @PathVariable locationId: UUID,
        @RequestBody request: CreateProviderRequest,
    ): ProviderDetailDto {
        val provider =
            providerService.createProvider(
                locationId = locationId,
                name = request.name,
                sortOrder = request.sortOrder,
                color = request.color,
            )
        return provider.toDetailDto(0)
    }

    @GetMapping("/providers/{providerId}")
    fun getProvider(
        @PathVariable providerId: UUID,
    ): ProviderDetailDto {
        val provider = providerService.getProvider(providerId)
        return provider.toDetailDto(providerService.getBookingCount(providerId))
    }

    @PutMapping("/providers/{providerId}")
    fun updateProvider(
        @PathVariable providerId: UUID,
        @RequestBody request: UpdateProviderRequest,
    ): ProviderDetailDto {
        val provider =
            providerService.updateProvider(
                providerId = providerId,
                name = request.name,
                active = request.active,
                sortOrder = request.sortOrder,
                color = request.color,
            )
        return provider.toDetailDto(providerService.getBookingCount(providerId))
    }

    @DeleteMapping("/providers/{providerId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteProvider(
        @PathVariable providerId: UUID,
    ) {
        providerService.deleteProvider(providerId)
    }
}
