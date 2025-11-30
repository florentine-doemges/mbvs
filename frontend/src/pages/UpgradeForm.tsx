import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { useUpgrade, useCreateUpgrade, useUpdateUpgrade } from '../hooks/useUpgrades'
import { useUpgradePriceHistory, useAddUpgradePrice } from '../hooks/usePrices'

export default function UpgradeForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const { data: upgrade, isLoading } = useUpgrade(id || '')
  const createUpgrade = useCreateUpgrade()
  const updateUpgrade = useUpdateUpgrade()
  const { data: priceHistory } = useUpgradePriceHistory(id || '')
  const addPriceMutation = useAddUpgradePrice(id || '')

  const [name, setName] = useState('')
  const [price, setPrice] = useState('0')
  const [active, setActive] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditingPrice, setIsEditingPrice] = useState(false)
  const [newPrice, setNewPrice] = useState('')

  useEffect(() => {
    if (upgrade) {
      setName(upgrade.name)
      setPrice(upgrade.price.toString())
      setActive(upgrade.active)
    }
  }, [upgrade])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Bitte geben Sie einen Namen ein')
      return
    }

    const priceValue = parseFloat(price)
    if (isNaN(priceValue) || priceValue < 0) {
      setError('Bitte geben Sie einen gültigen Preis ein')
      return
    }

    try {
      if (isEditing && id) {
        await updateUpgrade.mutateAsync({
          upgradeId: id,
          request: {
            name,
            price: priceValue,
            active,
          },
        })
      } else {
        await createUpgrade.mutateAsync({
          name,
          price: priceValue,
        })
      }
      void navigate('/upgrades')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    }
  }

  const handleAddPrice = async () => {
    setError(null)
    const parsedPrice = parseFloat(newPrice)
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Bitte geben Sie einen gültigen Preis ein')
      return
    }

    try {
      await addPriceMutation.mutateAsync(parsedPrice)
      setNewPrice('')
      setIsEditingPrice(false)
      setPrice(parsedPrice.toString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Hinzufügen des Preises')
    }
  }

  const handleSelectHistoricalPrice = (historicalPrice: number) => {
    setNewPrice(historicalPrice.toString())
    setIsEditingPrice(true)
  }

  if (isEditing && isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Laden...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">
          {isEditing ? 'Upgrade bearbeiten' : 'Neues Upgrade'}
        </h2>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-6">
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="z.B. Champagner, Kaviar, Massage..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preis (EUR) *
            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditingPrice(!isEditingPrice)}
                className="ml-2 text-sm text-blue-600 hover:text-blue-800"
              >
                {isEditingPrice ? '✗ Abbrechen' : '✏️ Preis ändern'}
              </button>
            )}
          </label>
          {!isEditing || !isEditingPrice ? (
            <>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                readOnly={isEditing}
              />
              <p className="mt-1 text-sm text-gray-500">
                Der Aufpreis für dieses Upgrade in Euro
              </p>
            </>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Neuer Preis"
                />
                <button
                  type="button"
                  onClick={() => void handleAddPrice()}
                  disabled={addPriceMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {addPriceMutation.isPending ? 'Speichern...' : '✓ Speichern'}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Der neue Preis gilt ab sofort. Der alte Preis bleibt in der Historie erhalten.
              </p>
            </div>
          )}
        </div>

        {isEditing && priceHistory && priceHistory.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preishistorie
            </label>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Preis
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Gültig von
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Gültig bis
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Aktion
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {priceHistory.map((priceItem) => (
                    <tr key={priceItem.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">
                        {priceItem.price.toFixed(2)} €
                        {!priceItem.validTo && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                            Aktuell
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {format(new Date(priceItem.validFrom), 'dd.MM.yyyy HH:mm', { locale: de })}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {priceItem.validTo
                          ? format(new Date(priceItem.validTo), 'dd.MM.yyyy HH:mm', { locale: de })
                          : '-'}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {priceItem.validTo && (
                          <button
                            type="button"
                            onClick={() => handleSelectHistoricalPrice(priceItem.price)}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            Als neuen Preis übernehmen
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isEditing && (
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">Aktiv</span>
            </label>
            <p className="mt-1 text-sm text-gray-500">
              Inaktive Upgrades können nicht mehr für Buchungen ausgewählt werden
            </p>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => void navigate('/upgrades')}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={createUpgrade.isPending || updateUpgrade.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {createUpgrade.isPending || updateUpgrade.isPending ? 'Speichern...' : 'Speichern'}
          </button>
        </div>
      </form>
    </div>
  )
}
