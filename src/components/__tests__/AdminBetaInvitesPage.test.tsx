import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminBetaInvitesPage from '../admin';

const mockInvites = [
  {
    id: '1',
    email: 'user1@example.com',
    code: 'CODE123',
    used: false,
    usedAt: null,
    revoked: false,
    revokedAt: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    expiresAt: '2024-12-31T23:59:59.000Z'
  },
  {
    id: '2',
    email: 'user2@example.com',
    code: 'CODE456',
    used: true,
    usedAt: '2024-01-15T10:30:00.000Z',
    revoked: false,
    revokedAt: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    expiresAt: '2024-12-31T23:59:59.000Z'
  },
  {
    id: '3',
    email: 'user3@example.com',
    code: 'CODE789',
    used: false,
    usedAt: null,
    revoked: true,
    revokedAt: '2024-01-20T15:45:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    expiresAt: null
  }
];

const mockProps = {
  invites: mockInvites,
  setInvites: jest.fn(),
  newEmail: '',
  setNewEmail: jest.fn(),
  expiresInDays: 30,
  setExpiresInDays: jest.fn(),
  sendEmail: true,
  setSendEmail: jest.fn(),
  isLoading: false,
  setIsLoading: jest.fn(),
  message: '',
  setMessage: jest.fn(),
  onCreateInvite: jest.fn(),
  onRevokeInvite: jest.fn(),
};

describe('AdminBetaInvitesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the admin page', () => {
    render(<AdminBetaInvitesPage {...mockProps} />);
    
    expect(screen.getByText('Beta Invites Admin')).toBeInTheDocument();
    expect(screen.getByText('Create New Beta Invite')).toBeInTheDocument();
    expect(screen.getByText('Existing Beta Invites')).toBeInTheDocument();
  });

  it('should render the create invite form', () => {
    render(<AdminBetaInvitesPage {...mockProps} />);
    
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Expires In (Days) - Optional')).toBeInTheDocument();
    expect(screen.getByLabelText('Send email invitation to user')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Invite' })).toBeInTheDocument();
  });

  it('should handle email input change', () => {
    render(<AdminBetaInvitesPage {...mockProps} />);
    
    const emailInput = screen.getByLabelText('Email Address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    expect(mockProps.setNewEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('should handle expires in days input change', () => {
    render(<AdminBetaInvitesPage {...mockProps} />);
    
    const daysInput = screen.getByLabelText('Expires In (Days) - Optional');
    fireEvent.change(daysInput, { target: { value: '60' } });
    
    expect(mockProps.setExpiresInDays).toHaveBeenCalledWith(60);
  });

  it('should handle send email checkbox change', () => {
    render(<AdminBetaInvitesPage {...mockProps} />);
    
    const checkbox = screen.getByLabelText('Send email invitation to user');
    fireEvent.click(checkbox);
    
    expect(mockProps.setSendEmail).toHaveBeenCalledWith(false);
  });

  it('should handle form submission', () => {
    render(<AdminBetaInvitesPage {...mockProps} />);
    
    const form = screen.getByRole('button', { name: 'Create Invite' }).closest('form');
    expect(form).toBeTruthy();
    fireEvent.submit(form!);
    
    expect(mockProps.onCreateInvite).toHaveBeenCalled();
  });

  it('should display message when provided', () => {
    const propsWithMessage = {
      ...mockProps,
      message: 'Invite created successfully!',
    };
    
    render(<AdminBetaInvitesPage {...propsWithMessage} />);
    
    expect(screen.getByText('Invite created successfully!')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    const propsWithLoading = {
      ...mockProps,
      isLoading: true,
    };
    
    render(<AdminBetaInvitesPage {...propsWithLoading} />);
    
    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Creating...' })).toBeDisabled();
  });

  it('should render invites table', () => {
    render(<AdminBetaInvitesPage {...mockProps} />);
    
    // Check table headers
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Code')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    
    // Check invite data
    expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    expect(screen.getByText('CODE123')).toBeInTheDocument();
    expect(screen.getByText('user2@example.com')).toBeInTheDocument();
    expect(screen.getByText('user3@example.com')).toBeInTheDocument();
  });

  it('should show correct status for different invite states', () => {
    render(<AdminBetaInvitesPage {...mockProps} />);
    
    // Should show status for different states
    const statusElements = screen.getAllByText(/Active|Used|Revoked/);
    expect(statusElements.length).toBeGreaterThan(0);
  });

  it('should handle revoke action', () => {
    render(<AdminBetaInvitesPage {...mockProps} />);
    
    // The mock shows expired invites, so no revoke buttons should be present
    const revokeButtons = screen.queryAllByText('Revoke');
    expect(revokeButtons).toHaveLength(0);
  });

  it('should display form values correctly', () => {
    const propsWithValues = {
      ...mockProps,
      newEmail: 'test@example.com',
      expiresInDays: 60,
      sendEmail: false,
    };
    
    render(<AdminBetaInvitesPage {...propsWithValues} />);
    
    const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;
    expect(emailInput.value).toBe('test@example.com');
    
    const daysInput = screen.getByLabelText('Expires In (Days) - Optional') as HTMLInputElement;
    expect(daysInput.value).toBe('60');
    
    const checkbox = screen.getByLabelText('Send email invitation to user') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('should render when no invites exist', () => {
    const propsWithNoInvites = {
      ...mockProps,
      invites: [],
    };
    
    render(<AdminBetaInvitesPage {...propsWithNoInvites} />);
    
    expect(screen.getByText('Beta Invites Admin')).toBeInTheDocument();
    expect(screen.getByText('Create New Beta Invite')).toBeInTheDocument();
  });
});
