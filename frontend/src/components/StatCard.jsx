/**
 * A KPI card for the admin dashboard.
 *
 * Props
 *   icon   - Bootstrap icon class, e.g. "bi-calendar"
 *   tone   - '' (navy) | 'gold' | 'teal'
 *   value  - the big number
 *   label  - what the number means
 *   hint   - a short explanatory line underneath
 */
export default function StatCard({ icon, value, label, hint, tone = '' }) {
  return (
    <div className="ce-stat">
      <div className={`ce-stat-icon ${tone}`}>
        <i className={`bi ${icon}`} />
      </div>
      <div className="flex-grow-1 min-width-0">
        <div className="ce-stat-label">{label}</div>
        <div className="ce-stat-value">{value}</div>
        {hint && <div className="ce-stat-hint">{hint}</div>}
      </div>
    </div>
  );
}
