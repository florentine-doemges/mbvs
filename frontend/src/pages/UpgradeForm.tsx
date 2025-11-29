import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useUpgrade, useCreateUpgrade, useUpdateUpgrade } from '../hooks/useUpgrades'

export default function UpgradeForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const { data: upgrade, isLoading } = useUpgrade(id || '')
  const createUpgrade = useCreateUpgrade()
  const updateUpgrade = useUpdateUpgrade()

  const [name, setName] = useState('')
  const [price, setPrice] = useState('0')
  const [active, setActive] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
          />
          <p className="mt-1 text-sm text-gray-500">
            Der Aufpreis für dieses Upgrade in Euro
          </p>
        </div>

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
