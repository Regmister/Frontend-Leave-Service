import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeaveTable } from '../../../components/leave/LeaveTable.jsx';

const sampleLeaves = [
  { id: 1, startDate: '2026-09-15', endDate: '2026-09-19', status: 'Pending',   reviewedBy: null,   employeed: 1001 },
  { id: 2, startDate: '2026-08-01', endDate: '2026-08-05', status: 'Approved',  reviewedBy: 2001,   employeed: 1001 },
  { id: 3, startDate: '2026-07-10', endDate: '2026-07-11', status: 'Declined',  reviewedBy: 2001,   employeed: 1002 },
  { id: 4, startDate: '2026-06-01', endDate: '2026-06-03', status: 'Cancelled', reviewedBy: null,   employeed: 1001 },
];

describe('LeaveTable — empty state', () => {
  it('shows EmptyState when no leaves are provided', () => {
    render(<LeaveTable leaves={[]} />);
    expect(screen.getByText(/no leave requests found/i)).toBeInTheDocument();
  });

  it('shows EmptyState when leaves prop is omitted', () => {
    render(<LeaveTable />);
    expect(screen.getByText(/no leave requests found/i)).toBeInTheDocument();
  });
});

describe('LeaveTable — rendering rows', () => {
  it('renders a row for each leave', () => {
    render(<LeaveTable leaves={sampleLeaves} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders start and end dates', () => {
    render(<LeaveTable leaves={[sampleLeaves[0]]} />);
    expect(screen.getByText('2026-09-15')).toBeInTheDocument();
    expect(screen.getByText('2026-09-19')).toBeInTheDocument();
  });

  it('renders StatusBadge for each status', () => {
    render(<LeaveTable leaves={sampleLeaves} />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Declined')).toBeInTheDocument();
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('renders reviewedBy value when present', () => {
    render(<LeaveTable leaves={[sampleLeaves[1]]} />);
    expect(screen.getByText('2001')).toBeInTheDocument();
  });

  it('renders "—" when reviewedBy is null', () => {
    render(<LeaveTable leaves={[sampleLeaves[0]]} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('has an accessible region label', () => {
    render(<LeaveTable leaves={sampleLeaves} />);
    expect(screen.getByRole('region', { name: /leave requests/i })).toBeInTheDocument();
  });
});

describe('LeaveTable — showEmployee column', () => {
  it('does NOT render Employee column header by default', () => {
    render(<LeaveTable leaves={sampleLeaves} />);
    expect(screen.queryByRole('columnheader', { name: /employee/i })).not.toBeInTheDocument();
  });

  it('renders Employee column header when showEmployee=true', () => {
    render(<LeaveTable leaves={sampleLeaves} showEmployee />);
    expect(screen.getByRole('columnheader', { name: /employee/i })).toBeInTheDocument();
  });

  it('renders employee ID values when showEmployee=true', () => {
    render(<LeaveTable leaves={[sampleLeaves[0]]} showEmployee />);
    expect(screen.getByText('1001')).toBeInTheDocument();
  });
});

describe('LeaveTable — actions render-prop', () => {
  it('renders the actions column header when actions prop is provided', () => {
    render(
      <LeaveTable
        leaves={sampleLeaves}
        actions={() => <button>Act</button>}
      />,
    );
    // sr-only header exists
    expect(document.querySelector('.sr-only')).toBeInTheDocument();
  });

  it('calls the actions render-prop with each leave object', () => {
    const actions = vi.fn(() => null);
    render(<LeaveTable leaves={sampleLeaves} actions={actions} />);
    expect(actions).toHaveBeenCalledTimes(sampleLeaves.length);
    expect(actions).toHaveBeenCalledWith(sampleLeaves[0]);
  });

  it('renders the button returned by actions and fires its click handler', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <LeaveTable
        leaves={[sampleLeaves[0]]}
        actions={(leave) => (
          <button onClick={() => handleClick(leave.id)}>Cancel</button>
        )}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(handleClick).toHaveBeenCalledWith(1);
  });
});
