package com.studio.booking.api

import com.studio.booking.service.BookingQueryService
import com.studio.booking.service.BookingStatus
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate
import java.util.UUID

@RestController
@RequestMapping("/api/locations")
class BookingListController(
    private val bookingQueryService: BookingQueryService,
) {
    @GetMapping("/{locationId}/bookings")
    fun getBookings(
        @PathVariable locationId: UUID,
        @RequestParam(required = false) startDate: String?,
        @RequestParam(required = false) endDate: String?,
        @RequestParam(required = false) providerId: UUID?,
        @RequestParam(required = false) roomId: UUID?,
        @RequestParam(required = false) clientSearch: String?,
        @RequestParam(required = false) status: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "50") size: Int,
    ): BookingListResponse {
        val parsedStartDate = startDate?.let { LocalDate.parse(it) }
        val parsedEndDate = endDate?.let { LocalDate.parse(it) }
        val parsedStatus = status?.let { BookingStatus.valueOf(it.uppercase()) }

        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startTime"))

        val bookingsPage =
            bookingQueryService.findBookingsWithFilters(
                locationId = locationId,
                startDate = parsedStartDate,
                endDate = parsedEndDate,
                providerId = providerId,
                roomId = roomId,
                clientSearch = clientSearch,
                status = parsedStatus,
                pageable = pageable,
            )

        return BookingListResponse(
            content = bookingsPage.content.map { it.toDto() },
            page =
                PageInfo(
                    number = bookingsPage.number,
                    size = bookingsPage.size,
                    totalElements = bookingsPage.totalElements,
                    totalPages = bookingsPage.totalPages,
                ),
        )
    }
}
