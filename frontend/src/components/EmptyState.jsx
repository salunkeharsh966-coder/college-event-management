/**
 * The "nothing here yet" panel.
 * Used when a search returns no events, a student has no registrations, etc.
 */
export default function EmptyState({
  icon = 'bi-inbox',
  title = 'Nothing to show',
  message = '',
  action = null,
}) {
  return (
    <div className="ce-empty">
      <i className={`bi ${icon}`} />
      <h5 className="fw-bold text-dark">{title}</h5>
      {message && <p className="mb-3">{message}</p>}
      {action}
    </div>
  );
}
