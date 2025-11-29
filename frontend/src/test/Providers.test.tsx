import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import Providers from '../pages/Providers'
import * as hooks from '../hooks/useProviders'

vi.mock('../hooks/useProviders')

const mockProviders = [
  { id: 'p1', name: 'Lady Lexi', active: true, sortOrder: 0, color: '#EC4899', bookingCount: 10 },
  { id: 'p2', name: 'Mistress Bella', active: false, sortOrder: 1, color: '#8B5CF6', bookingCount: 5 },
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

describe('Providers', () => {
  beforeEach(() => {
    vi.mocked(hooks.useProviders).mockReturnValue({
      data: mockProviders,
      isLoading: false,
      error: null,
    } as ReturnType<typeof hooks.useProviders>)

    vi.mocked(hooks.useDeleteProvider).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof hooks.useDeleteProvider>)
  })

  it('renders page title', () => {
    render(<Providers />, { wrapper: createWrapper() })

    expect(screen.getByText('Provider')).toBeInTheDocument()
  })

  it('renders provider names', () => {
    render(<Providers />, { wrapper: createWrapper() })

    expect(screen.getByText('Lady Lexi')).toBeInTheDocument()
    expect(screen.getByText('Mistress Bella')).toBeInTheDocument()
  })

  it('renders booking counts', () => {
    render(<Providers />, { wrapper: createWrapper() })

    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders active/inactive status', () => {
    render(<Providers />, { wrapper: createWrapper() })

    expect(screen.getByText('Aktiv')).toBeInTheDocument()
    expect(screen.getByText('Inaktiv')).toBeInTheDocument()
  })

  it('renders "Neuer Provider" button', () => {
    render(<Providers />, { wrapper: createWrapper() })

    expect(screen.getByText('Neuer Provider')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    vi.mocked(hooks.useProviders).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof hooks.useProviders>)

    render(<Providers />, { wrapper: createWrapper() })

    expect(screen.getByText('Laden...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    vi.mocked(hooks.useProviders).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Test error'),
    } as ReturnType<typeof hooks.useProviders>)

    render(<Providers />, { wrapper: createWrapper() })

    expect(screen.getByText('Fehler beim Laden der Provider')).toBeInTheDocument()
  })

  it('shows empty state when no providers', () => {
    vi.mocked(hooks.useProviders).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof hooks.useProviders>)

    render(<Providers />, { wrapper: createWrapper() })

    expect(screen.getByText('Keine Provider vorhanden')).toBeInTheDocument()
  })
})
