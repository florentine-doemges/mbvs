package com.studio.booking.api

import com.studio.booking.service.BookingService
import org.springframework.http.HttpStatus
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
@RequestMapping("/api/bookings")
class BookingController(
    private val bookingService: BookingService,
) {
    @PostMapping
    fun createBooking(
        @RequestBody request: CreateBookingRequest,
    ): ResponseEntity<BookingDto> {
        val upgradesWithQuantity = request.upgrades.mapKeys { UUID.fromString(it.key) }
        val booking =
            bookingService.createBooking(
                providerId = request.providerId,
                roomId = request.roomId,
                startTime = request.startTime,
                durationMinutes = request.durationMinutes,
                restingTimeMinutes = request.restingTimeMinutes,
                clientAlias = request.clientAlias,
                upgradesWithQuantity = upgradesWithQuantity,
            )
        return ResponseEntity.status(HttpStatus.CREATED).body(booking.toDto())
    }

    @GetMapping("/{id}")
    fun getBooking(
        @PathVariable id: UUID,
    ): BookingDto {
        return bookingService.getBooking(id).toDto()
    }

    @PutMapping("/{id}")
    fun updateBooking(
        @PathVariable id: UUID,
        @RequestBody request: UpdateBookingRequest,
    ): BookingDto {
        val upgradesWithQuantity = request.upgrades.mapKeys { UUID.fromString(it.key) }
        return bookingService.updateBooking(
            bookingId = id,
            providerId = request.providerId,
            roomId = request.roomId,
            startTime = request.startTime,
            durationMinutes = request.durationMinutes,
            restingTimeMinutes = request.restingTimeMinutes,
            clientAlias = request.clientAlias,
            upgradesWithQuantity = upgradesWithQuantity,
        ).toDto()
    }

    @DeleteMapping("/{id}")
    fun deleteBooking(
        @PathVariable id: UUID,
    ): ResponseEntity<Void> {
        bookingService.deleteBooking(id)
        return ResponseEntity.noContent().build()
    }
}
