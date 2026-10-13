import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';

describe('EmptyState', () => {
  it('renders the default message when none is supplied', () => {
    render(<EmptyState />);
    expect(screen.getByText('Nothing to show here.')).toBeInTheDocument();
  });

  it('renders a custom message', () => {
    render(<EmptyState message="No records found." />);
    expect(screen.getByText('No records found.')).toBeInTheDocument();
  });

  it('renders with role="status"', () => {
    render(<EmptyState />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders an icon when provided', () => {
    const { container } = render(<EmptyState icon="📭" />);
    expect(container.querySelector('.empty__icon')).toHaveTextContent('📭');
  });
});
