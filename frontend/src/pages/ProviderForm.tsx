import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProvider, useCreateProvider, useUpdateProvider } from '../hooks/useProviders'
import { LOCATION_ID } from '../App'

const DEFAULT_COLORS = [
  '#EC4899',
  '#F97316',
  '#EAB308',
  '#22C55E',
  '#14B8A6',
  '#06B6D4',
  '#8B5CF6',
  '#A855F7',
]

export default function ProviderForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const { data: provider, isLoading } = useProvider(id || '')
  const createProvider = useCreateProvider(LOCATION_ID)
  const updateProvider = useUpdateProvider()

  const [name, setName] = useState('')
  const [color, setColor] = useState('#10B981')
  const [active, setActive] = useState(true)
  const [sortOrder, setSortOrder] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (provider) {
      setName(provider.name)
      setColor(provider.color)
      setActive(provider.active)
      setSortOrder(provider.sortOrder)
    }
  }, [provider])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Bitte geben Sie einen Namen ein')
      return
    }

    try {
      if (isEditing && id) {
        await updateProvider.mutateAsync({
          providerId: id,
          request: {
            name,
            active,
            sortOrder,
            color,
          },
        })
      } else {
        await createProvider.mutateAsync({
          name,
          color,
        })
      }
      void navigate('/providers')
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
          {isEditing ? 'Provider bearbeiten' : 'Neuer Provider'}
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
            placeholder="z.B. Lady Lexi, Mistress Bella..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Farbe
          </label>
          <div className="flex items-center gap-4">
            <div className="flex gap-2 flex-wrap">
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    color === c ? 'border-gray-800 ring-2 ring-offset-2 ring-blue-500' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <span className="text-sm text-gray-600">{color}</span>
          </div>
        </div>

        {isEditing && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sortierung
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                min="0"
                className="w-32 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Niedrigere Werte erscheinen zuerst in Listen
              </p>
            </div>

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
                Inaktive Provider können nicht mehr für Buchungen ausgewählt werden
              </p>
            </div>
          </>
        )}

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => void navigate('/providers')}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={createProvider.isPending || updateProvider.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {createProvider.isPending || updateProvider.isPending ? 'Speichern...' : 'Speichern'}
          </button>
        </div>
      </form>
    </div>
  )
}
