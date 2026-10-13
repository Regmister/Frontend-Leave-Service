import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server.js';
import { DashboardPage } from '../../../components/pages/DashboardPage.jsx';
import { renderWithProviders, mockUsers } from '../../helpers.jsx';

const BASE = 'http://localhost:8080/leave-service';

describe('DashboardPage — header', () => {
  it('renders the welcome heading', async () => {
    renderWithProviders(<DashboardPage />, { user: mockUsers.user });
    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });

  it('displays the employee id in the sub-heading', async () => {
    renderWithProviders(<DashboardPage />, { user: mockUsers.user });
    expect(await screen.findByText(/#1001/)).toBeInTheDocument();
  });

  it('displays the user role', async () => {
    renderWithProviders(<DashboardPage />, { user: mockUsers.user });
    expect(await screen.findByText(/USER/)).toBeInTheDocument();
  });
});

describe('DashboardPage — balance tiles', () => {
  it('renders BalanceTiles after the balance loads', async () => {
    renderWithProviders(<DashboardPage />, { user: mockUsers.user });
    expect(await screen.findByText('Days used')).toBeInTheDocument();
    expect(await screen.findByText('Remaining balance')).toBeInTheDocument();
  });

  it('displays the correct days-used value', async () => {
    renderWithProviders(<DashboardPage />, { user: mockUsers.user });
    expect(await screen.findByText('5')).toBeInTheDocument();
  });

  it('shows an error alert when the balance fetch fails', async () => {
    server.use(
      http.get(`${BASE}/leave-request/total-days/:employeeId`, () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 }),
      ),
    );
    renderWithProviders(<DashboardPage />, { user: mockUsers.user });
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});

describe('DashboardPage — quick links (USER)', () => {
  it('shows My Leave quick link', async () => {
    renderWithProviders(<DashboardPage />, { user: mockUsers.user });
    expect(await screen.findByText('My Leave')).toBeInTheDocument();
  });

  it('shows Change Password quick link', async () => {
    renderWithProviders(<DashboardPage />, { user: mockUsers.user });
    expect(await screen.findByText('Change Password')).toBeInTheDocument();
  });

  it('does NOT show Team quick link for USER', async () => {
    renderWithProviders(<DashboardPage />, { user: mockUsers.user });
    await screen.findByText('Days used'); // wait for render to settle
    expect(screen.queryByText('Team')).not.toBeInTheDocument();
  });
});

describe('DashboardPage — quick links (MANAGER)', () => {
  it('shows Team quick link for MANAGER', async () => {
    renderWithProviders(<DashboardPage />, { user: mockUsers.manager });
    expect(await screen.findByText('Team')).toBeInTheDocument();
  });

  it('does NOT show All Leaves quick link for MANAGER', async () => {
    renderWithProviders(<DashboardPage />, { user: mockUsers.manager });
    await screen.findByText('Days used');
    expect(screen.queryByText('All Leaves')).not.toBeInTheDocument();
  });
});

describe('DashboardPage — quick links (ADMIN)', () => {
  it('shows All Leaves quick link for ADMIN', async () => {
    renderWithProviders(<DashboardPage />, { user: mockUsers.admin });
    expect(await screen.findByText('All Leaves')).toBeInTheDocument();
  });

  it('shows Users quick link for ADMIN', async () => {
    renderWithProviders(<DashboardPage />, { user: mockUsers.admin });
    expect(await screen.findByText('Users')).toBeInTheDocument();
  });
});
