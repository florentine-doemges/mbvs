import { test, expect } from '@playwright/test'
import {
  deleteAllTestData,
  navigateTo,
  setupTestData,
  createTestBooking,
  getTodayAtTime
} from './helpers'

test.describe('UC-1: Kalender-Verwaltung', () => {
  let testData: Awaited<ReturnType<typeof setupTestData>>

  test.beforeEach(async ({ page }) => {
    await deleteAllTestData(page)
    testData = await setupTestData(page)
  })

  test.afterAll(async ({ page }) => {
    await deleteAllTestData(page)
  })

  test('UC-1.1: Kalender-Ansicht öffnen', async ({ page }) => {
    // Setup: Create a booking
    await createTestBooking(page, {
      startTime: getTodayAtTime(14, 0),
      durationMinutes: 60,
      providerId: testData.providers.anna.id,
      roomId: testData.rooms.red.id,
      clientAlias: 'E2E Test Kalender Kunde'
    })

    // Execute
    await navigateTo(page, '/calendar')

    // Verify: Calendar is shown
    await expect(page.locator('h2').filter({ hasText: 'Kalender' })).toBeVisible()

    // Verify: Rooms are shown as rows
    await expect(page.getByText(testData.rooms.red.name)).toBeVisible()
    await expect(page.getByText(testData.rooms.blue.name)).toBeVisible()

    // Verify: Booking is shown
    await expect(page.getByText('E2E Test Kalender Kunde')).toBeVisible()
  })

  test('UC-1.2: Datum im Kalender wechseln', async ({ page }) => {
    // Setup: Create booking for today
    await createTestBooking(page, {
      startTime: getTodayAtTime(14, 0),
      durationMinutes: 60,
      providerId: testData.providers.anna.id,
      roomId: testData.rooms.red.id,
      clientAlias: 'E2E Test Heute'
    })

    // Execute
    await navigateTo(page, '/calendar')

    // Verify: Today's booking is visible
    await expect(page.getByText('E2E Test Heute')).toBeVisible()

    // Navigate to next day
    await page.getByRole('button', { name: 'Nächster Tag' }).or(page.getByRole('button', { name: '→' })).click()
    await page.waitForTimeout(1000)

    // Verify: Today's booking is not visible anymore
    await expect(page.getByText('E2E Test Heute')).not.toBeVisible()

    // Navigate back
    await page.getByRole('button', { name: 'Vorheriger Tag' }).or(page.getByRole('button', { name: '←' })).click()
    await page.waitForTimeout(1000)

    // Verify: Today's booking is visible again
    await expect(page.getByText('E2E Test Heute')).toBeVisible()
  })

  test('UC-1.3: Neue Buchung per Klick erstellen', async ({ page }) => {
    // Execute
    await navigateTo(page, '/calendar')

    // Click on a time slot to create booking
    // Find the calendar grid and click on a cell
    const calendarGrid = page.locator('.calendar-grid, [class*="calendar"]').first()

    // Try to find a clickable time slot
    // This might need adjustment based on actual calendar implementation
    const timeSlot = page.locator('[data-time], [class*="time-slot"]').first()

    // If direct slot selection doesn't work, we'll use the "Neue Buchung" button
    const newBookingButton = page.getByRole('button', { name: 'Neue Buchung' })
      .or(page.getByRole('button', { name: /Buchung erstellen/i }))

    await newBookingButton.click()

    // Verify: Modal opens
    await expect(
      page.locator('text=Neue Buchung').or(page.locator('text=Buchung erstellen'))
    ).toBeVisible()

    // Fill booking form
    await page.locator('select[name="providerId"], [data-test="provider-select"]').first().selectOption(testData.providers.anna.id)
    await page.locator('select[name="roomId"], [data-test="room-select"]').first().selectOption(testData.rooms.red.id)
    await page.locator('input[name="clientAlias"], [placeholder*="Kunde"]').first().fill('E2E Test Neu')

    // Save
    await page.getByRole('button', { name: 'Speichern' }).or(page.getByRole('button', { name: 'Erstellen' })).click()
    await page.waitForTimeout(1000)

    // Verify: Booking appears in calendar
    await expect(page.getByText('E2E Test Neu')).toBeVisible()
  })

  test('UC-1.5: Buchung aus Kalender löschen', async ({ page }) => {
    // Setup
    await createTestBooking(page, {
      startTime: getTodayAtTime(14, 0),
      durationMinutes: 60,
      providerId: testData.providers.anna.id,
      roomId: testData.rooms.red.id,
      clientAlias: 'E2E Test Löschen'
    })

    // Execute
    await navigateTo(page, '/calendar')

    // Click on booking
    await page.getByText('E2E Test Löschen').click()
    await page.waitForTimeout(500)

    // Modal should open - click delete
    page.on('dialog', dialog => dialog.accept())

    await page.getByRole('button', { name: 'Löschen' }).click()
    await page.waitForTimeout(1000)

    // Verify: Booking is gone
    await expect(page.getByText('E2E Test Löschen')).not.toBeVisible()
  })
})

test.describe('UC-7: Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await deleteAllTestData(page)
  })

  test('UC-7.1: Zwischen Seiten navigieren', async ({ page }) => {
    // Start at calendar
    await navigateTo(page, '/calendar')
    await expect(page.locator('h2').filter({ hasText: 'Kalender' })).toBeVisible()

    // Navigate to bookings
    await page.getByRole('link', { name: 'Buchungen' }).click()
    await page.waitForURL('**/bookings')
    await expect(page.locator('h2').filter({ hasText: 'Buchungen' })).toBeVisible()

    // Navigate to rooms
    await page.getByRole('link', { name: 'Räume' }).click()
    await page.waitForURL('**/rooms')
    await expect(page.locator('h2').filter({ hasText: 'Räume' })).toBeVisible()

    // Navigate to providers
    await page.getByRole('link', { name: 'Provider' }).click()
    await page.waitForURL('**/providers')
    await expect(page.locator('h2').filter({ hasText: 'Provider' })).toBeVisible()

    // Navigate to upgrades
    await page.getByRole('link', { name: 'Upgrades' }).click()
    await page.waitForURL('**/upgrades')
    await expect(page.locator('h2').filter({ hasText: 'Upgrades' })).toBeVisible()

    // Navigate to settings
    await page.getByRole('link', { name: 'Einstellungen' }).click()
    await page.waitForURL('**/settings')
    await expect(page.locator('h2').filter({ hasText: 'Buchungsdauern' })).toBeVisible()
  })
})
