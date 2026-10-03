/**
 * A horizontal bar chart drawn with plain HTML divs - no chart library.
 *
 * Why not a library? Keeping it dependency-free makes the component short,
 * fully responsive and easy to explain in a viva: each bar's width is just
 * a percentage of the largest value.
 *
 * Props
 *   labels  - array of strings
 *   values  - array of numbers (same length as labels)
 *   color   - CSS colour for the bar
 */
export default function BarChart({ labels = [], values = [], color = '#1b4a86' }) {
  const max = Math.max(1, ...values.map((v) => Number(v) || 0));

  if (labels.length === 0) {
    return (
      <p className="text-muted-soft small mb-0">
        No data to display yet.
      </p>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {labels.map((label, index) => {
        const value = Number(values[index]) || 0;
        const percent = Math.round((value / max) * 100);

        return (
          <div key={`${label}-${index}`}>
            <div className="d-flex justify-content-between align-items-baseline mb-1">
              <span
                className="small fw-semibold text-truncate"
                style={{ maxWidth: '72%' }}
                title={label}
              >
                {label}
              </span>
              <span className="small fw-bold text-dark">{value}</span>
            </div>
            <div className="ce-progress" style={{ height: '12px' }}>
              <div
                className="bar"
                style={{
                  width: `${percent}%`,
                  background: color,
                  minWidth: value > 0 ? '6px' : '0',
                }}
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-label={`${label}: ${value}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
