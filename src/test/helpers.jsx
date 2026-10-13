/**
 * Shared render helpers so individual test files don't repeat boilerplate.
 */
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

// ─── Default mock user payloads ───────────────────────────────────────────────
export const mockUsers = {
  user: { sub: 1001, role: 'USER', exp: 9999999999 },
  manager: { sub: 2001, role: 'MANAGER', exp: 9999999999 },
  admin: { sub: 3001, role: 'ADMIN', exp: 9999999999 },
};

/**
 * Render a component wrapped in MemoryRouter + a synthetic AuthContext.
 *
 * @param {React.ReactElement} ui
 * @param {object}  opts
 * @param {object}  opts.user          – user payload (default: mockUsers.user)
 * @param {string}  opts.initialPath   – starting URL (default: '/')
 * @param {object}  opts.authOverrides – extra fields merged into the context value
 */
export function renderWithProviders(
  ui,
  { user = mockUsers.user, initialPath = '/', authOverrides = {} } = {},
) {
  const storeToken = vi.fn();
  const logout = vi.fn();

  const authValue = {
    user,
    isLoggedIn: !!user,
    storeToken,
    logout,
    ...authOverrides,
  };

  const result = render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[initialPath]}>
        {ui}
      </MemoryRouter>
    </AuthContext.Provider>,
  );

  return { ...result, storeToken, logout };
}

/**
 * Render a full route tree – useful for ProtectedRoute tests where we need
 * multiple route definitions to verify redirects.
 */
export function renderRoutes(routes, { user = mockUsers.user, initialPath = '/' } = {}) {
  const storeToken = vi.fn();
  const logout = vi.fn();

  const authValue = { user, isLoggedIn: !!user, storeToken, logout };

  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}
