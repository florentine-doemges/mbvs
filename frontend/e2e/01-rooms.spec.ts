import { test, expect } from '@playwright/test'
import {
  deleteAllTestData,
  navigateTo,
  TEST_ROOMS,
  setupTestData,
  createTestRoom
} from './helpers'

test.describe('UC-3: Raumverwaltung', () => {
  test.beforeEach(async ({ page }) => {
    await deleteAllTestData(page)
  })

  test.afterAll(async ({ page }) => {
    await deleteAllTestData(page)
  })

  test('UC-3.1: Raumübersicht öffnen', async ({ page }) => {
    // Setup: Create test room
    await createTestRoom(page, TEST_ROOMS.red)

    // Execute: Navigate to rooms page
    await navigateTo(page, '/rooms')

    // Verify: Page loads correctly
    await expect(page.locator('h2').filter({ hasText: 'Räume' })).toBeVisible()

    // Verify: Room is displayed
    await expect(page.getByText(TEST_ROOMS.red.name)).toBeVisible()
    await expect(page.getByText(`${TEST_ROOMS.red.hourlyRate.toFixed(2)} €`)).toBeVisible()
    await expect(page.getByText(TEST_ROOMS.red.color)).toBeVisible()
  })

  test('UC-3.2: Inaktive Räume anzeigen', async ({ page }) => {
    // Setup: Create and deactivate a room
    const room = await createTestRoom(page, TEST_ROOMS.red)
    await page.request.put(`/api/rooms/${room.id}`, {
      data: {
        name: room.name,
        hourlyRate: room.hourlyRate,
        color: room.color,
        active: false,
        sortOrder: room.sortOrder
      }
    })

    // Execute: Navigate and check "show inactive"
    await navigateTo(page, '/rooms')

    // Initially inactive room should not be visible
    await expect(page.getByText(TEST_ROOMS.red.name)).not.toBeVisible()

    // Check "show inactive"
    await page.getByLabel('Inaktive anzeigen').check()
    await page.waitForTimeout(500)

    // Verify: Inactive room is now visible
    await expect(page.getByText(TEST_ROOMS.red.name)).toBeVisible()
  })

  test('UC-3.3: Neuen Raum erstellen', async ({ page }) => {
    // Execute: Navigate to new room form
    await navigateTo(page, '/rooms')
    await page.getByRole('link', { name: 'Neuer Raum' }).click()

    // Verify: Form is shown
    await expect(page.getByText('Neuer Raum')).toBeVisible()

    // Fill form
    await page.getByLabel('Name *').fill(TEST_ROOMS.red.name)
    await page.getByLabel('Stundensatz (€) *').fill(TEST_ROOMS.red.hourlyRate.toString())

    // Select color
    const colorButton = page.locator(`button[style*="${TEST_ROOMS.red.color}"]`).first()
    await colorButton.click()

    // Save
    await page.getByRole('button', { name: 'Speichern' }).click()

    // Verify: Redirected to rooms list
    await page.waitForURL('**/rooms')

    // Verify: New room is in the list
    await expect(page.getByText(TEST_ROOMS.red.name)).toBeVisible()
  })

  test('UC-3.4: Raum bearbeiten', async ({ page }) => {
    // Setup: Create room
    const room = await createTestRoom(page, TEST_ROOMS.red)

    // Execute: Navigate to edit
    await navigateTo(page, '/rooms')
    await page.getByRole('link', { name: 'Bearbeiten' }).first().click()

    // Verify: Form shows current values
    await expect(page.getByLabel('Name *')).toHaveValue(TEST_ROOMS.red.name)

    // Change name
    const newName = TEST_ROOMS.red.name + ' (Bearbeitet)'
    await page.getByLabel('Name *').fill(newName)

    // Save
    await page.getByRole('button', { name: 'Speichern' }).click()

    // Verify: Changes are saved
    await page.waitForURL('**/rooms')
    await expect(page.getByText(newName)).toBeVisible()
  })

  test('UC-3.4.1: Raum-Preis ändern mit Preishistorie', async ({ page }) => {
    // Setup: Create room
    const room = await createTestRoom(page, TEST_ROOMS.red)

    // Execute: Navigate to edit
    await navigateTo(page, `/rooms/${room.id}`)

    // Verify: Current price is shown
    const currentPrice = TEST_ROOMS.red.hourlyRate.toString()
    await expect(page.getByLabel('Stundensatz (€) *')).toHaveValue(currentPrice)

    // Change price
    const newPrice = '85.00'
    await page.getByLabel('Stundensatz (€) *').fill(newPrice)

    // Verify: Info message is shown
    await expect(
      page.getByText('Der Preis wird geändert. Der alte Preis bleibt in der Historie erhalten.')
    ).toBeVisible()

    // Save
    await page.getByRole('button', { name: 'Speichern' }).click()
    await page.waitForURL('**/rooms')

    // Verify: Price is updated
    await expect(page.getByText(`${newPrice} €`)).toBeVisible()

    // Verify: Price history was created
    await page.getByRole('link', { name: 'Bearbeiten' }).first().click()

    // Should see price history table
    await expect(page.getByText('Preishistorie')).toBeVisible()
    await expect(page.getByText(`${currentPrice} €`)).toBeVisible() // Old price
    await expect(page.getByText(`${newPrice} €`)).toBeVisible() // New price
    await expect(page.getByText('Aktuell')).toBeVisible() // Current price badge
  })

  test('UC-3.5: Historischen Preis übernehmen', async ({ page }) => {
    // Setup: Create room and change price twice to create history
    const room = await createTestRoom(page, TEST_ROOMS.red)
    const originalPrice = TEST_ROOMS.red.hourlyRate

    // Change price first time
    await page.request.post(`/api/rooms/${room.id}/prices`, {
      data: { price: 85.00, validFrom: new Date().toISOString() }
    })

    // Change price second time
    await page.request.post(`/api/rooms/${room.id}/prices`, {
      data: { price: 90.00, validFrom: new Date().toISOString() }
    })

    // Execute: Navigate to edit
    await navigateTo(page, `/rooms/${room.id}`)

    // Find the historical price row and click "Übernehmen"
    const historyRow = page.locator('tr', { has: page.getByText(`${originalPrice.toFixed(2)} €`) })
    await historyRow.getByRole('button', { name: 'Übernehmen' }).click()

    // Verify: Price field is updated
    await expect(page.getByLabel('Stundensatz (€) *')).toHaveValue(originalPrice.toString())

    // Verify: Info message shows
    await expect(page.getByText('Der Preis wird geändert')).toBeVisible()
  })

  test('UC-3.6: Raum deaktivieren', async ({ page }) => {
    // Setup: Create active room
    const room = await createTestRoom(page, TEST_ROOMS.red)

    // Execute: Navigate to edit
    await navigateTo(page, `/rooms/${room.id}`)

    // Deactivate
    await page.getByLabel('Aktiv').uncheck()
    await page.getByRole('button', { name: 'Speichern' }).click()
    await page.waitForURL('**/rooms')

    // Verify: Room is not visible by default
    await expect(page.getByText(TEST_ROOMS.red.name)).not.toBeVisible()

    // Show inactive
    await page.getByLabel('Inaktive anzeigen').check()
    await page.waitForTimeout(500)

    // Verify: Room is shown as inactive
    const row = page.locator('tr', { has: page.getByText(TEST_ROOMS.red.name) })
    await expect(row.getByText('Inaktiv')).toBeVisible()
  })

  test('UC-3.7: Raum löschen (ohne Buchungen)', async ({ page }) => {
    // Setup: Create room
    await createTestRoom(page, TEST_ROOMS.red)

    // Execute: Navigate to rooms and delete
    await navigateTo(page, '/rooms')

    // Set up dialog handler before clicking delete
    page.on('dialog', dialog => dialog.accept())

    // Click delete
    await page.getByRole('button', { name: 'Löschen' }).first().click()

    // Verify: Room is deleted
    await page.waitForTimeout(1000)
    await expect(page.getByText(TEST_ROOMS.red.name)).not.toBeVisible()
  })
})
