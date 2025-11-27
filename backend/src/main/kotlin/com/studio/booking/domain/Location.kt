package com.studio.booking.domain

import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "locations")
class Location(
    @Id
    val id: UUID = UUID.randomUUID(),
    val name: String,
    val createdAt: LocalDateTime = LocalDateTime.now()
)
