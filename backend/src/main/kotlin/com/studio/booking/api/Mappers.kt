package com.studio.booking.api

import com.studio.booking.domain.Billing
import com.studio.booking.domain.BillingItem
import com.studio.booking.domain.BillingItemUpgrade
import com.studio.booking.domain.Booking
import com.studio.booking.domain.BookingUpgrade
import com.studio.booking.domain.DurationOption
import com.studio.booking.domain.Location
import com.studio.booking.domain.Room
import com.studio.booking.domain.RoomPrice
import com.studio.booking.domain.ServiceProvider
import com.studio.booking.domain.Upgrade
import com.studio.booking.domain.UpgradePrice
import com.studio.booking.service.BookingListItem
import com.studio.booking.service.CalendarDay
import com.studio.booking.service.ProviderInfo
import com.studio.booking.service.RoomInfo
import com.studio.booking.service.RoomWithBookings

fun Room.toDto() =
    RoomDto(
        id = id,
        name = name,
        hourlyRate = hourlyRate,
    )

fun Room.toDetailDto(bookingCount: Long) =
    RoomDetailDto(
        id = id,
        name = name,
        hourlyRate = hourlyRate,
        active = active,
        sortOrder = sortOrder,
        color = color,
        bookingCount = bookingCount,
    )

fun ServiceProvider.toDto() =
    ServiceProviderDto(
        id = id,
        name = name,
    )

fun ServiceProvider.toDetailDto(bookingCount: Long) =
    ProviderDetailDto(
        id = id,
        name = name,
        active = active,
        sortOrder = sortOrder,
        color = color,
        bookingCount = bookingCount,
    )

fun DurationOption.toDto() =
    DurationOptionDto(
        id = id,
        minutes = minutes,
        label = label,
        isVariable = isVariable,
        minMinutes = minMinutes,
        maxMinutes = maxMinutes,
        stepMinutes = stepMinutes,
        sortOrder = sortOrder,
        active = active,
    )

fun Upgrade.toDto() =
    UpgradeDto(
        id = id,
        name = name,
        price = price,
        active = active,
    )

fun BookingUpgrade.toDto() =
    BookingUpgradeDto(
        upgrade = upgrade.toDto(),
        quantity = quantity,
    )

fun Booking.toDto() =
    BookingDto(
        id = id,
        provider = provider.toDto(),
        room = room.toDto(),
        startTime = startTime,
        durationMinutes = durationMinutes,
        restingTimeMinutes = restingTimeMinutes,
        clientAlias = clientAlias,
        upgrades = bookingUpgrades.map { it.toDto() },
        createdAt = createdAt,
    )

fun Booking.toCalendarDto() =
    CalendarBookingDto(
        id = id,
        startTime = startTime,
        durationMinutes = durationMinutes,
        restingTimeMinutes = restingTimeMinutes,
        provider = provider.toDto(),
        clientAlias = clientAlias,
        upgrades = bookingUpgrades.map { it.toDto() },
    )

fun RoomWithBookings.toDto() =
    CalendarRoomDto(
        id = room.id,
        name = room.name,
        color = room.color,
        bookings = bookings.map { it.toCalendarDto() },
    )

fun CalendarDay.toDto() =
    CalendarDayDto(
        date = date,
        rooms = rooms.map { it.toDto() },
    )

fun BookingListItem.toDto() =
    BookingListItemDto(
        id = id,
        startTime = startTime,
        endTime = endTime,
        durationMinutes = durationMinutes,
        restingTimeMinutes = restingTimeMinutes,
        clientAlias = clientAlias,
        provider = provider.toDto(),
        room = room.toDto(),
        upgrades = upgrades.map { it.toDto() },
        status = status.name.lowercase(),
        totalPrice = totalPrice,
    )

fun ProviderInfo.toDto() =
    ProviderInfoDto(
        id = id,
        name = name,
        color = color,
    )

fun RoomInfo.toDto() =
    RoomInfoDto(
        id = id,
        name = name,
        color = color,
        hourlyRate = hourlyRate,
    )

fun Location.toDto() =
    LocationDto(
        id = id,
        name = name,
    )

fun RoomPrice.toDto() =
    RoomPriceDto(
        id = id,
        roomId = room.id,
        price = price,
        validFrom = validFrom,
        validTo = validTo,
        createdAt = createdAt,
    )

fun UpgradePrice.toDto() =
    UpgradePriceDto(
        id = id,
        upgradeId = upgrade.id,
        price = price,
        validFrom = validFrom,
        validTo = validTo,
        createdAt = createdAt,
    )

fun Billing.toDto() =
    BillingDto(
        id = id,
        serviceProvider = serviceProvider.toDto(),
        periodStart = periodStart,
        periodEnd = periodEnd,
        totalAmount = totalAmount,
        invoiceDocumentUrl = invoiceDocumentUrl,
        createdAt = createdAt,
        itemCount = items.size,
    )

fun Billing.toDetailDto() =
    BillingDetailDto(
        id = id,
        serviceProvider = serviceProvider.toDto(),
        periodStart = periodStart,
        periodEnd = periodEnd,
        totalAmount = totalAmount,
        invoiceDocumentUrl = invoiceDocumentUrl,
        createdAt = createdAt,
        items = items.map { it.toDto() },
    )

fun BillingItem.toDto() =
    BillingItemDto(
        id = id,
        bookingId = booking.id,
        frozenStartTime = frozenStartTime,
        frozenEndTime = frozenEndTime,
        frozenDurationMinutes = frozenDurationMinutes,
        frozenRestingTimeMinutes = frozenRestingTimeMinutes,
        frozenClientAlias = frozenClientAlias,
        frozenRoomName = frozenRoomName,
        frozenRoomPriceAmount = frozenRoomPriceAmount,
        subtotalRoom = subtotalRoom,
        subtotalUpgrades = subtotalUpgrades,
        totalAmount = totalAmount,
        upgrades = upgrades.map { it.toDto() },
    )

fun BillingItemUpgrade.toDto() =
    BillingItemUpgradeDto(
        id = id,
        frozenUpgradeName = frozenUpgradeName,
        frozenQuantity = frozenQuantity,
        frozenUpgradePriceAmount = frozenUpgradePriceAmount,
        totalAmount = totalAmount,
    )
