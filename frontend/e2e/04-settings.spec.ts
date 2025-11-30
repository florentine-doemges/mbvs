import { test, expect } from '@playwright/test'
import {
  deleteAllTestData,
  navigateTo,
  TEST_DURATIONS,
  createTestDuration
} from './helpers'

test.describe('UC-6: Einstellungen - Buchungsdauern', () => {
  test.beforeEach(async ({ page }) => {
    await deleteAllTestData(page)
  })

  test.afterAll(async ({ page }) => {
    await deleteAllTestData(page)
  })

  test('UC-6.1: Einstellungen öffnen', async ({ page }) => {
    // Setup
    await createTestDuration(page, TEST_DURATIONS.oneHour)

    // Execute
    await navigateTo(page, '/settings')

    // Verify
    await expect(page.locator('h2').filter({ hasText: 'Buchungsdauern' })).toBeVisible()
    await expect(page.getByText(TEST_DURATIONS.oneHour.label)).toBeVisible()
    await expect(page.getByText('60 Minuten')).toBeVisible()
  })

  test('UC-6.2: Neue feste Buchungsdauer erstellen', async ({ page }) => {
    // Execute
    await navigateTo(page, '/settings')
    await page.getByRole('button', { name: 'Neue Dauer' }).click()

    // Verify: Form appears
    const form = page.locator('form').first()
    await expect(form).toBeVisible()

    // Fill form
    await form.getByLabel('Bezeichnung *').fill(TEST_DURATIONS.oneHour.label)
    // Variable duration should not be checked
    await expect(form.getByLabel('Variable Dauer')).not.toBeChecked()

    // Fill duration
    await form.getByLabel('Dauer (Minuten) *').fill(TEST_DURATIONS.oneHour.minutes.toString())

    // Save
    await form.getByRole('button', { name: 'Speichern' }).click()
    await page.waitForTimeout(1000)

    // Verify: Duration appears in list
    await expect(page.getByText(TEST_DURATIONS.oneHour.label)).toBeVisible()
    await expect(page.getByText('60 Minuten')).toBeVisible()
  })

  test('UC-6.3: Neue variable Buchungsdauer erstellen', async ({ page }) => {
    // Execute
    await navigateTo(page, '/settings')
    await page.getByRole('button', { name: 'Neue Dauer' }).click()

    const form = page.locator('form').first()

    // Fill label
    await form.getByLabel('Bezeichnung *').fill(TEST_DURATIONS.flexible.label)

    // Enable variable duration
    await form.getByLabel('Variable Dauer').check()

    // Verify: Variable duration fields appear
    await expect(form.getByLabel('Minimum (Min)')).toBeVisible()
    await expect(form.getByLabel('Maximum (Min)')).toBeVisible()
    await expect(form.getByLabel('Schritte (Min)')).toBeVisible()

    // Fill variable duration fields
    await form.getByLabel('Minimum (Min)').fill(TEST_DURATIONS.flexible.minMinutes!.toString())
    await form.getByLabel('Maximum (Min)').fill(TEST_DURATIONS.flexible.maxMinutes!.toString())
    await form.getByLabel('Schritte (Min)').fill(TEST_DURATIONS.flexible.stepMinutes!.toString())

    // Save
    await form.getByRole('button', { name: 'Speichern' }).click()
    await page.waitForTimeout(1000)

    // Verify
    await expect(page.getByText(TEST_DURATIONS.flexible.label)).toBeVisible()
    await expect(page.getByText('30-240 Min (30er Schritte)')).toBeVisible()
  })

  test('UC-6.4: Buchungsdauer bearbeiten', async ({ page }) => {
    // Setup
    await createTestDuration(page, TEST_DURATIONS.oneHour)

    // Execute
    await navigateTo(page, '/settings')

    // Click edit
    await page.getByRole('button', { name: 'Bearbeiten' }).first().click()

    // Verify: Inline edit form appears
    const form = page.locator('form').first()
    await expect(form.getByLabel('Bezeichnung *')).toHaveValue(TEST_DURATIONS.oneHour.label)

    // Change label
    const newLabel = TEST_DURATIONS.oneHour.label + ' (Bearbeitet)'
    await form.getByLabel('Bezeichnung *').fill(newLabel)

    // Save
    await form.getByRole('button', { name: 'Speichern' }).click()
    await page.waitForTimeout(1000)

    // Verify
    await expect(page.getByText(newLabel)).toBeVisible()
  })

  test('UC-6.5: Buchungsdauer aktivieren/deaktivieren', async ({ page }) => {
    // Setup
    await createTestDuration(page, TEST_DURATIONS.oneHour)

    // Execute
    await navigateTo(page, '/settings')

    // Deactivate
    const checkbox = page.locator('input[type="checkbox"]').first()
    await expect(checkbox).toBeChecked()
    await checkbox.uncheck()
    await page.waitForTimeout(1000)

    // Verify: Element has gray background
    const durationElement = page.locator('div', {
      has: page.getByText(TEST_DURATIONS.oneHour.label)
    }).first()
    await expect(durationElement).toHaveClass(/bg-gray-50/)

    // Reactivate
    await checkbox.check()
    await page.waitForTimeout(1000)

    // Verify: Gray background removed
    await expect(durationElement).not.toHaveClass(/bg-gray-50/)
  })

  test('UC-6.6: Buchungsdauer löschen', async ({ page }) => {
    // Setup
    await createTestDuration(page, TEST_DURATIONS.oneHour)

    // Execute
    await navigateTo(page, '/settings')

    page.on('dialog', dialog => dialog.accept())

    await page.getByRole('button', { name: 'Löschen' }).first().click()
    await page.waitForTimeout(1000)

    // Verify
    await expect(page.getByText(TEST_DURATIONS.oneHour.label)).not.toBeVisible()
  })
})
