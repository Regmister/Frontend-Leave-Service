import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Spinner } from '../../../components/ui/Spinner.jsx';

describe('Spinner', () => {
  it('renders with role="status" and aria-label="Loading"', () => {
    const { getByRole } = render(<Spinner />);
    const el = getByRole('status');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('aria-label', 'Loading');
  });

  it('applies no size modifier by default', () => {
    const { container } = render(<Spinner />);
    const el = container.firstChild;
    expect(el.className.trim()).toBe('spinner');
  });

  it('applies spinner--sm modifier when size="sm"', () => {
    const { container } = render(<Spinner size="sm" />);
    expect(container.firstChild).toHaveClass('spinner--sm');
  });

  it('applies spinner--lg modifier when size="lg"', () => {
    const { container } = render(<Spinner size="lg" />);
    expect(container.firstChild).toHaveClass('spinner--lg');
  });
});
