package com.studio.booking.api

import com.studio.booking.domain.Booking
import com.studio.booking.domain.DurationOption
import com.studio.booking.domain.Room
import com.studio.booking.domain.ServiceProvider
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

fun Booking.toDto() =
    BookingDto(
        id = id,
        provider = provider.toDto(),
        room = room.toDto(),
        startTime = startTime,
        durationMinutes = durationMinutes,
        clientAlias = clientAlias,
        createdAt = createdAt,
    )

fun Booking.toCalendarDto() =
    CalendarBookingDto(
        id = id,
        startTime = startTime,
        durationMinutes = durationMinutes,
        provider = provider.toDto(),
        clientAlias = clientAlias,
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
        clientAlias = clientAlias,
        provider = provider.toDto(),
        room = room.toDto(),
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
