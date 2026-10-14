import { useState } from 'react';
import { createUser, amendEmployee } from '../../api/users.js';
import { Alert } from '../ui/Alert.jsx';
import { Spinner } from '../ui/Spinner.jsx';

const ROLES = ['USER', 'MANAGER', 'ADMIN'];

function CreateUserForm({ onSuccess }) {
  const empty = {
    employee_id: '',
    first_name: '',
    last_name: '',
    role: 'USER',
    department: '',
    manager_id: '',
    leave_refresh_date: '',
    leave_refresh_amount: '',
  };
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        employee_id: Number(form.employee_id),
        first_name: form.first_name,
        last_name: form.last_name,
        role: form.role,
        leave_refresh_date: form.leave_refresh_date,
        leave_refresh_amount: Number(form.leave_refresh_amount),
      };
      if (form.department) payload.department = form.department;
      if (form.manager_id) payload.manager_id = Number(form.manager_id);

      await createUser(payload);
      setForm(empty);
      onSuccess?.(`Employee ${form.employee_id} created. They must change their password on first login.`);
    } catch (err) {
      setError(err.message ?? 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="mb-4">
          <Alert type="error" onDismiss={() => setError(null)}>{error}</Alert>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cu-id" className="form-label">
            Employee ID <span className="required" aria-hidden="true">*</span>
          </label>
          <input id="cu-id" type="number" className="form-input" required
            value={form.employee_id} onChange={(e) => set('employee_id', e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="cu-role" className="form-label">
            Role <span className="required" aria-hidden="true">*</span>
          </label>
          <select id="cu-role" className="form-select" value={form.role}
            onChange={(e) => set('role', e.target.value)}>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cu-first" className="form-label">
            First name <span className="required" aria-hidden="true">*</span>
          </label>
          <input id="cu-first" type="text" className="form-input" required
            value={form.first_name} onChange={(e) => set('first_name', e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="cu-last" className="form-label">
            Last name <span className="required" aria-hidden="true">*</span>
          </label>
          <input id="cu-last" type="text" className="form-input" required
            value={form.last_name} onChange={(e) => set('last_name', e.target.value)} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cu-dept" className="form-label">Department</label>
          <input id="cu-dept" type="text" className="form-input"
            value={form.department} onChange={(e) => set('department', e.target.value)}
            placeholder="Optional" />
        </div>
        <div className="form-group">
          <label htmlFor="cu-mgr" className="form-label">Manager ID</label>
          <input id="cu-mgr" type="number" className="form-input"
            value={form.manager_id} onChange={(e) => set('manager_id', e.target.value)}
            placeholder="Optional" />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cu-refresh-date" className="form-label">
            Leave refresh date <span className="required" aria-hidden="true">*</span>
          </label>
          <input id="cu-refresh-date" type="date" className="form-input" required
            value={form.leave_refresh_date}
            onChange={(e) => set('leave_refresh_date', e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="cu-refresh-amount" className="form-label">
            Annual entitlement (days) <span className="required" aria-hidden="true">*</span>
          </label>
          <input id="cu-refresh-amount" type="number" className="form-input" required
            min="0" step="0.5" value={form.leave_refresh_amount}
            onChange={(e) => set('leave_refresh_amount', e.target.value)}
            placeholder="e.g. 25" />
        </div>
      </div>

      <button
        type="submit"
        className="btn btn--primary mt-4"
        disabled={
          loading ||
          !form.employee_id || !form.first_name || !form.last_name ||
          !form.leave_refresh_date || !form.leave_refresh_amount
        }
      >
        {loading ? <><Spinner size="sm" />&nbsp;Creating…</> : 'Create employee'}
      </button>
    </form>
  );
}

function AmendEmployeeForm({ onSuccess }) {
  const [form, setForm] = useState({
    employee_id: '',
    role: '',
    department: '',
    manager_id: '',
    leave_balance: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = { employee_id: Number(form.employee_id) };
      if (form.role) payload.role = form.role;
      if (form.department) payload.department = form.department;
      if (form.manager_id) payload.manager_id = Number(form.manager_id);
      if (form.leave_balance !== '') payload.leave_balance = Number(form.leave_balance);

      await amendEmployee(payload);
      const amendedId = form.employee_id;
      setForm({ employee_id: '', role: '', department: '', manager_id: '', leave_balance: '' });
      onSuccess?.(`Employee ${amendedId} updated successfully.`);
    } catch (err) {
      setError(err.message ?? 'Failed to amend employee.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="mb-4">
          <Alert type="error" onDismiss={() => setError(null)}>{error}</Alert>
        </div>
      )}

      <div className="mb-4">
        <Alert type="info">
          Only fields you fill in will be updated. Leave others blank to keep them unchanged.
        </Alert>
      </div>

      <div className="form-group">
        <label htmlFor="ae-id" className="form-label">
          Employee ID <span className="required" aria-hidden="true">*</span>
        </label>
        <input id="ae-id" type="number" className="form-input" required
          value={form.employee_id} onChange={(e) => set('employee_id', e.target.value)} />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="ae-role" className="form-label">New role</label>
          <select id="ae-role" className="form-select" value={form.role}
            onChange={(e) => set('role', e.target.value)}>
            <option value="">No change</option>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="ae-dept" className="form-label">Department</label>
          <input id="ae-dept" type="text" className="form-input" placeholder="No change"
            value={form.department} onChange={(e) => set('department', e.target.value)} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="ae-mgr" className="form-label">Manager ID</label>
          <input id="ae-mgr" type="number" className="form-input" placeholder="No change"
            value={form.manager_id} onChange={(e) => set('manager_id', e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="ae-balance" className="form-label">Override leave balance</label>
          <input id="ae-balance" type="number" className="form-input" placeholder="No change"
            min="0" step="0.5"
            value={form.leave_balance} onChange={(e) => set('leave_balance', e.target.value)} />
        </div>
      </div>

      <button
        type="submit"
        className="btn btn--primary mt-4"
        disabled={loading || !form.employee_id}
      >
        {loading ? <><Spinner size="sm" />&nbsp;Saving…</> : 'Save changes'}
      </button>
    </form>
  );
}

export function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState('create');
  const [toast, setToast] = useState(null);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header__title">User Management</h1>
        <p className="page-header__sub">Create new employees or amend existing records.</p>
      </div>

      {toast && (
        <div className="mb-6">
          <Alert type="success" onDismiss={() => setToast(null)}>{toast}</Alert>
        </div>
      )}

      <div className="card">
        <div role="tablist" aria-label="User management tabs" className="tabs">
          <button
            role="tab"
            id="tab-create"
            aria-selected={activeTab === 'create'}
            aria-controls="panel-create"
            className={`tab-btn${activeTab === 'create' ? ' tab-btn--active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Create employee
          </button>
          <button
            role="tab"
            id="tab-amend"
            aria-selected={activeTab === 'amend'}
            aria-controls="panel-amend"
            className={`tab-btn${activeTab === 'amend' ? ' tab-btn--active' : ''}`}
            onClick={() => setActiveTab('amend')}
          >
            Amend employee
          </button>
        </div>

        <div
          role="tabpanel"
          id="panel-create"
          aria-labelledby="tab-create"
          hidden={activeTab !== 'create'}
        >
          {activeTab === 'create' && (
            <CreateUserForm onSuccess={(msg) => setToast(msg)} />
          )}
        </div>

        <div
          role="tabpanel"
          id="panel-amend"
          aria-labelledby="tab-amend"
          hidden={activeTab !== 'amend'}
        >
          {activeTab === 'amend' && (
            <AmendEmployeeForm onSuccess={(msg) => setToast(msg)} />
          )}
        </div>
      </div>
    </div>
  );
}
