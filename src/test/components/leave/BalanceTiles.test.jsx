import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BalanceTiles } from '../../../components/leave/BalanceTiles.jsx';

describe('BalanceTiles', () => {
  it('renders the "Days used" label', () => {
    render(<BalanceTiles daysUsed={5} remainingBalance={20} />);
    expect(screen.getByText('Days used')).toBeInTheDocument();
  });

  it('renders the "Remaining balance" label', () => {
    render(<BalanceTiles daysUsed={5} remainingBalance={20} />);
    expect(screen.getByText('Remaining balance')).toBeInTheDocument();
  });

  it('displays daysUsed value', () => {
    render(<BalanceTiles daysUsed={7} remainingBalance={18} />);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('formats remainingBalance to 1 decimal place', () => {
    render(<BalanceTiles daysUsed={5} remainingBalance={20} />);
    expect(screen.getByText('20.0')).toBeInTheDocument();
  });

  it('formats a fractional remainingBalance correctly', () => {
    render(<BalanceTiles daysUsed={5} remainingBalance={17.5} />);
    expect(screen.getByText('17.5')).toBeInTheDocument();
  });

  it('shows "—" when daysUsed is null/undefined', () => {
    render(<BalanceTiles remainingBalance={20} />);
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
  });

  it('shows "—" when remainingBalance is null/undefined', () => {
    render(<BalanceTiles daysUsed={5} />);
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
  });

  it('has an accessible region label', () => {
    render(<BalanceTiles daysUsed={5} remainingBalance={20} />);
    expect(screen.getByRole('region', { name: /leave balance summary/i })).toBeInTheDocument();
  });
});
