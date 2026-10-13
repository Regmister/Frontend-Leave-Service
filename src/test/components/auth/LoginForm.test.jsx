import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { server } from '../../mocks/server.js';
import { AuthContext } from '../../../context/AuthContext.jsx';
import { LoginForm } from '../../../components/auth/LoginForm.jsx';

const BASE = 'http://localhost:8080/leave-service';

// react-router-dom navigate is a side-effect we capture via a mock
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderLogin({ storeToken = vi.fn(), initialPath = '/login' } = {}) {
  return render(
    <AuthContext.Provider value={{ user: null, isLoggedIn: false, storeToken, logout: vi.fn() }}>
      <MemoryRouter initialEntries={[initialPath]}>
        <LoginForm />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('LoginForm — rendering', () => {
  it('renders the Employee ID input', () => {
    renderLogin();
    expect(screen.getByLabelText(/employee id/i)).toBeInTheDocument();
  });

  it('renders the Password input', () => {
    renderLogin();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
  });

  it('renders the Sign in button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('sign-in button is disabled when both fields are empty', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
  });

  it('sign-in button is disabled when only employee ID is filled', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText(/employee id/i), '1001');
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
  });

  it('sign-in button is disabled when only password is filled', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText(/^password/i), 'secret');
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
  });

  it('sign-in button is enabled when both fields have values', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText(/employee id/i), '1001');
    await user.type(screen.getByLabelText(/^password/i), 'secret');
    expect(screen.getByRole('button', { name: /sign in/i })).not.toBeDisabled();
  });
});

describe('LoginForm — successful login', () => {
  it('calls storeToken with the JWT on success', async () => {
    const user = userEvent.setup();
    const storeToken = vi.fn();
    renderLogin({ storeToken });

    await user.type(screen.getByLabelText(/employee id/i), '1001');
    await user.type(screen.getByLabelText(/^password/i), 'secret');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(storeToken).toHaveBeenCalledTimes(1));
    expect(typeof storeToken.mock.calls[0][0]).toBe('string');
  });

  it('navigates to "/" after a successful login', async () => {
    const user = userEvent.setup();
    mockNavigate.mockClear();
    renderLogin();

    await user.type(screen.getByLabelText(/employee id/i), '1001');
    await user.type(screen.getByLabelText(/^password/i), 'secret');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true }));
  });
});

describe('LoginForm — error handling', () => {
  it('shows invalid credentials message on 400', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/employee id/i), '9999');
    await user.type(screen.getByLabelText(/^password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid employee id or password/i)).toBeInTheDocument();
  });

  it('shows rate limit message on 429', async () => {
    server.use(
      http.post(`${BASE}/login`, () =>
        HttpResponse.json({ message: 'Too many requests' }, { status: 429 }),
      ),
    );
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/employee id/i), '1001');
    await user.type(screen.getByLabelText(/^password/i), 'secret');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/too many login attempts/i)).toBeInTheDocument();
  });

  it('shows a generic message on unknown errors', async () => {
    server.use(
      http.post(`${BASE}/login`, () =>
        HttpResponse.json({ message: 'Service unavailable' }, { status: 503 }),
      ),
    );
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/employee id/i), '1001');
    await user.type(screen.getByLabelText(/^password/i), 'secret');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/service unavailable/i)).toBeInTheDocument();
  });

  it('dismissing the error clears it from the DOM', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/employee id/i), '9999');
    await user.type(screen.getByLabelText(/^password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await screen.findByText(/invalid employee id or password/i);
    await user.click(screen.getByRole('button', { name: /dismiss/i }));

    expect(screen.queryByText(/invalid employee id or password/i)).not.toBeInTheDocument();
  });
});
