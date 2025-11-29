package com.studio.booking.api

import com.studio.booking.service.PriceService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.OffsetDateTime
import java.util.UUID

@RestController
@RequestMapping("/api")
class PriceController(
    private val priceService: PriceService,
) {
    /**
     * GET /api/rooms/{id}/prices
     * Get price history for a room
     */
    @GetMapping("/rooms/{id}/prices")
    fun getRoomPriceHistory(
        @PathVariable id: UUID,
    ): ResponseEntity<List<RoomPriceDto>> {
        val prices = priceService.getRoomPriceHistory(id)
        return ResponseEntity.ok(prices.map { it.toDto() })
    }

    /**
     * GET /api/rooms/{id}/prices/current
     * Get current price for a room
     */
    @GetMapping("/rooms/{id}/prices/current")
    fun getCurrentRoomPrice(
        @PathVariable id: UUID,
    ): ResponseEntity<RoomPriceDto> {
        val price =
            priceService.getCurrentRoomPrice(id)
                ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(price.toDto())
    }

    /**
     * GET /api/rooms/{id}/prices/at
     * Get price for a room at a specific point in time
     */
    @GetMapping("/rooms/{id}/prices/at")
    fun getRoomPriceAt(
        @PathVariable id: UUID,
        @RequestParam timestamp: OffsetDateTime,
    ): ResponseEntity<RoomPriceDto> {
        val price =
            priceService.getRoomPriceAt(id, timestamp)
                ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(price.toDto())
    }

    /**
     * POST /api/rooms/{id}/prices
     * Update room price (creates new price and closes current one)
     */
    @PostMapping("/rooms/{id}/prices")
    fun updateRoomPrice(
        @PathVariable id: UUID,
        @RequestBody request: UpdatePriceRequest,
    ): ResponseEntity<RoomPriceDto> {
        val newPrice =
            priceService.updateRoomPrice(
                roomId = id,
                newPrice = request.price,
                validFrom = request.validFrom,
            )
        return ResponseEntity.ok(newPrice.toDto())
    }

    /**
     * GET /api/upgrades/{id}/prices
     * Get price history for an upgrade
     */
    @GetMapping("/upgrades/{id}/prices")
    fun getUpgradePriceHistory(
        @PathVariable id: UUID,
    ): ResponseEntity<List<UpgradePriceDto>> {
        val prices = priceService.getUpgradePriceHistory(id)
        return ResponseEntity.ok(prices.map { it.toDto() })
    }

    /**
     * GET /api/upgrades/{id}/prices/current
     * Get current price for an upgrade
     */
    @GetMapping("/upgrades/{id}/prices/current")
    fun getCurrentUpgradePrice(
        @PathVariable id: UUID,
    ): ResponseEntity<UpgradePriceDto> {
        val price =
            priceService.getCurrentUpgradePrice(id)
                ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(price.toDto())
    }

    /**
     * GET /api/upgrades/{id}/prices/at
     * Get price for an upgrade at a specific point in time
     */
    @GetMapping("/upgrades/{id}/prices/at")
    fun getUpgradePriceAt(
        @PathVariable id: UUID,
        @RequestParam timestamp: OffsetDateTime,
    ): ResponseEntity<UpgradePriceDto> {
        val price =
            priceService.getUpgradePriceAt(id, timestamp)
                ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(price.toDto())
    }

    /**
     * POST /api/upgrades/{id}/prices
     * Update upgrade price (creates new price and closes current one)
     */
    @PostMapping("/upgrades/{id}/prices")
    fun updateUpgradePrice(
        @PathVariable id: UUID,
        @RequestBody request: UpdatePriceRequest,
    ): ResponseEntity<UpgradePriceDto> {
        val newPrice =
            priceService.updateUpgradePrice(
                upgradeId = id,
                newPrice = request.price,
                validFrom = request.validFrom,
            )
        return ResponseEntity.ok(newPrice.toDto())
    }
}
