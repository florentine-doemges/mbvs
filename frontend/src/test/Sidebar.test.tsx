import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

function createWrapper() {
  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>{children}</BrowserRouter>
  )
}

describe('Sidebar', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all navigation links', () => {
    render(<Sidebar isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() })

    expect(screen.getByText('Kalender')).toBeInTheDocument()
    expect(screen.getByText('Buchungen')).toBeInTheDocument()
    expect(screen.getByText('Räume')).toBeInTheDocument()
    expect(screen.getByText('Provider')).toBeInTheDocument()
    expect(screen.getByText('Einstellungen')).toBeInTheDocument()
  })

  it('renders correct link hrefs', () => {
    render(<Sidebar isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() })

    expect(screen.getByRole('link', { name: /Kalender/i })).toHaveAttribute('href', '/calendar')
    expect(screen.getByRole('link', { name: /Buchungen/i })).toHaveAttribute('href', '/bookings')
    expect(screen.getByRole('link', { name: /Räume/i })).toHaveAttribute('href', '/rooms')
    expect(screen.getByRole('link', { name: /Provider/i })).toHaveAttribute('href', '/providers')
    expect(screen.getByRole('link', { name: /Einstellungen/i })).toHaveAttribute('href', '/settings')
  })

  it('renders logo/title', () => {
    render(<Sidebar isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() })

    expect(screen.getByText('Studio Mabella')).toBeInTheDocument()
    expect(screen.getByText('Buchungssystem')).toBeInTheDocument()
  })

  it('renders version info', () => {
    render(<Sidebar isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() })

    expect(screen.getByText('Version 1.0 - Slice 2')).toBeInTheDocument()
  })

  it('calls onClose when clicking a link', () => {
    render(<Sidebar isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() })

    fireEvent.click(screen.getByRole('link', { name: /Räume/i }))
    expect(mockOnClose).toHaveBeenCalled()
  })
})
