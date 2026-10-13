import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert } from '../../../components/ui/Alert.jsx';

describe('Alert', () => {
  it('renders its children as text', () => {
    render(<Alert type="info">Something happened</Alert>);
    expect(screen.getByText('Something happened')).toBeInTheDocument();
  });

  it('applies the correct CSS modifier for each variant', () => {
    const { rerender } = render(<Alert type="error">msg</Alert>);
    expect(document.querySelector('.alert--error')).toBeInTheDocument();

    rerender(<Alert type="success">msg</Alert>);
    expect(document.querySelector('.alert--success')).toBeInTheDocument();

    rerender(<Alert type="warning">msg</Alert>);
    expect(document.querySelector('.alert--warning')).toBeInTheDocument();

    rerender(<Alert type="info">msg</Alert>);
    expect(document.querySelector('.alert--info')).toBeInTheDocument();
  });

  it('uses role="alert" for error variant', () => {
    render(<Alert type="error">Error!</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('uses role="status" for non-error variants', () => {
    render(<Alert type="success">Done!</Alert>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('defaults to info variant when no type is given', () => {
    render(<Alert>Default</Alert>);
    expect(document.querySelector('.alert--info')).toBeInTheDocument();
  });

  it('renders a dismiss button when onDismiss is provided', () => {
    render(<Alert type="info" onDismiss={vi.fn()}>msg</Alert>);
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
  });

  it('does NOT render a dismiss button when onDismiss is absent', () => {
    render(<Alert type="info">msg</Alert>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onDismiss when the dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Alert type="info" onDismiss={onDismiss}>msg</Alert>);
    await user.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
