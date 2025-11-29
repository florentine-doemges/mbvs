package com.studio.booking.api

import com.studio.booking.service.DurationOptionService
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
class DurationOptionController(
    private val durationOptionService: DurationOptionService,
) {
    @GetMapping("/locations/{locationId}/duration-options")
    fun getDurationOptions(
        @PathVariable locationId: UUID,
        @RequestParam(defaultValue = "false") includeInactive: Boolean,
    ): List<DurationOptionDto> {
        return durationOptionService.getDurationOptions(locationId, includeInactive)
            .map { it.toDto() }
    }

    @PostMapping("/locations/{locationId}/duration-options")
    @ResponseStatus(HttpStatus.CREATED)
    fun createDurationOption(
        @PathVariable locationId: UUID,
        @RequestBody request: CreateDurationOptionRequest,
    ): DurationOptionDto {
        val option =
            durationOptionService.createDurationOption(
                locationId = locationId,
                minutes = request.minutes,
                label = request.label,
                isVariable = request.isVariable,
                minMinutes = request.minMinutes,
                maxMinutes = request.maxMinutes,
                stepMinutes = request.stepMinutes,
                sortOrder = request.sortOrder,
            )
        return option.toDto()
    }

    @GetMapping("/duration-options/{optionId}")
    fun getDurationOption(
        @PathVariable optionId: UUID,
    ): DurationOptionDto {
        return durationOptionService.getDurationOption(optionId).toDto()
    }

    @PutMapping("/duration-options/{optionId}")
    fun updateDurationOption(
        @PathVariable optionId: UUID,
        @RequestBody request: UpdateDurationOptionRequest,
    ): DurationOptionDto {
        val option =
            durationOptionService.updateDurationOption(
                optionId = optionId,
                minutes = request.minutes,
                label = request.label,
                isVariable = request.isVariable,
                minMinutes = request.minMinutes,
                maxMinutes = request.maxMinutes,
                stepMinutes = request.stepMinutes,
                sortOrder = request.sortOrder,
                active = request.active,
            )
        return option.toDto()
    }

    @DeleteMapping("/duration-options/{optionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteDurationOption(
        @PathVariable optionId: UUID,
    ) {
        durationOptionService.deleteDurationOption(optionId)
    }
}
