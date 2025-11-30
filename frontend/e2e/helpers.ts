import { Page, expect } from '@playwright/test'

// Test data constants
export const LOCATION_ID = '11111111-1111-1111-1111-111111111111'
export const API_BASE = 'http://127.0.0.1:8080/api'
export const APP_BASE = process.env.BASE_URL || 'http://localhost:3001'

export const TEST_ROOMS = {
  red: {
    name: 'E2E Test Roter Raum',
    hourlyRate: 70.00,
    color: '#EF4444'
  },
  blue: {
    name: 'E2E Test Blauer Raum',
    hourlyRate: 75.00,
    color: '#3B82F6'
  }
}

export const TEST_PROVIDERS = {
  anna: {
    name: 'E2E Test Anna Schmidt',
    color: '#EC4899'
  },
  max: {
    name: 'E2E Test Max Müller',
    color: '#8B5CF6'
  }
}

export const TEST_UPGRADES = {
  champagne: {
    name: 'E2E Test Champagner',
    price: 50.00
  },
  massage: {
    name: 'E2E Test Massage',
    price: 80.00
  }
}

export const TEST_DURATIONS = {
  thirtyMin: {
    label: 'E2E Test 30 Minuten',
    minutes: 30,
    isVariable: false
  },
  oneHour: {
    label: 'E2E Test 1 Stunde',
    minutes: 60,
    isVariable: false
  },
  flexible: {
    label: 'E2E Test Flexibel',
    isVariable: true,
    minMinutes: 30,
    maxMinutes: 240,
    stepMinutes: 30
  }
}

// Helper functions
export async function navigateTo(page: Page, path: string) {
  // Build full URL if path is relative
  const url = path.startsWith('http') ? path : `${APP_BASE}${path}`
  await page.goto(url)
  await page.waitForLoadState('networkidle')
}

export async function waitForApiResponse(page: Page, urlPattern: string | RegExp) {
  return await page.waitForResponse(response => {
    const url = response.url()
    if (typeof urlPattern === 'string') {
      return url.includes(urlPattern)
    }
    return urlPattern.test(url)
  })
}

export async function deleteAllTestData(page: Page) {
  // Delete test bookings first (due to foreign keys)
  const bookingsResponse = await page.request.get(
    `${API_BASE}/locations/${LOCATION_ID}/bookings?limit=1000`
  )
  if (bookingsResponse.ok()) {
    const data = await bookingsResponse.json()
    for (const booking of data.content || []) {
      if (booking.clientAlias?.startsWith('E2E Test')) {
        await page.request.delete(`${API_BASE}/bookings/${booking.id}`)
      }
    }
  }

  // Delete test rooms
  const roomsResponse = await page.request.get(
    `${API_BASE}/locations/${LOCATION_ID}/rooms?includeInactive=true`
  )
  if (roomsResponse.ok()) {
    const rooms = await roomsResponse.json()
    for (const room of rooms) {
      if (room.name.startsWith('E2E Test')) {
        await page.request.delete(`${API_BASE}/rooms/${room.id}`)
      }
    }
  }

  // Delete test providers
  const providersResponse = await page.request.get(
    `${API_BASE}/locations/${LOCATION_ID}/providers?includeInactive=true`
  )
  if (providersResponse.ok()) {
    const providers = await providersResponse.json()
    for (const provider of providers) {
      if (provider.name.startsWith('E2E Test')) {
        await page.request.delete(`${API_BASE}/providers/${provider.id}`)
      }
    }
  }

  // Delete test upgrades
  const upgradesResponse = await page.request.get(`${API_BASE}/upgrades?includeInactive=true`)
  if (upgradesResponse.ok()) {
    const upgrades = await upgradesResponse.json()
    for (const upgrade of upgrades) {
      if (upgrade.name.startsWith('E2E Test')) {
        await page.request.delete(`${API_BASE}/upgrades/${upgrade.id}`)
      }
    }
  }

  // Delete test duration options
  const durationsResponse = await page.request.get(
    `${API_BASE}/locations/${LOCATION_ID}/duration-options?includeInactive=true`
  )
  if (durationsResponse.ok()) {
    const durations = await durationsResponse.json()
    for (const duration of durations) {
      if (duration.label.startsWith('E2E Test')) {
        await page.request.delete(`${API_BASE}/duration-options/${duration.id}`)
      }
    }
  }
}

export async function createTestRoom(page: Page, roomData: typeof TEST_ROOMS.red) {
  const response = await page.request.post(`${API_BASE}/locations/${LOCATION_ID}/rooms`, {
    data: roomData
  })
  expect(response.ok()).toBeTruthy()
  return await response.json()
}

export async function createTestProvider(page: Page, providerData: typeof TEST_PROVIDERS.anna) {
  const response = await page.request.post(`${API_BASE}/locations/${LOCATION_ID}/providers`, {
    data: providerData
  })
  expect(response.ok()).toBeTruthy()
  return await response.json()
}

export async function createTestUpgrade(page: Page, upgradeData: typeof TEST_UPGRADES.champagne) {
  const response = await page.request.post(`${API_BASE}/upgrades`, {
    data: upgradeData
  })
  expect(response.ok()).toBeTruthy()
  return await response.json()
}

export async function createTestDuration(
  page: Page,
  durationData: typeof TEST_DURATIONS.oneHour | typeof TEST_DURATIONS.flexible
) {
  const response = await page.request.post(
    `${API_BASE}/locations/${LOCATION_ID}/duration-options`,
    {
      data: durationData
    }
  )
  expect(response.ok()).toBeTruthy()
  return await response.json()
}

export async function createTestBooking(
  page: Page,
  bookingData: {
    startTime: string
    durationMinutes: number
    providerId: string
    roomId: string
    clientAlias: string
    upgrades?: Array<{ upgradeId: string; quantity: number }>
  }
) {
  const response = await page.request.post(`${API_BASE}/bookings`, {
    data: bookingData
  })
  expect(response.ok()).toBeTruthy()
  return await response.json()
}

export function getTodayAtTime(hour: number, minute: number = 0): string {
  const date = new Date()
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

export function getTomorrowAtTime(hour: number, minute: number = 0): string {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

export async function setupTestData(page: Page) {
  // Create test rooms
  const redRoom = await createTestRoom(page, TEST_ROOMS.red)
  const blueRoom = await createTestRoom(page, TEST_ROOMS.blue)

  // Create test providers
  const anna = await createTestProvider(page, TEST_PROVIDERS.anna)
  const max = await createTestProvider(page, TEST_PROVIDERS.max)

  // Create test upgrades
  const champagne = await createTestUpgrade(page, TEST_UPGRADES.champagne)
  const massage = await createTestUpgrade(page, TEST_UPGRADES.massage)

  // Create test durations
  const thirtyMin = await createTestDuration(page, TEST_DURATIONS.thirtyMin)
  const oneHour = await createTestDuration(page, TEST_DURATIONS.oneHour)
  const flexible = await createTestDuration(page, TEST_DURATIONS.flexible)

  return {
    rooms: { red: redRoom, blue: blueRoom },
    providers: { anna, max },
    upgrades: { champagne, massage },
    durations: { thirtyMin, oneHour, flexible }
  }
}
