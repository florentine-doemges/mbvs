package com.studio.booking.service

import com.studio.booking.domain.Billing
import com.studio.booking.domain.BillingItem
import com.studio.booking.domain.Booking
import com.studio.booking.domain.BookingUpgrade
import com.studio.booking.domain.Location
import com.studio.booking.domain.Room
import com.studio.booking.domain.RoomPrice
import com.studio.booking.domain.ServiceProvider
import com.studio.booking.domain.Upgrade
import com.studio.booking.domain.UpgradePrice
import com.studio.booking.repository.BillingItemRepository
import com.studio.booking.repository.BillingRepository
import com.studio.booking.repository.BookingRepository
import com.studio.booking.repository.RoomPriceRepository
import com.studio.booking.repository.ServiceProviderRepository
import com.studio.booking.repository.UpgradePriceRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.argThat
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.math.BigDecimal
import java.time.LocalDateTime
import java.time.OffsetDateTime
import java.time.ZoneId
import java.util.Optional
import java.util.UUID

@ExtendWith(MockitoExtension::class)
class BillingServiceTest {
    @Mock
    private lateinit var billingRepository: BillingRepository

    @Mock
    private lateinit var billingItemRepository: BillingItemRepository

    @Mock
    private lateinit var bookingRepository: BookingRepository

    @Mock
    private lateinit var roomPriceRepository: RoomPriceRepository

    @Mock
    private lateinit var upgradePriceRepository: UpgradePriceRepository

    @Mock
    private lateinit var priceCalculationService: PriceCalculationService

    private lateinit var billingService: BillingService

    private val location = Location(name = "Test Studio")
    private val room = Room(location = location, name = "Rot", hourlyRate = BigDecimal("70.00"))
    private val provider1 = ServiceProvider(location = location, name = "Provider 1")
    private val provider2 = ServiceProvider(location = location, name = "Provider 2")
    private val upgrade = Upgrade(name = "Test Upgrade", price = BigDecimal("20.00"))

    private lateinit var roomPrice: RoomPrice
    private lateinit var upgradePrice: UpgradePrice
    private lateinit var booking1: Booking
    private lateinit var booking2: Booking
    private lateinit var booking3: Booking

    @BeforeEach
    fun setUp() {
        billingService =
            BillingService(
                billingRepository,
                billingItemRepository,
                bookingRepository,
                roomPriceRepository,
                upgradePriceRepository,
                priceCalculationService,
            )

        // Set up test data
        val now = OffsetDateTime.now()
        roomPrice =
            RoomPrice(
                room = room,
                price = BigDecimal("70.00"),
                validFrom = now.minusDays(30),
                validTo = null,
            )

        upgradePrice =
            UpgradePrice(
                upgrade = upgrade,
                price = BigDecimal("20.00"),
                validFrom = now.minusDays(30),
                validTo = null,
            )

        val startTime = LocalDateTime.now().plusDays(1)
        booking1 =
            Booking(
                provider = provider1,
                room = room,
                startTime = startTime,
                durationMinutes = 60,
                restingTimeMinutes = 0,
                clientAlias = "Client 1",
            )

        booking2 =
            Booking(
                provider = provider1,
                room = room,
                startTime = startTime.plusHours(2),
                durationMinutes = 120,
                restingTimeMinutes = 0,
                clientAlias = "Client 2",
            )

        booking3 =
            Booking(
                provider = provider2,
                room = room,
                startTime = startTime.plusHours(5),
                durationMinutes = 60,
                restingTimeMinutes = 0,
                clientAlias = "Client 3",
            )
    }

    @Test
    fun `createBillings should create single billing for single provider`() {
        val bookingIds = listOf(booking1.id, booking2.id)
        val periodStart = OffsetDateTime.now().minusDays(7)
        val periodEnd = OffsetDateTime.now()

        whenever(bookingRepository.findAllById(bookingIds)).thenReturn(listOf(booking1, booking2))
        whenever(billingItemRepository.existsByBookingId(any())).thenReturn(false)
        whenever(roomPriceRepository.findByRoomIdAndValidAt(any(), any())).thenReturn(roomPrice)
        whenever(priceCalculationService.calculateRoomPrice(any(), any())).thenAnswer { invocation ->
            val duration = invocation.getArgument<Int>(1)
            val hours = BigDecimal(duration).divide(BigDecimal(60), 4, java.math.RoundingMode.HALF_UP)
            roomPrice.price.multiply(hours).setScale(2, java.math.RoundingMode.HALF_UP)
        }
        whenever(billingRepository.save(any<Billing>())).thenAnswer { it.arguments[0] }

        val billings = billingService.createBillings(bookingIds, periodStart, periodEnd)

        assertEquals(1, billings.size)
        assertEquals(provider1.id, billings[0].serviceProvider.id)
        assertEquals(2, billings[0].items.size)
        assertTrue(billings[0].totalAmount > BigDecimal.ZERO)
        verify(billingRepository).save(any<Billing>())
    }

    @Test
    fun `createBillings should create multiple billings for multiple providers`() {
        val bookingIds = listOf(booking1.id, booking2.id, booking3.id)
        val periodStart = OffsetDateTime.now().minusDays(7)
        val periodEnd = OffsetDateTime.now()

        whenever(bookingRepository.findAllById(bookingIds)).thenReturn(listOf(booking1, booking2, booking3))
        whenever(billingItemRepository.existsByBookingId(any())).thenReturn(false)
        whenever(roomPriceRepository.findByRoomIdAndValidAt(any(), any())).thenReturn(roomPrice)
        whenever(priceCalculationService.calculateRoomPrice(any(), any())).thenAnswer { invocation ->
            val duration = invocation.getArgument<Int>(1)
            val hours = BigDecimal(duration).divide(BigDecimal(60), 4, java.math.RoundingMode.HALF_UP)
            roomPrice.price.multiply(hours).setScale(2, java.math.RoundingMode.HALF_UP)
        }
        whenever(billingRepository.save(any<Billing>())).thenAnswer { it.arguments[0] }

        val billings = billingService.createBillings(bookingIds, periodStart, periodEnd)

        assertEquals(2, billings.size)

        // Verify provider 1 billing
        val provider1Billing = billings.find { it.serviceProvider.id == provider1.id }
        assertNotNull(provider1Billing)
        assertEquals(2, provider1Billing!!.items.size)

        // Verify provider 2 billing
        val provider2Billing = billings.find { it.serviceProvider.id == provider2.id }
        assertNotNull(provider2Billing)
        assertEquals(1, provider2Billing!!.items.size)

        verify(billingRepository).save(
            argThat { billing ->
                billing.serviceProvider.id == provider1.id
            },
        )
        verify(billingRepository).save(
            argThat { billing ->
                billing.serviceProvider.id == provider2.id
            },
        )
    }

    @Test
    fun `createBillings should throw exception when no bookings found`() {
        val bookingIds = listOf(UUID.randomUUID())
        whenever(bookingRepository.findAllById(bookingIds)).thenReturn(emptyList())

        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                billingService.createBillings(
                    bookingIds,
                    OffsetDateTime.now().minusDays(7),
                    OffsetDateTime.now(),
                )
            }

        assertEquals("No bookings found for the provided IDs", exception.message)
    }

    @Test
    fun `createBillings should throw exception when booking already billed`() {
        val bookingIds = listOf(booking1.id)
        whenever(bookingRepository.findAllById(bookingIds)).thenReturn(listOf(booking1))
        whenever(billingItemRepository.existsByBookingId(booking1.id)).thenReturn(true)

        val exception =
            assertThrows(IllegalStateException::class.java) {
                billingService.createBillings(
                    bookingIds,
                    OffsetDateTime.now().minusDays(7),
                    OffsetDateTime.now(),
                )
            }

        assertTrue(exception.message!!.contains("already billed"))
        assertTrue(exception.message!!.contains(booking1.id.toString()))
    }

    @Test
    fun `createBillings should correctly calculate room subtotal`() {
        val bookingIds = listOf(booking1.id)
        whenever(bookingRepository.findAllById(bookingIds)).thenReturn(listOf(booking1))
        whenever(billingItemRepository.existsByBookingId(any())).thenReturn(false)
        whenever(roomPriceRepository.findByRoomIdAndValidAt(any(), any())).thenReturn(roomPrice)
        whenever(priceCalculationService.calculateRoomPrice(any(), any())).thenAnswer { invocation ->
            val duration = invocation.getArgument<Int>(1)
            val hours = BigDecimal(duration).divide(BigDecimal(60), 4, java.math.RoundingMode.HALF_UP)
            roomPrice.price.multiply(hours).setScale(2, java.math.RoundingMode.HALF_UP)
        }
        whenever(billingRepository.save(any<Billing>())).thenAnswer { it.arguments[0] }

        val billings =
            billingService.createBillings(
                bookingIds,
                OffsetDateTime.now().minusDays(7),
                OffsetDateTime.now(),
            )

        val billingItem = billings[0].items[0]
        // 60 minutes = 1 hour, 1 hour * 70.00 = 70.00
        assertEquals(BigDecimal("70.00"), billingItem.subtotalRoom)
        assertEquals(BigDecimal("70.00"), billingItem.totalAmount)
    }

    @Test
    fun `createBillings should correctly freeze booking data`() {
        val bookingIds = listOf(booking1.id)
        whenever(bookingRepository.findAllById(bookingIds)).thenReturn(listOf(booking1))
        whenever(billingItemRepository.existsByBookingId(any())).thenReturn(false)
        whenever(roomPriceRepository.findByRoomIdAndValidAt(any(), any())).thenReturn(roomPrice)
        whenever(priceCalculationService.calculateRoomPrice(any(), any())).thenAnswer { invocation ->
            val duration = invocation.getArgument<Int>(1)
            val hours = BigDecimal(duration).divide(BigDecimal(60), 4, java.math.RoundingMode.HALF_UP)
            roomPrice.price.multiply(hours).setScale(2, java.math.RoundingMode.HALF_UP)
        }
        whenever(billingRepository.save(any<Billing>())).thenAnswer { it.arguments[0] }

        val billings =
            billingService.createBillings(
                bookingIds,
                OffsetDateTime.now().minusDays(7),
                OffsetDateTime.now(),
            )

        val billingItem = billings[0].items[0]
        assertEquals(booking1.id, billingItem.booking.id)
        assertEquals(booking1.durationMinutes, billingItem.frozenDurationMinutes)
        assertEquals(booking1.restingTimeMinutes, billingItem.frozenRestingTimeMinutes)
        assertEquals(booking1.clientAlias, billingItem.frozenClientAlias)
        assertEquals(booking1.room.name, billingItem.frozenRoomName)
        assertEquals(roomPrice.price, billingItem.frozenRoomPriceAmount)
    }

    @Test
    fun `createBillings should handle bookings with upgrades`() {
        // Add upgrade to booking1
        val bookingUpgrade = BookingUpgrade(booking = booking1, upgrade = upgrade, quantity = 2)
        booking1.bookingUpgrades.add(bookingUpgrade)

        val bookingIds = listOf(booking1.id)
        whenever(bookingRepository.findAllById(bookingIds)).thenReturn(listOf(booking1))
        whenever(billingItemRepository.existsByBookingId(any())).thenReturn(false)
        whenever(roomPriceRepository.findByRoomIdAndValidAt(any(), any())).thenReturn(roomPrice)
        whenever(priceCalculationService.calculateRoomPrice(any(), any())).thenAnswer { invocation ->
            val duration = invocation.getArgument<Int>(1)
            val hours = BigDecimal(duration).divide(BigDecimal(60), 4, java.math.RoundingMode.HALF_UP)
            roomPrice.price.multiply(hours).setScale(2, java.math.RoundingMode.HALF_UP)
        }
        whenever(upgradePriceRepository.findByUpgradeIdAndValidAt(any(), any())).thenReturn(upgradePrice)
        whenever(billingRepository.save(any<Billing>())).thenAnswer { it.arguments[0] }

        val billings =
            billingService.createBillings(
                bookingIds,
                OffsetDateTime.now().minusDays(7),
                OffsetDateTime.now(),
            )

        val billingItem = billings[0].items[0]
        assertEquals(1, billingItem.upgrades.size)

        val billingItemUpgrade = billingItem.upgrades[0]
        assertEquals(upgrade.name, billingItemUpgrade.frozenUpgradeName)
        assertEquals(2, billingItemUpgrade.frozenQuantity)
        assertEquals(upgradePrice.price, billingItemUpgrade.frozenUpgradePriceAmount)
        // 2 * 20.00 = 40.00
        assertEquals(BigDecimal("40.00"), billingItemUpgrade.totalAmount)
        assertEquals(BigDecimal("40.00"), billingItem.subtotalUpgrades)
        // 70.00 + 40.00 = 110.00
        assertEquals(BigDecimal("110.00"), billingItem.totalAmount)
    }

    @Test
    fun `createBillings should throw exception when room price not found`() {
        val bookingIds = listOf(booking1.id)
        whenever(bookingRepository.findAllById(bookingIds)).thenReturn(listOf(booking1))
        whenever(billingItemRepository.existsByBookingId(any())).thenReturn(false)
        whenever(roomPriceRepository.findByRoomIdAndValidAt(any(), any())).thenReturn(null)

        val exception =
            assertThrows(IllegalStateException::class.java) {
                billingService.createBillings(
                    bookingIds,
                    OffsetDateTime.now().minusDays(7),
                    OffsetDateTime.now(),
                )
            }

        assertTrue(exception.message!!.contains("No room price found"))
    }

    @Test
    fun `createBillings should throw exception when upgrade price not found`() {
        val bookingUpgrade = BookingUpgrade(booking = booking1, upgrade = upgrade, quantity = 1)
        booking1.bookingUpgrades.add(bookingUpgrade)

        val bookingIds = listOf(booking1.id)
        whenever(bookingRepository.findAllById(bookingIds)).thenReturn(listOf(booking1))
        whenever(billingItemRepository.existsByBookingId(any())).thenReturn(false)
        whenever(roomPriceRepository.findByRoomIdAndValidAt(any(), any())).thenReturn(roomPrice)
        whenever(priceCalculationService.calculateRoomPrice(any(), any())).thenAnswer { invocation ->
            val duration = invocation.getArgument<Int>(1)
            val hours = BigDecimal(duration).divide(BigDecimal(60), 4, java.math.RoundingMode.HALF_UP)
            roomPrice.price.multiply(hours).setScale(2, java.math.RoundingMode.HALF_UP)
        }
        whenever(upgradePriceRepository.findByUpgradeIdAndValidAt(any(), any())).thenReturn(null)

        val exception =
            assertThrows(IllegalStateException::class.java) {
                billingService.createBillings(
                    bookingIds,
                    OffsetDateTime.now().minusDays(7),
                    OffsetDateTime.now(),
                )
            }

        assertTrue(exception.message!!.contains("No upgrade price found"))
    }

    @Test
    fun `getAllBillings should return all billings ordered by creation date`() {
        val billing1 =
            Billing(
                serviceProvider = provider1,
                periodStart = OffsetDateTime.now().minusDays(7),
                periodEnd = OffsetDateTime.now(),
                totalAmount = BigDecimal("100.00"),
            )
        val billing2 =
            Billing(
                serviceProvider = provider2,
                periodStart = OffsetDateTime.now().minusDays(14),
                periodEnd = OffsetDateTime.now().minusDays(7),
                totalAmount = BigDecimal("200.00"),
            )

        whenever(billingRepository.findAllByOrderByCreatedAtDesc()).thenReturn(listOf(billing1, billing2))

        val billings = billingService.getAllBillings()

        assertEquals(2, billings.size)
        verify(billingRepository).findAllByOrderByCreatedAtDesc()
    }

    @Test
    fun `getBillingsByServiceProvider should return filtered billings`() {
        val billing =
            Billing(
                serviceProvider = provider1,
                periodStart = OffsetDateTime.now().minusDays(7),
                periodEnd = OffsetDateTime.now(),
                totalAmount = BigDecimal("100.00"),
            )

        whenever(billingRepository.findByServiceProviderIdOrderByCreatedAtDesc(provider1.id))
            .thenReturn(listOf(billing))

        val billings = billingService.getBillingsByServiceProvider(provider1.id)

        assertEquals(1, billings.size)
        assertEquals(provider1.id, billings[0].serviceProvider.id)
        verify(billingRepository).findByServiceProviderIdOrderByCreatedAtDesc(provider1.id)
    }

    @Test
    fun `getBillingById should return billing when found`() {
        val billingId = UUID.randomUUID()
        val billing =
            Billing(
                id = billingId,
                serviceProvider = provider1,
                periodStart = OffsetDateTime.now().minusDays(7),
                periodEnd = OffsetDateTime.now(),
                totalAmount = BigDecimal("100.00"),
            )

        whenever(billingRepository.findById(billingId)).thenReturn(Optional.of(billing))

        val result = billingService.getBillingById(billingId)

        assertEquals(billingId, result.id)
        verify(billingRepository).findById(billingId)
    }

    @Test
    fun `getBillingById should throw exception when not found`() {
        val billingId = UUID.randomUUID()
        whenever(billingRepository.findById(billingId)).thenReturn(Optional.empty())

        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                billingService.getBillingById(billingId)
            }

        assertEquals("Billing not found: $billingId", exception.message)
    }

    @Test
    fun `getBillingItems should return items for billing`() {
        val billingId = UUID.randomUUID()
        val billing =
            Billing(
                id = billingId,
                serviceProvider = provider1,
                periodStart = OffsetDateTime.now().minusDays(7),
                periodEnd = OffsetDateTime.now(),
                totalAmount = BigDecimal("100.00"),
            )

        val startTime = booking1.startTime.atZone(ZoneId.systemDefault()).toOffsetDateTime()
        val endTime = booking1.endTime().atZone(ZoneId.systemDefault()).toOffsetDateTime()

        val billingItem =
            BillingItem(
                billing = billing,
                booking = booking1,
                frozenStartTime = startTime,
                frozenEndTime = endTime,
                frozenDurationMinutes = 60,
                frozenRestingTimeMinutes = 0,
                frozenClientAlias = "Client 1",
                frozenRoomName = "Rot",
                roomPrice = roomPrice,
                frozenRoomPriceAmount = BigDecimal("70.00"),
                subtotalRoom = BigDecimal("70.00"),
                totalAmount = BigDecimal("70.00"),
            )

        whenever(billingItemRepository.findByBillingId(billingId)).thenReturn(listOf(billingItem))

        val items = billingService.getBillingItems(billingId)

        assertEquals(1, items.size)
        assertEquals(billing.id, items[0].billing.id)
        verify(billingItemRepository).findByBillingId(billingId)
    }
}
