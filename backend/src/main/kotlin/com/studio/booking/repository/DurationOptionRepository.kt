package com.studio.booking.repository

import com.studio.booking.domain.DurationOption
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.util.UUID

interface DurationOptionRepository : JpaRepository<DurationOption, UUID> {
    fun findByLocationIdOrderBySortOrderAsc(locationId: UUID): List<DurationOption>

    fun findByLocationIdAndActiveTrueOrderBySortOrderAsc(locationId: UUID): List<DurationOption>

    fun countByLocationIdAndActiveTrue(locationId: UUID): Long

    @Query("SELECT MAX(d.sortOrder) FROM DurationOption d WHERE d.location.id = :locationId")
    fun findMaxSortOrderByLocationId(locationId: UUID): Int?
}
