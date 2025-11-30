import type {
  Booking,
  BookingListResponse,
  CalendarDay,
  CreateBookingRequest,
  CreateDurationOptionRequest,
  CreateProviderRequest,
  CreateRoomRequest,
  CreateUpgradeRequest,
  DurationOption,
  ErrorResponse,
  Location,
  ProviderDetail,
  RoomDetail,
  UpdateBookingRequest,
  UpdateDurationOptionRequest,
  UpdateProviderRequest,
  UpdateRoomRequest,
  UpdateUpgradeRequest,
  Upgrade,
  RoomPrice,
  UpgradePrice,
  RoomPriceTier,
  CreatePriceTierRequest,
  UpdatePriceTierRequest,
  PricePreview,
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

// Locations
export async function fetchLocation(locationId: string): Promise<Location> {
  const response = await fetch(`${API_BASE}/locations/${locationId}`)
  return handleResponse<Location>(response)
}

// Upgrades
export async function fetchUpgrades(includeInactive = false): Promise<Upgrade[]> {
  const response = await fetch(`${API_BASE}/upgrades?includeInactive=${includeInactive}`)
  return handleResponse<Upgrade[]>(response)
}

export async function fetchUpgrade(upgradeId: string): Promise<Upgrade> {
  const response = await fetch(`${API_BASE}/upgrades/${upgradeId}`)
  return handleResponse<Upgrade>(response)
}

export async function createUpgrade(request: CreateUpgradeRequest): Promise<Upgrade> {
  const response = await fetch(`${API_BASE}/upgrades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  return handleResponse<Upgrade>(response)
}

export async function updateUpgrade(
  upgradeId: string,
  request: UpdateUpgradeRequest
): Promise<Upgrade> {
  const response = await fetch(`${API_BASE}/upgrades/${upgradeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  return handleResponse<Upgrade>(response)
}

export async function deleteUpgrade(upgradeId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/upgrades/${upgradeId}`, {
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
export async function fetchBookings(
  locationId: string,
  params: Record<string, string>
): Promise<BookingListResponse> {
  const queryParams = new URLSearchParams(params)
  const response = await fetch(
    `${API_BASE}/locations/${locationId}/bookings?${queryParams.toString()}`
  )
  return handleResponse<BookingListResponse>(response)
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
    const error = (await response.json()) as ErrorResponse
    throw new Error(error.message)
  }
}

// Room Prices
export async function fetchRoomPriceHistory(roomId: string): Promise<RoomPrice[]> {
  const response = await fetch(`${API_BASE}/rooms/${roomId}/prices`)
  return handleResponse<RoomPrice[]>(response)
}

export async function fetchCurrentRoomPrice(roomId: string): Promise<RoomPrice | null> {
  const response = await fetch(`${API_BASE}/rooms/${roomId}/prices/current`)
  if (response.status === 404) {
    return null
  }
  return handleResponse<RoomPrice>(response)
}

export async function addRoomPrice(roomId: string, price: number, validFrom?: string): Promise<RoomPrice> {
  const response = await fetch(`${API_BASE}/rooms/${roomId}/prices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      price,
      validFrom: validFrom || new Date().toISOString()
    }),
  })
  return handleResponse<RoomPrice>(response)
}

// Upgrade Prices
export async function fetchUpgradePriceHistory(upgradeId: string): Promise<UpgradePrice[]> {
  const response = await fetch(`${API_BASE}/upgrades/${upgradeId}/prices`)
  return handleResponse<UpgradePrice[]>(response)
}

export async function fetchCurrentUpgradePrice(upgradeId: string): Promise<UpgradePrice | null> {
  const response = await fetch(`${API_BASE}/upgrades/${upgradeId}/prices/current`)
  if (response.status === 404) {
    return null
  }
  return handleResponse<UpgradePrice>(response)
}

export async function addUpgradePrice(upgradeId: string, price: number, validFrom?: string): Promise<UpgradePrice> {
  const response = await fetch(`${API_BASE}/upgrades/${upgradeId}/prices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      price,
      validFrom: validFrom || new Date().toISOString()
    }),
  })
  return handleResponse<UpgradePrice>(response)
}

// Price Tiers
export async function fetchPriceTiers(roomId: string, priceId: string): Promise<RoomPriceTier[]> {
  const response = await fetch(`${API_BASE}/rooms/${roomId}/prices/${priceId}/tiers`)
  return handleResponse<RoomPriceTier[]>(response)
}

export async function createPriceTier(
  roomId: string,
  priceId: string,
  request: CreatePriceTierRequest
): Promise<RoomPriceTier> {
  const response = await fetch(`${API_BASE}/rooms/${roomId}/prices/${priceId}/tiers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  return handleResponse<RoomPriceTier>(response)
}

export async function updatePriceTier(
  roomId: string,
  priceId: string,
  tierId: string,
  request: UpdatePriceTierRequest
): Promise<RoomPriceTier> {
  const response = await fetch(`${API_BASE}/rooms/${roomId}/prices/${priceId}/tiers/${tierId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  return handleResponse<RoomPriceTier>(response)
}

export async function deletePriceTier(
  roomId: string,
  priceId: string,
  tierId: string
): Promise<void> {
  const response = await fetch(`${API_BASE}/rooms/${roomId}/prices/${priceId}/tiers/${tierId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = (await response.json()) as ErrorResponse
    throw new Error(error.message)
  }
}

export async function fetchPricePreview(
  roomId: string,
  priceId: string
): Promise<PricePreview[]> {
  const response = await fetch(`${API_BASE}/rooms/${roomId}/prices/${priceId}/preview`)
  return handleResponse<PricePreview[]>(response)
}
