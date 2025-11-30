import { test, expect } from '@playwright/test'
import {
  deleteAllTestData,
  navigateTo,
  setupTestData,
  createTestBooking,
  getTodayAtTime,
  getTomorrowAtTime
} from './helpers'

test.describe('UC-2: Buchungsübersicht', () => {
  let testData: Awaited<ReturnType<typeof setupTestData>>

  test.beforeEach(async ({ page }) => {
    await deleteAllTestData(page)
    testData = await setupTestData(page)
  })

  test.afterAll(async ({ page }) => {
    await deleteAllTestData(page)
  })

  test('UC-2.1: Buchungsübersicht öffnen', async ({ page }) => {
    // Setup: Create test booking
    await createTestBooking(page, {
      startTime: getTodayAtTime(14, 0),
      durationMinutes: 60,
      providerId: testData.providers.anna.id,
      roomId: testData.rooms.red.id,
      clientAlias: 'E2E Test Kunde A'
    })

    // Execute
    await navigateTo(page, '/bookings')

    // Verify
    await expect(page.locator('h2').filter({ hasText: 'Buchungen' })).toBeVisible()
    await expect(page.getByText('E2E Test Kunde A')).toBeVisible()
    await expect(page.getByText(testData.providers.anna.name)).toBeVisible()
    await expect(page.getByText(testData.rooms.red.name)).toBeVisible()
  })

  test('UC-2.2: Buchungen filtern nach Provider', async ({ page }) => {
    // Setup: Create bookings with different providers
    await createTestBooking(page, {
      startTime: getTodayAtTime(14, 0),
      durationMinutes: 60,
      providerId: testData.providers.anna.id,
      roomId: testData.rooms.red.id,
      clientAlias: 'E2E Test Anna Kunde'
    })

    await createTestBooking(page, {
      startTime: getTodayAtTime(16, 0),
      durationMinutes: 60,
      providerId: testData.providers.max.id,
      roomId: testData.rooms.blue.id,
      clientAlias: 'E2E Test Max Kunde'
    })

    // Execute
    await navigateTo(page, '/bookings')

    // Both bookings should be visible
    await expect(page.getByText('E2E Test Anna Kunde')).toBeVisible()
    await expect(page.getByText('E2E Test Max Kunde')).toBeVisible()

    // Apply provider filter
    await page.getByLabel('Provider').selectOption(testData.providers.anna.id)
    await page.waitForTimeout(1000)

    // Verify: Only Anna's booking is visible
    await expect(page.getByText('E2E Test Anna Kunde')).toBeVisible()
    await expect(page.getByText('E2E Test Max Kunde')).not.toBeVisible()
  })

  test('UC-2.3: Buchung inline bearbeiten - Kundenname ändern', async ({ page }) => {
    // Setup
    await createTestBooking(page, {
      startTime: getTodayAtTime(14, 0),
      durationMinutes: 60,
      providerId: testData.providers.anna.id,
      roomId: testData.rooms.red.id,
      clientAlias: 'E2E Test Kunde A'
    })

    // Execute
    await navigateTo(page, '/bookings')

    // Click on client name to edit
    const clientCell = page.locator('td', { hasText: 'E2E Test Kunde A' })
    await clientCell.click()

    // Verify: Input field appears
    const input = page.locator('input[type="text"][value="E2E Test Kunde A"]')
    await expect(input).toBeVisible()

    // Change value
    await input.fill('E2E Test Kunde B')

    // Save
    await page.getByRole('button', { name: '✓' }).click()
    await page.waitForTimeout(1000)

    // Verify: Value is updated
    await expect(page.getByText('E2E Test Kunde B')).toBeVisible()
    await expect(page.getByText('E2E Test Kunde A')).not.toBeVisible()
  })

  test('UC-2.3.1: Buchung inline bearbeiten abbrechen', async ({ page }) => {
    // Setup
    await createTestBooking(page, {
      startTime: getTodayAtTime(14, 0),
      durationMinutes: 60,
      providerId: testData.providers.anna.id,
      roomId: testData.rooms.red.id,
      clientAlias: 'E2E Test Original'
    })

    // Execute
    await navigateTo(page, '/bookings')

    // Start editing
    await page.locator('td', { hasText: 'E2E Test Original' }).click()
    const input = page.locator('input[type="text"][value="E2E Test Original"]')
    await input.fill('E2E Test Geändert')

    // Cancel
    await page.getByRole('button', { name: '✗' }).click()
    await page.waitForTimeout(500)

    // Verify: Original value is still shown
    await expect(page.getByText('E2E Test Original')).toBeVisible()
    await expect(page.getByText('E2E Test Geändert')).not.toBeVisible()
  })

  test('UC-2.4: Buchung erweitert bearbeiten (Preis-Klick)', async ({ page }) => {
    // Setup
    const booking = await createTestBooking(page, {
      startTime: getTodayAtTime(14, 0),
      durationMinutes: 60,
      providerId: testData.providers.anna.id,
      roomId: testData.rooms.red.id,
      clientAlias: 'E2E Test Kunde'
    })

    // Execute
    await navigateTo(page, '/bookings')

    // Click on price (should open modal)
    const priceCell = page.locator('td').filter({ hasText: /^\d+,\d{2}\s€$/ }).first()
    await priceCell.click()

    // Verify: Modal opens with all booking details
    await expect(page.locator('.modal, [role="dialog"]').or(page.locator('text=Upgrades'))).toBeVisible()

    // Modal should show upgrade section
    await expect(page.getByText('Upgrades').or(page.getByText('Keine Upgrades'))).toBeVisible()
  })

  test('UC-2.5: Buchung im Kalender anzeigen', async ({ page }) => {
    // Setup
    await createTestBooking(page, {
      startTime: getTodayAtTime(14, 0),
      durationMinutes: 60,
      providerId: testData.providers.anna.id,
      roomId: testData.rooms.red.id,
      clientAlias: 'E2E Test Kalender'
    })

    // Execute
    await navigateTo(page, '/bookings')

    // Click calendar button
    await page.getByRole('button', { name: '📅' }).first().click()

    // Verify: Navigated to calendar
    await page.waitForURL('**/calendar')
    await expect(page.locator('h2').filter({ hasText: 'Kalender' })).toBeVisible()

    // Booking should be visible in calendar
    await expect(page.getByText('E2E Test Kalender')).toBeVisible()
  })

  test('UC-2.6: Buchung aus Übersicht löschen', async ({ page }) => {
    // Setup
    await createTestBooking(page, {
      startTime: getTodayAtTime(14, 0),
      durationMinutes: 60,
      providerId: testData.providers.anna.id,
      roomId: testData.rooms.red.id,
      clientAlias: 'E2E Test Zu Löschen'
    })

    // Execute
    await navigateTo(page, '/bookings')

    // Verify booking exists
    await expect(page.getByText('E2E Test Zu Löschen')).toBeVisible()

    // Delete
    page.on('dialog', dialog => dialog.accept())
    await page.getByRole('button', { name: '🗑️' }).first().click()
    await page.waitForTimeout(1000)

    // Verify: Booking is gone
    await expect(page.getByText('E2E Test Zu Löschen')).not.toBeVisible()
  })
})
