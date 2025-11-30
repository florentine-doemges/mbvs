# Preisstaffel-System Design

## Anforderung

Das Studio soll flexible Preisstaffeln pflegen können:
- **Standard**: Flatpreis pro Stunde (aktuelles System)
- **Gestaffelt**: Verschiedene Preise abhängig von der Buchungsdauer
  - Beispiel 1: 15 min = 20€, 30 min = 35€, 60 min = 60€
  - Beispiel 2: Erste 3 Stunden à 70€/h, ab 4. Stunde 60€/h
  - Beispiel 3: 0-30 min = 25€, 30-60 min = 45€, 60-120 min = 80€, >120 min = 120€

## Datenmodell

### Option 1: Price Tiers Table (Empfohlen)

Neue Tabelle `room_price_tiers`:

```sql
CREATE TABLE room_price_tiers (
    id UUID PRIMARY KEY,
    room_price_id UUID NOT NULL REFERENCES room_prices(id) ON DELETE CASCADE,
    from_minutes INT NOT NULL,          -- Ab dieser Minute (inklusiv)
    to_minutes INT,                     -- Bis zu dieser Minute (exklusiv), NULL = unbegrenzt
    price_type VARCHAR(20) NOT NULL,    -- 'FIXED' oder 'HOURLY'
    price DECIMAL(10,2) NOT NULL,       -- Preis (fix oder pro Stunde)
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_room_price_tiers_price_id ON room_price_tiers(room_price_id);
CREATE INDEX idx_room_price_tiers_minutes ON room_price_tiers(from_minutes, to_minutes);
```

### Felder-Bedeutung:

- **from_minutes**: Startpunkt der Staffel (z.B. 0, 15, 30, 60, 180)
- **to_minutes**: Endpunkt der Staffel (NULL für "unbegrenzt")
- **price_type**:
  - `FIXED`: Fixpreis für den gesamten Zeitraum (z.B. 15 min = 20€)
  - `HOURLY`: Stundensatz für diesen Zeitraum (z.B. ab 4. Stunde = 60€/h)
- **price**: Der Betrag (Interpretation hängt von price_type ab)
- **sort_order**: Reihenfolge für die Anzeige

### Beispiel-Daten:

**Beispiel 1: Feste Zeitblöcke**
```
room_price_id | from_minutes | to_minutes | price_type | price
-------------|--------------|------------|------------|-------
<price-id>   | 0            | 15         | FIXED      | 20.00
<price-id>   | 15           | 30         | FIXED      | 35.00
<price-id>   | 30           | 60         | FIXED      | 60.00
<price-id>   | 60           | NULL       | HOURLY     | 70.00
```

Bedeutung:
- 0-15 min: 20€ (fix)
- 15-30 min: 35€ (fix)
- 30-60 min: 60€ (fix)
- Ab 60 min: 70€/Stunde

**Beispiel 2: Stundensatz-Staffelung**
```
room_price_id | from_minutes | to_minutes | price_type | price
-------------|--------------|------------|------------|-------
<price-id>   | 0            | 180        | HOURLY     | 70.00
<price-id>   | 180          | NULL       | HOURLY     | 60.00
```

Bedeutung:
- 0-180 min (0-3 Stunden): 70€/Stunde
- Ab 180 min (ab 4. Stunde): 60€/Stunde

**Beispiel 3: Pauschalen pro Zeitfenster**
```
room_price_id | from_minutes | to_minutes | price_type | price
-------------|--------------|------------|------------|-------
<price-id>   | 0            | 30         | FIXED      | 25.00
<price-id>   | 30           | 60         | FIXED      | 45.00
<price-id>   | 60           | 120        | FIXED      | 80.00
<price-id>   | 120          | NULL       | FIXED      | 120.00
```

Bedeutung:
- 0-30 min: 25€
- 30-60 min: 45€
- 60-120 min: 80€
- Über 120 min: 120€

## Berechnung

### Algorithmus für Preisberechnung:

```kotlin
fun calculateRoomPrice(durationMinutes: Int, priceTiers: List<PriceTier>): BigDecimal {
    if (priceTiers.isEmpty()) {
        // Fallback: Nutze hourlyRate (Rückwärtskompatibilität)
        return hourlyRate * (durationMinutes / 60.0)
    }

    // Sortiere Tiers nach from_minutes
    val sortedTiers = priceTiers.sortedBy { it.fromMinutes }

    var totalPrice = BigDecimal.ZERO
    var remainingMinutes = durationMinutes
    var currentPosition = 0

    for (tier in sortedTiers) {
        // Überspringe Tiers die vor unserem currentPosition liegen
        if (tier.toMinutes != null && tier.toMinutes <= currentPosition) {
            continue
        }

        // Berechne start/end für diesen Tier relativ zur Gesamtdauer
        val tierStart = maxOf(tier.fromMinutes, currentPosition)
        val tierEnd = tier.toMinutes ?: durationMinutes

        // Wie viele Minuten fallen in diesen Tier?
        val minutesInTier = minOf(tierEnd, durationMinutes) - tierStart

        if (minutesInTier <= 0) {
            break
        }

        val tierPrice = when (tier.priceType) {
            PriceType.FIXED -> tier.price
            PriceType.HOURLY -> {
                val hours = BigDecimal(minutesInTier) / BigDecimal(60)
                tier.price * hours
            }
        }

        totalPrice += tierPrice
        currentPosition = minOf(tierEnd, durationMinutes)

        if (currentPosition >= durationMinutes) {
            break
        }
    }

    return totalPrice.setScale(2, RoundingMode.HALF_UP)
}
```

### Berechnungsbeispiele:

**Beispiel 1: 45 Minuten Buchung mit Festen Zeitblöcken**
```
Tiers:
- 0-15 min: 20€ (FIXED)
- 15-30 min: 35€ (FIXED)
- 30-60 min: 60€ (FIXED)

Berechnung für 45 min:
- 0-15 min: 20€ (FIXED) → 20€
- 15-30 min: 35€ (FIXED) → 35€
- 30-45 min: Teil von "30-60 min FIXED 60€" → 60€
Total: 115€
```

**Beispiel 2: 300 Minuten (5 Stunden) mit Stundensatz-Staffelung**
```
Tiers:
- 0-180 min: 70€/h (HOURLY)
- 180+ min: 60€/h (HOURLY)

Berechnung für 300 min:
- 0-180 min: 180/60 * 70€ = 3 * 70€ = 210€
- 180-300 min: 120/60 * 60€ = 2 * 60€ = 120€
Total: 330€
```

## Migration-Strategie

### Phase 1: Rückwärtskompatibilität

1. Neue Tabelle `room_price_tiers` erstellen
2. Bestehende Räume haben **keine** Tiers (leere Tabelle)
3. **Fallback-Logik**: Wenn keine Tiers vorhanden → nutze `hourlyRate` aus `room_prices`
4. Billing-Service prüft:
   ```kotlin
   val tiers = priceTierRepository.findByRoomPriceId(roomPrice.id)
   val totalPrice = if (tiers.isEmpty()) {
       // Alt: Stundensatz
       roomPrice.price * (durationMinutes / 60.0)
   } else {
       // Neu: Preisstaffeln
       calculateTieredPrice(durationMinutes, tiers)
   }
   ```

### Phase 2: UI Integration

1. **Room Form**: Neue Sektion "Preisstaffelung"
   - Radio-Button: "Flatpreis" oder "Gestaffelt"
   - Bei "Flatpreis": Wie bisher (nur hourlyRate)
   - Bei "Gestaffelt": Tabelle zum Pflegen der Tiers
2. **Tier-Tabelle im Frontend**:
   ```
   Von (Min) | Bis (Min) | Typ      | Preis  | Aktionen
   ---------|-----------|----------|--------|----------
   0         | 15        | Fix      | 20,00€ | [Bearbeiten] [Löschen]
   15        | 30        | Fix      | 35,00€ | [Bearbeiten] [Löschen]
   30        | -         | Stunde   | 70,00€ | [Bearbeiten] [Löschen]
   [+ Neue Staffel hinzufügen]
   ```

### Phase 3: Validierung

**Backend-Validierungen**:
1. Keine Lücken: Nächster Tier muss bei `toMinutes` des vorherigen beginnen
2. Keine Überschneidungen
3. Mindestens ein Tier muss "unbegrenzt" sein (toMinutes = NULL)
4. fromMinutes >= 0
5. toMinutes > fromMinutes (wenn gesetzt)
6. Preis > 0

## API-Erweiterungen

### Neue Endpoints:

```
POST   /api/rooms/{roomId}/prices/{priceId}/tiers
GET    /api/rooms/{roomId}/prices/{priceId}/tiers
PUT    /api/rooms/{roomId}/prices/{priceId}/tiers/{tierId}
DELETE /api/rooms/{roomId}/prices/{priceId}/tiers/{tierId}
```

### DTOs:

```kotlin
data class PriceTierDto(
    val id: UUID?,
    val fromMinutes: Int,
    val toMinutes: Int?,
    val priceType: PriceType,
    val price: BigDecimal,
    val sortOrder: Int = 0
)

enum class PriceType {
    FIXED,   // Fixpreis für den Zeitraum
    HOURLY   // Stundensatz
}

data class CreatePriceTierRequest(
    val fromMinutes: Int,
    val toMinutes: Int?,
    val priceType: PriceType,
    val price: BigDecimal
)
```

## Frontend-Änderungen

### RoomForm.tsx

Neue Sektion nach "Aktueller Preis":

```tsx
<div className="border-t pt-4">
  <h3>Preisstaffelung</h3>

  <div className="mb-4">
    <label>
      <input type="radio" checked={!useTieredPricing} />
      Flatpreis (Stundensatz)
    </label>
    <label>
      <input type="radio" checked={useTieredPricing} />
      Gestaffelte Preise
    </label>
  </div>

  {useTieredPricing && (
    <PriceTierTable
      roomId={roomId}
      priceId={currentPriceId}
      tiers={priceTiers}
      onTiersChange={handleTiersChange}
    />
  )}
</div>
```

## Preisvorschau

Hilfreiche Funktion für Nutzer:

```tsx
<div className="bg-blue-50 p-4 rounded mt-4">
  <h4>Preisvorschau</h4>
  <table>
    <tr>
      <td>15 Minuten:</td>
      <td>{calculatePreview(15)}€</td>
    </tr>
    <tr>
      <td>30 Minuten:</td>
      <td>{calculatePreview(30)}€</td>
    </tr>
    <tr>
      <td>1 Stunde:</td>
      <td>{calculatePreview(60)}€</td>
    </tr>
    <tr>
      <td>2 Stunden:</td>
      <td>{calculatePreview(120)}€</td>
    </tr>
    <tr>
      <td>4 Stunden:</td>
      <td>{calculatePreview(240)}€</td>
    </tr>
  </table>
</div>
```

## Zusammenfassung

**Vorteile dieses Designs**:
1. ✅ Rückwärtskompatibel (bestehende Räume nutzen weiter hourlyRate)
2. ✅ Flexibel (Fix- und Stundensätze kombinierbar)
3. ✅ Einfach erweiterbar
4. ✅ Preishistorie bleibt erhalten (Tiers gehören zu einem RoomPrice)
5. ✅ Validierbar (klare Regeln)

**Implementierungsreihenfolge**:
1. Backend: Migration + Domain Model
2. Backend: Repository + Service
3. Backend: API Controller
4. Frontend: API Client
5. Frontend: UI Components
6. Testing
