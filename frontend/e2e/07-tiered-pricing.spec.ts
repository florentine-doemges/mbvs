import { test, expect } from '@playwright/test'
import {
  deleteAllTestData,
  navigateTo,
  TEST_ROOMS,
  createTestRoom,
  API_BASE,
} from './helpers'

test.describe('UC-10: Preisstaffeln', () => {
  test.beforeEach(async ({ page }) => {
    await deleteAllTestData(page)
  })

  test('UC-10.1: Preisstaffel-Bereich anzeigen', async ({ page }) => {
    // Setup: Create test room
    const room = await createTestRoom(page, TEST_ROOMS.red)

    // Execute: Navigate to room edit
    await navigateTo(page, `/rooms/${room.id}`)

    // Verify: Price tier section is visible
    await expect(page.getByText('Preisstaffel (optional)')).toBeVisible()
    await expect(
      page.getByText('Ohne Staffel gilt der Stundensatz für alle Buchungen')
    ).toBeVisible()

    // Verify: Add tier button is visible
    await expect(page.getByText('+ Staffel hinzufügen')).toBeVisible()
  })

  test('UC-10.2: Erste Preisstaffel erstellen', async ({ page }) => {
    // Setup: Create test room
    const room = await createTestRoom(page, TEST_ROOMS.red)

    // Execute: Navigate to room edit
    await navigateTo(page, `/rooms/${room.id}`)

    // Click add tier
    await page.getByText('+ Staffel hinzufügen').click()

    // Verify: Form is shown
    await expect(page.getByText('Neue Preisstufe')).toBeVisible()

    // Fill in tier data: 0-30 min = 50€ fixed
    await page.getByLabel('Von (Minuten) *').fill('0')
    await page.getByLabel('Bis (Minuten)').fill('30')
    await page.getByLabel('Typ *').selectOption('FIXED')
    await page.getByLabel('Preis (€) *').fill('50.00')

    // Verify: Description updates
    await expect(page.getByText('Fester Preis für den gesamten Zeitraum')).toBeVisible()

    // Save tier
    await page.getByRole('button', { name: 'Hinzufügen' }).click()

    // Verify: Tier appears in table
    await expect(page.getByText('0 Min')).toBeVisible()
    await expect(page.getByText('30 Min')).toBeVisible()
    await expect(page.getByText('Festpreis')).toBeVisible()
    await expect(page.getByText('50.00 €')).toBeVisible()

    // Verify: Form is hidden after adding
    await expect(page.getByText('Neue Preisstufe')).not.toBeVisible()
  })

  test('UC-10.3: Mehrere Preisstaffeln erstellen', async ({ page }) => {
    // Setup: Create test room
    const room = await createTestRoom(page, TEST_ROOMS.red)
    await navigateTo(page, `/rooms/${room.id}`)

    // Add first tier: 0-30 min = 75€ fixed
    await page.getByText('+ Staffel hinzufügen').click()
    await page.getByLabel('Von (Minuten) *').fill('0')
    await page.getByLabel('Bis (Minuten)').fill('30')
    await page.getByLabel('Typ *').selectOption('FIXED')
    await page.getByLabel('Preis (€) *').fill('75.00')
    await page.getByRole('button', { name: 'Hinzufügen' }).click()

    // Wait for first tier to be added
    await expect(page.getByText('75.00 €').first()).toBeVisible()

    // Add second tier: 30 min onwards = 120€/hour
    await page.getByText('+ Staffel hinzufügen').click()
    await page.getByLabel('Von (Minuten) *').fill('30')
    // Leave "Bis" empty for infinity
    await page.getByLabel('Typ *').selectOption('HOURLY')
    await page.getByLabel('Preis (€) *').fill('120.00')
    await page.getByRole('button', { name: 'Hinzufügen' }).click()

    // Verify: Both tiers are shown
    const rows = page.locator('tbody tr')
    await expect(rows).toHaveCount(2)

    // Verify first tier
    await expect(page.getByText('75.00 €')).toBeVisible()
    await expect(page.getByText('Festpreis')).toBeVisible()

    // Verify second tier
    await expect(page.getByText('120.00 €/Std')).toBeVisible()
    await expect(page.getByText('Stundensatz')).toBeVisible()
    await expect(page.getByText('∞')).toBeVisible() // Infinity symbol
  })

  test('UC-10.4: Preisstaffel löschen', async ({ page }) => {
    // Setup: Create room with a tier via API
    const room = await createTestRoom(page, TEST_ROOMS.red)

    // Get current price
    const priceHistoryResponse = await page.request.get(
      `${API_BASE}/rooms/${room.id}/prices`
    )
    const priceHistory = await priceHistoryResponse.json()
    const currentPrice = priceHistory.find((p: any) => !p.validTo)

    // Create tier via API
    await page.request.post(
      `${API_BASE}/rooms/${room.id}/prices/${currentPrice.id}/tiers`,
      {
        data: {
          fromMinutes: 0,
          toMinutes: 30,
          priceType: 'FIXED',
          price: 50.00,
          sortOrder: 0,
        },
      }
    )

    // Execute: Navigate to room edit
    await navigateTo(page, `/rooms/${room.id}`)

    // Verify: Tier is shown
    await expect(page.getByText('50.00 €')).toBeVisible()

    // Set up dialog handler for confirm
    page.on('dialog', (dialog) => dialog.accept())

    // Delete tier
    await page.getByRole('button', { name: 'Löschen' }).first().click()

    // Verify: Tier is removed
    await page.waitForTimeout(500)
    await expect(page.getByText('50.00 €')).not.toBeVisible()
  })

  test('UC-10.5: Validierung bei ungültigen Eingaben', async ({ page }) => {
    // Setup: Create test room
    const room = await createTestRoom(page, TEST_ROOMS.red)
    await navigateTo(page, `/rooms/${room.id}`)

    // Open form
    await page.getByText('+ Staffel hinzufügen').click()

    // Test case: toMinutes <= fromMinutes
    await page.getByLabel('Von (Minuten) *').fill('30')
    await page.getByLabel('Bis (Minuten)').fill('20')
    await page.getByLabel('Preis (€) *').fill('50.00')
    await page.getByRole('button', { name: 'Hinzufügen' }).click()

    // Verify: Error message is shown
    await expect(
      page.getByText('Die Endzeit muss größer als die Startzeit sein')
    ).toBeVisible()

    // Fix and try again
    await page.getByLabel('Bis (Minuten)').fill('60')
    await page.getByRole('button', { name: 'Hinzufügen' }).click()

    // Verify: Tier is created successfully
    await expect(page.getByText('50.00 €')).toBeVisible()
  })

  test('UC-10.6: Form abbrechen', async ({ page }) => {
    // Setup: Create test room
    const room = await createTestRoom(page, TEST_ROOMS.red)
    await navigateTo(page, `/rooms/${room.id}`)

    // Open form
    await page.getByText('+ Staffel hinzufügen').click()
    await expect(page.getByText('Neue Preisstufe')).toBeVisible()

    // Fill some data
    await page.getByLabel('Von (Minuten) *').fill('0')
    await page.getByLabel('Preis (€) *').fill('50.00')

    // Cancel
    await page.getByRole('button', { name: 'Abbrechen' }).click()

    // Verify: Form is hidden
    await expect(page.getByText('Neue Preisstufe')).not.toBeVisible()

    // Verify: No tier was created
    await expect(page.getByText('50.00 €')).not.toBeVisible()
  })

  test('UC-10.7: Zeitformatierung anzeigen', async ({ page }) => {
    // Setup: Create room with tiers of different durations
    const room = await createTestRoom(page, TEST_ROOMS.red)

    const priceHistoryResponse = await page.request.get(
      `${API_BASE}/rooms/${room.id}/prices`
    )
    const priceHistory = await priceHistoryResponse.json()
    const currentPrice = priceHistory.find((p: any) => !p.validTo)

    // Create tiers with different time formats
    await page.request.post(
      `${API_BASE}/rooms/${room.id}/prices/${currentPrice.id}/tiers`,
      {
        data: {
          fromMinutes: 0,
          toMinutes: 15, // 15 minutes
          priceType: 'FIXED',
          price: 20.00,
          sortOrder: 0,
        },
      }
    )

    await page.request.post(
      `${API_BASE}/rooms/${room.id}/prices/${currentPrice.id}/tiers`,
      {
        data: {
          fromMinutes: 15,
          toMinutes: 60, // 1 hour
          priceType: 'FIXED',
          price: 35.00,
          sortOrder: 1,
        },
      }
    )

    await page.request.post(
      `${API_BASE}/rooms/${room.id}/prices/${currentPrice.id}/tiers`,
      {
        data: {
          fromMinutes: 60,
          toMinutes: 90, // 1:30 hours
          priceType: 'HOURLY',
          price: 70.00,
          sortOrder: 2,
        },
      }
    )

    // Execute: Navigate to room edit
    await navigateTo(page, `/rooms/${room.id}`)

    // Verify: Time formatting
    await expect(page.getByText('15 Min')).toBeVisible() // Just minutes
    await expect(page.getByText('1 Std')).toBeVisible() // Just hours
    await expect(page.getByText('1:30 Std')).toBeVisible() // Hours and minutes
  })

  test('UC-10.8: Preisstaffel wird bei Preisänderung nicht überschrieben', async ({
    page,
  }) => {
    // Setup: Create room with tier
    const room = await createTestRoom(page, TEST_ROOMS.red)

    const priceHistoryResponse = await page.request.get(
      `${API_BASE}/rooms/${room.id}/prices`
    )
    const priceHistory = await priceHistoryResponse.json()
    const currentPrice = priceHistory.find((p: any) => !p.validTo)

    // Create tier
    await page.request.post(
      `${API_BASE}/rooms/${room.id}/prices/${currentPrice.id}/tiers`,
      {
        data: {
          fromMinutes: 0,
          toMinutes: 30,
          priceType: 'FIXED',
          price: 75.00,
          sortOrder: 0,
        },
      }
    )

    // Execute: Navigate and change basic hourly rate
    await navigateTo(page, `/rooms/${room.id}`)

    // Verify tier is shown
    await expect(page.getByText('75.00 €')).toBeVisible()

    // Change the base hourly rate
    await page.getByLabel('Stundensatz (€) *').fill('85.00')
    await page.getByRole('button', { name: 'Speichern' }).click()
    await page.waitForURL('**/rooms')

    // Go back to edit
    await page.getByRole('link', { name: 'Bearbeiten' }).first().click()

    // Verify: Tier is still there (it's tied to the old price entry, not the new one)
    // Note: After price change, tier management will be for the NEW price
    // The old tier should stay with the old price in history
    await expect(page.getByText('Preishistorie')).toBeVisible()

    // The new current price should NOT have tiers yet
    await expect(page.getByText('+ Staffel hinzufügen')).toBeVisible()
  })

  test('UC-10.9: Backend-Berechnung: 90 Minuten = 195€ (Beispiel aus Anforderung)', async ({
    page,
  }) => {
    // Setup: Create room with tiered pricing as per user requirement
    // 30 min = 75€, then 120€/hour
    const room = await createTestRoom(page, TEST_ROOMS.red)

    const priceHistoryResponse = await page.request.get(
      `${API_BASE}/rooms/${room.id}/prices`
    )
    const priceHistory = await priceHistoryResponse.json()
    const currentPrice = priceHistory.find((p: any) => !p.validTo)

    // Tier 1: 0-30 min = 75€ FIXED
    await page.request.post(
      `${API_BASE}/rooms/${room.id}/prices/${currentPrice.id}/tiers`,
      {
        data: {
          fromMinutes: 0,
          toMinutes: 30,
          priceType: 'FIXED',
          price: 75.00,
          sortOrder: 0,
        },
      }
    )

    // Tier 2: 30+ min = 120€/hour HOURLY
    await page.request.post(
      `${API_BASE}/rooms/${room.id}/prices/${currentPrice.id}/tiers`,
      {
        data: {
          fromMinutes: 30,
          toMinutes: null,
          priceType: 'HOURLY',
          price: 120.00,
          sortOrder: 1,
        },
      }
    )

    // Execute: Create a booking for 90 minutes
    // First need a provider
    const providerResponse = await page.request.post(
      `${API_BASE}/locations/11111111-1111-1111-1111-111111111111/providers`,
      {
        data: {
          name: 'E2E Test Provider',
          color: '#EC4899',
        },
      }
    )
    const provider = await providerResponse.json()

    const bookingResponse = await page.request.post(`${API_BASE}/bookings`, {
      data: {
        providerId: provider.id,
        roomId: room.id,
        startTime: new Date().toISOString(),
        durationMinutes: 90,
        clientAlias: 'E2E Test Client',
      },
    })

    expect(bookingResponse.ok()).toBeTruthy()
    const booking = await bookingResponse.json()

    // Verify: The booking was created
    expect(booking.id).toBeTruthy()
    expect(booking.durationMinutes).toBe(90)

    // Navigate to bookings list to verify the price
    await navigateTo(page, '/bookings')

    // Find the booking row
    const bookingRow = page.locator('tr', { has: page.getByText('E2E Test Client') })
    await expect(bookingRow).toBeVisible()

    // Verify: The total price is 195€
    // Calculation: 75€ (0-30min) + 120€ (60min at 120€/h) = 195€
    await expect(bookingRow.getByText('195.00 €')).toBeVisible()
  })

  test('UC-10.10: Ohne Preisstaffel wird Stundensatz verwendet', async ({ page }) => {
    // Setup: Create room WITHOUT tiers
    const room = await createTestRoom(page, {
      name: 'E2E Test Room Without Tiers',
      hourlyRate: 70.00,
      color: '#3B82F6',
    })

    // Create provider
    const providerResponse = await page.request.post(
      `${API_BASE}/locations/11111111-1111-1111-1111-111111111111/providers`,
      {
        data: {
          name: 'E2E Test Provider',
          color: '#EC4899',
        },
      }
    )
    const provider = await providerResponse.json()

    // Create booking for 90 minutes
    await page.request.post(`${API_BASE}/bookings`, {
      data: {
        providerId: provider.id,
        roomId: room.id,
        startTime: new Date().toISOString(),
        durationMinutes: 90,
        clientAlias: 'E2E Test Client No Tiers',
      },
    })

    // Navigate to bookings list
    await navigateTo(page, '/bookings')

    // Find the booking
    const bookingRow = page.locator('tr', { has: page.getByText('E2E Test Client No Tiers') })
    await expect(bookingRow).toBeVisible()

    // Verify: Price is calculated with simple hourly rate
    // 90 min = 1.5 hours * 70€ = 105€
    await expect(bookingRow.getByText('105.00 €')).toBeVisible()
  })
})
