# Studio Booking System - Use Cases

## Überblick

Dieses Dokument beschreibt alle Use Cases des Studio Booking Systems. Das System ermöglicht die Verwaltung von Buchungen für Studio-Räume mit Providern, verschiedenen Buchungsdauern und optionalen Upgrades.

---

## 1. Kalender-Verwaltung

### UC-1.1: Kalender-Ansicht öffnen
**Akteur:** Benutzer
**Vorbedingung:** Anwendung ist gestartet
**Ablauf:**
1. Benutzer navigiert zu `/calendar`
2. System zeigt Kalender mit aktuellem Datum
3. Kalender zeigt alle Räume als Zeilen
4. Kalender zeigt Stunden des Tages als Spalten
5. Vorhandene Buchungen werden als farbige Blöcke angezeigt

**Erwartetes Ergebnis:** Kalender-Ansicht wird geladen und zeigt alle Buchungen des aktuellen Tages

**Testdaten:**
- Datum: Aktuelles Datum
- Mindestens 2 aktive Räume vorhanden
- Mindestens 1 Buchung vorhanden

---

### UC-1.2: Datum im Kalender wechseln
**Akteur:** Benutzer
**Vorbedingung:** Kalender-Ansicht ist geöffnet
**Ablauf:**
1. Benutzer klickt auf "Vorheriger Tag" oder "Nächster Tag"
2. System lädt Buchungen für das gewählte Datum
3. Kalender aktualisiert sich mit neuen Buchungen

**Erwartetes Ergebnis:** Kalender zeigt Buchungen des gewählten Datums

**Alternativablauf:**
- Benutzer wählt Datum über Datumswähler
- System springt zum gewählten Datum

---

### UC-1.3: Neue Buchung per Drag & Drop erstellen
**Akteur:** Benutzer
**Vorbedingung:**
- Kalender-Ansicht ist geöffnet
- Mindestens 1 Provider ist aktiv
- Mindestens 1 Raum ist aktiv
- Mindestens 1 Buchungsdauer ist aktiv

**Ablauf:**
1. Benutzer klickt auf freie Zeitslot im Kalender
2. Benutzer zieht Maus um Buchungszeitraum zu definieren
3. System öffnet Buchungs-Modal mit vorausgefüllten Werten:
   - Startzeit: Beginn des gezogenen Zeitraums
   - Dauer: Länge des gezogenen Zeitraums (gerundet)
   - Raum: Raum der Zeile
4. Benutzer wählt Provider
5. Benutzer wählt optional Buchungsdauer aus vordefinierter Liste
6. Benutzer gibt optional Kundenname ein
7. Benutzer wählt optional Upgrades
8. Benutzer klickt "Speichern"
9. System validiert Eingaben
10. System erstellt Buchung
11. System schließt Modal
12. Buchung erscheint im Kalender

**Erwartetes Ergebnis:** Neue Buchung wird erstellt und im Kalender angezeigt

**Validierungsregeln:**
- Startzeit muss in der Zukunft oder Gegenwart liegen
- Provider muss ausgewählt sein
- Raum muss ausgewählt sein
- Dauer muss > 0 sein
- Keine Überschneidung mit anderen Buchungen im gleichen Raum

**Testdaten:**
- Startzeit: Heute 14:00
- Dauer: 60 Minuten
- Provider: Beliebiger aktiver Provider
- Raum: Beliebiger aktiver Raum
- Kundenname: "Max Mustermann"
- Upgrades: 1x "Champagner"

---

### UC-1.4: Buchung per Drag & Drop verschieben
**Akteur:** Benutzer
**Vorbedingung:**
- Kalender-Ansicht ist geöffnet
- Mindestens 1 Buchung existiert

**Ablauf:**
1. Benutzer klickt auf Buchungs-Block im Kalender
2. Benutzer zieht Buchung zu neuer Position (andere Zeit oder anderer Raum)
3. System zeigt visuelles Feedback während des Ziehens
4. Benutzer lässt Maus los
5. System validiert neue Position
6. System aktualisiert Buchung (Startzeit und/oder Raum)
7. Buchung erscheint an neuer Position

**Erwartetes Ergebnis:** Buchung wird verschoben und an neuer Position angezeigt

**Validierungsregeln:**
- Ziel-Raum muss aktiv sein
- Keine Überschneidung mit anderen Buchungen
- Neue Zeit muss gültig sein

**Alternativablauf (Fehler):**
- Bei Überschneidung: System zeigt Fehlermeldung
- Buchung springt zurück zur ursprünglichen Position

---

### UC-1.5: Buchung aus Kalender löschen
**Akteur:** Benutzer
**Vorbedingung:**
- Kalender-Ansicht ist geöffnet
- Mindestens 1 Buchung existiert

**Ablauf:**
1. Benutzer klickt auf Buchungs-Block
2. System öffnet Buchungs-Modal im Bearbeitungsmodus
3. Benutzer klickt "Löschen"
4. System zeigt Bestätigungsdialog
5. Benutzer bestätigt Löschung
6. System löscht Buchung
7. System schließt Modal
8. Buchung verschwindet aus Kalender

**Erwartetes Ergebnis:** Buchung wird gelöscht und nicht mehr im Kalender angezeigt

---

## 2. Buchungsübersicht

### UC-2.1: Buchungsübersicht öffnen
**Akteur:** Benutzer
**Vorbedingung:** Anwendung ist gestartet
**Ablauf:**
1. Benutzer navigiert zu `/bookings`
2. System lädt Buchungen mit Standardfiltern:
   - Status: Alle
   - Zeitraum: Nächste 30 Tage
   - Sortierung: Nach Startzeit aufsteigend
3. System zeigt Buchungen in Tabelle (Desktop) oder Karten (Mobile)

**Erwartetes Ergebnis:** Buchungsübersicht wird geladen mit gefilterten Buchungen

---

### UC-2.2: Buchungen filtern
**Akteur:** Benutzer
**Vorbedingung:** Buchungsübersicht ist geöffnet
**Ablauf:**
1. Benutzer wählt Filter-Optionen:
   - Status (Bestätigt, Ausstehend, Storniert)
   - Von-Datum
   - Bis-Datum
   - Provider
   - Raum
   - Kundenname (Suche)
2. Benutzer klickt "Anwenden" oder Filter werden automatisch angewendet
3. System lädt gefilterte Buchungen
4. Tabelle aktualisiert sich

**Erwartetes Ergebnis:** Nur Buchungen die den Filterkriterien entsprechen werden angezeigt

**Testdaten:**
- Status: Bestätigt
- Von: Heute
- Bis: Heute + 7 Tage
- Provider: Spezifischer Provider
- Raum: Spezifischer Raum

---

### UC-2.3: Buchung inline bearbeiten (Tabellenansicht)
**Akteur:** Benutzer
**Vorbedingung:**
- Buchungsübersicht ist geöffnet (Desktop)
- Mindestens 1 Buchung existiert

**Ablauf:**
1. Benutzer klickt auf editierbares Feld in der Tabelle:
   - Datum/Zeit
   - Provider
   - Raum
   - Dauer
   - Kundenname
2. Feld wechselt in Bearbeitungsmodus (Input/Select)
3. Benutzer ändert Wert
4. Benutzer klickt "✓" (Speichern) oder drückt Enter
5. System validiert Eingabe
6. System aktualisiert Buchung
7. Feld wechselt zurück in Anzeigemodus
8. Geänderter Wert wird angezeigt

**Erwartetes Ergebnis:** Buchungsfeld wird aktualisiert

**Validierungsregeln:**
- Gleiche Regeln wie bei Buchungserstellung
- Keine Überschneidungen bei Zeit-/Raum-Änderungen

**Alternativablauf (Abbruch):**
- Benutzer klickt "✗" (Abbrechen)
- Änderungen werden verworfen
- Feld zeigt ursprünglichen Wert

---

### UC-2.4: Buchung erweitert bearbeiten (mit Upgrades)
**Akteur:** Benutzer
**Vorbedingung:**
- Buchungsübersicht ist geöffnet
- Mindestens 1 Buchung existiert

**Ablauf:**
1. Benutzer klickt auf Preis oder "⚙️" Bearbeiten-Button
2. System öffnet vollständiges Buchungs-Modal
3. Benutzer ändert Werte:
   - Alle Grunddaten (Zeit, Provider, Raum, Dauer, Kunde)
   - Upgrades hinzufügen/entfernen/Menge ändern
4. System berechnet Gesamtpreis in Echtzeit
5. Benutzer klickt "Speichern"
6. System validiert und aktualisiert Buchung
7. Modal schließt sich
8. Tabelle zeigt aktualisierte Werte

**Erwartetes Ergebnis:** Buchung wird mit allen Änderungen aktualisiert

---

### UC-2.5: Buchung im Kalender anzeigen
**Akteur:** Benutzer
**Vorbedingung:**
- Buchungsübersicht ist geöffnet
- Mindestens 1 Buchung existiert

**Ablauf:**
1. Benutzer klickt auf "📅" Kalender-Button bei einer Buchung
2. System navigiert zu `/calendar`
3. Kalender springt zum Datum der Buchung
4. Buchung wird hervorgehoben/fokussiert

**Erwartetes Ergebnis:** Kalender öffnet sich und zeigt die ausgewählte Buchung

---

### UC-2.6: Buchung aus Übersicht löschen
**Akteur:** Benutzer
**Vorbedingung:**
- Buchungsübersicht ist geöffnet
- Mindestens 1 Buchung existiert

**Ablauf:**
1. Benutzer klickt "🗑️" Löschen-Button
2. System zeigt Bestätigungsdialog: "Buchung wirklich löschen?"
3. Benutzer bestätigt
4. System löscht Buchung
5. Buchung verschwindet aus Tabelle

**Erwartetes Ergebnis:** Buchung wird gelöscht und nicht mehr angezeigt

---

## 3. Raumverwaltung

### UC-3.1: Raumübersicht öffnen
**Akteur:** Benutzer
**Vorbedingung:** Anwendung ist gestartet
**Ablauf:**
1. Benutzer navigiert zu `/rooms`
2. System lädt alle aktiven Räume
3. System zeigt Räume in Tabelle mit:
   - Name
   - Farbe (Farbfeld + Hex-Code)
   - Stundensatz
   - Status (Aktiv/Inaktiv)
   - Anzahl Buchungen

**Erwartetes Ergebnis:** Raumübersicht wird mit allen aktiven Räumen angezeigt

---

### UC-3.2: Inaktive Räume anzeigen
**Akteur:** Benutzer
**Vorbedingung:** Raumübersicht ist geöffnet
**Ablauf:**
1. Benutzer aktiviert Checkbox "Inaktive anzeigen"
2. System lädt auch inaktive Räume
3. Inaktive Räume werden mit grauem Hintergrund angezeigt

**Erwartetes Ergebnis:** Alle Räume (aktiv + inaktiv) werden angezeigt

---

### UC-3.3: Neuen Raum erstellen
**Akteur:** Benutzer
**Vorbedingung:** Raumübersicht ist geöffnet
**Ablauf:**
1. Benutzer klickt "Neuer Raum"
2. System navigiert zu `/rooms/new`
3. System zeigt leeres Formular
4. Benutzer füllt Felder aus:
   - Name (Pflicht, max 100 Zeichen)
   - Stundensatz (Pflicht, > 0 EUR)
   - Farbe (Auswahl aus Palette oder eigene Farbe)
5. Benutzer klickt "Speichern"
6. System validiert Eingaben
7. System erstellt Raum
8. System erstellt ersten Preishistorie-Eintrag
9. System navigiert zurück zu `/rooms`
10. Neuer Raum erscheint in Liste

**Erwartetes Ergebnis:** Neuer Raum wird erstellt und in der Liste angezeigt

**Validierungsregeln:**
- Name darf nicht leer sein
- Name max 100 Zeichen
- Stundensatz muss > 0 sein
- Farbe muss gültiger Hex-Code sein

**Testdaten:**
- Name: "Roter Raum"
- Stundensatz: 70.00 EUR
- Farbe: #EF4444

---

### UC-3.4: Raum bearbeiten
**Akteur:** Benutzer
**Vorbedingung:**
- Raumübersicht ist geöffnet
- Mindestens 1 Raum existiert

**Ablauf:**
1. Benutzer klickt "Bearbeiten" bei einem Raum ODER klickt auf Stundensatz
2. System navigiert zu `/rooms/{id}`
3. System lädt Raumdaten
4. System lädt Preishistorie
5. Formular zeigt aktuelle Werte:
   - Name
   - Stundensatz
   - Farbe
   - Sortierung (nur im Edit-Modus)
   - Status Aktiv (nur im Edit-Modus)
6. System zeigt Preishistorie-Tabelle
7. Benutzer ändert Werte
8. Benutzer klickt "Speichern"
9. System validiert Eingaben
10. Falls Stundensatz geändert wurde:
    - System erstellt neuen Preishistorie-Eintrag mit validFrom = jetzt
    - System setzt validTo des alten Eintrags auf jetzt
11. System aktualisiert Raum
12. System navigiert zurück zu `/rooms`

**Erwartetes Ergebnis:** Raum wird aktualisiert, bei Preisänderung wird Historie erstellt

**Testdaten:**
- Neuer Stundensatz: 75.00 EUR
- Neuer Name: "Roter Raum (Premium)"

---

### UC-3.5: Historischen Preis übernehmen
**Akteur:** Benutzer
**Vorbedingung:**
- Raum-Bearbeitungsformular ist geöffnet
- Raum hat mehrere Preishistorie-Einträge

**Ablauf:**
1. Benutzer sieht Preishistorie-Tabelle mit:
   - Preis
   - Gültig von (Datum/Zeit)
   - Gültig bis (Datum/Zeit oder "-" für aktuell)
   - "Übernehmen" Button
2. Benutzer klickt "Übernehmen" bei einem historischen Preis
3. Preisfeld wird mit dem historischen Wert gefüllt
4. Benutzer sieht Info: "ℹ️ Der Preis wird geändert. Der alte Preis bleibt in der Historie erhalten."
5. Benutzer klickt "Speichern"
6. Neuer Preishistorie-Eintrag wird erstellt

**Erwartetes Ergebnis:** Historischer Preis wird übernommen und als neuer Eintrag gespeichert

---

### UC-3.6: Raum deaktivieren
**Akteur:** Benutzer
**Vorbedingung:**
- Raum-Bearbeitungsformular ist geöffnet
- Raum ist aktiv

**Ablauf:**
1. Benutzer deaktiviert Checkbox "Aktiv"
2. Benutzer klickt "Speichern"
3. System aktualisiert Raum (active = false)
4. In Raumübersicht wird Raum grau dargestellt
5. Raum kann nicht mehr für neue Buchungen ausgewählt werden

**Erwartetes Ergebnis:** Raum wird deaktiviert und kann nicht mehr gebucht werden

**Hinweis:** Bestehende Buchungen bleiben erhalten

---

### UC-3.7: Raum löschen
**Akteur:** Benutzer
**Vorbedingung:**
- Raumübersicht ist geöffnet
- Mindestens 1 Raum existiert

**Ablauf:**
1. Benutzer klickt "Löschen" bei einem Raum
2. System zeigt Bestätigungsdialog: "Möchten Sie den Raum '{Name}' wirklich löschen?"
3. Benutzer bestätigt
4. System löscht Raum
5. Raum verschwindet aus Liste

**Erwartetes Ergebnis:** Raum wird gelöscht

**Alternativablauf (Raum hat Buchungen):**
- System zeigt Fehlermeldung
- Raum wird nicht gelöscht
- Hinweis: Raum sollte stattdessen deaktiviert werden

---

## 4. Provider-Verwaltung

### UC-4.1: Provider-Übersicht öffnen
**Akteur:** Benutzer
**Vorbedingung:** Anwendung ist gestartet
**Ablauf:**
1. Benutzer navigiert zu `/providers`
2. System lädt alle aktiven Provider
3. System zeigt Provider in Tabelle mit:
   - Name
   - Farbe (Farbkreis + Hex-Code)
   - Status (Aktiv/Inaktiv)
   - Anzahl Buchungen

**Erwartetes Ergebnis:** Provider-Übersicht wird mit allen aktiven Providern angezeigt

---

### UC-4.2: Inaktive Provider anzeigen
**Akteur:** Benutzer
**Vorbedingung:** Provider-Übersicht ist geöffnet
**Ablauf:**
1. Benutzer aktiviert Checkbox "Inaktive anzeigen"
2. System lädt auch inaktive Provider
3. Inaktive Provider werden mit grauem Hintergrund angezeigt

**Erwartetes Ergebnis:** Alle Provider (aktiv + inaktiv) werden angezeigt

---

### UC-4.3: Neuen Provider erstellen
**Akteur:** Benutzer
**Vorbedingung:** Provider-Übersicht ist geöffnet
**Ablauf:**
1. Benutzer klickt "Neuer Provider"
2. System navigiert zu `/providers/new`
3. System zeigt leeres Formular
4. Benutzer füllt Felder aus:
   - Name (Pflicht, max 100 Zeichen)
   - Farbe (Auswahl aus Palette oder eigene Farbe)
5. Benutzer klickt "Speichern"
6. System validiert Eingaben
7. System erstellt Provider (active = true, sortOrder = 0)
8. System navigiert zurück zu `/providers`
9. Neuer Provider erscheint in Liste

**Erwartetes Ergebnis:** Neuer Provider wird erstellt und in der Liste angezeigt

**Validierungsregeln:**
- Name darf nicht leer sein
- Name max 100 Zeichen
- Farbe muss gültiger Hex-Code sein

**Testdaten:**
- Name: "Anna Schmidt"
- Farbe: #EC4899

---

### UC-4.4: Provider bearbeiten
**Akteur:** Benutzer
**Vorbedingung:**
- Provider-Übersicht ist geöffnet
- Mindestens 1 Provider existiert

**Ablauf:**
1. Benutzer klickt "Bearbeiten" bei einem Provider
2. System navigiert zu `/providers/{id}`
3. System lädt Provider-Daten
4. Formular zeigt aktuelle Werte:
   - Name
   - Farbe
   - Sortierung (nur im Edit-Modus)
   - Status Aktiv (nur im Edit-Modus)
5. Benutzer ändert Werte
6. Benutzer klickt "Speichern"
7. System validiert Eingaben
8. System aktualisiert Provider
9. System navigiert zurück zu `/providers`

**Erwartetes Ergebnis:** Provider wird aktualisiert

---

### UC-4.5: Provider deaktivieren
**Akteur:** Benutzer
**Vorbedingung:**
- Provider-Bearbeitungsformular ist geöffnet
- Provider ist aktiv

**Ablauf:**
1. Benutzer deaktiviert Checkbox "Aktiv"
2. Benutzer klickt "Speichern"
3. System aktualisiert Provider (active = false)
4. In Provider-Übersicht wird Provider grau dargestellt
5. Provider kann nicht mehr für neue Buchungen ausgewählt werden

**Erwartetes Ergebnis:** Provider wird deaktiviert

---

### UC-4.6: Provider löschen
**Akteur:** Benutzer
**Vorbedingung:**
- Provider-Übersicht ist geöffnet
- Mindestens 1 Provider existiert

**Ablauf:**
1. Benutzer klickt "Löschen" bei einem Provider
2. System zeigt Bestätigungsdialog
3. Benutzer bestätigt
4. System löscht Provider
5. Provider verschwindet aus Liste

**Erwartetes Ergebnis:** Provider wird gelöscht

**Alternativablauf (Provider hat Buchungen):**
- System zeigt Fehlermeldung
- Provider sollte deaktiviert statt gelöscht werden

---

## 5. Upgrade-Verwaltung

### UC-5.1: Upgrade-Übersicht öffnen
**Akteur:** Benutzer
**Vorbedingung:** Anwendung ist gestartet
**Ablauf:**
1. Benutzer navigiert zu `/upgrades`
2. System lädt alle aktiven Upgrades
3. System zeigt Upgrades in Tabelle mit:
   - Name
   - Preis
   - Status (Aktiv/Inaktiv)

**Erwartetes Ergebnis:** Upgrade-Übersicht wird mit allen aktiven Upgrades angezeigt

---

### UC-5.2: Inaktive Upgrades anzeigen
**Akteur:** Benutzer
**Vorbedingung:** Upgrade-Übersicht ist geöffnet
**Ablauf:**
1. Benutzer aktiviert Checkbox "Inaktive anzeigen"
2. System lädt auch inaktive Upgrades
3. Inaktive Upgrades werden mit grauem Hintergrund angezeigt

**Erwartetes Ergebnis:** Alle Upgrades (aktiv + inaktiv) werden angezeigt

---

### UC-5.3: Neues Upgrade erstellen
**Akteur:** Benutzer
**Vorbedingung:** Upgrade-Übersicht ist geöffnet
**Ablauf:**
1. Benutzer klickt "Neues Upgrade"
2. System navigiert zu `/upgrades/new`
3. System zeigt leeres Formular
4. Benutzer füllt Felder aus:
   - Name (Pflicht, max 100 Zeichen)
   - Preis (Pflicht, >= 0 EUR)
5. Benutzer klickt "Speichern"
6. System validiert Eingaben
7. System erstellt Upgrade (active = true)
8. System erstellt ersten Preishistorie-Eintrag
9. System navigiert zurück zu `/upgrades`
10. Neues Upgrade erscheint in Liste

**Erwartetes Ergebnis:** Neues Upgrade wird erstellt und in der Liste angezeigt

**Validierungsregeln:**
- Name darf nicht leer sein
- Name max 100 Zeichen
- Preis muss >= 0 sein

**Testdaten:**
- Name: "Champagner"
- Preis: 50.00 EUR

---

### UC-5.4: Upgrade bearbeiten
**Akteur:** Benutzer
**Vorbedingung:**
- Upgrade-Übersicht ist geöffnet
- Mindestens 1 Upgrade existiert

**Ablauf:**
1. Benutzer klickt "Bearbeiten" bei einem Upgrade ODER klickt auf Preis
2. System navigiert zu `/upgrades/{id}`
3. System lädt Upgrade-Daten
4. System lädt Preishistorie
5. Formular zeigt aktuelle Werte:
   - Name
   - Preis
   - Status Aktiv (nur im Edit-Modus)
6. System zeigt Preishistorie-Tabelle
7. Benutzer ändert Werte
8. Benutzer klickt "Speichern"
9. System validiert Eingaben
10. Falls Preis geändert wurde:
    - System erstellt neuen Preishistorie-Eintrag
    - System setzt validTo des alten Eintrags
11. System aktualisiert Upgrade
12. System navigiert zurück zu `/upgrades`

**Erwartetes Ergebnis:** Upgrade wird aktualisiert, bei Preisänderung wird Historie erstellt

**Testdaten:**
- Neuer Preis: 55.00 EUR
- Neuer Name: "Premium Champagner"

---

### UC-5.5: Historischen Upgrade-Preis übernehmen
**Akteur:** Benutzer
**Vorbedingung:**
- Upgrade-Bearbeitungsformular ist geöffnet
- Upgrade hat mehrere Preishistorie-Einträge

**Ablauf:**
1. Benutzer sieht Preishistorie-Tabelle
2. Benutzer klickt "Übernehmen" bei einem historischen Preis
3. Preisfeld wird gefüllt
4. Info-Hinweis wird angezeigt
5. Benutzer speichert
6. Neuer Preiseintrag wird erstellt

**Erwartetes Ergebnis:** Historischer Preis wird als neuer Eintrag übernommen

---

### UC-5.6: Upgrade deaktivieren
**Akteur:** Benutzer
**Vorbedingung:**
- Upgrade-Bearbeitungsformular ist geöffnet
- Upgrade ist aktiv

**Ablauf:**
1. Benutzer deaktiviert Checkbox "Aktiv"
2. Benutzer klickt "Speichern"
3. System aktualisiert Upgrade (active = false)
4. Upgrade kann nicht mehr zu Buchungen hinzugefügt werden

**Erwartetes Ergebnis:** Upgrade wird deaktiviert

**Hinweis:** Bestehende Buchungen mit diesem Upgrade bleiben unverändert

---

### UC-5.7: Upgrade löschen
**Akteur:** Benutzer
**Vorbedingung:**
- Upgrade-Übersicht ist geöffnet
- Mindestens 1 Upgrade existiert

**Ablauf:**
1. Benutzer klickt "Löschen"
2. System zeigt Bestätigungsdialog
3. Benutzer bestätigt
4. System löscht Upgrade
5. Upgrade verschwindet aus Liste

**Erwartetes Ergebnis:** Upgrade wird gelöscht

---

## 6. Einstellungen - Buchungsdauern

### UC-6.1: Einstellungen öffnen
**Akteur:** Benutzer
**Vorbedingung:** Anwendung ist gestartet
**Ablauf:**
1. Benutzer navigiert zu `/settings`
2. System lädt alle Buchungsdauern (inkl. inaktiver)
3. System zeigt Buchungsdauern-Liste mit:
   - Aktiv-Checkbox
   - Name/Label
   - Dauer-Info (fest oder variabel mit Bereich)
   - Bearbeiten/Löschen Buttons

**Erwartetes Ergebnis:** Einstellungen werden mit allen Buchungsdauern angezeigt

---

### UC-6.2: Neue feste Buchungsdauer erstellen
**Akteur:** Benutzer
**Vorbedingung:** Einstellungen sind geöffnet
**Ablauf:**
1. Benutzer klickt "Neue Dauer"
2. System zeigt Formular
3. Benutzer füllt aus:
   - Bezeichnung: "1 Stunde" (Pflicht)
   - Variable Dauer: NICHT aktiviert
   - Dauer: 60 Minuten
4. Benutzer klickt "Speichern"
5. System erstellt Buchungsdauer (active = true)
6. Neue Dauer erscheint in Liste

**Erwartetes Ergebnis:** Neue feste Buchungsdauer wird erstellt

**Validierungsregeln:**
- Bezeichnung darf nicht leer sein, max 50 Zeichen
- Dauer muss 1-480 Minuten sein

**Testdaten:**
- Bezeichnung: "1 Stunde"
- Dauer: 60 Minuten

---

### UC-6.3: Neue variable Buchungsdauer erstellen
**Akteur:** Benutzer
**Vorbedingung:** Einstellungen sind geöffnet
**Ablauf:**
1. Benutzer klickt "Neue Dauer"
2. System zeigt Formular
3. Benutzer aktiviert "Variable Dauer"
4. Formular zeigt zusätzliche Felder:
   - Minimum (Minuten)
   - Maximum (Minuten)
   - Schritte (Minuten)
5. Benutzer füllt aus:
   - Bezeichnung: "Flexibel"
   - Minimum: 30 Min
   - Maximum: 240 Min
   - Schritte: 30 Min
6. Benutzer klickt "Speichern"
7. System erstellt variable Buchungsdauer
8. Neue Dauer erscheint in Liste

**Erwartetes Ergebnis:** Neue variable Buchungsdauer wird erstellt

**Validierungsregeln:**
- Minimum < Maximum
- Schritte > 0
- Alle Werte > 0

**Testdaten:**
- Bezeichnung: "Flexibel"
- Min: 30, Max: 240, Schritte: 30

---

### UC-6.4: Buchungsdauer bearbeiten
**Akteur:** Benutzer
**Vorbedingung:**
- Einstellungen sind geöffnet
- Mindestens 1 Buchungsdauer existiert

**Ablauf:**
1. Benutzer klickt "Bearbeiten" bei einer Dauer
2. Dauer-Element wechselt in Edit-Modus (Inline-Formular)
3. Benutzer ändert Werte
4. Benutzer klickt "Speichern"
5. System validiert und aktualisiert Buchungsdauer
6. Element wechselt zurück in Anzeigemodus

**Erwartetes Ergebnis:** Buchungsdauer wird aktualisiert

**Alternativablauf:**
- Benutzer klickt "Abbrechen"
- Änderungen werden verworfen

---

### UC-6.5: Buchungsdauer aktivieren/deaktivieren
**Akteur:** Benutzer
**Vorbedingung:**
- Einstellungen sind geöffnet
- Mindestens 1 Buchungsdauer existiert

**Ablauf:**
1. Benutzer klickt auf Aktiv-Checkbox einer Dauer
2. System aktualisiert sofort active-Status
3. Bei Deaktivierung:
   - Element wird grau dargestellt
   - Dauer erscheint nicht mehr in Buchungsformularen

**Erwartetes Ergebnis:** Aktiv-Status wird geändert

---

### UC-6.6: Buchungsdauer löschen
**Akteur:** Benutzer
**Vorbedingung:**
- Einstellungen sind geöffnet
- Mindestens 1 Buchungsdauer existiert

**Ablauf:**
1. Benutzer klickt "Löschen" bei einer Dauer
2. System zeigt Bestätigungsdialog
3. Benutzer bestätigt
4. System löscht Buchungsdauer
5. Dauer verschwindet aus Liste

**Erwartetes Ergebnis:** Buchungsdauer wird gelöscht

---

## 7. Navigation & Layout

### UC-7.1: Zwischen Seiten navigieren
**Akteur:** Benutzer
**Vorbedingung:** Anwendung ist gestartet
**Ablauf:**
1. Benutzer klickt auf Navigation-Link in Sidebar:
   - Kalender
   - Buchungen
   - Räume
   - Provider
   - Upgrades
   - Einstellungen
2. System navigiert zur entsprechenden Seite
3. Aktiver Link wird hervorgehoben

**Erwartetes Ergebnis:** Navigation funktioniert, aktive Seite wird angezeigt

---

### UC-7.2: Mobile Navigation
**Akteur:** Benutzer (Mobile)
**Vorbedingung:** Anwendung wird auf mobiler Ansicht geöffnet
**Ablauf:**
1. Benutzer sieht Hamburger-Menü
2. Benutzer klickt Hamburger-Menü
3. Sidebar öffnet sich
4. Benutzer wählt Navigation-Link
5. Sidebar schließt sich
6. Seite wird geladen

**Erwartetes Ergebnis:** Mobile Navigation funktioniert

---

## Zusammenfassung der Testdaten-Anforderungen

### Stammdaten (Müssen vor Tests vorhanden sein):
- Mindestens 2 aktive Räume
- Mindestens 2 aktive Provider
- Mindestens 3 Upgrades (2 aktiv, 1 inaktiv)
- Mindestens 3 Buchungsdauern (fest und variabel)

### Beispiel-Stammdaten:
**Räume:**
- "Roter Raum" - 70€/h - #EF4444
- "Blauer Raum" - 75€/h - #3B82F6

**Provider:**
- "Anna Schmidt" - #EC4899
- "Max Müller" - #8B5CF6

**Upgrades:**
- "Champagner" - 50€
- "Massage" - 80€
- "Kaviar" - 120€ (inaktiv)

**Buchungsdauern:**
- "30 Minuten" - 30 Min (fest)
- "1 Stunde" - 60 Min (fest)
- "Flexibel" - 30-240 Min, Schritte 30 (variabel)

### Test-Buchungen:
- Heute 14:00 - Anna Schmidt - Roter Raum - 60 Min - "Kunde A" - 1x Champagner
- Heute 16:00 - Max Müller - Blauer Raum - 90 Min - "Kunde B" - ohne Upgrades
- Morgen 10:00 - Anna Schmidt - Blauer Raum - 120 Min - "Kunde C" - 2x Massage
