import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PriceTierForm from '../components/PriceTierForm'
import * as hooks from '../hooks/usePriceTiers'

// Mock the hooks
vi.mock('../hooks/usePriceTiers', () => ({
  usePriceTiers: vi.fn(),
  useCreatePriceTier: vi.fn(),
  useDeletePriceTier: vi.fn(),
}))

describe('PriceTierForm', () => {
  let queryClient: QueryClient
  const mockRoomId = 'room-123'
  const mockPriceId = 'price-456'

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <PriceTierForm roomId={mockRoomId} priceId={mockPriceId} />
      </QueryClientProvider>
    )
  }

  it('shows loading state initially', () => {
    vi.mocked(hooks.usePriceTiers).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any)
    vi.mocked(hooks.useCreatePriceTier).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(hooks.useDeletePriceTier).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any)

    renderComponent()
    expect(screen.getByText('Laden...')).toBeInTheDocument()
  })

  it('shows tier form when add button is clicked', () => {
    vi.mocked(hooks.usePriceTiers).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    vi.mocked(hooks.useCreatePriceTier).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(hooks.useDeletePriceTier).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any)

    renderComponent()

    const addButton = screen.getByText('+ Staffel hinzufügen')
    fireEvent.click(addButton)

    expect(screen.getByText('Neue Preisstufe')).toBeInTheDocument()
    expect(screen.getByLabelText('Von (Minuten) *')).toBeInTheDocument()
    expect(screen.getByLabelText('Bis (Minuten)')).toBeInTheDocument()
    expect(screen.getByLabelText('Typ *')).toBeInTheDocument()
    expect(screen.getByLabelText('Preis (€) *')).toBeInTheDocument()
  })

  it('hides tier form when close button is clicked', () => {
    vi.mocked(hooks.usePriceTiers).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    vi.mocked(hooks.useCreatePriceTier).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(hooks.useDeletePriceTier).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any)

    renderComponent()

    fireEvent.click(screen.getByText('+ Staffel hinzufügen'))
    expect(screen.getByText('Neue Preisstufe')).toBeInTheDocument()

    fireEvent.click(screen.getByText('✕'))
    expect(screen.queryByText('Neue Preisstufe')).not.toBeInTheDocument()
  })

  it('hides tier form when cancel button is clicked', () => {
    vi.mocked(hooks.usePriceTiers).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    vi.mocked(hooks.useCreatePriceTier).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(hooks.useDeletePriceTier).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any)

    renderComponent()

    fireEvent.click(screen.getByText('+ Staffel hinzufügen'))
    fireEvent.click(screen.getByText('Abbrechen'))

    expect(screen.queryByText('Neue Preisstufe')).not.toBeInTheDocument()
  })

  it('displays existing tiers in a table', () => {
    const mockTiers = [
      {
        id: 'tier-1',
        roomPriceId: mockPriceId,
        fromMinutes: 0,
        toMinutes: 30,
        priceType: 'FIXED',
        price: 75.0,
        sortOrder: 0,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'tier-2',
        roomPriceId: mockPriceId,
        fromMinutes: 30,
        toMinutes: null,
        priceType: 'HOURLY',
        price: 120.0,
        sortOrder: 1,
        createdAt: '2024-01-01T00:00:00Z',
      },
    ]

    vi.mocked(hooks.usePriceTiers).mockReturnValue({
      data: mockTiers,
      isLoading: false,
    } as any)
    vi.mocked(hooks.useCreatePriceTier).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(hooks.useDeletePriceTier).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any)

    renderComponent()

    expect(screen.getAllByText('0 Min')[0]).toBeInTheDocument()
    expect(screen.getAllByText('30 Min')[0]).toBeInTheDocument()
    expect(screen.getByText('∞')).toBeInTheDocument()
    expect(screen.getByText('Festpreis')).toBeInTheDocument()
    expect(screen.getByText('Stundensatz')).toBeInTheDocument()
    expect(screen.getByText('75.00 €')).toBeInTheDocument()
    expect(screen.getByText('120.00 €/Std')).toBeInTheDocument()
  })

  it('formats duration correctly', () => {
    const mockTiers = [
      {
        id: 'tier-1',
        roomPriceId: mockPriceId,
        fromMinutes: 0,
        toMinutes: 45,
        priceType: 'FIXED',
        price: 75.0,
        sortOrder: 0,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'tier-2',
        roomPriceId: mockPriceId,
        fromMinutes: 60,
        toMinutes: 125,
        priceType: 'HOURLY',
        price: 120.0,
        sortOrder: 1,
        createdAt: '2024-01-01T00:00:00Z',
      },
    ]

    vi.mocked(hooks.usePriceTiers).mockReturnValue({
      data: mockTiers,
      isLoading: false,
    } as any)
    vi.mocked(hooks.useCreatePriceTier).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(hooks.useDeletePriceTier).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any)

    renderComponent()

    expect(screen.getByText('45 Min')).toBeInTheDocument()
    expect(screen.getByText('1 Std')).toBeInTheDocument()
    expect(screen.getByText('2:05 Std')).toBeInTheDocument()
  })

  it('shows validation error for invalid fromMinutes', () => {
    vi.mocked(hooks.usePriceTiers).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    vi.mocked(hooks.useCreatePriceTier).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(hooks.useDeletePriceTier).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any)

    renderComponent()

    fireEvent.click(screen.getByText('+ Staffel hinzufügen'))

    const priceInput = screen.getByLabelText('Preis (€) *')
    fireEvent.change(priceInput, { target: { value: '100' } })

    fireEvent.click(screen.getByText('Hinzufügen'))

    expect(screen.getByText('Bitte geben Sie eine gültige Startzeit ein')).toBeInTheDocument()
  })

  it('shows validation error for invalid toMinutes', () => {
    vi.mocked(hooks.usePriceTiers).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    vi.mocked(hooks.useCreatePriceTier).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(hooks.useDeletePriceTier).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any)

    renderComponent()

    fireEvent.click(screen.getByText('+ Staffel hinzufügen'))

    fireEvent.change(screen.getByLabelText('Von (Minuten) *'), { target: { value: '30' } })
    fireEvent.change(screen.getByLabelText('Bis (Minuten)'), { target: { value: '20' } })
    fireEvent.change(screen.getByLabelText('Preis (€) *'), { target: { value: '100' } })

    fireEvent.click(screen.getByText('Hinzufügen'))

    expect(screen.getByText('Die Endzeit muss größer als die Startzeit sein')).toBeInTheDocument()
  })

  it('shows validation error for invalid price', () => {
    vi.mocked(hooks.usePriceTiers).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    vi.mocked(hooks.useCreatePriceTier).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(hooks.useDeletePriceTier).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any)

    renderComponent()

    fireEvent.click(screen.getByText('+ Staffel hinzufügen'))

    fireEvent.change(screen.getByLabelText('Von (Minuten) *'), { target: { value: '0' } })
    fireEvent.change(screen.getByLabelText('Bis (Minuten)'), { target: { value: '30' } })

    fireEvent.click(screen.getByText('Hinzufügen'))

    expect(screen.getByText('Bitte geben Sie einen gültigen Preis ein')).toBeInTheDocument()
  })

  it('creates tier with valid data', async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue({})

    vi.mocked(hooks.usePriceTiers).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    vi.mocked(hooks.useCreatePriceTier).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any)
    vi.mocked(hooks.useDeletePriceTier).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any)

    renderComponent()

    fireEvent.click(screen.getByText('+ Staffel hinzufügen'))

    fireEvent.change(screen.getByLabelText('Von (Minuten) *'), { target: { value: '0' } })
    fireEvent.change(screen.getByLabelText('Bis (Minuten)'), { target: { value: '30' } })
    fireEvent.change(screen.getByLabelText('Typ *'), { target: { value: 'FIXED' } })
    fireEvent.change(screen.getByLabelText('Preis (€) *'), { target: { value: '75.50' } })

    fireEvent.click(screen.getByText('Hinzufügen'))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        fromMinutes: 0,
        toMinutes: 30,
        priceType: 'FIXED',
        price: 75.5,
        sortOrder: 0,
      })
    })
  })

  it('deletes tier when delete button is clicked and confirmed', () => {
    const mockDeleteAsync = vi.fn().mockResolvedValue({})
    global.confirm = vi.fn(() => true)

    const mockTiers = [
      {
        id: 'tier-1',
        roomPriceId: mockPriceId,
        fromMinutes: 0,
        toMinutes: 30,
        priceType: 'FIXED',
        price: 75.0,
        sortOrder: 0,
        createdAt: '2024-01-01T00:00:00Z',
      },
    ]

    vi.mocked(hooks.usePriceTiers).mockReturnValue({
      data: mockTiers,
      isLoading: false,
    } as any)
    vi.mocked(hooks.useCreatePriceTier).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(hooks.useDeletePriceTier).mockReturnValue({
      mutateAsync: mockDeleteAsync,
    } as any)

    renderComponent()

    const deleteButton = screen.getByText('Löschen')
    fireEvent.click(deleteButton)

    expect(global.confirm).toHaveBeenCalledWith('Preisstufe wirklich löschen?')
    expect(mockDeleteAsync).toHaveBeenCalledWith('tier-1')
  })

  it('does not delete tier when delete is cancelled', () => {
    const mockDeleteAsync = vi.fn()
    global.confirm = vi.fn(() => false)

    const mockTiers = [
      {
        id: 'tier-1',
        roomPriceId: mockPriceId,
        fromMinutes: 0,
        toMinutes: 30,
        priceType: 'FIXED',
        price: 75.0,
        sortOrder: 0,
        createdAt: '2024-01-01T00:00:00Z',
      },
    ]

    vi.mocked(hooks.usePriceTiers).mockReturnValue({
      data: mockTiers,
      isLoading: false,
    } as any)
    vi.mocked(hooks.useCreatePriceTier).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(hooks.useDeletePriceTier).mockReturnValue({
      mutateAsync: mockDeleteAsync,
    } as any)

    renderComponent()

    const deleteButton = screen.getByText('Löschen')
    fireEvent.click(deleteButton)

    expect(mockDeleteAsync).not.toHaveBeenCalled()
  })

  it('shows pending state while creating tier', () => {
    vi.mocked(hooks.usePriceTiers).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    vi.mocked(hooks.useCreatePriceTier).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
    } as any)
    vi.mocked(hooks.useDeletePriceTier).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any)

    renderComponent()

    fireEvent.click(screen.getByText('+ Staffel hinzufügen'))

    expect(screen.getByText('Speichern...')).toBeInTheDocument()
    expect(screen.getByText('Speichern...')).toBeDisabled()
  })

  it('updates price type description when changed', () => {
    vi.mocked(hooks.usePriceTiers).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    vi.mocked(hooks.useCreatePriceTier).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(hooks.useDeletePriceTier).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any)

    renderComponent()

    fireEvent.click(screen.getByText('+ Staffel hinzufügen'))

    expect(screen.getByText('Preis pro Stunde für die Minuten in diesem Zeitraum')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Typ *'), { target: { value: 'FIXED' } })

    expect(screen.getByText('Fester Preis für den gesamten Zeitraum')).toBeInTheDocument()
  })
})
