package com.studio.booking.domain

import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import java.math.BigDecimal
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "billings")
class Billing(
    @Id
    val id: UUID = UUID.randomUUID(),
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_provider_id", nullable = false)
    val serviceProvider: ServiceProvider,
    @Column(name = "period_start", nullable = false, columnDefinition = "TIMESTAMPTZ")
    val periodStart: OffsetDateTime,
    @Column(name = "period_end", nullable = false, columnDefinition = "TIMESTAMPTZ")
    val periodEnd: OffsetDateTime,
    @Column(name = "total_amount", precision = 10, scale = 2, nullable = false)
    var totalAmount: BigDecimal,
    @Column(name = "invoice_document_url")
    var invoiceDocumentUrl: String? = null,
    @Column(name = "created_at", nullable = false, columnDefinition = "TIMESTAMPTZ")
    val createdAt: OffsetDateTime = OffsetDateTime.now(),
    @Column(name = "updated_at", nullable = false, columnDefinition = "TIMESTAMPTZ")
    var updatedAt: OffsetDateTime = OffsetDateTime.now(),
    @OneToMany(mappedBy = "billing", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    val items: MutableList<BillingItem> = mutableListOf(),
) {
    fun addItem(item: BillingItem) {
        items.add(item)
    }

    fun calculateTotalAmount(): BigDecimal {
        return items.sumOf { it.totalAmount }
    }

    fun updateTotalAmount() {
        totalAmount = calculateTotalAmount()
        updatedAt = OffsetDateTime.now()
    }
}
