package com.studio.booking.repository

import com.studio.booking.domain.BillingItem
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface BillingItemRepository : JpaRepository<BillingItem, UUID> {
    fun findByBillingId(billingId: UUID): List<BillingItem>

    fun findByBookingId(bookingId: UUID): List<BillingItem>

    fun existsByBookingId(bookingId: UUID): Boolean
}
