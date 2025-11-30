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

export interface Upgrade {
  id: string
  name: string
  price: number
  active: boolean
}

export interface BookingUpgrade {
  upgrade: Upgrade
  quantity: number
}

export interface CreateUpgradeRequest {
  name: string
  price: number
}

export interface UpdateUpgradeRequest {
  name: string
  price: number
  active: boolean
}

export interface CalendarBooking {
  id: string
  startTime: string
  durationMinutes: number
  restingTimeMinutes: number
  provider: ServiceProvider
  clientAlias: string
  upgrades: BookingUpgrade[]
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
  restingTimeMinutes: number
  clientAlias: string
  upgrades: BookingUpgrade[]
  createdAt: string
}

export interface CreateBookingRequest {
  providerId: string
  roomId: string
  startTime: string
  durationMinutes: number
  restingTimeMinutes?: number
  clientAlias?: string
  upgrades?: Record<string, number>
}

export interface UpdateBookingRequest {
  providerId: string
  roomId: string
  startTime: string
  durationMinutes: number
  restingTimeMinutes?: number
  clientAlias?: string
  upgrades?: Record<string, number>
}

// Booking List types
export interface BookingListItem {
  id: string
  startTime: string
  endTime: string
  durationMinutes: number
  restingTimeMinutes: number
  clientAlias: string
  provider: ProviderInfo
  room: RoomInfo
  upgrades: BookingUpgrade[]
  status: 'upcoming' | 'today' | 'past'
  totalPrice: number
}

export interface ProviderInfo {
  id: string
  name: string
  color: string
}

export interface RoomInfo {
  id: string
  name: string
  color: string
  hourlyRate: number
}

export interface BookingListResponse {
  content: BookingListItem[]
  page: PageInfo
}

export interface PageInfo {
  number: number
  size: number
  totalElements: number
  totalPages: number
}

export interface Location {
  id: string
  name: string
}

export interface ErrorResponse {
  message: string
}

export interface RoomPrice {
  id: string
  price: number
  validFrom: string
  validTo: string | null
}

export interface UpgradePrice {
  id: string
  price: number
  validFrom: string
  validTo: string | null
}
