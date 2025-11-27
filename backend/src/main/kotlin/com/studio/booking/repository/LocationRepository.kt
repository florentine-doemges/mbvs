package com.studio.booking.repository

import com.studio.booking.domain.Location
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface LocationRepository : JpaRepository<Location, UUID>
