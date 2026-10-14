import { useState, useEffect, useCallback } from "react";
import {
  getTeamPendingLeaves,
  approveLeave,
  declineLeave,
  getTeamLeaveBalance,
} from "../../api/leave.js";
import { LeaveTable } from "../leave/LeaveTable.jsx";
import { Alert } from "../ui/Alert.jsx";
import { Spinner } from "../ui/Spinner.jsx";
import { Modal } from "../ui/Modal.jsx";
import { StatusBadge } from "../ui/StatusBadge.jsx";

export function TeamPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [startFilter, setStartFilter] = useState("");
  const [endFilter, setEndFilter] = useState("");

  const [balanceEmpId, setBalanceEmpId] = useState("");
  const [balanceData, setBalanceData] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);

  const [actionId, setActionId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTeamPendingLeaves({
        start_date: startFilter || undefined,
        end_date: endFilter || undefined,
      });
      setLeaves(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [startFilter, endFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAction(id, action) {
    setActionId(id);
    try {
      if (action === "approve") await approveLeave(id);
      else await declineLeave(id);
      setToast({ type: "success", msg: `Request #${id} ${action}d.` });
      load();
    } catch (err) {
      setToast({ type: "error", msg: err.message });
    } finally {
      setActionId(null);
    }
  }

  async function handleBalanceLookup(e) {
    e.preventDefault();
    setBalanceLoading(true);
    setBalanceError(null);
    setBalanceData(null);
    try {
      const data = await getTeamLeaveBalance(balanceEmpId);
      setBalanceData(data);
    } catch (err) {
      setBalanceError(err.message);
    } finally {
      setBalanceLoading(false);
    }
  }

  const isPending = !startFilter && !endFilter;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header__title">Team</h1>
        <p className="page-header__sub">
          {isPending
            ? "Pending requests from your team."
            : "Filtered requests from your team."}
        </p>
      </div>

      {toast && (
        <div className="mb-6">
          <Alert type={toast.type} onDismiss={() => setToast(null)}>
            {toast.msg}
          </Alert>
        </div>
      )}

      <div className="card mb-6">
        <div className="card__header">
          <h2 className="card__title">Member balance</h2>
          <button
            className="btn btn--secondary btn--sm"
            onClick={() => {
              setShowBalanceModal(true);
              setBalanceData(null);
              setBalanceError(null);
            }}
          >
            Look up balance
          </button>
        </div>
        <p className="card__subtitle">
          Check a team member's current leave balance and entitlement.
        </p>
      </div>

      <div className="card mb-6">
        <div className="card__header">
          <h2 className="card__title">
            {isPending ? "Pending requests" : "Filtered requests"}
          </h2>
        </div>

        <div className="filter-bar">
          <div className="form-group">
            <label htmlFor="filter-start" className="form-label">
              From
            </label>
            <input
              id="filter-start"
              type="date"
              className="form-input"
              value={startFilter}
              onChange={(e) => setStartFilter(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="filter-end" className="form-label">
              To
            </label>
            <input
              id="filter-end"
              type="date"
              className="form-input"
              value={endFilter}
              onChange={(e) => setEndFilter(e.target.value)}
            />
          </div>
          {(startFilter || endFilter) && (
            <button
              className="btn btn--ghost"
              onClick={() => {
                setStartFilter("");
                setEndFilter("");
              }}
              aria-label="Clear date filters"
            >
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-center">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <Alert type="error">{error}</Alert>
        ) : (
          <LeaveTable
            leaves={leaves}
            showEmployee
            actions={(leave) =>
              leave.status === "Pending" ? (
                <>
                  <button
                    className="btn btn--primary btn--sm"
                    onClick={() => handleAction(leave.id, "approve")}
                    disabled={actionId === leave.id}
                    aria-label={`Approve leave request ${leave.id}`}
                  >
                    {actionId === leave.id ? <Spinner size="sm" /> : "Approve"}
                  </button>
                  <button
                    className="btn btn--secondary btn--sm"
                    onClick={() => handleAction(leave.id, "decline")}
                    disabled={actionId === leave.id}
                    aria-label={`Decline leave request ${leave.id}`}
                  >
                    Decline
                  </button>
                </>
              ) : null
            }
          />
        )}
      </div>

      {showBalanceModal && (
        <Modal
          title="Check member balance"
          onClose={() => setShowBalanceModal(false)}
        >
          <form onSubmit={handleBalanceLookup} noValidate>
            <div className="form-group">
              <label htmlFor="balance-emp-id" className="form-label">
                Employee ID
              </label>
              <input
                id="balance-emp-id"
                type="number"
                className="form-input"
                value={balanceEmpId}
                onChange={(e) => setBalanceEmpId(e.target.value)}
                required
                placeholder="e.g. 1003"
              />
            </div>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={balanceLoading || !balanceEmpId}
            >
              {balanceLoading ? (
                <>
                  <Spinner size="sm" />
                  &nbsp;Looking up…
                </>
              ) : (
                "Look up"
              )}
            </button>
          </form>

          {balanceError && (
            <div className="mt-4">
              <Alert type="error">{balanceError}</Alert>
            </div>
          )}

          {balanceData && (
            <div className="mt-6">
              <hr className="divider" />
              <EmployeeBalanceCard data={balanceData} />
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

function EmployeeBalanceCard({ data }) {
  return (
    <dl
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}
    >
      <Row label="Name" value={`${data.first_name} ${data.last_name}`} />
      <Row label="Role" value={<StatusBadge value={data.role} />} />
      <Row label="Department" value={data.department ?? "—"} />
      <Row label="Manager ID" value={data.manager_id ?? "—"} />
      <Row
        label="Balance"
        value={`${Number(data.leave_balance).toFixed(1)} days`}
      />
      <Row
        label="Entitlement"
        value={`${Number(data.leave_refresh_amount).toFixed(1)} days`}
      />
      <Row label="Refresh date" value={data.leave_refresh_date} />
    </dl>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <dt
        className="text-xs text-muted"
        style={{
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </dt>
      <dd className="text-sm" style={{ marginTop: "2px" }}>
        {value}
      </dd>
    </div>
  );
}
