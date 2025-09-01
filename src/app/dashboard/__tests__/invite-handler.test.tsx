import { render } from '@testing-library/react';
import InviteHandler from '../invite-handler';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: () => 'test123',
  }),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { email: 'test@example.com' } },
    status: 'authenticated',
  }),
}));

// Mock fetch
const mockFetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).fetch = mockFetch;

describe('InviteHandler', () => {
  it('should render without crashing', () => {
    const { container } = render(<InviteHandler />);
    expect(container.firstChild).toBeNull();
  });

  it('should make API call when invite code and session exist', async () => {
    render(<InviteHandler />);

    // Wait for useEffect to run
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(global.fetch).toHaveBeenCalledWith('/api/mark-invite-used', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: 'test123',
        email: 'test@example.com',
      }),
    });
  });
});
