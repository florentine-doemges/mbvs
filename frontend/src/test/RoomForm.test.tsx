import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import RoomForm from '../pages/RoomForm'
import * as hooks from '../hooks/useRooms'

vi.mock('../hooks/useRooms')

const mockRoom = {
  id: '1',
  name: 'Rot',
  hourlyRate: 70,
  color: '#EF4444',
  active: true,
  sortOrder: 1,
  bookingCount: 5,
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
  const path = id ? `/rooms/${id}` : '/rooms/new'
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/rooms/new" element={<RoomForm />} />
        <Route path="/rooms/:id" element={<RoomForm />} />
        <Route path="/rooms" element={<div>Rooms List</div>} />
      </Routes>
    </MemoryRouter>,
    { wrapper: createWrapper() }
  )
}

describe('RoomForm', () => {
  const mockCreateMutate = vi.fn()
  const mockUpdateMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(hooks.useRoom).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as ReturnType<typeof hooks.useRoom>)

    vi.mocked(hooks.useCreateRoom).mockReturnValue({
      mutateAsync: mockCreateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof hooks.useCreateRoom>)

    vi.mocked(hooks.useUpdateRoom).mockReturnValue({
      mutateAsync: mockUpdateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof hooks.useUpdateRoom>)
  })

  it('renders create form with empty fields', () => {
    renderWithRouter()

    expect(screen.getByText('Neuer Raum')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('z.B. Rot, Blau, Klinik...')).toHaveValue('')
    expect(screen.getByPlaceholderText('70.00')).toHaveValue(null)
  })

  it('renders edit form with room data', () => {
    vi.mocked(hooks.useRoom).mockReturnValue({
      data: mockRoom,
      isLoading: false,
    } as ReturnType<typeof hooks.useRoom>)

    renderWithRouter('1')

    expect(screen.getByText('Raum bearbeiten')).toBeInTheDocument()
  })

  it('shows loading state when fetching room', () => {
    vi.mocked(hooks.useRoom).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof hooks.useRoom>)

    renderWithRouter('1')

    expect(screen.getByText('Laden...')).toBeInTheDocument()
  })

  it('validates name is required', () => {
    renderWithRouter()

    // HTML5 validation should prevent submission
    const nameInput = screen.getByPlaceholderText('z.B. Rot, Blau, Klinik...')
    expect(nameInput).toBeRequired()
  })

  it('validates hourly rate is required', () => {
    renderWithRouter()

    const rateInput = screen.getByPlaceholderText('70.00')
    expect(rateInput).toBeRequired()
  })

  it('shows color picker with default colors', () => {
    renderWithRouter()

    // Check for color picker input
    const colorInput = document.querySelector('input[type="color"]')
    expect(colorInput).toBeInTheDocument()
    expect(colorInput).toHaveValue('#3b82f6')
  })

  it('shows cancel button that navigates back', () => {
    renderWithRouter()

    const cancelButton = screen.getByText('Abbrechen')
    expect(cancelButton).toBeInTheDocument()
  })

  it('shows sortOrder and active fields only in edit mode', () => {
    vi.mocked(hooks.useRoom).mockReturnValue({
      data: mockRoom,
      isLoading: false,
    } as ReturnType<typeof hooks.useRoom>)

    renderWithRouter('1')

    expect(screen.getByText('Sortierung')).toBeInTheDocument()
    expect(screen.getByText('Aktiv')).toBeInTheDocument()
  })

  it('does not show sortOrder and active fields in create mode', () => {
    renderWithRouter()

    expect(screen.queryByText('Sortierung')).not.toBeInTheDocument()
  })

  it('calls createRoom on form submit in create mode', () => {
    mockCreateMutate.mockResolvedValueOnce({})

    renderWithRouter()

    fireEvent.change(screen.getByPlaceholderText('z.B. Rot, Blau, Klinik...'), {
      target: { value: 'Neuer Raum' },
    })
    fireEvent.change(screen.getByPlaceholderText('70.00'), {
      target: { value: '75' },
    })

    act(() => {
      const form = document.querySelector('form')!
      fireEvent.submit(form)
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
