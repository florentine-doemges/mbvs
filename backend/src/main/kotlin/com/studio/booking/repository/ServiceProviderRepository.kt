package com.studio.booking.repository

import com.studio.booking.domain.ServiceProvider
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface ServiceProviderRepository : JpaRepository<ServiceProvider, UUID> {
    fun findByActiveTrue(): List<ServiceProvider>
}
