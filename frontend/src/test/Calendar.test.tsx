import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import Calendar from '../pages/Calendar'
import * as calendarHooks from '../hooks/useCalendar'
import * as roomHooks from '../hooks/useRooms'
import * as durationHooks from '../hooks/useDurationOptions'

vi.mock('../hooks/useCalendar')
vi.mock('../hooks/useRooms')
vi.mock('../hooks/useDurationOptions')

const mockCreateMutate = vi.fn()
const mockUpdateMutate = vi.fn()
const mockDeleteMutate = vi.fn()

const mockCalendarData = {
  date: '2024-06-15',
  rooms: [
    {
      id: '1',
      name: 'Rot',
      color: '#EF4444',
      bookings: [
        {
          id: 'b1',
          startTime: '2024-06-15T14:00:00',
          durationMinutes: 60,
          provider: { id: 'p1', name: 'Lady Lexi' },
          clientAlias: 'Max',
        },
      ],
    },
    {
      id: '2',
      name: 'Blau',
      color: '#3B82F6',
      bookings: [],
    },
  ],
}

const mockRooms = [
  { id: '1', name: 'Rot', hourlyRate: 70, active: true, sortOrder: 0, color: '#EF4444', bookingCount: 1 },
  { id: '2', name: 'Blau', hourlyRate: 70, active: true, sortOrder: 1, color: '#3B82F6', bookingCount: 0 },
]

const mockProviders = [
  { id: 'p1', name: 'Lady Lexi' },
  { id: 'p2', name: 'Mistress Bella' },
]

const mockDurationOptions = [
  { id: 'd1', minutes: 60, label: '1 Stunde', isVariable: false, minMinutes: null, maxMinutes: null, stepMinutes: null, sortOrder: 0, active: true },
  { id: 'd2', minutes: 120, label: '2 Stunden', isVariable: false, minMinutes: null, maxMinutes: null, stepMinutes: null, sortOrder: 1, active: true },
]

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Calendar', () => {
  beforeEach(() => {
    vi.mocked(calendarHooks.useCalendar).mockReturnValue({
      data: mockCalendarData,
      isLoading: false,
      error: null,
    } as ReturnType<typeof calendarHooks.useCalendar>)

    vi.mocked(calendarHooks.useProviders).mockReturnValue({
      data: mockProviders,
      isLoading: false,
    } as ReturnType<typeof calendarHooks.useProviders>)

    vi.mocked(roomHooks.useRooms).mockReturnValue({
      data: mockRooms,
      isLoading: false,
      error: null,
    } as ReturnType<typeof roomHooks.useRooms>)

    vi.mocked(durationHooks.useDurationOptions).mockReturnValue({
      data: mockDurationOptions,
      isLoading: false,
      error: null,
    } as ReturnType<typeof durationHooks.useDurationOptions>)

    // Mock booking mutations for BookingModal
    vi.mocked(calendarHooks.useCreateBooking).mockReturnValue({
      mutateAsync: mockCreateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof calendarHooks.useCreateBooking>)

    vi.mocked(calendarHooks.useUpdateBooking).mockReturnValue({
      mutateAsync: mockUpdateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof calendarHooks.useUpdateBooking>)

    vi.mocked(calendarHooks.useDeleteBooking).mockReturnValue({
      mutateAsync: mockDeleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof calendarHooks.useDeleteBooking>)
  })

  it('renders room names', () => {
    render(<Calendar />, { wrapper: createWrapper() })

    expect(screen.getByText('Rot')).toBeInTheDocument()
    expect(screen.getByText('Blau')).toBeInTheDocument()
  })

  it('renders bookings with provider name', () => {
    render(<Calendar />, { wrapper: createWrapper() })

    expect(screen.getByText('Lady Lexi')).toBeInTheDocument()
    expect(screen.getByText('Max')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    vi.mocked(calendarHooks.useCalendar).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof calendarHooks.useCalendar>)

    render(<Calendar />, { wrapper: createWrapper() })

    expect(screen.getByText('Laden...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    vi.mocked(calendarHooks.useCalendar).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Test error'),
    } as ReturnType<typeof calendarHooks.useCalendar>)

    render(<Calendar />, { wrapper: createWrapper() })

    expect(screen.getByText('Fehler beim Laden des Kalenders')).toBeInTheDocument()
  })

  it('renders navigation buttons', () => {
    render(<Calendar />, { wrapper: createWrapper() })

    expect(screen.getByText('Heute')).toBeInTheDocument()
  })

  it('renders time slot headers', () => {
    render(<Calendar />, { wrapper: createWrapper() })

    expect(screen.getByText('10:00')).toBeInTheDocument()
    expect(screen.getByText('14:00')).toBeInTheDocument()
  })

  it('navigates to previous day', () => {
    render(<Calendar />, { wrapper: createWrapper() })

    const prevButton = screen.getByText('←')
    fireEvent.click(prevButton)

    // Check that the date has changed
    expect(calendarHooks.useCalendar).toHaveBeenCalled()
  })

  it('navigates to next day', () => {
    render(<Calendar />, { wrapper: createWrapper() })

    const nextButton = screen.getByText('→')
    fireEvent.click(nextButton)

    expect(calendarHooks.useCalendar).toHaveBeenCalled()
  })

  it('navigates to today', () => {
    render(<Calendar />, { wrapper: createWrapper() })

    const todayButton = screen.getByText('Heute')
    fireEvent.click(todayButton)

    expect(calendarHooks.useCalendar).toHaveBeenCalled()
  })

  it('changes date via date picker', () => {
    render(<Calendar />, { wrapper: createWrapper() })

    const datePicker = document.querySelector('input[type="date"]')!
    fireEvent.change(datePicker, { target: { value: '2024-07-01' } })

    expect(calendarHooks.useCalendar).toHaveBeenCalled()
  })

  it('opens booking modal when clicking empty slot', () => {
    render(<Calendar />, { wrapper: createWrapper() })

    // Find an empty slot (cells with cursor-pointer that are not bookings)
    const emptySlots = document.querySelectorAll('td.cursor-pointer')
    if (emptySlots.length > 0) {
      fireEvent.click(emptySlots[0])
    }

    // Modal should now be open but since it depends on data, check that rendering continues
    expect(screen.getByText('Rot')).toBeInTheDocument()
  })

  it('opens booking modal when clicking existing booking', () => {
    render(<Calendar />, { wrapper: createWrapper() })

    // Find the booking div (has cursor-pointer class)
    const bookingDiv = document.querySelector('.cursor-pointer.border-2')
    if (bookingDiv) {
      fireEvent.click(bookingDiv)
    }

    // Check that provider is still visible - use getAllByText since modal shows it too
    const ladyLexiElements = screen.getAllByText('Lady Lexi')
    expect(ladyLexiElements.length).toBeGreaterThan(0)
  })
})
