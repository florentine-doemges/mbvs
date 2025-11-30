# E2E Testing mit Playwright

## Überblick

Dieses Projekt verwendet Playwright für Ende-zu-Ende-Tests. Die Tests decken alle Use Cases ab, die im [USE_CASES.md](../USE_CASES.md) Dokument beschrieben sind.

## Voraussetzungen

- Node.js 18 oder höher
- Backend muss auf `http://localhost:8080` laufen
- Frontend wird automatisch auf `http://localhost:5173` gestartet

## Installation

Die Playwright-Abhängigkeiten sind bereits in `package.json` enthalten. Falls noch nicht installiert:

```bash
npm install
npx playwright install chromium
```

## Test-Struktur

Die E2E-Tests sind nach Funktionsbereichen organisiert:

```
e2e/
├── helpers.ts           # Hilfsfunktionen und Testdaten
├── 01-rooms.spec.ts     # UC-3: Raumverwaltung
├── 02-providers.spec.ts # UC-4: Provider-Verwaltung
├── 03-upgrades.spec.ts  # UC-5: Upgrade-Verwaltung
├── 04-settings.spec.ts  # UC-6: Einstellungen
├── 05-bookings.spec.ts  # UC-2: Buchungsübersicht
└── 06-calendar.spec.ts  # UC-1: Kalender + UC-7: Navigation
```

## Tests ausführen

### Alle Tests ausführen (Headless)
```bash
npm run test:e2e
```

### Tests mit UI (interaktiv)
```bash
npm run test:e2e:ui
```

### Tests mit sichtbarem Browser
```bash
npm run test:e2e:headed
```

### Tests im Debug-Modus
```bash
npm run test:e2e:debug
```

### Einzelne Test-Datei ausführen
```bash
npx playwright test e2e/01-rooms.spec.ts
```

### Einzelnen Test ausführen
```bash
npx playwright test -g "UC-3.3: Neuen Raum erstellen"
```

## Test-Daten

Die Tests verwenden folgende Namenskonvention für Testdaten:
- Alle Testdaten beginnen mit `E2E Test` Präfix
- Beispiel: `E2E Test Roter Raum`, `E2E Test Anna Schmidt`

### Test-Daten-Management

**Automatische Bereinigung:**
- `beforeEach`: Löscht alle Testdaten vor jedem Test
- `afterAll`: Löscht alle Testdaten nach allen Tests

**Testdaten werden erstellt:**
- Räume: "E2E Test Roter Raum", "E2E Test Blauer Raum"
- Provider: "E2E Test Anna Schmidt", "E2E Test Max Müller"
- Upgrades: "E2E Test Champagner", "E2E Test Massage"
- Buchungsdauern: "E2E Test 30 Minuten", "E2E Test 1 Stunde", "E2E Test Flexibel"

## Hilfsfunktionen

Die Datei `helpers.ts` enthält wiederverwendbare Funktionen:

### Daten-Setup
```typescript
// Alle Testdaten einrichten
const testData = await setupTestData(page)

// Einzelne Entitäten erstellen
const room = await createTestRoom(page, TEST_ROOMS.red)
const provider = await createTestProvider(page, TEST_PROVIDERS.anna)
const upgrade = await createTestUpgrade(page, TEST_UPGRADES.champagne)
const duration = await createTestDuration(page, TEST_DURATIONS.oneHour)

// Buchung erstellen
const booking = await createTestBooking(page, {
  startTime: getTodayAtTime(14, 0),
  durationMinutes: 60,
  providerId: provider.id,
  roomId: room.id,
  clientAlias: 'Test Kunde'
})
```

### Zeitpunkt-Funktionen
```typescript
// Heute um 14:00
const time = getTodayAtTime(14, 0)

// Morgen um 10:00
const time = getTomorrowAtTime(10, 0)
```

### Navigation
```typescript
await navigateTo(page, '/rooms')
```

### Cleanup
```typescript
await deleteAllTestData(page)
```

## Test-Berichterstattung

Nach jedem Test-Durchlauf wird ein HTML-Report erstellt:

```bash
npx playwright show-report
```

Der Report enthält:
- Test-Ergebnisse (Pass/Fail)
- Screenshots bei Fehlern
- Traces für fehlgeschlagene Tests
- Ausführungszeiten

## CI/CD Integration

Die Tests sind für CI/CD vorbereitet:

```yaml
# Beispiel GitHub Actions
- name: Run E2E Tests
  run: npm run test:e2e
  env:
    CI: true
```

In CI-Umgebungen:
- Retries: 2 (bei Fehlern)
- Workers: 1 (sequentiell für Datenkonsistenz)
- Screenshots: Nur bei Fehlern

## Debugging

### Screenshots bei Fehlern
Screenshots werden automatisch bei Fehlern erstellt und sind im Test-Report verfügbar.

### Traces
Traces werden beim ersten Retry erstellt:
```bash
npx playwright show-trace trace.zip
```

### Debug-Modus
Im Debug-Modus können Tests Schritt für Schritt ausgeführt werden:
```bash
npm run test:e2e:debug
```

### Playwright Inspector
Öffnet den interaktiven Inspector:
```bash
npx playwright test --debug
```

## Best Practices

### 1. Testdaten-Isolation
- Jeder Test bereinigt vor und nach der Ausführung
- Eindeutige Präfixe für Testdaten (`E2E Test`)

### 2. Wartezeiten
```typescript
// ✅ Gut: Warten auf Netzwerk
await page.waitForLoadState('networkidle')

// ✅ Gut: Warten auf Element
await expect(page.getByText('...')).toBeVisible()

// ⚠️ Nur wenn nötig: Feste Wartezeit
await page.waitForTimeout(1000)
```

### 3. Selektoren
```typescript
// ✅ Gut: Semantische Selektoren
await page.getByRole('button', { name: 'Speichern' })
await page.getByLabel('Name *')

// ✅ Gut: Text-Selektoren
await page.getByText('Roter Raum')

// ⚠️ Vermeiden: CSS-Selektoren
await page.locator('.button-class')
```

### 4. Assertions
```typescript
// ✅ Gut: Auto-waiting assertions
await expect(page.getByText('...')).toBeVisible()
await expect(input).toHaveValue('...')

// ❌ Schlecht: Assertions ohne Warten
expect(await page.isVisible('.element')).toBe(true)
```

## Bekannte Einschränkungen

1. **Drag & Drop im Kalender**: Aufgrund der Komplexität des Drag & Drop-Features im Kalender sind diese Tests möglicherweise nicht vollständig implementiert. Sie können manuell getestet werden.

2. **Sequentielle Ausführung**: Tests laufen sequentiell (`workers: 1`), um Datenkonflikte zu vermeiden. Dies kann die Ausführungszeit verlängern.

3. **Browser**: Aktuell nur Chromium konfiguriert. Firefox und Safari können bei Bedarf in `playwright.config.ts` aktiviert werden.

## Fehlerbehebung

### Tests schlagen fehl mit Timeout
- Prüfen ob Backend läuft: `http://localhost:8080/actuator/health`
- Prüfen ob Frontend läuft: `http://localhost:5173`
- Timeout in `playwright.config.ts` erhöhen

### "Element not found" Fehler
- Screenshot im Report prüfen
- Selector möglicherweise anpassen
- Warten auf Netzwerk-Requests hinzufügen

### Testdaten bleiben in DB
- `deleteAllTestData()` wird automatisch aufgerufen
- Manuell: Alle Einträge mit `E2E Test` Präfix löschen

## Coverage

Die E2E-Tests decken folgende Use Cases ab:

- ✅ UC-1: Kalender-Verwaltung (6 Tests)
- ✅ UC-2: Buchungsübersicht (6 Tests)
- ✅ UC-3: Raumverwaltung (8 Tests)
- ✅ UC-4: Provider-Verwaltung (6 Tests)
- ✅ UC-5: Upgrade-Verwaltung (7 Tests)
- ✅ UC-6: Einstellungen (6 Tests)
- ✅ UC-7: Navigation (1 Test)

**Gesamt: 40 E2E-Tests**

## Wartung

### Tests aktualisieren
Bei UI-Änderungen müssen möglicherweise Selektoren angepasst werden:
1. Test im Debug-Modus ausführen
2. Playwright Inspector verwenden um neue Selektoren zu finden
3. Selektoren in Test-Datei aktualisieren

### Neue Tests hinzufügen
1. Use Case in `USE_CASES.md` dokumentieren
2. Entsprechende Test-Datei erstellen/erweitern
3. Hilfsfunktionen in `helpers.ts` bei Bedarf ergänzen
4. Test ausführen und verifizieren

## Weitere Ressourcen

- [Playwright Dokumentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Use Cases Dokument](../USE_CASES.md)
