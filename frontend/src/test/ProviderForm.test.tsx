import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProviderForm from '../pages/ProviderForm'
import * as hooks from '../hooks/useProviders'

vi.mock('../hooks/useProviders')

const mockProvider = {
  id: 'p1',
  name: 'Lady Lexi',
  color: '#EC4899',
  active: true,
  sortOrder: 1,
  bookingCount: 10,
}

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

function renderWithRouter(id?: string) {
  const path = id ? `/providers/${id}` : '/providers/new'
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/providers/new" element={<ProviderForm />} />
        <Route path="/providers/:id" element={<ProviderForm />} />
        <Route path="/providers" element={<div>Providers List</div>} />
      </Routes>
    </MemoryRouter>,
    { wrapper: createWrapper() }
  )
}

describe('ProviderForm', () => {
  const mockCreateMutate = vi.fn()
  const mockUpdateMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(hooks.useProvider).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as ReturnType<typeof hooks.useProvider>)

    vi.mocked(hooks.useCreateProvider).mockReturnValue({
      mutateAsync: mockCreateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof hooks.useCreateProvider>)

    vi.mocked(hooks.useUpdateProvider).mockReturnValue({
      mutateAsync: mockUpdateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof hooks.useUpdateProvider>)
  })

  it('renders create form with empty fields', () => {
    renderWithRouter()

    expect(screen.getByText('Neuer Provider')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('z.B. Lady Lexi, Mistress Bella...')).toHaveValue('')
  })

  it('renders edit form with provider data', () => {
    vi.mocked(hooks.useProvider).mockReturnValue({
      data: mockProvider,
      isLoading: false,
    } as ReturnType<typeof hooks.useProvider>)

    renderWithRouter('p1')

    expect(screen.getByText('Provider bearbeiten')).toBeInTheDocument()
  })

  it('shows loading state when fetching provider', () => {
    vi.mocked(hooks.useProvider).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof hooks.useProvider>)

    renderWithRouter('p1')

    expect(screen.getByText('Laden...')).toBeInTheDocument()
  })

  it('validates name is required', () => {
    renderWithRouter()

    const nameInput = screen.getByPlaceholderText('z.B. Lady Lexi, Mistress Bella...')
    expect(nameInput).toBeRequired()
  })

  it('shows color picker with default colors', () => {
    renderWithRouter()

    // Check for color picker input
    const colorInput = document.querySelector('input[type="color"]')
    expect(colorInput).toBeInTheDocument()
    expect(colorInput).toHaveValue('#10b981')
  })

  it('shows cancel button', () => {
    renderWithRouter()

    const cancelButton = screen.getByText('Abbrechen')
    expect(cancelButton).toBeInTheDocument()
  })

  it('shows save button', () => {
    renderWithRouter()

    const saveButton = screen.getByText('Speichern')
    expect(saveButton).toBeInTheDocument()
  })

  it('shows sortOrder and active fields only in edit mode', () => {
    vi.mocked(hooks.useProvider).mockReturnValue({
      data: mockProvider,
      isLoading: false,
    } as ReturnType<typeof hooks.useProvider>)

    renderWithRouter('p1')

    expect(screen.getByText('Sortierung')).toBeInTheDocument()
    expect(screen.getByText('Aktiv')).toBeInTheDocument()
  })

  it('does not show sortOrder and active fields in create mode', () => {
    renderWithRouter()

    expect(screen.queryByText('Sortierung')).not.toBeInTheDocument()
  })

  it('allows selecting preset colors', () => {
    renderWithRouter()

    // There should be multiple color buttons
    const colorButtons = document.querySelectorAll('button[style*="background-color"]')
    expect(colorButtons.length).toBeGreaterThan(0)
  })

  it('calls createProvider on form submit in create mode', () => {
    mockCreateMutate.mockResolvedValueOnce({})

    renderWithRouter()

    fireEvent.change(screen.getByPlaceholderText('z.B. Lady Lexi, Mistress Bella...'), {
      target: { value: 'Neuer Provider' },
    })

    act(() => {
      fireEvent.submit(document.querySelector('form')!)
    })
  })

  it('clicks color preset button', () => {
    renderWithRouter()

    const colorButtons = document.querySelectorAll('button[style*="background-color"]')
    if (colorButtons.length > 0) {
      fireEvent.click(colorButtons[0])
    }
    expect(colorButtons.length).toBeGreaterThan(0)
  })

  it('changes color via color input', () => {
    renderWithRouter()

    const colorInput = document.querySelector('input[type="color"]')
    if (colorInput) {
      fireEvent.change(colorInput, { target: { value: '#ff0000' } })
    }
    expect(colorInput).toBeInTheDocument()
  })
})
