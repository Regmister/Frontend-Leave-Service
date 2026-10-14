import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getLeaveStatus, getTotalDays, cancelLeave } from "../../api/leave.js";
import { LeaveRequestForm } from "../leave/LeaveRequestForm.jsx";
import { LeaveTable } from "../leave/LeaveTable.jsx";
import { BalanceTiles } from "../leave/BalanceTiles.jsx";
import { Alert } from "../ui/Alert.jsx";
import { Spinner } from "../ui/Spinner.jsx";
import { Modal } from "../ui/Modal.jsx";

export function MyLeavePage() {
  const { user } = useAuth();
  const employeeId = user?.sub;

  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [leavesData, balanceData] = await Promise.all([
        getLeaveStatus(employeeId),
        getTotalDays(employeeId),
      ]);
      setLeaves(leavesData);
      setBalance(balanceData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCancel() {
    setCancelling(true);
    try {
      await cancelLeave(cancelTarget.id);
      setToast({
        type: "success",
        msg: `Leave request #${cancelTarget.id} cancelled.`,
      });
      setCancelTarget(null);
      load();
    } catch (err) {
      setToast({ type: "error", msg: err.message });
    } finally {
      setCancelling(false);
    }
  }

  function handleRequestSuccess() {
    setToast({ type: "success", msg: "Leave request submitted successfully." });
    load();
  }

  const canCancel = (leave) =>
    leave.status === "Pending" || leave.status === "Approved";

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header__title">My Leave</h1>
        <p className="page-header__sub">
          Manage your leave requests and view your balance.
        </p>
      </div>

      {toast && (
        <div className="mb-6">
          <Alert type={toast.type} onDismiss={() => setToast(null)}>
            {toast.msg}
          </Alert>
        </div>
      )}

      {loading ? (
        <div className="loading-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : (
        <>
          <BalanceTiles
            daysUsed={balance?.days}
            remainingBalance={balance?.remainingBalance}
          />

          <div className="card mb-6">
            <div className="card__header">
              <div>
                <h2 className="card__title">Request leave</h2>
                <p className="card__subtitle">
                  Submit a new leave request for approval.
                </p>
              </div>
            </div>
            <LeaveRequestForm
              employeeId={employeeId}
              onSuccess={handleRequestSuccess}
            />
          </div>

          <div className="card">
            <div className="card__header">
              <h2 className="card__title">Leave history</h2>
            </div>
            <LeaveTable
              leaves={leaves}
              actions={(leave) =>
                canCancel(leave) ? (
                  <button
                    className="btn btn--danger btn--sm"
                    onClick={() => setCancelTarget(leave)}
                    aria-label={`Cancel leave request ${leave.id}`}
                  >
                    Cancel
                  </button>
                ) : null
              }
            />
          </div>
        </>
      )}

      {cancelTarget && (
        <Modal
          title="Cancel leave request"
          onClose={() => setCancelTarget(null)}
          footer={
            <>
              <button
                className="btn btn--secondary"
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
              >
                Keep request
              </button>
              <button
                className="btn btn--danger"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? (
                  <>
                    <Spinner size="sm" />
                    &nbsp;Cancelling…
                  </>
                ) : (
                  "Confirm cancel"
                )}
              </button>
            </>
          }
        >
          <p>
            Are you sure you want to cancel request{" "}
            <strong>#{cancelTarget.id}</strong>?
          </p>
          <p className="text-muted text-sm mt-4">
            {cancelTarget.status === "Approved"
              ? "Your leave balance will be refunded."
              : "This pending request will be withdrawn."}
          </p>
        </Modal>
      )}
    </div>
  );
}
