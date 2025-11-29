package com.studio.booking.api

import com.studio.booking.service.CalendarService
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate
import java.util.UUID

@RestController
@RequestMapping("/api/locations/{locationId}/calendar")
class CalendarController(
    private val calendarService: CalendarService,
) {
    @GetMapping
    fun getCalendar(
        @PathVariable locationId: UUID,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate,
    ): CalendarDayDto {
        return calendarService.getCalendarForDate(locationId, date).toDto()
    }
}
