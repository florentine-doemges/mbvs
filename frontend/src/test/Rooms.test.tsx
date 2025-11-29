import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import Rooms from '../pages/Rooms'
import * as hooks from '../hooks/useRooms'

vi.mock('../hooks/useRooms')

const mockRooms = [
  { id: '1', name: 'Rot', hourlyRate: 70, active: true, sortOrder: 0, color: '#EF4444', bookingCount: 5 },
  { id: '2', name: 'Blau', hourlyRate: 80, active: false, sortOrder: 1, color: '#3B82F6', bookingCount: 3 },
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

describe('Rooms', () => {
  beforeEach(() => {
    vi.mocked(hooks.useRooms).mockReturnValue({
      data: mockRooms,
      isLoading: false,
      error: null,
    } as ReturnType<typeof hooks.useRooms>)

    vi.mocked(hooks.useDeleteRoom).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof hooks.useDeleteRoom>)
  })

  it('renders page title', () => {
    render(<Rooms />, { wrapper: createWrapper() })

    expect(screen.getByText('Räume')).toBeInTheDocument()
  })

  it('renders room names', () => {
    render(<Rooms />, { wrapper: createWrapper() })

    expect(screen.getByText('Rot')).toBeInTheDocument()
    expect(screen.getByText('Blau')).toBeInTheDocument()
  })

  it('renders hourly rates column', () => {
    render(<Rooms />, { wrapper: createWrapper() })

    // Check that the column header exists
    expect(screen.getByText('Stundensatz')).toBeInTheDocument()
    // Check that the hourly rates are displayed (text may be split across elements)
    expect(screen.getByText((content, element) =>
      element?.tagName === 'TD' && content.includes('70.00')
    )).toBeInTheDocument()
  })

  it('renders booking counts', () => {
    render(<Rooms />, { wrapper: createWrapper() })

    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders active/inactive status', () => {
    render(<Rooms />, { wrapper: createWrapper() })

    expect(screen.getByText('Aktiv')).toBeInTheDocument()
    expect(screen.getByText('Inaktiv')).toBeInTheDocument()
  })

  it('renders "Neuer Raum" button', () => {
    render(<Rooms />, { wrapper: createWrapper() })

    expect(screen.getByText('Neuer Raum')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    vi.mocked(hooks.useRooms).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof hooks.useRooms>)

    render(<Rooms />, { wrapper: createWrapper() })

    expect(screen.getByText('Laden...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    vi.mocked(hooks.useRooms).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Test error'),
    } as ReturnType<typeof hooks.useRooms>)

    render(<Rooms />, { wrapper: createWrapper() })

    expect(screen.getByText('Fehler beim Laden der Räume')).toBeInTheDocument()
  })

  it('shows empty state when no rooms', () => {
    vi.mocked(hooks.useRooms).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof hooks.useRooms>)

    render(<Rooms />, { wrapper: createWrapper() })

    expect(screen.getByText('Keine Räume vorhanden')).toBeInTheDocument()
  })
})
