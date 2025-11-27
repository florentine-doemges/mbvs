package com.studio.booking.api

import com.studio.booking.domain.Booking
import com.studio.booking.domain.Room
import com.studio.booking.domain.ServiceProvider
import com.studio.booking.service.CalendarDay
import com.studio.booking.service.RoomWithBookings

fun Room.toDto() = RoomDto(
    id = id,
    name = name,
    hourlyRate = hourlyRate
)

fun ServiceProvider.toDto() = ServiceProviderDto(
    id = id,
    name = name
)

fun Booking.toDto() = BookingDto(
    id = id,
    provider = provider.toDto(),
    room = room.toDto(),
    startTime = startTime,
    durationMinutes = durationMinutes,
    clientAlias = clientAlias,
    createdAt = createdAt
)

fun Booking.toCalendarDto() = CalendarBookingDto(
    id = id,
    startTime = startTime,
    durationMinutes = durationMinutes,
    provider = provider.toDto(),
    clientAlias = clientAlias
)

fun RoomWithBookings.toDto() = CalendarRoomDto(
    id = room.id,
    name = room.name,
    bookings = bookings.map { it.toCalendarDto() }
)

fun CalendarDay.toDto() = CalendarDayDto(
    date = date,
    rooms = rooms.map { it.toDto() }
)
