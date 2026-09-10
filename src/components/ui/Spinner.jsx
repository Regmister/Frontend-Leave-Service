export function Spinner({ size = '' }) {
  return (
    <span
      className={`spinner ${size ? `spinner--${size}` : ''}`}
      role="status"
      aria-label="Loading"
    />
  );
}
