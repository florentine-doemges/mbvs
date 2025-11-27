import type {
  Booking,
  CalendarDay,
  CreateBookingRequest,
  ErrorResponse,
  Room,
  ServiceProvider,
  UpdateBookingRequest,
} from './types'

const API_BASE = '/api'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ErrorResponse = await response.json()
    throw new Error(error.message)
  }
  return response.json()
}

export async function fetchRooms(locationId: string): Promise<Room[]> {
  const response = await fetch(`${API_BASE}/locations/${locationId}/rooms`)
  return handleResponse<Room[]>(response)
}

export async function fetchProviders(locationId: string): Promise<ServiceProvider[]> {
  const response = await fetch(`${API_BASE}/locations/${locationId}/providers`)
  return handleResponse<ServiceProvider[]>(response)
}

export async function fetchCalendar(locationId: string, date: string): Promise<CalendarDay> {
  const response = await fetch(
    `${API_BASE}/locations/${locationId}/calendar?date=${date}`
  )
  return handleResponse<CalendarDay>(response)
}

export async function fetchBooking(bookingId: string): Promise<Booking> {
  const response = await fetch(`${API_BASE}/bookings/${bookingId}`)
  return handleResponse<Booking>(response)
}

export async function createBooking(request: CreateBookingRequest): Promise<Booking> {
  const response = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  return handleResponse<Booking>(response)
}

export async function updateBooking(
  bookingId: string,
  request: UpdateBookingRequest
): Promise<Booking> {
  const response = await fetch(`${API_BASE}/bookings/${bookingId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  return handleResponse<Booking>(response)
}

export async function deleteBooking(bookingId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/bookings/${bookingId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error: ErrorResponse = await response.json()
    throw new Error(error.message)
  }
}
