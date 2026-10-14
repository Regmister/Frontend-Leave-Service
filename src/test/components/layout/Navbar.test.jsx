import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthContext } from '../../../context/AuthContext.jsx';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from '../../../components/layout/Navbar.jsx';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderNavbar(user) {
  const logout = vi.fn();
  render(
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, logout, storeToken: vi.fn() }}>
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
  return { logout };
}

describe('Navbar — brand', () => {
  it('renders the Leave Service brand link', () => {
    renderNavbar({ sub: 1001, role: 'USER', exp: 9999999999 });
    expect(screen.getByRole('link', { name: /leave service home/i })).toBeInTheDocument();
  });
});

describe('Navbar — navigation links', () => {
  // The Navbar intentionally renders no section navigation links.
  // Navigation between sections is handled via the Dashboard quick links.
  it('does not render a My Leave link', () => {
    renderNavbar({ sub: 1001, role: 'USER', exp: 9999999999 });
    expect(screen.queryByRole('link', { name: /my leave/i })).not.toBeInTheDocument();
  });

  it('does not render a Team link even for a MANAGER', () => {
    renderNavbar({ sub: 2001, role: 'MANAGER', exp: 9999999999 });
    expect(screen.queryByRole('link', { name: /team/i })).not.toBeInTheDocument();
  });

  it('does not render admin links even for an ADMIN', () => {
    renderNavbar({ sub: 3001, role: 'ADMIN', exp: 9999999999 });
    expect(screen.queryByRole('link', { name: /all leaves/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^users$/i })).not.toBeInTheDocument();
  });

  it('only renders the brand link', () => {
    renderNavbar({ sub: 1001, role: 'USER', exp: 9999999999 });
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName(/leave service home/i);
  });
});

describe('Navbar — user badge', () => {
  it('displays the employee id and role', () => {
    renderNavbar({ sub: 1001, role: 'USER', exp: 9999999999 });
    expect(screen.getByText(/#1001/)).toBeInTheDocument();
    expect(screen.getByText(/USER/)).toBeInTheDocument();
  });
});

describe('Navbar — logout', () => {
  it('renders a Sign out button', () => {
    renderNavbar({ sub: 1001, role: 'USER', exp: 9999999999 });
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('calls logout and navigates to /login when Sign out is clicked', async () => {
    const user = userEvent.setup();
    mockNavigate.mockClear();
    const { logout } = renderNavbar({ sub: 1001, role: 'USER', exp: 9999999999 });
    await user.click(screen.getByRole('button', { name: /sign out/i }));
    expect(logout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});

describe('Navbar — mobile toggle', () => {
  it('renders a toggle button', () => {
    renderNavbar({ sub: 1001, role: 'USER', exp: 9999999999 });
    expect(screen.getByRole('button', { name: /toggle navigation/i })).toBeInTheDocument();
  });

  it('toggles aria-expanded when the hamburger is clicked', async () => {
    const user = userEvent.setup();
    renderNavbar({ sub: 1001, role: 'USER', exp: 9999999999 });
    const toggle = screen.getByRole('button', { name: /toggle navigation/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});
