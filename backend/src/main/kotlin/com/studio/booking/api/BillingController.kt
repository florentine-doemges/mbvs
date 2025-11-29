package com.studio.booking.api

import com.studio.booking.service.BillingService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/billings")
class BillingController(
    private val billingService: BillingService,
) {
    /**
     * POST /api/billings
     * Create billings from selected bookings.
     * Automatically groups by service provider and creates one billing per provider.
     */
    @PostMapping
    fun createBillings(
        @RequestBody request: CreateBillingRequest,
    ): ResponseEntity<List<BillingDto>> {
        val billings =
            billingService.createBillings(
                bookingIds = request.bookingIds,
                periodStart = request.periodStart,
                periodEnd = request.periodEnd,
            )

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(billings.map { it.toDto() })
    }

    /**
     * GET /api/billings
     * Get all billings, optionally filtered by service provider
     */
    @GetMapping
    fun getAllBillings(
        @RequestParam(required = false) serviceProviderId: UUID?,
    ): ResponseEntity<List<BillingDto>> {
        val billings =
            if (serviceProviderId != null) {
                billingService.getBillingsByServiceProvider(serviceProviderId)
            } else {
                billingService.getAllBillings()
            }

        return ResponseEntity.ok(billings.map { it.toDto() })
    }

    /**
     * GET /api/billings/{id}
     * Get detailed billing with all items
     */
    @GetMapping("/{id}")
    fun getBillingById(
        @PathVariable id: UUID,
    ): ResponseEntity<BillingDetailDto> {
        val billing = billingService.getBillingById(id)
        return ResponseEntity.ok(billing.toDetailDto())
    }

    /**
     * GET /api/billings/{id}/items
     * Get billing items for a specific billing
     */
    @GetMapping("/{id}/items")
    fun getBillingItems(
        @PathVariable id: UUID,
    ): ResponseEntity<List<BillingItemDto>> {
        val items = billingService.getBillingItems(id)
        return ResponseEntity.ok(items.map { it.toDto() })
    }
}
