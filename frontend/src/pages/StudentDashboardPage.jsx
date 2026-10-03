import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { registrationApi, getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate, formatTime, formatDateTime, relativeDays } from '../utils/format.js';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';

/**
 * Student dashboard - "My Registered Events".
 *
 * Shows three counters at the top and one ticket-style card per
 * registration, with a Cancel button.
 */
export default function StudentDashboardPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [showPast, setShowPast] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await registrationApi.myRegistrations(user.userId);
      setRegistrations(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  const handleCancel = async (registration) => {
    const confirmed = window.confirm(
      `Cancel your registration for "${registration.eventTitle}"?\n\n` +
      'Your seat will be released for other students.'
    );
    if (!confirmed) return;

    setBusyId(registration.id);
    try {
      const { data } = await registrationApi.cancel(registration.id, user.userId);
      toast.success(data.message || 'Registration cancelled.');
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const active = registrations.filter((r) => r.status !== 'CANCELLED');
  const cancelled = registrations.filter((r) => r.status === 'CANCELLED');

  const upcomingCount = active.filter((r) => {
    if (!r.eventDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(r.eventDate) >= today;
  }).length;

  const visible = showPast ? registrations : active;

  return (
    <div className="ce-page container">

      {/* ---------------- header ---------------- */}
      <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
        <div className="ce-page-head mb-0">
          <h1>My Registrations</h1>
          <p>
            Welcome, <strong>{user?.fullName}</strong>
            {user?.rollNumber ? ` (${user.rollNumber})` : ''} — here is everything
            you signed up for.
          </p>
        </div>
        <Link className="btn btn-ce-gold" to="/events">
          <i className="bi bi-plus-circle me-1" />Find More Events
        </Link>
      </div>

      {/* ---------------- counters ---------------- */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="ce-stat">
            <div className="ce-stat-icon"><i className="bi bi-journal-check" /></div>
            <div>
              <div className="ce-stat-label">Active</div>
              <div className="ce-stat-value">{active.length}</div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="ce-stat">
            <div className="ce-stat-icon teal"><i className="bi bi-calendar-event" /></div>
            <div>
              <div className="ce-stat-label">Upcoming</div>
              <div className="ce-stat-value">{upcomingCount}</div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="ce-stat">
            <div className="ce-stat-icon gold"><i className="bi bi-x-circle" /></div>
            <div>
              <div className="ce-stat-label">Cancelled</div>
              <div className="ce-stat-value">{cancelled.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- list ---------------- */}
      <div className="ce-section">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <h5 className="ce-section-title mb-0">
            <i className="bi bi-list-check" />Registered Events
          </h5>

          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="showPast"
              checked={showPast}
              onChange={(e) => setShowPast(e.target.checked)}
            />
            <label className="form-check-label small" htmlFor="showPast">
              Include cancelled
            </label>
          </div>
        </div>

        {loading ? (
          <Spinner message="Loading your registrations..." />
        ) : visible.length === 0 ? (
          <EmptyState
            icon="bi-journal-x"
            title="You have not registered for any event yet"
            message="Browse the events list and register for something that interests you."
            action={
              <Link className="btn btn-ce-primary" to="/events">
                <i className="bi bi-calendar-event me-1" />Browse Events
              </Link>
            }
          />
        ) : (
          <div className="row g-3">
            {visible.map((registration) => {
              const isCancelled = registration.status === 'CANCELLED';

              return (
                <div className="col-lg-6" key={registration.id}>
                  <div className={`ce-ticket ${isCancelled ? 'cancelled' : ''}`}>

                    <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                      <Link
                        to={`/events/${registration.eventId}`}
                        className="fw-bold text-decoration-none"
                        style={{ color: 'var(--ce-navy-dark)', fontSize: '1.02rem' }}
                      >
                        {registration.eventTitle}
                      </Link>
                      <span className={`ce-badge ${String(registration.status).toLowerCase()}`}>
                        {registration.status}
                      </span>
                    </div>

                    <div className="ce-meta">
                      <i className="bi bi-calendar-event" />
                      <span>
                        {formatDate(registration.eventDate)}
                        <span className="text-muted-soft ms-2 small">
                          ({relativeDays(registration.eventDate)})
                        </span>
                      </span>
                    </div>

                    <div className="ce-meta">
                      <i className="bi bi-clock" />{formatTime(registration.eventTime)}
                    </div>

                    <div className="ce-meta">
                      <i className="bi bi-geo-alt" />{registration.venue}
                    </div>

                    {registration.organizer && (
                      <div className="ce-meta">
                        <i className="bi bi-person-badge" />{registration.organizer}
                      </div>
                    )}

                    <div className="ce-divider my-3" />

                    <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
                      <span className="small text-muted-soft">
                        <i className="bi bi-clock-history me-1" />
                        Registered on {formatDateTime(registration.registeredAt)}
                      </span>

                      <div className="d-flex gap-2">
                        <Link
                          className="btn btn-sm btn-ce-outline"
                          to={`/events/${registration.eventId}`}
                        >
                          <i className="bi bi-eye me-1" />View
                        </Link>

                        {!isCancelled && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleCancel(registration)}
                            disabled={busyId === registration.id}
                          >
                            {busyId === registration.id
                              ? <span className="spinner-border spinner-border-sm" />
                              : <><i className="bi bi-x-circle me-1" />Cancel</>}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
