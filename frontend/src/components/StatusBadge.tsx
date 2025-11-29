interface StatusBadgeProps {
  status: 'upcoming' | 'today' | 'past'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    upcoming: { label: 'Kommend', color: 'bg-blue-100 text-blue-800' },
    today: { label: 'Heute', color: 'bg-green-100 text-green-800' },
    past: { label: 'Vergangen', color: 'bg-gray-100 text-gray-600' },
  }

  const { label, color } = config[status]

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}
