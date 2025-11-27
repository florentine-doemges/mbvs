import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Calendar from '../pages/Calendar'
import * as hooks from '../hooks/useCalendar'

vi.mock('../hooks/useCalendar')

const mockCalendarData = {
  date: '2024-06-15',
  rooms: [
    {
      id: '1',
      name: 'Rot',
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
      bookings: [],
    },
  ],
}

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

describe('Calendar', () => {
  beforeEach(() => {
    vi.mocked(hooks.useCalendar).mockReturnValue({
      data: mockCalendarData,
      isLoading: false,
      error: null,
    } as ReturnType<typeof hooks.useCalendar>)

    vi.mocked(hooks.useRooms).mockReturnValue({
      data: mockRooms,
      isLoading: false,
    } as ReturnType<typeof hooks.useRooms>)

    vi.mocked(hooks.useProviders).mockReturnValue({
      data: mockProviders,
      isLoading: false,
    } as ReturnType<typeof hooks.useProviders>)
  })

  it('renders room names', () => {
    render(
      <Calendar
        locationId="test-location"
        selectedDate={new Date('2024-06-15')}
        onDateChange={() => {}}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Rot')).toBeInTheDocument()
    expect(screen.getByText('Blau')).toBeInTheDocument()
  })

  it('renders bookings with provider name', () => {
    render(
      <Calendar
        locationId="test-location"
        selectedDate={new Date('2024-06-15')}
        onDateChange={() => {}}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Lady Lexi')).toBeInTheDocument()
    expect(screen.getByText('Max')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    vi.mocked(hooks.useCalendar).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof hooks.useCalendar>)

    render(
      <Calendar
        locationId="test-location"
        selectedDate={new Date('2024-06-15')}
        onDateChange={() => {}}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Laden...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    vi.mocked(hooks.useCalendar).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Test error'),
    } as ReturnType<typeof hooks.useCalendar>)

    render(
      <Calendar
        locationId="test-location"
        selectedDate={new Date('2024-06-15')}
        onDateChange={() => {}}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Fehler beim Laden des Kalenders')).toBeInTheDocument()
  })

  it('renders navigation buttons', () => {
    render(
      <Calendar
        locationId="test-location"
        selectedDate={new Date('2024-06-15')}
        onDateChange={() => {}}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Heute')).toBeInTheDocument()
  })
})
