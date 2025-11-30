package com.studio.booking.api

import com.studio.booking.domain.PriceType
import com.studio.booking.service.PriceTierService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api")
class PriceTierController(
    private val priceTierService: PriceTierService,
) {
    /**
     * GET /api/prices/{priceId}/tiers
     * Get all price tiers for a room price
     */
    @GetMapping("/prices/{priceId}/tiers")
    fun getRoomPriceTiers(
        @PathVariable priceId: UUID,
    ): ResponseEntity<List<RoomPriceTierDto>> {
        val tiers = priceTierService.getRoomPriceTiers(priceId)
        return ResponseEntity.ok(tiers.map { it.toDto() })
    }

    /**
     * POST /api/prices/{priceId}/tiers
     * Create a new price tier
     */
    @PostMapping("/prices/{priceId}/tiers")
    fun createPriceTier(
        @PathVariable priceId: UUID,
        @RequestBody request: CreatePriceTierRequest,
    ): ResponseEntity<RoomPriceTierDto> {
        val priceType =
            try {
                PriceType.valueOf(request.priceType.uppercase())
            } catch (e: IllegalArgumentException) {
                throw IllegalArgumentException("Invalid price type: ${request.priceType}. Must be FIXED or HOURLY", e)
            }

        val tier =
            priceTierService.createPriceTier(
                roomPriceId = priceId,
                fromMinutes = request.fromMinutes,
                toMinutes = request.toMinutes,
                priceType = priceType,
                price = request.price,
                sortOrder = request.sortOrder,
            )

        return ResponseEntity.ok(tier.toDto())
    }

    /**
     * PUT /api/tiers/{tierId}
     * Update an existing price tier
     */
    @PutMapping("/tiers/{tierId}")
    fun updatePriceTier(
        @PathVariable tierId: UUID,
        @RequestBody request: UpdatePriceTierRequest,
    ): ResponseEntity<RoomPriceTierDto> {
        val priceType =
            try {
                PriceType.valueOf(request.priceType.uppercase())
            } catch (e: IllegalArgumentException) {
                throw IllegalArgumentException("Invalid price type: ${request.priceType}. Must be FIXED or HOURLY", e)
            }

        val tier =
            priceTierService.updatePriceTier(
                tierId = tierId,
                fromMinutes = request.fromMinutes,
                toMinutes = request.toMinutes,
                priceType = priceType,
                price = request.price,
                sortOrder = request.sortOrder,
            )

        return ResponseEntity.ok(tier.toDto())
    }

    /**
     * DELETE /api/tiers/{tierId}
     * Delete a price tier
     */
    @DeleteMapping("/tiers/{tierId}")
    fun deletePriceTier(
        @PathVariable tierId: UUID,
    ): ResponseEntity<Void> {
        priceTierService.deletePriceTier(tierId)
        return ResponseEntity.noContent().build()
    }
}
