export interface Room {
  id: string
  name: string
  hourlyRate: number
}

export interface ServiceProvider {
  id: string
  name: string
}

export interface CalendarBooking {
  id: string
  startTime: string
  durationMinutes: number
  provider: ServiceProvider
  clientAlias: string
}

export interface CalendarRoom {
  id: string
  name: string
  bookings: CalendarBooking[]
}

export interface CalendarDay {
  date: string
  rooms: CalendarRoom[]
}

export interface Booking {
  id: string
  provider: ServiceProvider
  room: Room
  startTime: string
  durationMinutes: number
  clientAlias: string
  createdAt: string
}

export interface CreateBookingRequest {
  providerId: string
  roomId: string
  startTime: string
  durationMinutes: number
  clientAlias: string
}

export interface UpdateBookingRequest {
  providerId: string
  roomId: string
  startTime: string
  durationMinutes: number
  clientAlias: string
}

export interface ErrorResponse {
  message: string
}

export const DURATION_OPTIONS = [
  { value: 30, label: '30 Minuten' },
  { value: 60, label: '60 Minuten' },
  { value: 90, label: '90 Minuten' },
  { value: 120, label: '120 Minuten' },
] as const
