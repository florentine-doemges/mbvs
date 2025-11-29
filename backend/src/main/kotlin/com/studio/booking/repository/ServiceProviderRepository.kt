package com.studio.booking.repository

import com.studio.booking.domain.ServiceProvider
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.util.UUID

interface ServiceProviderRepository : JpaRepository<ServiceProvider, UUID> {
    fun findByActiveTrue(): List<ServiceProvider>

    fun findByLocationIdOrderBySortOrderAsc(locationId: UUID): List<ServiceProvider>

    fun findByLocationIdAndActiveTrueOrderBySortOrderAsc(locationId: UUID): List<ServiceProvider>

    fun existsByLocationIdAndNameIgnoreCase(
        locationId: UUID,
        name: String,
    ): Boolean

    fun existsByLocationIdAndNameIgnoreCaseAndIdNot(
        locationId: UUID,
        name: String,
        id: UUID,
    ): Boolean

    @Query("SELECT MAX(p.sortOrder) FROM ServiceProvider p WHERE p.location.id = :locationId")
    fun findMaxSortOrderByLocationId(locationId: UUID): Int?
}
