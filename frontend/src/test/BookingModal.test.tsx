import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import BookingModal from '../components/BookingModal'
import * as hooks from '../hooks/useCalendar'

vi.mock('../hooks/useCalendar')

const mockRooms = [
  { id: '1', name: 'Rot', hourlyRate: 70 },
  { id: '2', name: 'Blau', hourlyRate: 70 },
]

const mockProviders = [
  { id: 'p1', name: 'Lady Lexi' },
  { id: 'p2', name: 'Mistress Bella' },
]

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('BookingModal', () => {
  const mockOnClose = vi.fn()
  const mockCreateMutate = vi.fn()
  const mockUpdateMutate = vi.fn()
  const mockDeleteMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(hooks.useCreateBooking).mockReturnValue({
      mutateAsync: mockCreateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof hooks.useCreateBooking>)

    vi.mocked(hooks.useUpdateBooking).mockReturnValue({
      mutateAsync: mockUpdateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof hooks.useUpdateBooking>)

    vi.mocked(hooks.useDeleteBooking).mockReturnValue({
      mutateAsync: mockDeleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof hooks.useDeleteBooking>)
  })

  it('renders create mode title', () => {
    render(
      <BookingModal
        locationId="test-location"
        mode="create"
        rooms={mockRooms}
        providers={mockProviders}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Neue Buchung')).toBeInTheDocument()
  })

  it('renders edit mode title', () => {
    const booking = {
      id: 'b1',
      startTime: '2024-06-15T14:00:00',
      durationMinutes: 60,
      provider: { id: 'p1', name: 'Lady Lexi' },
      clientAlias: 'Max',
    }

    render(
      <BookingModal
        locationId="test-location"
        mode="edit"
        booking={booking}
        rooms={mockRooms}
        providers={mockProviders}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Buchung bearbeiten')).toBeInTheDocument()
  })

  it('renders provider dropdown with options', () => {
    render(
      <BookingModal
        locationId="test-location"
        mode="create"
        rooms={mockRooms}
        providers={mockProviders}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Lady Lexi')).toBeInTheDocument()
    expect(screen.getByText('Mistress Bella')).toBeInTheDocument()
  })

  it('renders room dropdown with prices', () => {
    render(
      <BookingModal
        locationId="test-location"
        mode="create"
        rooms={mockRooms}
        providers={mockProviders}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Rot (70€/h)')).toBeInTheDocument()
    expect(screen.getByText('Blau (70€/h)')).toBeInTheDocument()
  })

  it('renders duration options', () => {
    render(
      <BookingModal
        locationId="test-location"
        mode="create"
        rooms={mockRooms}
        providers={mockProviders}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('30 Minuten')).toBeInTheDocument()
    expect(screen.getByText('60 Minuten')).toBeInTheDocument()
    expect(screen.getByText('90 Minuten')).toBeInTheDocument()
    expect(screen.getByText('120 Minuten')).toBeInTheDocument()
  })

  it('shows delete button in edit mode', () => {
    const booking = {
      id: 'b1',
      startTime: '2024-06-15T14:00:00',
      durationMinutes: 60,
      provider: { id: 'p1', name: 'Lady Lexi' },
      clientAlias: 'Max',
    }

    render(
      <BookingModal
        locationId="test-location"
        mode="edit"
        booking={booking}
        rooms={mockRooms}
        providers={mockProviders}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Löschen')).toBeInTheDocument()
  })

  it('does not show delete button in create mode', () => {
    render(
      <BookingModal
        locationId="test-location"
        mode="create"
        rooms={mockRooms}
        providers={mockProviders}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.queryByText('Löschen')).not.toBeInTheDocument()
  })

  it('closes modal on cancel', () => {
    render(
      <BookingModal
        locationId="test-location"
        mode="create"
        rooms={mockRooms}
        providers={mockProviders}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    fireEvent.click(screen.getByText('Abbrechen'))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('prefills room and time when provided', () => {
    render(
      <BookingModal
        locationId="test-location"
        mode="create"
        rooms={mockRooms}
        providers={mockProviders}
        prefilledRoomId="1"
        prefilledTime="2024-06-15T14:00:00"
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    const dateInput = screen.getByDisplayValue('2024-06-15') as HTMLInputElement
    expect(dateInput).toBeInTheDocument()

    const timeInput = screen.getByDisplayValue('14:00') as HTMLInputElement
    expect(timeInput).toBeInTheDocument()

    // Room should show prefilled option selected
    expect(screen.getByText('Rot (70€/h)')).toBeInTheDocument()
  })
})
