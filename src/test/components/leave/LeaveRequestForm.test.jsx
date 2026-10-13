import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server.js';
import { LeaveRequestForm } from '../../../components/leave/LeaveRequestForm.jsx';

const BASE = 'http://localhost:8080/leave-service';

// Helper — fill in valid dates (today + 1 day for start, today + 3 for end)
function getTodayPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const futureStart = getTodayPlus(1);
const futureEnd   = getTodayPlus(3);

describe('LeaveRequestForm — rendering', () => {
  it('renders start date and end date inputs', () => {
    render(<LeaveRequestForm employeeId={1001} onSuccess={vi.fn()} />);
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
  });

  it('renders a submit button', () => {
    render(<LeaveRequestForm employeeId={1001} onSuccess={vi.fn()} />);
    expect(screen.getByRole('button', { name: /submit request/i })).toBeInTheDocument();
  });

  it('submit button is disabled when fields are empty', () => {
    render(<LeaveRequestForm employeeId={1001} onSuccess={vi.fn()} />);
    expect(screen.getByRole('button', { name: /submit request/i })).toBeDisabled();
  });

  it('shows a weekday hint text', () => {
    render(<LeaveRequestForm employeeId={1001} onSuccess={vi.fn()} />);
    expect(screen.getByText(/working days/i)).toBeInTheDocument();
  });
});

describe('LeaveRequestForm — validation', () => {
  it('shows an error when end date is before start date', async () => {
    const user = userEvent.setup();
    render(<LeaveRequestForm employeeId={1001} onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText(/start date/i), futureEnd);
    await user.type(screen.getByLabelText(/end date/i), futureStart);

    expect(await screen.findByText(/end date must be on or after/i)).toBeInTheDocument();
  });

  it('disables submit when end date is before start date', async () => {
    const user = userEvent.setup();
    render(<LeaveRequestForm employeeId={1001} onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText(/start date/i), futureEnd);
    await user.type(screen.getByLabelText(/end date/i), futureStart);

    expect(screen.getByRole('button', { name: /submit request/i })).toBeDisabled();
  });

  it('enables submit when both dates are valid', async () => {
    const user = userEvent.setup();
    render(<LeaveRequestForm employeeId={1001} onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText(/start date/i), futureStart);
    await user.type(screen.getByLabelText(/end date/i), futureEnd);

    expect(screen.getByRole('button', { name: /submit request/i })).not.toBeDisabled();
  });
});

describe('LeaveRequestForm — submission', () => {
  it('calls onSuccess after a successful submission', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(<LeaveRequestForm employeeId={1001} onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/start date/i), futureStart);
    await user.type(screen.getByLabelText(/end date/i), futureEnd);
    await user.click(screen.getByRole('button', { name: /submit request/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });

  it('clears the date fields after a successful submission', async () => {
    const user = userEvent.setup();
    render(<LeaveRequestForm employeeId={1001} onSuccess={vi.fn()} />);

    const startInput = screen.getByLabelText(/start date/i);
    const endInput   = screen.getByLabelText(/end date/i);

    await user.type(startInput, futureStart);
    await user.type(endInput, futureEnd);
    await user.click(screen.getByRole('button', { name: /submit request/i }));

    await waitFor(() => {
      expect(startInput).toHaveValue('');
      expect(endInput).toHaveValue('');
    });
  });

  it('shows an error alert when the API call fails', async () => {
    server.use(
      http.post(`${BASE}/leave-request`, () =>
        HttpResponse.json({ message: 'Insufficient balance' }, { status: 400 }),
      ),
    );

    const user = userEvent.setup();
    render(<LeaveRequestForm employeeId={1001} onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText(/start date/i), futureStart);
    await user.type(screen.getByLabelText(/end date/i), futureEnd);
    await user.click(screen.getByRole('button', { name: /submit request/i }));

    expect(await screen.findByText(/insufficient balance/i)).toBeInTheDocument();
  });
});
