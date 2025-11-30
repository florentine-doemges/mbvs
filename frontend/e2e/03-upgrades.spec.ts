import { test, expect } from '@playwright/test'
import {
  deleteAllTestData,
  navigateTo,
  TEST_UPGRADES,
  createTestUpgrade
} from './helpers'

test.describe('UC-5: Upgrade-Verwaltung', () => {
  test.beforeEach(async ({ page }) => {
    await deleteAllTestData(page)
  })

  test.afterAll(async ({ page }) => {
    await deleteAllTestData(page)
  })

  test('UC-5.1: Upgrade-Übersicht öffnen', async ({ page }) => {
    // Setup
    await createTestUpgrade(page, TEST_UPGRADES.champagne)

    // Execute
    await navigateTo(page, '/upgrades')

    // Verify
    await expect(page.locator('h2').filter({ hasText: 'Upgrades' })).toBeVisible()
    await expect(page.getByText(TEST_UPGRADES.champagne.name)).toBeVisible()
  })

  test('UC-5.2: Inaktive Upgrades anzeigen', async ({ page }) => {
    // Setup: Create and deactivate
    const upgrade = await createTestUpgrade(page, TEST_UPGRADES.champagne)
    await page.request.put(`/api/upgrades/${upgrade.id}`, {
      data: {
        name: upgrade.name,
        price: upgrade.price,
        active: false
      }
    })

    // Execute
    await navigateTo(page, '/upgrades')

    // Initially not visible
    await expect(page.getByText(TEST_UPGRADES.champagne.name)).not.toBeVisible()

    // Show inactive
    await page.getByLabel('Inaktive anzeigen').check()
    await page.waitForTimeout(500)

    // Verify
    await expect(page.getByText(TEST_UPGRADES.champagne.name)).toBeVisible()
    const row = page.locator('tr', { has: page.getByText(TEST_UPGRADES.champagne.name) })
    await expect(row.getByText('Inaktiv')).toBeVisible()
  })

  test('UC-5.3: Neues Upgrade erstellen', async ({ page }) => {
    // Execute
    await navigateTo(page, '/upgrades')
    await page.getByRole('link', { name: 'Neues Upgrade' }).click()

    // Verify form
    await expect(page.getByText('Neues Upgrade')).toBeVisible()

    // Fill form
    await page.getByLabel('Name *').fill(TEST_UPGRADES.champagne.name)
    await page.getByLabel('Preis (EUR) *').fill(TEST_UPGRADES.champagne.price.toString())

    // Save
    await page.getByRole('button', { name: 'Speichern' }).click()
    await page.waitForURL('**/upgrades')

    // Verify
    await expect(page.getByText(TEST_UPGRADES.champagne.name)).toBeVisible()
  })

  test('UC-5.4: Upgrade bearbeiten und Preis ändern', async ({ page }) => {
    // Setup
    const upgrade = await createTestUpgrade(page, TEST_UPGRADES.champagne)

    // Execute: Navigate to edit
    await navigateTo(page, `/upgrades/${upgrade.id}`)

    // Verify current values
    await expect(page.getByLabel('Name *')).toHaveValue(TEST_UPGRADES.champagne.name)
    await expect(page.getByLabel('Preis (EUR) *')).toHaveValue(
      TEST_UPGRADES.champagne.price.toString()
    )

    // Change price
    const newPrice = '55.00'
    await page.getByLabel('Preis (EUR) *').fill(newPrice)

    // Verify info message
    await expect(
      page.getByText('Der Preis wird geändert. Der alte Preis bleibt in der Historie erhalten.')
    ).toBeVisible()

    // Save
    await page.getByRole('button', { name: 'Speichern' }).click()
    await page.waitForURL('**/upgrades')

    // Verify price updated
    await expect(page.getByText('55,00 €')).toBeVisible()

    // Verify price history was created
    await page.locator('td', { hasText: '55,00 €' }).click()
    await page.waitForURL(`**/upgrades/${upgrade.id}`)

    await expect(page.getByText('Preishistorie')).toBeVisible()
    await expect(page.getByText('50,00 €')).toBeVisible() // Old price
    await expect(page.getByText('55,00 €')).toBeVisible() // New price
    await expect(page.getByText('Aktuell')).toBeVisible()
  })

  test('UC-5.5: Historischen Upgrade-Preis übernehmen', async ({ page }) => {
    // Setup: Create upgrade and change price twice
    const upgrade = await createTestUpgrade(page, TEST_UPGRADES.champagne)
    const originalPrice = TEST_UPGRADES.champagne.price

    // Change price twice
    await page.request.post(`/api/upgrades/${upgrade.id}/prices`, {
      data: { price: 60.00, validFrom: new Date().toISOString() }
    })
    await page.request.post(`/api/upgrades/${upgrade.id}/prices`, {
      data: { price: 65.00, validFrom: new Date().toISOString() }
    })

    // Execute
    await navigateTo(page, `/upgrades/${upgrade.id}`)

    // Click "Übernehmen" on historical price
    const historyRow = page.locator('tr', { has: page.getByText(`${originalPrice.toFixed(2)} €`) })
    await historyRow.getByRole('button', { name: 'Übernehmen' }).click()

    // Verify: Price field updated
    await expect(page.getByLabel('Preis (EUR) *')).toHaveValue(originalPrice.toString())
    await expect(page.getByText('Der Preis wird geändert')).toBeVisible()
  })

  test('UC-5.6: Upgrade deaktivieren', async ({ page }) => {
    // Setup
    const upgrade = await createTestUpgrade(page, TEST_UPGRADES.champagne)

    // Execute
    await navigateTo(page, `/upgrades/${upgrade.id}`)
    await page.getByLabel('Aktiv').uncheck()
    await page.getByRole('button', { name: 'Speichern' }).click()
    await page.waitForURL('**/upgrades')

    // Verify: Not visible by default
    await expect(page.getByText(TEST_UPGRADES.champagne.name)).not.toBeVisible()

    // Show inactive
    await page.getByLabel('Inaktive anzeigen').check()
    await page.waitForTimeout(500)

    // Verify: Shown as inactive
    const row = page.locator('tr', { has: page.getByText(TEST_UPGRADES.champagne.name) })
    await expect(row.getByText('Inaktiv')).toBeVisible()
  })

  test('UC-5.7: Upgrade löschen', async ({ page }) => {
    // Setup
    await createTestUpgrade(page, TEST_UPGRADES.champagne)

    // Execute
    await navigateTo(page, '/upgrades')

    page.on('dialog', dialog => dialog.accept())

    await page.getByRole('button', { name: 'Löschen' }).first().click()
    await page.waitForTimeout(1000)

    // Verify
    await expect(page.getByText(TEST_UPGRADES.champagne.name)).not.toBeVisible()
  })
})
