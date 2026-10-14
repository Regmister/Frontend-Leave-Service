export function Alert({ type = "info", children, onDismiss }) {
  return (
    <div
      className={`alert alert--${type}`}
      role={type === "error" ? "alert" : "status"}
      style={{ marginBottom: "1rem" }}
    >
      <span style={{ flex: 1 }}>{children}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="btn btn--ghost btn--sm"
          aria-label="Dismiss notification"
          style={{ marginLeft: "auto", padding: "0 4px" }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
