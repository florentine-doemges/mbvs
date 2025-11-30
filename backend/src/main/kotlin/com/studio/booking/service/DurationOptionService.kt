package com.studio.booking.service

import com.studio.booking.domain.DurationOption
import com.studio.booking.repository.DurationOptionRepository
import com.studio.booking.repository.LocationRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional
open class DurationOptionService(
    private val durationOptionRepository: DurationOptionRepository,
    private val locationRepository: LocationRepository,
) {
    open fun getDurationOptions(
        locationId: UUID,
        includeInactive: Boolean = false,
    ): List<DurationOption> {
        return if (includeInactive) {
            durationOptionRepository.findByLocationIdOrderBySortOrderAsc(locationId)
        } else {
            durationOptionRepository.findByLocationIdAndActiveTrueOrderBySortOrderAsc(locationId)
        }
    }

    open fun getDurationOption(optionId: UUID): DurationOption {
        return durationOptionRepository.findById(optionId)
            .orElseThrow { IllegalArgumentException("Dauer-Option nicht gefunden") }
    }

    open fun createDurationOption(
        locationId: UUID,
        minutes: Int,
        label: String,
        isVariable: Boolean,
        minMinutes: Int?,
        maxMinutes: Int?,
        stepMinutes: Int?,
        sortOrder: Int?,
    ): DurationOption {
        validateLabel(label)

        if (isVariable) {
            validateVariableOption(minMinutes, maxMinutes, stepMinutes)
        } else {
            validateFixedDuration(minutes)
        }

        val location =
            locationRepository.findById(locationId)
                .orElseThrow { IllegalArgumentException("Standort nicht gefunden") }

        val effectiveSortOrder =
            sortOrder
                ?: ((durationOptionRepository.findMaxSortOrderByLocationId(locationId) ?: 0) + 1)

        val option =
            DurationOption(
                location = location,
                minutes = if (isVariable) 0 else minutes,
                label = label.trim(),
                isVariable = isVariable,
                minMinutes = if (isVariable) minMinutes else null,
                maxMinutes = if (isVariable) maxMinutes else null,
                stepMinutes = if (isVariable) stepMinutes else null,
                sortOrder = effectiveSortOrder,
            )

        return durationOptionRepository.save(option)
    }

    open fun updateDurationOption(
        optionId: UUID,
        minutes: Int,
        label: String,
        isVariable: Boolean,
        minMinutes: Int?,
        maxMinutes: Int?,
        stepMinutes: Int?,
        sortOrder: Int,
        active: Boolean,
    ): DurationOption {
        validateLabel(label)

        if (isVariable) {
            validateVariableOption(minMinutes, maxMinutes, stepMinutes)
        } else {
            validateFixedDuration(minutes)
        }

        val option =
            durationOptionRepository.findById(optionId)
                .orElseThrow { IllegalArgumentException("Dauer-Option nicht gefunden") }

        if (!active) {
            val activeCount = durationOptionRepository.countByLocationIdAndActiveTrue(option.location.id)
            if (activeCount <= 1) {
                throw IllegalArgumentException("Mindestens eine Dauer-Option muss aktiv bleiben")
            }
        }

        option.minutes = if (isVariable) 0 else minutes
        option.label = label.trim()
        option.isVariable = isVariable
        option.minMinutes = if (isVariable) minMinutes else null
        option.maxMinutes = if (isVariable) maxMinutes else null
        option.stepMinutes = if (isVariable) stepMinutes else null
        option.sortOrder = sortOrder
        option.active = active

        return durationOptionRepository.save(option)
    }

    open fun deleteDurationOption(optionId: UUID) {
        val option =
            durationOptionRepository.findById(optionId)
                .orElseThrow { IllegalArgumentException("Dauer-Option nicht gefunden") }

        val activeCount = durationOptionRepository.countByLocationIdAndActiveTrue(option.location.id)
        if (activeCount <= 1 && option.active) {
            throw IllegalArgumentException("Mindestens eine Dauer-Option muss aktiv bleiben")
        }

        durationOptionRepository.delete(option)
    }

    private fun validateLabel(label: String) {
        val trimmed = label.trim()
        if (trimmed.isEmpty()) {
            throw IllegalArgumentException("Bezeichnung darf nicht leer sein")
        }
        if (trimmed.length > 50) {
            throw IllegalArgumentException("Bezeichnung darf maximal 50 Zeichen lang sein")
        }
    }

    private fun validateFixedDuration(minutes: Int) {
        if (minutes <= 0) {
            throw IllegalArgumentException("Dauer muss größer als 0 sein")
        }
        if (minutes > 480) {
            throw IllegalArgumentException("Dauer darf maximal 480 Minuten (8 Stunden) sein")
        }
    }

    private fun validateVariableOption(
        minMinutes: Int?,
        maxMinutes: Int?,
        stepMinutes: Int?,
    ) {
        if (minMinutes == null || maxMinutes == null || stepMinutes == null) {
            throw IllegalArgumentException(
                "Für variable Dauern müssen Minimum, Maximum und Schrittweite angegeben werden",
            )
        }
        if (minMinutes <= 0) {
            throw IllegalArgumentException("Minimum muss größer als 0 sein")
        }
        if (maxMinutes <= minMinutes) {
            throw IllegalArgumentException("Maximum muss größer als Minimum sein")
        }
        if (stepMinutes <= 0) {
            throw IllegalArgumentException("Schrittweite muss größer als 0 sein")
        }
        if (maxMinutes > 480) {
            throw IllegalArgumentException("Maximum darf maximal 480 Minuten (8 Stunden) sein")
        }
    }
}
