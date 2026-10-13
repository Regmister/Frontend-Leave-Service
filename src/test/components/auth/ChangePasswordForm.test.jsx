import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server.js';
import { ChangePasswordForm } from '../../../components/auth/ChangePasswordForm.jsx';

const BASE = 'http://localhost:8080/leave-service';

beforeEach(() => localStorage.setItem('jwt', 'test-token'));

function renderForm(props = {}) {
  return render(<ChangePasswordForm {...props} />);
}

// Both inputs share autocomplete="new-password", so /new password/i matches both.
// Use the exact label text (anchored) to target each input unambiguously.
const NEW_PW_LABEL   = /^new password/i;       // matches "New password *" only
const CONF_PW_LABEL  = /^confirm new password/i; // matches "Confirm new password *" only

describe('ChangePasswordForm — rendering', () => {
  it('renders new password and confirm password fields', () => {
    renderForm();
    expect(screen.getByLabelText(NEW_PW_LABEL)).toBeInTheDocument();
    expect(screen.getByLabelText(CONF_PW_LABEL)).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
  });

  it('submit button is disabled when fields are empty', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /change password/i })).toBeDisabled();
  });

  it('does NOT show a warning alert when forced=false (default)', () => {
    renderForm();
    expect(screen.queryByText(/must set a new password/i)).not.toBeInTheDocument();
  });

  it('shows a warning alert when forced=true', () => {
    renderForm({ forced: true });
    expect(screen.getByText(/must set a new password/i)).toBeInTheDocument();
  });
});

describe('ChangePasswordForm — validation', () => {
  it('shows mismatch error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(NEW_PW_LABEL), 'password1');
    await user.type(screen.getByLabelText(CONF_PW_LABEL), 'password2');

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('disables submit when passwords do not match', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(NEW_PW_LABEL), 'abc');
    await user.type(screen.getByLabelText(CONF_PW_LABEL), 'xyz');

    expect(screen.getByRole('button', { name: /change password/i })).toBeDisabled();
  });

  it('enables submit when both fields are filled and match', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(NEW_PW_LABEL), 'newpass123');
    await user.type(screen.getByLabelText(CONF_PW_LABEL), 'newpass123');

    expect(screen.getByRole('button', { name: /change password/i })).not.toBeDisabled();
  });

  it('clears the mismatch error when passwords match', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(NEW_PW_LABEL), 'abc');
    await user.type(screen.getByLabelText(CONF_PW_LABEL), 'xyz');
    await screen.findByText(/passwords do not match/i);

    await user.clear(screen.getByLabelText(CONF_PW_LABEL));
    await user.type(screen.getByLabelText(CONF_PW_LABEL), 'abc');

    expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();
  });
});

describe('ChangePasswordForm — submission', () => {
  it('shows success message after successful submission', async () => {
    const user = userEvent.setup();
    renderForm({ onSuccess: vi.fn() });

    await user.type(screen.getByLabelText(NEW_PW_LABEL), 'newpass123');
    await user.type(screen.getByLabelText(CONF_PW_LABEL), 'newpass123');
    await user.click(screen.getByRole('button', { name: /change password/i }));

    expect(await screen.findByText(/password changed successfully/i)).toBeInTheDocument();
  });

  it('calls onSuccess callback after successful submission', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    renderForm({ onSuccess });

    await user.type(screen.getByLabelText(NEW_PW_LABEL), 'newpass123');
    await user.type(screen.getByLabelText(CONF_PW_LABEL), 'newpass123');
    await user.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });

  it('shows an error alert when the API call fails', async () => {
    server.use(
      http.patch(`${BASE}/change-password`, () =>
        HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }),
      ),
    );
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(NEW_PW_LABEL), 'newpass123');
    await user.type(screen.getByLabelText(CONF_PW_LABEL), 'newpass123');
    await user.click(screen.getByRole('button', { name: /change password/i }));

    expect(await screen.findByText(/unauthorized/i)).toBeInTheDocument();
  });
});
