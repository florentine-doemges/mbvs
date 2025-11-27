package com.studio.booking.domain

import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.util.UUID

@Entity
@Table(name = "service_providers")
class ServiceProvider(
    @Id
    val id: UUID = UUID.randomUUID(),
    val name: String,
    val active: Boolean = true
)
