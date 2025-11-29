package com.studio.booking.repository

import com.studio.booking.domain.Upgrade
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface UpgradeRepository : JpaRepository<Upgrade, UUID> {
    fun findByActiveTrue(): List<Upgrade>

    fun findAllByOrderByNameAsc(): List<Upgrade>
}
