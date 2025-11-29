import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Layout from '../components/Layout'

function renderWithRouter() {
  return render(
    <MemoryRouter initialEntries={['/calendar']}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/calendar" element={<div>Calendar Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('Layout', () => {
  it('renders sidebar and main content', () => {
    renderWithRouter()

    // There are two "Studio Mabella" - one in sidebar, one in mobile header
    const studioTitles = screen.getAllByText('Studio Mabella')
    expect(studioTitles.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Calendar Content')).toBeInTheDocument()
  })

  it('renders mobile header with hamburger menu', () => {
    renderWithRouter()

    const menuButton = screen.getByLabelText('Menü öffnen')
    expect(menuButton).toBeInTheDocument()
  })

  it('opens sidebar when hamburger menu is clicked', () => {
    renderWithRouter()

    const menuButton = screen.getByLabelText('Menü öffnen')
    fireEvent.click(menuButton)

    // After clicking, sidebar should be open (overlay visible)
    const overlay = document.querySelector('.fixed.inset-0.bg-black')
    expect(overlay).toBeInTheDocument()
  })

  it('closes sidebar when overlay is clicked', () => {
    renderWithRouter()

    // Open sidebar first
    const menuButton = screen.getByLabelText('Menü öffnen')
    fireEvent.click(menuButton)

    // Click overlay to close
    const overlay = document.querySelector('.fixed.inset-0.bg-black')
    if (overlay) {
      fireEvent.click(overlay)
    }

    // Overlay should be removed after closing
    const overlayAfter = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50')
    expect(overlayAfter).not.toBeInTheDocument()
  })

  it('renders navigation links in sidebar', () => {
    renderWithRouter()

    expect(screen.getByText('Kalender')).toBeInTheDocument()
    expect(screen.getByText('Räume')).toBeInTheDocument()
    expect(screen.getByText('Provider')).toBeInTheDocument()
    expect(screen.getByText('Einstellungen')).toBeInTheDocument()
  })
})
