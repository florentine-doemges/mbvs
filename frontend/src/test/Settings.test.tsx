import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import Settings from '../pages/Settings'
import * as hooks from '../hooks/useDurationOptions'

vi.mock('../hooks/useDurationOptions')

const mockDurationOptions = [
  { id: 'd1', minutes: 60, label: '1 Stunde', isVariable: false, minMinutes: null, maxMinutes: null, stepMinutes: null, sortOrder: 0, active: true },
  { id: 'd2', minutes: 120, label: '2 Stunden', isVariable: false, minMinutes: null, maxMinutes: null, stepMinutes: null, sortOrder: 1, active: true },
  { id: 'd3', minutes: 0, label: 'Variable', isVariable: true, minMinutes: 30, maxMinutes: 480, stepMinutes: 30, sortOrder: 2, active: true },
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

describe('Settings', () => {
  beforeEach(() => {
    vi.mocked(hooks.useDurationOptions).mockReturnValue({
      data: mockDurationOptions,
      isLoading: false,
      error: null,
    } as ReturnType<typeof hooks.useDurationOptions>)

    vi.mocked(hooks.useCreateDurationOption).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof hooks.useCreateDurationOption>)

    vi.mocked(hooks.useUpdateDurationOption).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof hooks.useUpdateDurationOption>)

    vi.mocked(hooks.useDeleteDurationOption).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof hooks.useDeleteDurationOption>)
  })

  it('renders page title', () => {
    render(<Settings />, { wrapper: createWrapper() })

    expect(screen.getByText('Buchungsdauern')).toBeInTheDocument()
  })

  it('renders duration option labels', () => {
    render(<Settings />, { wrapper: createWrapper() })

    expect(screen.getByText('1 Stunde')).toBeInTheDocument()
    expect(screen.getByText('2 Stunden')).toBeInTheDocument()
    expect(screen.getByText('Variable')).toBeInTheDocument()
  })

  it('renders fixed duration info', () => {
    render(<Settings />, { wrapper: createWrapper() })

    expect(screen.getByText('60 Minuten')).toBeInTheDocument()
    expect(screen.getByText('120 Minuten')).toBeInTheDocument()
  })

  it('renders variable duration info', () => {
    render(<Settings />, { wrapper: createWrapper() })

    expect(screen.getByText('30-480 Min (30er Schritte)')).toBeInTheDocument()
  })

  it('renders "Neue Dauer" button', () => {
    render(<Settings />, { wrapper: createWrapper() })

    expect(screen.getByText('Neue Dauer')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    vi.mocked(hooks.useDurationOptions).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof hooks.useDurationOptions>)

    render(<Settings />, { wrapper: createWrapper() })

    expect(screen.getByText('Laden...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    vi.mocked(hooks.useDurationOptions).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Test error'),
    } as ReturnType<typeof hooks.useDurationOptions>)

    render(<Settings />, { wrapper: createWrapper() })

    expect(screen.getByText('Fehler beim Laden der Einstellungen')).toBeInTheDocument()
  })

  it('opens add form when clicking "Neue Dauer"', () => {
    render(<Settings />, { wrapper: createWrapper() })

    fireEvent.click(screen.getByText('Neue Dauer'))

    // Form should appear with Bezeichnung field
    expect(screen.getByPlaceholderText('z.B. 1 Stunde, Variable...')).toBeInTheDocument()
  })

  it('shows edit button for each option', () => {
    render(<Settings />, { wrapper: createWrapper() })

    const editButtons = screen.getAllByText('Bearbeiten')
    expect(editButtons.length).toBe(3)
  })

  it('shows delete button for each option', () => {
    render(<Settings />, { wrapper: createWrapper() })

    const deleteButtons = screen.getAllByText('Löschen')
    expect(deleteButtons.length).toBe(3)
  })

  it('opens edit form when clicking "Bearbeiten"', () => {
    render(<Settings />, { wrapper: createWrapper() })

    const editButtons = screen.getAllByText('Bearbeiten')
    fireEvent.click(editButtons[0])

    // Should now show Abbrechen button in the edit form
    expect(screen.getByText('Abbrechen')).toBeInTheDocument()
  })

  it('toggles active checkbox', async () => {
    const mockUpdateMutate = vi.fn().mockResolvedValue({})
    vi.mocked(hooks.useUpdateDurationOption).mockReturnValue({
      mutateAsync: mockUpdateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof hooks.useUpdateDurationOption>)

    render(<Settings />, { wrapper: createWrapper() })

    // Find checkbox for first option
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])

    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalled()
    })
  })

  it('cancels add form', () => {
    render(<Settings />, { wrapper: createWrapper() })

    fireEvent.click(screen.getByText('Neue Dauer'))
    expect(screen.getByPlaceholderText('z.B. 1 Stunde, Variable...')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Abbrechen'))

    // Form should be hidden
    expect(screen.queryByPlaceholderText('z.B. 1 Stunde, Variable...')).not.toBeInTheDocument()
  })

  it('shows variable duration checkbox in form', () => {
    render(<Settings />, { wrapper: createWrapper() })

    fireEvent.click(screen.getByText('Neue Dauer'))

    expect(screen.getByText('Variable Dauer')).toBeInTheDocument()
  })
})
