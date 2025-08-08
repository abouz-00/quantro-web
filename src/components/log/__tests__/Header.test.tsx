import { render, screen, fireEvent } from '@testing-library/react'
import { signOut } from 'next-auth/react'
import { Header } from '../Header'

// Mock the modules at the top level
const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })
}))

jest.mock('next-auth/react', () => ({
  signOut: jest.fn().mockResolvedValue(undefined)
}))

describe('Header Component', () => {
  const mockSetIsMainMenuOpen = jest.fn()
  const mockSetIsTargetsModalOpen = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const defaultProps = {
    isMainMenuOpen: false,
    setIsMainMenuOpen: mockSetIsMainMenuOpen,
    setIsTargetsModalOpen: mockSetIsTargetsModalOpen,
  }

  it('renders header with logo and menu button', () => {
    render(<Header {...defaultProps} />)
    
    expect(screen.getByAltText('Quantro Logo')).toBeInTheDocument()
    expect(screen.getByLabelText('Open main menu')).toBeInTheDocument()
  })

  it('navigates to dashboard when logo is clicked', () => {
    render(<Header {...defaultProps} />)
    
    const logoButton = screen.getByLabelText('Go to Dashboard')
    fireEvent.click(logoButton)
    
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('toggles menu when menu button is clicked', () => {
    render(<Header {...defaultProps} />)
    
    const menuButton = screen.getByLabelText('Open main menu')
    fireEvent.click(menuButton)
    
    expect(mockSetIsMainMenuOpen).toHaveBeenCalledWith(true)
  })

  it('shows dropdown menu when isMainMenuOpen is true', () => {
    render(<Header {...defaultProps} isMainMenuOpen={true} />)
    
    expect(screen.getByText('🎯 Set Targets')).toBeInTheDocument()
    expect(screen.getByText('🚪 Sign Out')).toBeInTheDocument()
  })

  it('opens targets modal when Set Targets is clicked', () => {
    render(<Header {...defaultProps} isMainMenuOpen={true} />)
    
    const targetsButton = screen.getByText('🎯 Set Targets')
    fireEvent.click(targetsButton)
    
    expect(mockSetIsTargetsModalOpen).toHaveBeenCalledWith(true)
    expect(mockSetIsMainMenuOpen).toHaveBeenCalledWith(false)
  })

  it('signs out when Sign Out is clicked', async () => {
    render(<Header {...defaultProps} isMainMenuOpen={true} />)
    
    const signOutButton = screen.getByText('🚪 Sign Out')
    fireEvent.click(signOutButton)
    
    expect(mockSetIsMainMenuOpen).toHaveBeenCalledWith(false)
    expect(signOut).toHaveBeenCalledWith({
      callbackUrl: '/',
      redirect: true
    })
  })

  it('closes menu when backdrop is clicked', () => {
    render(<Header {...defaultProps} isMainMenuOpen={true} />)
    
    // The backdrop is a div, not a button
    const backdrop = screen.getByTestId('menu-backdrop')
    fireEvent.click(backdrop)
    
    expect(mockSetIsMainMenuOpen).toHaveBeenCalledWith(false)
  })

  it('updates aria-label based on menu state', () => {
    const { rerender } = render(<Header {...defaultProps} isMainMenuOpen={false} />)
    expect(screen.getByLabelText('Open main menu')).toBeInTheDocument()

    rerender(<Header {...defaultProps} isMainMenuOpen={true} />)
    expect(screen.getByLabelText('Close main menu')).toBeInTheDocument()
  })
})
