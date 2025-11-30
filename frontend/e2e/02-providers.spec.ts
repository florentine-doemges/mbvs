import { test, expect } from '@playwright/test'
import {
  deleteAllTestData,
  navigateTo,
  TEST_PROVIDERS,
  createTestProvider
} from './helpers'

test.describe('UC-4: Provider-Verwaltung', () => {
  test.beforeEach(async ({ page }) => {
    await deleteAllTestData(page)
  })

  test.afterAll(async ({ page }) => {
    await deleteAllTestData(page)
  })

  test('UC-4.1: Provider-Übersicht öffnen', async ({ page }) => {
    // Setup
    await createTestProvider(page, TEST_PROVIDERS.anna)

    // Execute
    await navigateTo(page, '/providers')

    // Verify
    await expect(page.locator('h2').filter({ hasText: 'Provider' })).toBeVisible()
    await expect(page.getByText(TEST_PROVIDERS.anna.name)).toBeVisible()
    await expect(page.getByText(TEST_PROVIDERS.anna.color)).toBeVisible()
  })

  test('UC-4.2: Inaktive Provider anzeigen', async ({ page }) => {
    // Setup: Create and deactivate provider
    const provider = await createTestProvider(page, TEST_PROVIDERS.anna)
    await page.request.put(`/api/providers/${provider.id}`, {
      data: {
        name: provider.name,
        color: provider.color,
        active: false,
        sortOrder: provider.sortOrder
      }
    })

    // Execute
    await navigateTo(page, '/providers')

    // Initially not visible
    await expect(page.getByText(TEST_PROVIDERS.anna.name)).not.toBeVisible()

    // Show inactive
    await page.getByLabel('Inaktive anzeigen').check()
    await page.waitForTimeout(500)

    // Verify: Now visible
    await expect(page.getByText(TEST_PROVIDERS.anna.name)).toBeVisible()
    const row = page.locator('tr', { has: page.getByText(TEST_PROVIDERS.anna.name) })
    await expect(row.getByText('Inaktiv')).toBeVisible()
  })

  test('UC-4.3: Neuen Provider erstellen', async ({ page }) => {
    // Execute
    await navigateTo(page, '/providers')
    await page.getByRole('link', { name: 'Neuer Provider' }).click()

    // Verify form
    await expect(page.getByText('Neuer Provider')).toBeVisible()

    // Fill form
    await page.getByLabel('Name *').fill(TEST_PROVIDERS.anna.name)

    // Select color
    const colorButton = page.locator(`button[style*="${TEST_PROVIDERS.anna.color}"]`).first()
    await colorButton.click()

    // Save
    await page.getByRole('button', { name: 'Speichern' }).click()
    await page.waitForURL('**/providers')

    // Verify
    await expect(page.getByText(TEST_PROVIDERS.anna.name)).toBeVisible()
  })

  test('UC-4.4: Provider bearbeiten', async ({ page }) => {
    // Setup
    await createTestProvider(page, TEST_PROVIDERS.anna)

    // Execute
    await navigateTo(page, '/providers')
    await page.getByRole('link', { name: 'Bearbeiten' }).first().click()

    // Verify form shows values
    await expect(page.getByLabel('Name *')).toHaveValue(TEST_PROVIDERS.anna.name)

    // Change name
    const newName = TEST_PROVIDERS.anna.name + ' (Bearbeitet)'
    await page.getByLabel('Name *').fill(newName)

    // Save
    await page.getByRole('button', { name: 'Speichern' }).click()
    await page.waitForURL('**/providers')

    // Verify
    await expect(page.getByText(newName)).toBeVisible()
  })

  test('UC-4.5: Provider deaktivieren', async ({ page }) => {
    // Setup
    const provider = await createTestProvider(page, TEST_PROVIDERS.anna)

    // Execute
    await navigateTo(page, `/providers/${provider.id}`)
    await page.getByLabel('Aktiv').uncheck()
    await page.getByRole('button', { name: 'Speichern' }).click()
    await page.waitForURL('**/providers')

    // Verify: Not visible by default
    await expect(page.getByText(TEST_PROVIDERS.anna.name)).not.toBeVisible()

    // Show inactive
    await page.getByLabel('Inaktive anzeigen').check()
    await page.waitForTimeout(500)

    // Verify: Shown as inactive
    const row = page.locator('tr', { has: page.getByText(TEST_PROVIDERS.anna.name) })
    await expect(row.getByText('Inaktiv')).toBeVisible()
  })

  test('UC-4.6: Provider löschen (ohne Buchungen)', async ({ page }) => {
    // Setup
    await createTestProvider(page, TEST_PROVIDERS.anna)

    // Execute
    await navigateTo(page, '/providers')

    // Set up dialog handler
    page.on('dialog', dialog => dialog.accept())

    // Delete
    await page.getByRole('button', { name: 'Löschen' }).first().click()
    await page.waitForTimeout(1000)

    // Verify: Deleted
    await expect(page.getByText(TEST_PROVIDERS.anna.name)).not.toBeVisible()
  })
})
