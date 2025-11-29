import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import UpgradeForm from '../pages/UpgradeForm'
import * as api from '../api/client'

// Mock the API
vi.mock('../api/client', () => ({
  fetchUpgrade: vi.fn(),
  createUpgrade: vi.fn(),
  updateUpgrade: vi.fn(),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderUpgradeForm(initialPath = '/upgrades/new') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/upgrades/new" element={<UpgradeForm />} />
          <Route path="/upgrades/:id" element={<UpgradeForm />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('UpgradeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders create form with title', () => {
    renderUpgradeForm()
    expect(screen.getByText('Neues Upgrade')).toBeInTheDocument()
  })

  it('renders edit form with title when id is present', async () => {
    const mockUpgrade = {
      id: '123',
      name: 'Premium',
      price: 50.0,
      active: true,
    }
    vi.mocked(api.fetchUpgrade).mockResolvedValue(mockUpgrade)

    renderUpgradeForm('/upgrades/123')

    await waitFor(() => {
      expect(screen.getByText('Upgrade bearbeiten')).toBeInTheDocument()
    })
  })

  it('shows loading state when editing', () => {
    vi.mocked(api.fetchUpgrade).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    renderUpgradeForm('/upgrades/123')

    expect(screen.getByText('Laden...')).toBeInTheDocument()
  })

  it('populates form fields when editing', async () => {
    const mockUpgrade = {
      id: '123',
      name: 'Premium',
      price: 50.0,
      active: true,
    }
    vi.mocked(api.fetchUpgrade).mockResolvedValue(mockUpgrade)

    renderUpgradeForm('/upgrades/123')

    await waitFor(() => {
      expect(screen.getByDisplayValue('Premium')).toBeInTheDocument()
      expect(screen.getByDisplayValue('50')).toBeInTheDocument()
      expect(screen.getByLabelText('Aktiv')).toBeChecked()
    })
  })

  it('shows active checkbox only in edit mode', () => {
    renderUpgradeForm()

    expect(screen.queryByLabelText('Aktiv')).not.toBeInTheDocument()
  })

  it('calls createUpgrade on form submit in create mode', async () => {
    vi.mocked(api.createUpgrade).mockResolvedValue({
      id: '123',
      name: 'Test Upgrade',
      price: 25.0,
      active: true,
    })

    renderUpgradeForm()

    const nameInput = screen.getByPlaceholderText(/z.B. Champagner/)
    const priceInput = screen.getByPlaceholderText('0.00')
    const submitButton = screen.getByText('Speichern')

    fireEvent.change(nameInput, { target: { value: 'Test Upgrade' } })
    fireEvent.change(priceInput, { target: { value: '25' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(api.createUpgrade).toHaveBeenCalledWith({
        name: 'Test Upgrade',
        price: 25,
      })
      expect(mockNavigate).toHaveBeenCalledWith('/upgrades')
    })
  })

  it('calls updateUpgrade on form submit in edit mode', async () => {
    const mockUpgrade = {
      id: '123',
      name: 'Premium',
      price: 50.0,
      active: true,
    }
    vi.mocked(api.fetchUpgrade).mockResolvedValue(mockUpgrade)
    vi.mocked(api.updateUpgrade).mockResolvedValue(mockUpgrade)

    renderUpgradeForm('/upgrades/123')

    await waitFor(() => {
      expect(screen.getByDisplayValue('Premium')).toBeInTheDocument()
    })

    const nameInput = screen.getByDisplayValue('Premium')
    const submitButton = screen.getByText('Speichern')

    fireEvent.change(nameInput, { target: { value: 'Updated Premium' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(api.updateUpgrade).toHaveBeenCalledWith('123', {
        name: 'Updated Premium',
        price: 50,
        active: true,
      })
      expect(mockNavigate).toHaveBeenCalledWith('/upgrades')
    })
  })

  it('shows error when name is empty', async () => {
    renderUpgradeForm()

    const nameInput = screen.getByPlaceholderText(/z.B. Champagner/)
    const priceInput = screen.getByPlaceholderText('0.00')
    const submitButton = screen.getByText('Speichern')

    // Fill price but leave name empty (with only whitespace)
    fireEvent.change(nameInput, { target: { value: '   ' } })
    fireEvent.change(priceInput, { target: { value: '25' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Bitte geben Sie einen Namen ein')).toBeInTheDocument()
    })
  })

  // Note: Browser-level HTML5 validation for invalid/negative prices is handled by the input[type=number] element

  it('shows error message when API call fails', async () => {
    vi.mocked(api.createUpgrade).mockRejectedValue(new Error('API Error'))

    renderUpgradeForm()

    const nameInput = screen.getByPlaceholderText(/z.B. Champagner/)
    const priceInput = screen.getByPlaceholderText('0.00')
    const submitButton = screen.getByText('Speichern')

    fireEvent.change(nameInput, { target: { value: 'Test' } })
    fireEvent.change(priceInput, { target: { value: '25' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument()
    })
  })

  it('navigates back on cancel button click', () => {
    renderUpgradeForm()

    const cancelButton = screen.getByText('Abbrechen')
    fireEvent.click(cancelButton)

    expect(mockNavigate).toHaveBeenCalledWith('/upgrades')
  })

  it('disables submit button while submitting', async () => {
    vi.mocked(api.createUpgrade).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    renderUpgradeForm()

    const nameInput = screen.getByPlaceholderText(/z.B. Champagner/)
    const priceInput = screen.getByPlaceholderText('0.00')
    const submitButton = screen.getByText('Speichern')

    fireEvent.change(nameInput, { target: { value: 'Test' } })
    fireEvent.change(priceInput, { target: { value: '25' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Speichern...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })
  })

  it('toggles active checkbox in edit mode', async () => {
    const mockUpgrade = {
      id: '123',
      name: 'Premium',
      price: 50.0,
      active: true,
    }
    vi.mocked(api.fetchUpgrade).mockResolvedValue(mockUpgrade)

    renderUpgradeForm('/upgrades/123')

    await waitFor(() => {
      const activeCheckbox = screen.getByLabelText('Aktiv')
      expect(activeCheckbox).toBeChecked()
      fireEvent.click(activeCheckbox)
      expect(activeCheckbox).not.toBeChecked()
    })
  })
})
