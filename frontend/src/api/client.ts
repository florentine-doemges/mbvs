import type {
  Booking,
  CalendarDay,
  CreateBookingRequest,
  CreateDurationOptionRequest,
  CreateProviderRequest,
  CreateRoomRequest,
  DurationOption,
  ErrorResponse,
  ProviderDetail,
  RoomDetail,
  UpdateBookingRequest,
  UpdateDurationOptionRequest,
  UpdateProviderRequest,
  UpdateRoomRequest,
} from './types'

const API_BASE = '/api'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = (await response.json()) as ErrorResponse
    throw new Error(error.message)
  }
  return (await response.json()) as T
}

// Rooms
export async function fetchRooms(
  locationId: string,
  includeInactive = false
): Promise<RoomDetail[]> {
  const response = await fetch(
    `${API_BASE}/locations/${locationId}/rooms?includeInactive=${includeInactive}`
  )
  return handleResponse<RoomDetail[]>(response)
}

export async function fetchRoom(roomId: string): Promise<RoomDetail> {
  const response = await fetch(`${API_BASE}/rooms/${roomId}`)
  return handleResponse<RoomDetail>(response)
}

export async function createRoom(
  locationId: string,
  request: CreateRoomRequest
): Promise<RoomDetail> {
  const response = await fetch(`${API_BASE}/locations/${locationId}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  return handleResponse<RoomDetail>(response)
}

export async function updateRoom(
  roomId: string,
  request: UpdateRoomRequest
): Promise<RoomDetail> {
  const response = await fetch(`${API_BASE}/rooms/${roomId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  return handleResponse<RoomDetail>(response)
}

export async function deleteRoom(roomId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/rooms/${roomId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = (await response.json()) as ErrorResponse
    throw new Error(error.message)
  }
}

// Providers
export async function fetchProviders(
  locationId: string,
  includeInactive = false
): Promise<ProviderDetail[]> {
  const response = await fetch(
    `${API_BASE}/locations/${locationId}/providers?includeInactive=${includeInactive}`
  )
  return handleResponse<ProviderDetail[]>(response)
}

export async function fetchProvider(providerId: string): Promise<ProviderDetail> {
  const response = await fetch(`${API_BASE}/providers/${providerId}`)
  return handleResponse<ProviderDetail>(response)
}

export async function createProvider(
  locationId: string,
  request: CreateProviderRequest
): Promise<ProviderDetail> {
  const response = await fetch(`${API_BASE}/locations/${locationId}/providers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  return handleResponse<ProviderDetail>(response)
}

export async function updateProvider(
  providerId: string,
  request: UpdateProviderRequest
): Promise<ProviderDetail> {
  const response = await fetch(`${API_BASE}/providers/${providerId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  return handleResponse<ProviderDetail>(response)
}

export async function deleteProvider(providerId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/providers/${providerId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = (await response.json()) as ErrorResponse
    throw new Error(error.message)
  }
}

// Duration Options
export async function fetchDurationOptions(
  locationId: string,
  includeInactive = false
): Promise<DurationOption[]> {
  const response = await fetch(
    `${API_BASE}/locations/${locationId}/duration-options?includeInactive=${includeInactive}`
  )
  return handleResponse<DurationOption[]>(response)
}

export async function fetchDurationOption(optionId: string): Promise<DurationOption> {
  const response = await fetch(`${API_BASE}/duration-options/${optionId}`)
  return handleResponse<DurationOption>(response)
}

export async function createDurationOption(
  locationId: string,
  request: CreateDurationOptionRequest
): Promise<DurationOption> {
  const response = await fetch(`${API_BASE}/locations/${locationId}/duration-options`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  return handleResponse<DurationOption>(response)
}

export async function updateDurationOption(
  optionId: string,
  request: UpdateDurationOptionRequest
): Promise<DurationOption> {
  const response = await fetch(`${API_BASE}/duration-options/${optionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  return handleResponse<DurationOption>(response)
}

export async function deleteDurationOption(optionId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/duration-options/${optionId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = (await response.json()) as ErrorResponse
    throw new Error(error.message)
  }
}

// Calendar
export async function fetchCalendar(locationId: string, date: string): Promise<CalendarDay> {
  const response = await fetch(
    `${API_BASE}/locations/${locationId}/calendar?date=${date}`
  )
  return handleResponse<CalendarDay>(response)
}

// Bookings
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
    const error = (await response.json()) as ErrorResponse
    throw new Error(error.message)
  }
}
