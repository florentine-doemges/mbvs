export interface Room {
  id: string
  name: string
  hourlyRate: number
}

export interface RoomDetail {
  id: string
  name: string
  hourlyRate: number
  active: boolean
  sortOrder: number
  color: string
  bookingCount: number
}

export interface CreateRoomRequest {
  name: string
  hourlyRate: number
  sortOrder?: number
  color?: string
}

export interface UpdateRoomRequest {
  name: string
  hourlyRate: number
  active: boolean
  sortOrder: number
  color: string
}

export interface ServiceProvider {
  id: string
  name: string
}

export interface ProviderDetail {
  id: string
  name: string
  active: boolean
  sortOrder: number
  color: string
  bookingCount: number
}

export interface CreateProviderRequest {
  name: string
  sortOrder?: number
  color?: string
}

export interface UpdateProviderRequest {
  name: string
  active: boolean
  sortOrder: number
  color: string
}

export interface DurationOption {
  id: string
  minutes: number
  label: string
  isVariable: boolean
  minMinutes: number | null
  maxMinutes: number | null
  stepMinutes: number | null
  sortOrder: number
  active: boolean
}

export interface CreateDurationOptionRequest {
  minutes: number
  label: string
  isVariable: boolean
  minMinutes?: number
  maxMinutes?: number
  stepMinutes?: number
  sortOrder?: number
}

export interface UpdateDurationOptionRequest {
  minutes: number
  label: string
  isVariable: boolean
  minMinutes?: number
  maxMinutes?: number
  stepMinutes?: number
  sortOrder: number
  active: boolean
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
  color: string
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
