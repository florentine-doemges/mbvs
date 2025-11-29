import { NavLink } from 'react-router-dom'
import { useLocation } from '../hooks/useLocation'
import { LOCATION_ID } from '../App'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  { path: '/calendar', label: 'Kalender', icon: '📅' },
  { path: '/bookings', label: 'Buchungen', icon: '📋' },
  { path: '/rooms', label: 'Räume', icon: '🚪' },
  { path: '/providers', label: 'Provider', icon: '👤' },
  { path: '/upgrades', label: 'Upgrades', icon: '✨' },
  { path: '/settings', label: 'Einstellungen', icon: '⚙️' },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { data: location } = useLocation(LOCATION_ID)
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30
          w-64 bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">
              {location?.name || 'Studio Mabella'}
            </h1>
            <p className="text-sm text-gray-500">Buchungssystem</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t text-xs text-gray-400">
            Version 1.0 - Slice 2
          </div>
        </div>
      </aside>
    </>
  )
}
