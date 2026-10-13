import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../../../components/ui/Modal.jsx';

function renderModal(props = {}) {
  return render(
    <Modal title="Test Modal" onClose={vi.fn()} {...props}>
      <p>Modal body content</p>
    </Modal>,
  );
}

describe('Modal', () => {
  it('renders the title', () => {
    renderModal();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('renders children', () => {
    renderModal();
    expect(screen.getByText('Modal body content')).toBeInTheDocument();
  });

  it('has role="dialog" and aria-modal="true"', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('has aria-labelledby pointing to the title element', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    expect(document.getElementById('modal-title')).toHaveTextContent('Test Modal');
  });

  it('renders a close button with accessible label', () => {
    renderModal();
    expect(screen.getByRole('button', { name: /close dialog/i })).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal title="T" onClose={onClose}><p>body</p></Modal>);
    await user.click(screen.getByRole('button', { name: /close dialog/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the Escape key is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal title="T" onClose={onClose}><p>body</p></Modal>);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(<Modal title="T" onClose={onClose}><p>body</p></Modal>);
    const backdrop = container.querySelector('.modal-backdrop');
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onClose when clicking inside the dialog', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal title="T" onClose={onClose}><p>body</p></Modal>);
    await user.click(screen.getByText('body'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders a footer when the footer prop is provided', () => {
    render(
      <Modal title="T" onClose={vi.fn()} footer={<button>Confirm</button>}>
        <p>body</p>
      </Modal>,
    );
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('does NOT render a footer element when footer prop is absent', () => {
    const { container } = renderModal();
    expect(container.querySelector('.modal__footer')).not.toBeInTheDocument();
  });
});
