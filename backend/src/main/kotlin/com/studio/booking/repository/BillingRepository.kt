package com.studio.booking.repository

import com.studio.booking.domain.Billing
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.OffsetDateTime
import java.util.UUID

interface BillingRepository : JpaRepository<Billing, UUID> {
    fun findByServiceProviderIdOrderByCreatedAtDesc(serviceProviderId: UUID): List<Billing>

    @Query(
        """
        SELECT b FROM Billing b
        WHERE b.serviceProvider.id = :serviceProviderId
        AND b.periodStart >= :periodStart
        AND b.periodEnd <= :periodEnd
        ORDER BY b.createdAt DESC
    """,
    )
    fun findByServiceProviderAndPeriod(
        @Param("serviceProviderId") serviceProviderId: UUID,
        @Param("periodStart") periodStart: OffsetDateTime,
        @Param("periodEnd") periodEnd: OffsetDateTime,
    ): List<Billing>

    fun findAllByOrderByCreatedAtDesc(): List<Billing>
}
