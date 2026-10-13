import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server.js';
import { MyLeavePage } from '../../../components/pages/MyLeavePage.jsx';
import { renderWithProviders, mockUsers } from '../../helpers.jsx';

const BASE = 'http://localhost:8080/leave-service';

function getTodayPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
const futureStart = getTodayPlus(1);
const futureEnd   = getTodayPlus(3);

describe('MyLeavePage — initial load', () => {
  it('renders the My Leave heading', async () => {
    renderWithProviders(<MyLeavePage />, { user: mockUsers.user });
    expect(await screen.findByRole('heading', { name: /my leave/i })).toBeInTheDocument();
  });

  it('renders BalanceTiles after load', async () => {
    renderWithProviders(<MyLeavePage />, { user: mockUsers.user });
    expect(await screen.findByText('Days used')).toBeInTheDocument();
    expect(await screen.findByText('Remaining balance')).toBeInTheDocument();
  });

  it('renders the leave history table after load', async () => {
    renderWithProviders(<MyLeavePage />, { user: mockUsers.user });
    expect(await screen.findByRole('region', { name: /leave requests/i })).toBeInTheDocument();
  });

  it('renders existing leave rows from the API', async () => {
    renderWithProviders(<MyLeavePage />, { user: mockUsers.user });
    expect(await screen.findByText('Pending')).toBeInTheDocument();
    expect(await screen.findByText('Approved')).toBeInTheDocument();
  });

  it('shows an error alert when data fetch fails', async () => {
    server.use(
      http.get(`${BASE}/leave-request/status/:employeeId`, () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 }),
      ),
    );
    renderWithProviders(<MyLeavePage />, { user: mockUsers.user });
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});

describe('MyLeavePage — cancel action', () => {
  it('shows a Cancel button for Pending leave rows', async () => {
    renderWithProviders(<MyLeavePage />, { user: mockUsers.user });
    const cancelBtns = await screen.findAllByRole('button', { name: /cancel leave/i });
    expect(cancelBtns.length).toBeGreaterThan(0);
  });

  it('opens the cancel confirmation modal when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MyLeavePage />, { user: mockUsers.user });

    const cancelBtns = await screen.findAllByRole('button', { name: /cancel leave/i });
    await user.click(cancelBtns[0]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/cancel leave request/i)).toBeInTheDocument();
  });

  it('shows balance-refund message for Approved leaves', async () => {
    // Override to return one Approved leave only
    server.use(
      http.get(`${BASE}/leave-request/status/:employeeId`, () =>
        HttpResponse.json({
          data: [
            { id: 2, startDate: '2026-08-01', endDate: '2026-08-05', status: 'Approved', reviewedBy: 2001 },
          ],
        }),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<MyLeavePage />, { user: mockUsers.user });

    const cancelBtn = await screen.findByRole('button', { name: /cancel leave/i });
    await user.click(cancelBtn);

    expect(screen.getByText(/balance will be refunded/i)).toBeInTheDocument();
  });

  it('shows withdrawal message for Pending leaves', async () => {
    server.use(
      http.get(`${BASE}/leave-request/status/:employeeId`, () =>
        HttpResponse.json({
          data: [
            { id: 1, startDate: '2026-09-15', endDate: '2026-09-19', status: 'Pending', reviewedBy: null },
          ],
        }),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<MyLeavePage />, { user: mockUsers.user });

    const cancelBtn = await screen.findByRole('button', { name: /cancel leave/i });
    await user.click(cancelBtn);

    expect(screen.getByText(/withdrawn/i)).toBeInTheDocument();
  });

  it('closes the modal when "Keep request" is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MyLeavePage />, { user: mockUsers.user });

    const cancelBtns = await screen.findAllByRole('button', { name: /cancel leave/i });
    await user.click(cancelBtns[0]);
    await user.click(screen.getByRole('button', { name: /keep request/i }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes modal and shows success toast after confirming cancellation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MyLeavePage />, { user: mockUsers.user });

    const cancelBtns = await screen.findAllByRole('button', { name: /cancel leave/i });
    await user.click(cancelBtns[0]);
    await user.click(screen.getByRole('button', { name: /confirm cancel/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await screen.findByText(/cancelled/i)).toBeInTheDocument();
  });

  it('shows an error toast if cancellation fails', async () => {
    server.use(
      http.delete(`${BASE}/leave-request`, () =>
        HttpResponse.json({ message: 'Cannot cancel' }, { status: 400 }),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<MyLeavePage />, { user: mockUsers.user });

    const cancelBtns = await screen.findAllByRole('button', { name: /cancel leave/i });
    await user.click(cancelBtns[0]);
    await user.click(screen.getByRole('button', { name: /confirm cancel/i }));

    expect(await screen.findByText(/cannot cancel/i)).toBeInTheDocument();
  });
});

describe('MyLeavePage — submit new leave', () => {
  it('renders the leave request form', async () => {
    renderWithProviders(<MyLeavePage />, { user: mockUsers.user });
    expect(await screen.findByRole('button', { name: /submit request/i })).toBeInTheDocument();
  });

  it('shows a success toast after submitting a valid request', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MyLeavePage />, { user: mockUsers.user });

    await screen.findByRole('button', { name: /submit request/i });

    await user.type(screen.getByLabelText(/start date/i), futureStart);
    await user.type(screen.getByLabelText(/end date/i), futureEnd);
    await user.click(screen.getByRole('button', { name: /submit request/i }));

    expect(await screen.findByText(/submitted successfully/i)).toBeInTheDocument();
  });
});
