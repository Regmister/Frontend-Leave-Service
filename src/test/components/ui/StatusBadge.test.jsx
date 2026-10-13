import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../../../components/ui/StatusBadge.jsx';

const cases = [
  ['Pending',   'badge--pending'],
  ['Approved',  'badge--approved'],
  ['Declined',  'badge--declined'],
  ['Cancelled', 'badge--cancelled'],
  ['ADMIN',     'badge--admin'],
  ['MANAGER',   'badge--manager'],
  ['USER',      'badge--user'],
];

describe('StatusBadge', () => {
  it.each(cases)('renders "%s" with class %s', (value, cls) => {
    const { container } = render(<StatusBadge value={value} />);
    expect(screen.getByText(value)).toBeInTheDocument();
    expect(container.firstChild).toHaveClass(cls);
  });

  it('falls back to badge--pending for unknown values', () => {
    const { container } = render(<StatusBadge value="UNKNOWN" />);
    expect(container.firstChild).toHaveClass('badge--pending');
  });

  it('has an aria-label containing the value', () => {
    render(<StatusBadge value="Approved" />);
    expect(screen.getByLabelText(/Approved/i)).toBeInTheDocument();
  });
});
