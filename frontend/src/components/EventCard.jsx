import { Link } from 'react-router-dom';
import { formatDate, formatTime, relativeDays } from '../utils/format.js';

/** Colour class for the status pill. */
const statusClass = (status) => String(status || 'open').toLowerCase();

/**
 * One event card used on the home page and on the events list.
 *
 * Props
 *   event         - an EventResponse from the backend
 *   showRegister  - when true a "Register" button is shown
 *   onRegister    - click handler for that button
 *   registerLabel - text for the button (default "Register Now")
 *   busy          - disables the button while a request is in flight
 */
export default function EventCard({
  event,
  showRegister = false,
  onRegister,
  registerLabel = 'Register Now',
  busy = false,
}) {
  const seatsPercent = event.capacity
    ? Math.min(100, Math.round((event.registeredCount * 100) / event.capacity))
    : 0;

  return (
    <div className="ce-card">

      <div className="ce-card-body">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
          <span className={`ce-badge ${statusClass(event.status)}`}>
            <i className="bi bi-circle-fill" style={{ fontSize: '0.4rem' }} />
            {event.status}
          </span>
          {event.department && (
            <span className="ce-badge dept">{event.department}</span>
          )}
        </div>

        <h5 className="ce-card-title">{event.title}</h5>

        <p className="ce-card-text">
          {event.description?.length > 130
            ? `${event.description.slice(0, 130)}...`
            : event.description}
        </p>

        <div className="ce-meta">
          <i className="bi bi-calendar-event" />
          <span>
            {formatDate(event.eventDate)}
            {event.eventDate && (
              <span className="text-muted-soft ms-2 small">
                ({relativeDays(event.eventDate)})
              </span>
            )}
          </span>
        </div>

        <div className="ce-meta">
          <i className="bi bi-clock" />
          <span>{formatTime(event.eventTime)}</span>
        </div>

        <div className="ce-meta">
          <i className="bi bi-geo-alt" />
          <span>{event.venue}</span>
        </div>

        <div className="ce-meta">
          <i className="bi bi-person-badge" />
          <span>{event.organizer || '—'}</span>
        </div>

        {/* seat availability */}
        <div className="mt-3">
          <div className="d-flex justify-content-between small mb-1">
            <span className="text-muted-soft">
              {event.registeredCount} of {event.capacity} seats filled
            </span>
            <span className={event.full ? 'text-danger fw-bold' : 'text-success fw-bold'}>
              {event.full ? 'FULL' : `${event.seatsLeft} left`}
            </span>
          </div>
          <div className="ce-progress">
            <div className="bar" style={{ width: `${seatsPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="ce-card-footer">
        <Link className="btn btn-sm btn-ce-outline" to={`/events/${event.id}`}>
          <i className="bi bi-info-circle me-1" />Details
        </Link>

        {showRegister && (
          event.registrationOpen ? (
            <button
              className="btn btn-sm btn-ce-primary"
              onClick={() => onRegister?.(event)}
              disabled={busy}
            >
              {busy
                ? <><span className="spinner-border spinner-border-sm me-1" />Wait...</>
                : <><i className="bi bi-check2-circle me-1" />{registerLabel}</>}
            </button>
          ) : (
            <span className="ce-badge closed">
              <i className="bi bi-lock" /> Registration closed
            </span>
          )
        )}
      </div>
    </div>
  );
}
