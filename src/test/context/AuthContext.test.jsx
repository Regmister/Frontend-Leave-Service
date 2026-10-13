import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../context/AuthContext.jsx';

// ─── helpers ─────────────────────────────────────────────────────────────────

// Build a real JWT-shaped token (header.payload.sig) where payload is base64
// Keep standard base64 padding so atob() in decodeJwt can parse it correctly.
function makeToken(payload) {
  const encoded = btoa(JSON.stringify(payload));
  return `header.${encoded}.sig`;
}

// A simple consumer component that exposes auth state through the DOM
function AuthConsumer() {
  const { user, isLoggedIn, storeToken, logout } = useAuth();
  return (
    <div>
      <span data-testid="logged-in">{String(isLoggedIn)}</span>
      <span data-testid="role">{user?.role ?? 'none'}</span>
      <span data-testid="sub">{user?.sub ?? 'none'}</span>
      <button onClick={() => storeToken(makeToken({ sub: 99, role: 'ADMIN', exp: 9999999999 }))}>
        login
      </button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

function renderAuth() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>,
  );
}

beforeEach(() => localStorage.clear());

// ─── tests ───────────────────────────────────────────────────────────────────

describe('AuthProvider — initial state', () => {
  it('starts logged out when localStorage has no JWT', () => {
    renderAuth();
    expect(screen.getByTestId('logged-in')).toHaveTextContent('false');
  });

  it('starts logged in when localStorage already has a valid JWT', () => {
    localStorage.setItem('jwt', makeToken({ sub: 1001, role: 'USER', exp: 9999999999 }));
    renderAuth();
    expect(screen.getByTestId('logged-in')).toHaveTextContent('true');
  });

  it('reads the role from the stored token on init', () => {
    localStorage.setItem('jwt', makeToken({ sub: 1001, role: 'MANAGER', exp: 9999999999 }));
    renderAuth();
    expect(screen.getByTestId('role')).toHaveTextContent('MANAGER');
  });
});

describe('AuthProvider — logout', () => {
  it('sets isLoggedIn to false after logout', async () => {
    const user = userEvent.setup();
    localStorage.setItem('jwt', makeToken({ sub: 1001, role: 'USER', exp: 9999999999 }));
    renderAuth();
    await user.click(screen.getByRole('button', { name: 'logout' }));
    expect(screen.getByTestId('logged-in')).toHaveTextContent('false');
  });

  it('removes the JWT from localStorage after logout', async () => {
    const user = userEvent.setup();
    localStorage.setItem('jwt', makeToken({ sub: 1001, role: 'USER', exp: 9999999999 }));
    renderAuth();
    await user.click(screen.getByRole('button', { name: 'logout' }));
    expect(localStorage.getItem('jwt')).toBeNull();
  });

  it('clears the user after logout', async () => {
    const user = userEvent.setup();
    localStorage.setItem('jwt', makeToken({ sub: 1001, role: 'USER', exp: 9999999999 }));
    renderAuth();
    await user.click(screen.getByRole('button', { name: 'logout' }));
    expect(screen.getByTestId('role')).toHaveTextContent('none');
  });
});

describe('AuthProvider — token expiry', () => {
  it('automatically logs out when token is already expired', async () => {
    // exp in the past
    localStorage.setItem('jwt', makeToken({ sub: 1001, role: 'USER', exp: 1 }));
    renderAuth();
    await waitFor(() =>
      expect(screen.getByTestId('logged-in')).toHaveTextContent('false'),
    );
  });

  it('schedules logout via setTimeout for a future-expiring token', async () => {
    vi.useFakeTimers();
    const expireInMs = 5000;
    const expSec = Math.floor((Date.now() + expireInMs) / 1000);
    localStorage.setItem('jwt', makeToken({ sub: 1001, role: 'USER', exp: expSec }));

    renderAuth();
    expect(screen.getByTestId('logged-in')).toHaveTextContent('true');

    await act(async () => { vi.advanceTimersByTime(expireInMs + 100); });

    expect(screen.getByTestId('logged-in')).toHaveTextContent('false');
    vi.useRealTimers();
  });
});

describe('useAuth — error boundary', () => {
  it('throws when used outside AuthProvider', () => {
    // Suppress the expected error output in the test console
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<AuthConsumer />)).toThrow(
      'useAuth must be used within an AuthProvider',
    );
    spy.mockRestore();
  });
});
