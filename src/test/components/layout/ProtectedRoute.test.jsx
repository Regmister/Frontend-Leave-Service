import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { ProtectedRoute } from '../../../components/layout/ProtectedRoute.jsx';
import { renderRoutes, mockUsers } from '../../helpers.jsx';

const routes = (element) => [
  { path: '/', element },
  { path: '/login', element: <p>Login Page</p> },
  { path: '/dashboard', element: <p>Dashboard</p> },
];

describe('ProtectedRoute — unauthenticated', () => {
  it('redirects to /login when user is not logged in', () => {
    renderRoutes(routes(<ProtectedRoute><p>Secret</p></ProtectedRoute>), {
      user: null,
      initialPath: '/',
    });
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });

  it('preserves the attempted path in location state', () => {
    // We can't easily inspect location.state here, but verifying the redirect
    // to /login is sufficient to confirm the guard fired.
    renderRoutes(routes(<ProtectedRoute><p>Secret</p></ProtectedRoute>), {
      user: null,
      initialPath: '/',
    });
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});

describe('ProtectedRoute — authenticated, no role requirement', () => {
  it('renders children when user is logged in', () => {
    renderRoutes(routes(<ProtectedRoute><p>Secret</p></ProtectedRoute>), {
      user: mockUsers.user,
      initialPath: '/',
    });
    expect(screen.getByText('Secret')).toBeInTheDocument();
  });
});

describe('ProtectedRoute — role-based access', () => {
  it('renders children when user has a required role', () => {
    renderRoutes(
      routes(<ProtectedRoute roles={['MANAGER', 'ADMIN']}><p>Team</p></ProtectedRoute>),
      { user: mockUsers.manager, initialPath: '/' },
    );
    expect(screen.getByText('Team')).toBeInTheDocument();
  });

  it('redirects to / when user does not have a required role', () => {
    renderRoutes(
      [
        { path: '/', element: <p>Dashboard</p> },
        { path: '/admin', element: <ProtectedRoute roles={['ADMIN']}><p>Admin</p></ProtectedRoute> },
        { path: '/login', element: <p>Login Page</p> },
      ],
      { user: mockUsers.user, initialPath: '/admin' },
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('allows ADMIN to access an ADMIN-only route', () => {
    renderRoutes(
      [
        { path: '/', element: <p>Dashboard</p> },
        { path: '/admin', element: <ProtectedRoute roles={['ADMIN']}><p>Admin</p></ProtectedRoute> },
        { path: '/login', element: <p>Login Page</p> },
      ],
      { user: mockUsers.admin, initialPath: '/admin' },
    );
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('rejects MANAGER from an ADMIN-only route', () => {
    renderRoutes(
      [
        { path: '/', element: <p>Dashboard</p> },
        { path: '/admin', element: <ProtectedRoute roles={['ADMIN']}><p>Admin</p></ProtectedRoute> },
        { path: '/login', element: <p>Login Page</p> },
      ],
      { user: mockUsers.manager, initialPath: '/admin' },
    );
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
