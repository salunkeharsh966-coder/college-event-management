import { Link } from 'react-router-dom';

/** Shown for any URL that does not match a route. */
export default function NotFoundPage() {
  return (
    <div className="ce-auth-wrap">
      <div className="text-center">
        <div style={{ fontSize: '5rem', lineHeight: 1, color: 'var(--ce-navy)' }}>
          <i className="bi bi-compass" />
        </div>
        <h1 className="fw-bold mt-3 mb-2" style={{ color: 'var(--ce-navy-dark)' }}>
          404 — Page not found
        </h1>
        <p className="text-muted-soft mb-4">
          The page you were looking for does not exist or has been moved.
        </p>
        <div className="d-flex gap-2 justify-content-center flex-wrap">
          <Link className="btn btn-ce-primary" to="/">
            <i className="bi bi-house-door me-1" />Go Home
          </Link>
          <Link className="btn btn-ce-outline" to="/events">
            <i className="bi bi-calendar-event me-1" />Browse Events
          </Link>
        </div>
      </div>
    </div>
  );
}
