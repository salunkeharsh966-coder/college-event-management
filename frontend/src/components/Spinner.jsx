/** A centred Bootstrap spinner with an optional message. */
export default function Spinner({ message = 'Loading...' }) {
  return (
    <div className="ce-spinner-wrap">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading</span>
      </div>
      <p className="text-muted-soft mt-3 mb-0">{message}</p>
    </div>
  );
}
