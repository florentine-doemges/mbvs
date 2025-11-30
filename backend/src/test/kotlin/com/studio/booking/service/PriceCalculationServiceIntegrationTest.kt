package com.studio.booking.service

import com.studio.booking.domain.Location
import com.studio.booking.domain.PriceType
import com.studio.booking.domain.Room
import com.studio.booking.domain.RoomPrice
import com.studio.booking.domain.RoomPriceTier
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.OffsetDateTime

/**
 * Integration test for PriceCalculationService using direct tier calculations
 */
class PriceCalculationServiceIntegrationTest {
    private val location = Location(name = "Test Studio")
    private val room = Room(location = location, name = "Test Room", hourlyRate = BigDecimal("70.00"))
    private val roomPrice =
        RoomPrice(
            room = room,
            price = BigDecimal("70.00"),
            validFrom = OffsetDateTime.now(),
        )

    @Test
    @DisplayName("Calculate user example: 90 min = 30min@75€ + 60min@120€/h = 195€")
    fun testUserExample() {
        val tier1 =
            RoomPriceTier(
                roomPrice = roomPrice,
                fromMinutes = 0,
                toMinutes = 30,
                priceType = PriceType.FIXED,
                price = BigDecimal("75.00"),
            )
        val tier2 =
            RoomPriceTier(
                roomPrice = roomPrice,
                fromMinutes = 30,
                toMinutes = null,
                priceType = PriceType.HOURLY,
                price = BigDecimal("120.00"),
            )

        val tiers = listOf(tier1, tier2)
        val service = PriceCalculationService(MockTierRepository(tiers))

        // Test 90 minutes: 75€ + (60min × 120€/h) = 75€ + 120€ = 195€
        val result = service.calculateTieredPrice(tiers, 90)
        assertEquals(BigDecimal("195.00"), result, "90 minutes should cost 195€")

        // Test 30 minutes: 75€
        val result30 = service.calculateTieredPrice(tiers, 30)
        assertEquals(BigDecimal("75.00"), result30, "30 minutes should cost 75€")

        // Test 60 minutes: 75€ + (30min × 120€/h) = 75€ + 60€ = 135€
        val result60 = service.calculateTieredPrice(tiers, 60)
        assertEquals(BigDecimal("135.00"), result60, "60 minutes should cost 135€")

        // Test 120 minutes: 75€ + (90min × 120€/h) = 75€ + 180€ = 255€
        val result120 = service.calculateTieredPrice(tiers, 120)
        assertEquals(BigDecimal("255.00"), result120, "120 minutes should cost 255€")
    }

    @Test
    @DisplayName("Calculate fixed price blocks")
    fun testFixedPriceBlocks() {
        val tiers =
            listOf(
                RoomPriceTier(
                    roomPrice = roomPrice,
                    fromMinutes = 0,
                    toMinutes = 15,
                    priceType = PriceType.FIXED,
                    price = BigDecimal("20.00"),
                ),
                RoomPriceTier(
                    roomPrice = roomPrice,
                    fromMinutes = 15,
                    toMinutes = 30,
                    priceType = PriceType.FIXED,
                    price = BigDecimal("35.00"),
                ),
                RoomPriceTier(
                    roomPrice = roomPrice,
                    fromMinutes = 30,
                    toMinutes = 60,
                    priceType = PriceType.FIXED,
                    price = BigDecimal("60.00"),
                ),
                RoomPriceTier(
                    roomPrice = roomPrice,
                    fromMinutes = 60,
                    toMinutes = null,
                    priceType = PriceType.HOURLY,
                    price = BigDecimal("70.00"),
                ),
            )

        val service = PriceCalculationService(MockTierRepository(tiers))

        // 10 minutes: 20€
        assertEquals(BigDecimal("20.00"), service.calculateTieredPrice(tiers, 10))

        // 20 minutes: 20€ + 35€ = 55€
        assertEquals(BigDecimal("55.00"), service.calculateTieredPrice(tiers, 20))

        // 45 minutes: 20€ + 35€ + 60€ = 115€
        assertEquals(BigDecimal("115.00"), service.calculateTieredPrice(tiers, 45))

        // 120 minutes: 20€ + 35€ + 60€ + (60min × 70€/h) = 185€
        assertEquals(BigDecimal("185.00"), service.calculateTieredPrice(tiers, 120))
    }

    @Test
    @DisplayName("Calculate hourly rate tiers")
    fun testHourlyRateTiers() {
        val tiers =
            listOf(
                RoomPriceTier(
                    roomPrice = roomPrice,
                    fromMinutes = 0,
                    toMinutes = 180,
                    priceType = PriceType.HOURLY,
                    price = BigDecimal("70.00"),
                ),
                RoomPriceTier(
                    roomPrice = roomPrice,
                    fromMinutes = 180,
                    toMinutes = null,
                    priceType = PriceType.HOURLY,
                    price = BigDecimal("60.00"),
                ),
            )

        val service = PriceCalculationService(MockTierRepository(tiers))

        // 120 minutes (2h): 140€
        assertEquals(BigDecimal("140.00"), service.calculateTieredPrice(tiers, 120))

        // 180 minutes (3h): 210€
        assertEquals(BigDecimal("210.00"), service.calculateTieredPrice(tiers, 180))

        // 300 minutes (5h): 210€ + 120€ = 330€
        assertEquals(BigDecimal("330.00"), service.calculateTieredPrice(tiers, 300))
    }

    // Mock repository
    private class MockTierRepository(
        private val tiers: List<RoomPriceTier>,
    ) : com.studio.booking.repository.RoomPriceTierRepository {
        override fun findByRoomPriceIdOrderBySortOrder(roomPriceId: java.util.UUID) = tiers

        override fun findByRoomPriceIdOrderByFromMinutes(roomPriceId: java.util.UUID) =
            tiers.sortedBy { it.fromMinutes }

        override fun deleteByRoomPriceId(roomPriceId: java.util.UUID) = Unit

        override fun existsByRoomPriceId(roomPriceId: java.util.UUID) = tiers.isNotEmpty()

        // Unused methods
        override fun <S : RoomPriceTier> save(entity: S) = entity

        override fun <S : RoomPriceTier> saveAll(entities: MutableIterable<S>) = entities.toList()

        override fun findById(id: java.util.UUID) = java.util.Optional.empty<RoomPriceTier>()

        override fun existsById(id: java.util.UUID) = false

        override fun findAll() = tiers

        override fun findAll(sort: org.springframework.data.domain.Sort) = tiers

        override fun findAll(pageable: org.springframework.data.domain.Pageable) =
            org.springframework.data.domain.PageImpl(tiers)

        override fun findAllById(ids: MutableIterable<java.util.UUID>) = emptyList<RoomPriceTier>()

        override fun count() = tiers.size.toLong()

        override fun deleteById(id: java.util.UUID) = Unit

        override fun delete(entity: RoomPriceTier) = Unit

        override fun deleteAllById(ids: MutableIterable<java.util.UUID>) = Unit

        override fun deleteAll(entities: MutableIterable<RoomPriceTier>) = Unit

        override fun deleteAll() = Unit

        override fun flush() = Unit

        override fun <S : RoomPriceTier> saveAndFlush(entity: S) = entity

        override fun <S : RoomPriceTier> saveAllAndFlush(entities: MutableIterable<S>) = entities.toList()

        override fun deleteAllInBatch(entities: MutableIterable<RoomPriceTier>) = Unit

        override fun deleteAllByIdInBatch(ids: MutableIterable<java.util.UUID>) = Unit

        override fun deleteAllInBatch() = Unit

        override fun getOne(id: java.util.UUID) = throw UnsupportedOperationException()

        override fun getById(id: java.util.UUID) = throw UnsupportedOperationException()

        override fun getReferenceById(id: java.util.UUID) = throw UnsupportedOperationException()

        override fun <S : RoomPriceTier> findAll(example: org.springframework.data.domain.Example<S>) = emptyList<S>()

        override fun <S : RoomPriceTier> findAll(
            example: org.springframework.data.domain.Example<S>,
            sort: org.springframework.data.domain.Sort,
        ) = emptyList<S>()

        override fun <S : RoomPriceTier> findAll(
            example: org.springframework.data.domain.Example<S>,
            pageable: org.springframework.data.domain.Pageable,
        ) = org.springframework.data.domain.PageImpl(emptyList<S>())

        override fun <S : RoomPriceTier> count(example: org.springframework.data.domain.Example<S>) = 0L

        override fun <S : RoomPriceTier> exists(example: org.springframework.data.domain.Example<S>) = false

        override fun <S : RoomPriceTier> findOne(example: org.springframework.data.domain.Example<S>) =
            java.util.Optional.empty<S>()

        override fun <S : RoomPriceTier, R : Any> findBy(
            example: org.springframework.data.domain.Example<S>,
            queryFunction: java.util.function.Function<
                org.springframework.data.repository.query.FluentQuery.FetchableFluentQuery<S>,
                R,
                >,
        ): R = throw UnsupportedOperationException()
    }
}
