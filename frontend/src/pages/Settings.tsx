import { useState } from 'react'
import {
  useDurationOptions,
  useCreateDurationOption,
  useUpdateDurationOption,
  useDeleteDurationOption,
} from '../hooks/useDurationOptions'
import { LOCATION_ID } from '../App'
import type { DurationOption } from '../api/types'

export default function Settings() {
  const { data: options, isLoading, error } = useDurationOptions(LOCATION_ID, true)
  const createOption = useCreateDurationOption(LOCATION_ID)
  const updateOption = useUpdateDurationOption()
  const deleteOption = useDeleteDurationOption()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleDelete = async (optionId: string, label: string) => {
    if (!confirm(`Möchten Sie "${label}" wirklich löschen?`)) {
      return
    }
    try {
      await deleteOption.mutateAsync(optionId)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fehler beim Löschen')
    }
  }

  const handleToggleActive = async (option: DurationOption) => {
    try {
      await updateOption.mutateAsync({
        optionId: option.id,
        request: {
          minutes: option.minutes,
          label: option.label,
          isVariable: option.isVariable,
          minMinutes: option.minMinutes ?? undefined,
          maxMinutes: option.maxMinutes ?? undefined,
          stepMinutes: option.stepMinutes ?? undefined,
          sortOrder: option.sortOrder,
          active: !option.active,
        },
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fehler beim Aktualisieren')
    }
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
        <div className="text-red-500">Fehler beim Laden der Einstellungen</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Buchungsdauern</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Neue Dauer
          </button>
        </div>

        <div className="p-4 space-y-3">
          {options?.map((option) => (
            <div
              key={option.id}
              className={`p-4 border rounded-lg ${!option.active ? 'bg-gray-50' : ''}`}
            >
              {editingId === option.id ? (
                <DurationForm
                  option={option}
                  onSave={async (data) => {
                    try {
                      await updateOption.mutateAsync({
                        optionId: option.id,
                        request: {
                          ...data,
                          sortOrder: option.sortOrder,
                          active: option.active,
                        },
                      })
                      setEditingId(null)
                    } catch (err) {
                      setFormError(
                        err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten'
                      )
                    }
                  }}
                  onCancel={() => setEditingId(null)}
                  error={formError}
                />
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={option.active}
                      onChange={() => void handleToggleActive(option)}
                      className="rounded"
                    />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">
                        {option.isVariable
                          ? `${option.minMinutes}-${option.maxMinutes} Min (${option.stepMinutes}er Schritte)`
                          : `${option.minutes} Minuten`}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(option.id)
                        setFormError(null)
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => void handleDelete(option.id, option.label)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {showAddForm && (
            <div className="p-4 border rounded-lg border-blue-200 bg-blue-50">
              <DurationForm
                onSave={async (data) => {
                  try {
                    await createOption.mutateAsync(data)
                    setShowAddForm(false)
                    setFormError(null)
                  } catch (err) {
                    setFormError(
                      err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten'
                    )
                  }
                }}
                onCancel={() => {
                  setShowAddForm(false)
                  setFormError(null)
                }}
                error={formError}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface DurationFormProps {
  option?: DurationOption
  onSave: (data: {
    minutes: number
    label: string
    isVariable: boolean
    minMinutes?: number
    maxMinutes?: number
    stepMinutes?: number
  }) => Promise<void>
  onCancel: () => void
  error: string | null
}

function DurationForm({ option, onSave, onCancel, error }: DurationFormProps) {
  const [label, setLabel] = useState(option?.label || '')
  const [isVariable, setIsVariable] = useState(option?.isVariable || false)
  const [minutes, setMinutes] = useState(option?.minutes?.toString() || '60')
  const [minMinutes, setMinMinutes] = useState(option?.minMinutes?.toString() || '30')
  const [maxMinutes, setMaxMinutes] = useState(option?.maxMinutes?.toString() || '480')
  const [stepMinutes, setStepMinutes] = useState(option?.stepMinutes?.toString() || '30')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        label,
        isVariable,
        minutes: isVariable ? 0 : parseInt(minutes),
        minMinutes: isVariable ? parseInt(minMinutes) : undefined,
        maxMinutes: isVariable ? parseInt(maxMinutes) : undefined,
        stepMinutes: isVariable ? parseInt(stepMinutes) : undefined,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bezeichnung *
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
          maxLength={50}
          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          placeholder="z.B. 1 Stunde, Variable..."
        />
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isVariable}
            onChange={(e) => setIsVariable(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Variable Dauer</span>
        </label>
      </div>

      {isVariable ? (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum (Min)
            </label>
            <input
              type="number"
              value={minMinutes}
              onChange={(e) => setMinMinutes(e.target.value)}
              min="1"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum (Min)
            </label>
            <input
              type="number"
              value={maxMinutes}
              onChange={(e) => setMaxMinutes(e.target.value)}
              min="1"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Schritte (Min)
            </label>
            <input
              type="number"
              value={stepMinutes}
              onChange={(e) => setStepMinutes(e.target.value)}
              min="1"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dauer (Minuten) *
          </label>
          <input
            type="number"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            min="1"
            max="480"
            className="w-48 px-3 py-2 border rounded"
          />
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Speichern...' : 'Speichern'}
        </button>
      </div>
    </form>
  )
}
