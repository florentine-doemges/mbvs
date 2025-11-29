import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import Upgrades from '../pages/Upgrades'
import * as api from '../api/client'

// Mock the API
vi.mock('../api/client', () => ({
  fetchUpgrades: vi.fn(),
  deleteUpgrade: vi.fn(),
}))

function renderUpgrades() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Upgrades />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Upgrades', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state', () => {
    vi.mocked(api.fetchUpgrades).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )
    renderUpgrades()
    expect(screen.getByText('Laden...')).toBeInTheDocument()
  })

  it('shows error state', async () => {
    vi.mocked(api.fetchUpgrades).mockRejectedValue(new Error('Network error'))
    renderUpgrades()

    await waitFor(() => {
      expect(screen.getByText('Fehler beim Laden der Upgrades')).toBeInTheDocument()
    })
  })

  it('renders upgrades list', async () => {
    const mockUpgrades = [
      { id: '1', name: 'Premium', price: 50.0, active: true },
      { id: '2', name: 'Extra', price: 30.0, active: true },
    ]
    vi.mocked(api.fetchUpgrades).mockResolvedValue(mockUpgrades)

    renderUpgrades()

    await waitFor(() => {
      expect(screen.getByText('Premium')).toBeInTheDocument()
      expect(screen.getByText('Extra')).toBeInTheDocument()
      expect(screen.getByText(/50,00\s*€/)).toBeInTheDocument()
      expect(screen.getByText(/30,00\s*€/)).toBeInTheDocument()
    })
  })

  it('shows "Neues Upgrade" button', async () => {
    vi.mocked(api.fetchUpgrades).mockResolvedValue([])
    renderUpgrades()

    await waitFor(() => {
      const newButton = screen.getByText('Neues Upgrade')
      expect(newButton).toBeInTheDocument()
      expect(newButton.closest('a')).toHaveAttribute('href', '/upgrades/new')
    })
  })

  it('shows empty state when no upgrades', async () => {
    vi.mocked(api.fetchUpgrades).mockResolvedValue([])
    renderUpgrades()

    await waitFor(() => {
      expect(screen.getByText('Keine Upgrades vorhanden')).toBeInTheDocument()
    })
  })

  it('renders active and inactive status badges', async () => {
    const mockUpgrades = [
      { id: '1', name: 'Active Upgrade', price: 50.0, active: true },
      { id: '2', name: 'Inactive Upgrade', price: 30.0, active: false },
    ]
    vi.mocked(api.fetchUpgrades).mockResolvedValue(mockUpgrades)

    renderUpgrades()

    await waitFor(() => {
      const activeBadges = screen.getAllByText('Aktiv')
      const inactiveBadges = screen.getAllByText('Inaktiv')
      expect(activeBadges.length).toBeGreaterThan(0)
      expect(inactiveBadges.length).toBeGreaterThan(0)
    })
  })

  it('toggles show inactive checkbox', async () => {
    vi.mocked(api.fetchUpgrades).mockResolvedValue([])
    renderUpgrades()

    await waitFor(() => {
      const checkbox = screen.getByLabelText('Inaktive anzeigen')
      expect(checkbox).not.toBeChecked()
      fireEvent.click(checkbox)
      expect(checkbox).toBeChecked()
    })
  })

  it('renders edit links for each upgrade', async () => {
    const mockUpgrades = [
      { id: '123', name: 'Premium', price: 50.0, active: true },
    ]
    vi.mocked(api.fetchUpgrades).mockResolvedValue(mockUpgrades)

    renderUpgrades()

    await waitFor(() => {
      const editLink = screen.getByText('Bearbeiten')
      expect(editLink.closest('a')).toHaveAttribute('href', '/upgrades/123')
    })
  })

  it('handles delete with confirmation', async () => {
    const mockUpgrades = [
      { id: '1', name: 'Premium', price: 50.0, active: true },
    ]
    vi.mocked(api.fetchUpgrades).mockResolvedValue(mockUpgrades)
    vi.mocked(api.deleteUpgrade).mockResolvedValue(undefined)

    // Mock window.confirm to return true
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderUpgrades()

    await waitFor(() => {
      const deleteButton = screen.getByText('Löschen')
      fireEvent.click(deleteButton)
    })

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledWith('Möchten Sie "Premium" wirklich löschen?')
    })

    confirmSpy.mockRestore()
  })

  it('cancels delete when confirmation is rejected', async () => {
    const mockUpgrades = [
      { id: '1', name: 'Premium', price: 50.0, active: true },
    ]
    vi.mocked(api.fetchUpgrades).mockResolvedValue(mockUpgrades)

    // Mock window.confirm to return false
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    renderUpgrades()

    await waitFor(() => {
      const deleteButton = screen.getByText('Löschen')
      fireEvent.click(deleteButton)
    })

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled()
      expect(api.deleteUpgrade).not.toHaveBeenCalled()
    })

    confirmSpy.mockRestore()
  })

  it('shows alert on delete error', async () => {
    const mockUpgrades = [
      { id: '1', name: 'Premium', price: 50.0, active: true },
    ]
    vi.mocked(api.fetchUpgrades).mockResolvedValue(mockUpgrades)
    vi.mocked(api.deleteUpgrade).mockRejectedValue(new Error('Delete failed'))

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    renderUpgrades()

    await waitFor(() => {
      const deleteButton = screen.getByText('Löschen')
      fireEvent.click(deleteButton)
    })

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Delete failed')
    })

    confirmSpy.mockRestore()
    alertSpy.mockRestore()
  })

  it('formats prices correctly', async () => {
    const mockUpgrades = [
      { id: '1', name: 'Premium', price: 1234.56, active: true },
    ]
    vi.mocked(api.fetchUpgrades).mockResolvedValue(mockUpgrades)

    renderUpgrades()

    await waitFor(() => {
      // Check for formatted price (may have regular or non-breaking space)
      const priceText = screen.getByText(/1\.234,56\s*€/)
      expect(priceText).toBeInTheDocument()
    })
  })
})
