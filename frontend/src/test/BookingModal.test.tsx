import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import BookingModal from '../components/BookingModal'
import * as hooks from '../hooks/useCalendar'
import type { DurationOption } from '../api/types'

vi.mock('../hooks/useCalendar')

const mockRooms = [
  { id: '1', name: 'Rot', hourlyRate: 70 },
  { id: '2', name: 'Blau', hourlyRate: 70 },
]

const mockProviders = [
  { id: 'p1', name: 'Lady Lexi' },
  { id: 'p2', name: 'Mistress Bella' },
]

const mockDurationOptions: DurationOption[] = [
  { id: 'd1', minutes: 60, label: '1 Stunde', isVariable: false, minMinutes: null, maxMinutes: null, stepMinutes: null, sortOrder: 0, active: true },
  { id: 'd2', minutes: 120, label: '2 Stunden', isVariable: false, minMinutes: null, maxMinutes: null, stepMinutes: null, sortOrder: 1, active: true },
]

const mockDurationOptionsWithVariable: DurationOption[] = [
  ...mockDurationOptions,
  { id: 'd3', minutes: 0, label: 'Variable Dauer', isVariable: true, minMinutes: 30, maxMinutes: 480, stepMinutes: 30, sortOrder: 2, active: true },
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
        durationOptions={mockDurationOptions}
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
        durationOptions={mockDurationOptions}
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
        durationOptions={mockDurationOptions}
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
        durationOptions={mockDurationOptions}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Rot (70€/h)')).toBeInTheDocument()
    expect(screen.getByText('Blau (70€/h)')).toBeInTheDocument()
  })

  it('renders fixed duration options in dropdown', () => {
    render(
      <BookingModal
        locationId="test-location"
        mode="create"
        rooms={mockRooms}
        providers={mockProviders}
        durationOptions={mockDurationOptions}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('1 Stunde')).toBeInTheDocument()
    expect(screen.getByText('2 Stunden')).toBeInTheDocument()
  })

  it('renders variable duration option with slider', () => {
    render(
      <BookingModal
        locationId="test-location"
        mode="create"
        rooms={mockRooms}
        providers={mockProviders}
        durationOptions={mockDurationOptionsWithVariable}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Variable Dauer')).toBeInTheDocument()
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
        durationOptions={mockDurationOptions}
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
        durationOptions={mockDurationOptions}
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
        durationOptions={mockDurationOptions}
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
        durationOptions={mockDurationOptions}
        prefilledRoomId="1"
        prefilledTime="2024-06-15T14:00:00"
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    const dateInput = screen.getByDisplayValue('2024-06-15')
    expect(dateInput).toBeInTheDocument()

    const timeInput = screen.getByDisplayValue('14:00')
    expect(timeInput).toBeInTheDocument()

    expect(screen.getByText('Rot (70€/h)')).toBeInTheDocument()
  })

  it('calls createBooking on form submit with valid data', async () => {
    mockCreateMutate.mockResolvedValueOnce({})

    render(
      <BookingModal
        locationId="test-location"
        mode="create"
        rooms={mockRooms}
        providers={mockProviders}
        durationOptions={mockDurationOptions}
        prefilledRoomId="1"
        prefilledTime="2024-06-15T14:00:00"
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    // Fill client alias
    fireEvent.change(screen.getByPlaceholderText('z.B. Max, Stammgast'), {
      target: { value: 'Test Client' },
    })

    // Submit form
    const submitButton = screen.getByText('Speichern')
    fireEvent.click(submitButton)

    await vi.waitFor(() => {
      expect(mockCreateMutate).toHaveBeenCalled()
    })
  })

  it('calls updateBooking on form submit in edit mode', async () => {
    mockUpdateMutate.mockResolvedValueOnce({})

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
        durationOptions={mockDurationOptions}
        prefilledRoomId="1"
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    // Change client alias
    fireEvent.change(screen.getByPlaceholderText('z.B. Max, Stammgast'), {
      target: { value: 'Updated Client' },
    })

    // Submit form
    const submitButton = screen.getByText('Speichern')
    fireEvent.click(submitButton)

    await vi.waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalled()
    })
  })

  it('calls deleteBooking when delete button is clicked', async () => {
    mockDeleteMutate.mockResolvedValueOnce({})
    vi.stubGlobal('confirm', () => true)

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
        durationOptions={mockDurationOptions}
        prefilledRoomId="1"
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    fireEvent.click(screen.getByText('Löschen'))

    await vi.waitFor(() => {
      expect(mockDeleteMutate).toHaveBeenCalledWith('b1')
    })

    vi.unstubAllGlobals()
  })

  it('does not delete when confirm is cancelled', () => {
    vi.stubGlobal('confirm', () => false)

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
        durationOptions={mockDurationOptions}
        prefilledRoomId="1"
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    fireEvent.click(screen.getByText('Löschen'))

    expect(mockDeleteMutate).not.toHaveBeenCalled()

    vi.unstubAllGlobals()
  })

  it('shows error when submit fails', async () => {
    mockCreateMutate.mockRejectedValueOnce(new Error('Test error'))

    render(
      <BookingModal
        locationId="test-location"
        mode="create"
        rooms={mockRooms}
        providers={mockProviders}
        durationOptions={mockDurationOptions}
        prefilledRoomId="1"
        prefilledTime="2024-06-15T14:00:00"
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    fireEvent.click(screen.getByText('Speichern'))

    await vi.waitFor(() => {
      expect(screen.getByText('Test error')).toBeInTheDocument()
    })
  })

  it('changes provider selection', () => {
    render(
      <BookingModal
        locationId="test-location"
        mode="create"
        rooms={mockRooms}
        providers={mockProviders}
        durationOptions={mockDurationOptions}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    const providerSelect = screen.getAllByRole('combobox')[0]
    fireEvent.change(providerSelect, { target: { value: 'p2' } })

    expect(providerSelect).toHaveValue('p2')
  })

  it('changes room selection', () => {
    render(
      <BookingModal
        locationId="test-location"
        mode="create"
        rooms={mockRooms}
        providers={mockProviders}
        durationOptions={mockDurationOptions}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    const roomSelect = screen.getAllByRole('combobox')[1]
    fireEvent.change(roomSelect, { target: { value: '2' } })

    expect(roomSelect).toHaveValue('2')
  })

  it('changes date input', () => {
    render(
      <BookingModal
        locationId="test-location"
        mode="create"
        rooms={mockRooms}
        providers={mockProviders}
        durationOptions={mockDurationOptions}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    const dateInput = document.querySelector('input[type="date"]')!
    fireEvent.change(dateInput, { target: { value: '2024-07-01' } })

    expect(dateInput).toHaveValue('2024-07-01')
  })

  it('changes time input', () => {
    render(
      <BookingModal
        locationId="test-location"
        mode="create"
        rooms={mockRooms}
        providers={mockProviders}
        durationOptions={mockDurationOptions}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    const timeInput = document.querySelector('input[type="time"]')!
    fireEvent.change(timeInput, { target: { value: '15:30' } })

    expect(timeInput).toHaveValue('15:30')
  })

  it('changes duration option selection', () => {
    render(
      <BookingModal
        locationId="test-location"
        mode="create"
        rooms={mockRooms}
        providers={mockProviders}
        durationOptions={mockDurationOptions}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    const durationSelect = screen.getAllByRole('combobox')[2]
    fireEvent.change(durationSelect, { target: { value: 'd2' } })

    expect(durationSelect).toHaveValue('d2')
  })

  it('selects variable duration and changes slider', () => {
    render(
      <BookingModal
        locationId="test-location"
        mode="create"
        rooms={mockRooms}
        providers={mockProviders}
        durationOptions={mockDurationOptionsWithVariable}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    // Select variable duration
    const radioButton = screen.getByRole('radio')
    fireEvent.click(radioButton)

    // Change slider
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '120' } })

    expect(slider).toHaveValue('120')
  })

  it('changes client alias input', () => {
    render(
      <BookingModal
        locationId="test-location"
        mode="create"
        rooms={mockRooms}
        providers={mockProviders}
        durationOptions={mockDurationOptions}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    const clientInput = screen.getByPlaceholderText('z.B. Max, Stammgast')
    fireEvent.change(clientInput, { target: { value: 'New Client' } })

    expect(clientInput).toHaveValue('New Client')
  })

  it('provider select is required', () => {
    render(
      <BookingModal
        locationId="test-location"
        mode="create"
        rooms={mockRooms}
        providers={mockProviders}
        durationOptions={mockDurationOptions}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    const providerSelect = screen.getAllByRole('combobox')[0]
    expect(providerSelect).toBeRequired()
  })

  it('room select is required', () => {
    render(
      <BookingModal
        locationId="test-location"
        mode="create"
        rooms={mockRooms}
        providers={mockProviders}
        durationOptions={mockDurationOptions}
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    const roomSelect = screen.getAllByRole('combobox')[1]
    expect(roomSelect).toBeRequired()
  })

  it('uses variable duration when no fixed options match in edit mode', () => {
    const booking = {
      id: 'b1',
      startTime: '2024-06-15T14:00:00',
      durationMinutes: 90, // Non-standard duration
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
        durationOptions={mockDurationOptionsWithVariable}
        prefilledRoomId="1"
        onClose={mockOnClose}
      />,
      { wrapper: createWrapper() }
    )

    // Variable option should be selected
    const radioButton = screen.getByRole('radio')
    expect(radioButton).toBeChecked()
  })
})
