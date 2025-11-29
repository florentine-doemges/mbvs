package com.studio.booking.api

import com.studio.booking.service.UpgradeService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api")
class UpgradeController(
    private val upgradeService: UpgradeService,
) {
    @GetMapping("/upgrades")
    fun getAllUpgrades(
        @RequestParam(defaultValue = "false") includeInactive: Boolean,
    ): List<UpgradeDto> = upgradeService.getAllUpgrades(includeInactive).map { it.toDto() }

    @GetMapping("/upgrades/{id}")
    fun getUpgrade(
        @PathVariable id: UUID,
    ): UpgradeDto = upgradeService.getUpgrade(id).toDto()

    @PostMapping("/upgrades")
    fun createUpgrade(
        @RequestBody request: CreateUpgradeRequest,
    ): ResponseEntity<UpgradeDto> {
        val upgrade = upgradeService.createUpgrade(request.name, request.price)
        return ResponseEntity.status(HttpStatus.CREATED).body(upgrade.toDto())
    }

    @PutMapping("/upgrades/{id}")
    fun updateUpgrade(
        @PathVariable id: UUID,
        @RequestBody request: UpdateUpgradeRequest,
    ): UpgradeDto =
        upgradeService.updateUpgrade(
            id,
            request.name,
            request.price,
            request.active,
        ).toDto()

    @DeleteMapping("/upgrades/{id}")
    fun deleteUpgrade(
        @PathVariable id: UUID,
    ): ResponseEntity<Void> {
        upgradeService.deleteUpgrade(id)
        return ResponseEntity.noContent().build()
    }
}
