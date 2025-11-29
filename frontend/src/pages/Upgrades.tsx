import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUpgrades, useDeleteUpgrade } from '../hooks/useUpgrades'

export default function Upgrades() {
  const [showInactive, setShowInactive] = useState(false)
  const { data: upgrades, isLoading, error } = useUpgrades(showInactive)
  const deleteUpgrade = useDeleteUpgrade()

  const handleDelete = async (upgradeId: string, upgradeName: string) => {
    if (!confirm(`Möchten Sie "${upgradeName}" wirklich löschen?`)) {
      return
    }
    try {
      await deleteUpgrade.mutateAsync(upgradeId)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fehler beim Löschen')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Laden...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Fehler beim Laden der Upgrades</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-semibold">Upgrades</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded"
            />
            Inaktive anzeigen
          </label>
          <Link
            to="/upgrades/new"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Neues Upgrade
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left font-medium">Name</th>
              <th className="p-3 text-right font-medium">Preis</th>
              <th className="p-3 text-center font-medium">Status</th>
              <th className="p-3 text-right font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {upgrades?.map((upgrade) => (
              <tr
                key={upgrade.id}
                className={`border-t ${!upgrade.active ? 'bg-gray-50 text-gray-500' : ''}`}
              >
                <td className="p-3 font-medium">{upgrade.name}</td>
                <td className="p-3 text-right">{formatPrice(upgrade.price)}</td>
                <td className="p-3 text-center">
                  {upgrade.active ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Aktiv
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                      Inaktiv
                    </span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/upgrades/${upgrade.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Bearbeiten
                    </Link>
                    <button
                      onClick={() => void handleDelete(upgrade.id, upgrade.name)}
                      className="text-red-600 hover:text-red-800"
                      disabled={deleteUpgrade.isPending}
                    >
                      Löschen
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {upgrades?.length === 0 && (
        <div className="p-8 text-center text-gray-500">Keine Upgrades vorhanden</div>
      )}
    </div>
  )
}
