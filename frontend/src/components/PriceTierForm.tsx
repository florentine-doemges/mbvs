import { useState } from 'react'
import type { RoomPriceTier, PriceType, CreatePriceTierRequest } from '../api/types'
import { usePriceTiers, useCreatePriceTier, useDeletePriceTier } from '../hooks/usePriceTiers'

interface PriceTierFormProps {
  roomId: string
  priceId: string
}

export default function PriceTierForm({ roomId, priceId }: PriceTierFormProps) {
  const { data: tiers, isLoading } = usePriceTiers(roomId, priceId)
  const createTier = useCreatePriceTier(roomId, priceId)
  const deleteTier = useDeletePriceTier(roomId, priceId)

  const [fromMinutes, setFromMinutes] = useState('')
  const [toMinutes, setToMinutes] = useState('')
  const [priceType, setPriceType] = useState<PriceType>('HOURLY')
  const [price, setPrice] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const from = parseInt(fromMinutes)
    const to = toMinutes ? parseInt(toMinutes) : null
    const priceValue = parseFloat(price)

    if (isNaN(from) || from < 0) {
      setError('Bitte geben Sie eine gültige Startzeit ein')
      return
    }

    if (toMinutes && (isNaN(to as number) || (to as number) <= from)) {
      setError('Die Endzeit muss größer als die Startzeit sein')
      return
    }

    if (isNaN(priceValue) || priceValue <= 0) {
      setError('Bitte geben Sie einen gültigen Preis ein')
      return
    }

    const request: CreatePriceTierRequest = {
      fromMinutes: from,
      toMinutes: to,
      priceType,
      price: priceValue,
      sortOrder: (tiers?.length || 0),
    }

    try {
      await createTier.mutateAsync(request)
      // Reset form
      setFromMinutes('')
      setToMinutes('')
      setPriceType('HOURLY')
      setPrice('')
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen der Preisstufe')
    }
  }

  const handleDelete = async (tierId: string) => {
    if (!confirm('Preisstufe wirklich löschen?')) {
      return
    }

    try {
      await deleteTier.mutateAsync(tierId)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fehler beim Löschen der Preisstufe')
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins} Min`
    if (mins === 0) return `${hours} Std`
    return `${hours}:${mins.toString().padStart(2, '0')} Std`
  }

  if (isLoading) {
    return <div className="text-gray-500 text-sm">Laden...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Preisstaffel (optional)
        </label>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Staffel hinzufügen
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Ohne Staffel gilt der Stundensatz für alle Buchungen. Mit Staffel können Sie
        unterschiedliche Preise für verschiedene Zeiträume definieren.
      </p>

      {/* Existing tiers */}
      {tiers && tiers.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Von
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Bis
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Typ
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Preis
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Aktion
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tiers.map((tier: RoomPriceTier) => (
                <tr key={tier.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{formatDuration(tier.fromMinutes)}</td>
                  <td className="px-3 py-2">
                    {tier.toMinutes ? formatDuration(tier.toMinutes) : '∞'}
                  </td>
                  <td className="px-3 py-2">
                    {tier.priceType === 'FIXED' ? (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                        Festpreis
                      </span>
                    ) : (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        Stundensatz
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-medium">
                    {tier.price.toFixed(2)} €
                    {tier.priceType === 'HOURLY' && '/Std'}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(tier.id)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add tier form */}
      {showForm && (
        <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Neue Preisstufe</h4>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setError(null)
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {error && <div className="p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="fromMinutes" className="block text-xs font-medium text-gray-700 mb-1">
                Von (Minuten) *
              </label>
              <input
                id="fromMinutes"
                type="number"
                value={fromMinutes}
                onChange={(e) => setFromMinutes(e.target.value)}
                min="0"
                step="1"
                required
                className="w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="toMinutes" className="block text-xs font-medium text-gray-700 mb-1">
                Bis (Minuten)
              </label>
              <input
                id="toMinutes"
                type="number"
                value={toMinutes}
                onChange={(e) => setToMinutes(e.target.value)}
                min="1"
                step="1"
                className="w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="∞ (leer lassen)"
              />
            </div>
          </div>

          <div>
            <label htmlFor="priceType" className="block text-xs font-medium text-gray-700 mb-1">Typ *</label>
            <select
              id="priceType"
              value={priceType}
              onChange={(e) => setPriceType(e.target.value as PriceType)}
              className="w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="HOURLY">Stundensatz</option>
              <option value="FIXED">Festpreis</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {priceType === 'FIXED'
                ? 'Fester Preis für den gesamten Zeitraum'
                : 'Preis pro Stunde für die Minuten in diesem Zeitraum'}
            </p>
          </div>

          <div>
            <label htmlFor="tierPrice" className="block text-xs font-medium text-gray-700 mb-1">
              Preis (€) *
            </label>
            <input
              id="tierPrice"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0.01"
              step="0.01"
              required
              className="w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="70.00"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => void handleSubmit(e as unknown as React.FormEvent)}
              disabled={createTier.isPending}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {createTier.isPending ? 'Speichern...' : 'Hinzufügen'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1 border text-sm rounded hover:bg-gray-100"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
