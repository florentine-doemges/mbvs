package com.studio.booking.service

import com.studio.booking.domain.Billing
import com.studio.booking.domain.BillingItem
import com.studio.booking.domain.BillingItemUpgrade
import com.studio.booking.domain.Booking
import com.studio.booking.repository.BillingItemRepository
import com.studio.booking.repository.BillingRepository
import com.studio.booking.repository.BookingRepository
import com.studio.booking.repository.RoomPriceRepository
import com.studio.booking.repository.UpgradePriceRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.OffsetDateTime
import java.util.UUID

@Service
class BillingService(
    private val billingRepository: BillingRepository,
    private val billingItemRepository: BillingItemRepository,
    private val bookingRepository: BookingRepository,
    private val roomPriceRepository: RoomPriceRepository,
    private val upgradePriceRepository: UpgradePriceRepository,
    private val priceCalculationService: PriceCalculationService,
) {
    /**
     * Create billings for selected bookings.
     * Groups bookings by service provider and creates one billing per provider.
     *
     * @param bookingIds List of booking IDs to include in billing
     * @param periodStart Start of billing period
     * @param periodEnd End of billing period
     * @return List of created billings (one per service provider)
     */
    @Transactional
    fun createBillings(
        bookingIds: List<UUID>,
        periodStart: OffsetDateTime,
        periodEnd: OffsetDateTime,
    ): List<Billing> {
        // Load all bookings
        val bookings = bookingRepository.findAllById(bookingIds)

        if (bookings.isEmpty()) {
            throw IllegalArgumentException("No bookings found for the provided IDs")
        }

        // Check if any booking is already billed
        val alreadyBilledIds =
            bookings
                .filter { billingItemRepository.existsByBookingId(it.id) }
                .map { it.id }

        if (alreadyBilledIds.isNotEmpty()) {
            throw IllegalStateException(
                "Some bookings are already billed: $alreadyBilledIds",
            )
        }

        // Group bookings by service provider
        val bookingsByProvider = bookings.groupBy { it.provider }

        // Create one billing per service provider
        val billings = mutableListOf<Billing>()

        for ((serviceProvider, providerBookings) in bookingsByProvider) {
            val billing =
                Billing(
                    serviceProvider = serviceProvider,
                    periodStart = periodStart,
                    periodEnd = periodEnd,
                    totalAmount = BigDecimal.ZERO,
                )

            // Create billing items for each booking
            for (booking in providerBookings) {
                val billingItem = createBillingItem(billing, booking)
                billing.addItem(billingItem)
            }

            // Calculate total amount
            billing.updateTotalAmount()

            // Save billing with all items
            billings.add(billingRepository.save(billing))
        }

        return billings
    }

    /**
     * Create a billing item from a booking (freeze the booking data)
     */
    private fun createBillingItem(
        billing: Billing,
        booking: Booking,
    ): BillingItem {
        // Convert LocalDateTime to OffsetDateTime (assuming system default timezone)
        val bookingStartTime = booking.startTime.atZone(java.time.ZoneId.systemDefault()).toOffsetDateTime()
        val bookingEndTime = booking.endTime().atZone(java.time.ZoneId.systemDefault()).toOffsetDateTime()

        // Get the room price that was valid at booking start time
        val roomPrice =
            roomPriceRepository.findByRoomIdAndValidAt(booking.room.id, bookingStartTime)
                ?: throw IllegalStateException(
                    "No room price found for room ${booking.room.id} at $bookingStartTime",
                )

        // Calculate room subtotal using tiered pricing if available
        val subtotalRoom = priceCalculationService.calculateRoomPrice(roomPrice, booking.durationMinutes)

        // Create billing item
        val billingItem =
            BillingItem(
                billing = billing,
                booking = booking,
                frozenStartTime = bookingStartTime,
                frozenEndTime = bookingEndTime,
                frozenDurationMinutes = booking.durationMinutes,
                frozenRestingTimeMinutes = booking.restingTimeMinutes,
                frozenClientAlias = booking.clientAlias,
                frozenRoomName = booking.room.name,
                roomPrice = roomPrice,
                frozenRoomPriceAmount = roomPrice.price,
                subtotalRoom = subtotalRoom,
                subtotalUpgrades = BigDecimal.ZERO,
                totalAmount = subtotalRoom,
            )

        // Create billing item upgrades
        for (bookingUpgrade in booking.bookingUpgrades) {
            val upgradePrice =
                upgradePriceRepository.findByUpgradeIdAndValidAt(
                    bookingUpgrade.upgrade.id,
                    bookingStartTime,
                ) ?: throw IllegalStateException(
                    "No upgrade price found for upgrade ${bookingUpgrade.upgrade.id} at $bookingStartTime",
                )

            val quantity = bookingUpgrade.quantity
            val totalAmount =
                upgradePrice.price
                    .multiply(BigDecimal.valueOf(quantity.toLong()))
                    .setScale(2, RoundingMode.HALF_UP)

            val billingItemUpgrade =
                BillingItemUpgrade(
                    billingItem = billingItem,
                    frozenUpgradeName = bookingUpgrade.upgrade.name,
                    frozenQuantity = quantity,
                    upgradePrice = upgradePrice,
                    frozenUpgradePriceAmount = upgradePrice.price,
                    totalAmount = totalAmount,
                )

            billingItem.addUpgrade(billingItemUpgrade)
        }

        // Calculate total amount including upgrades
        billingItem.calculateTotalAmount()

        return billingItem
    }

    /**
     * Get all billings
     */
    @Transactional(readOnly = true)
    fun getAllBillings(): List<Billing> {
        return billingRepository.findAllByOrderByCreatedAtDesc()
    }

    /**
     * Get billings for a specific service provider
     */
    @Transactional(readOnly = true)
    fun getBillingsByServiceProvider(serviceProviderId: UUID): List<Billing> {
        return billingRepository.findByServiceProviderIdOrderByCreatedAtDesc(serviceProviderId)
    }

    /**
     * Get a specific billing by ID
     */
    @Transactional(readOnly = true)
    fun getBillingById(id: UUID): Billing {
        return billingRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Billing not found: $id") }
    }

    /**
     * Get billing items for a specific billing
     */
    @Transactional(readOnly = true)
    fun getBillingItems(billingId: UUID): List<BillingItem> {
        return billingItemRepository.findByBillingId(billingId)
    }
}
