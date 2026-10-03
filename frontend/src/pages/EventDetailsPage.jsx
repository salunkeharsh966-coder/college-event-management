import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { eventApi, registrationApi, getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatDateLong, formatTime, relativeDays } from '../utils/format.js';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';

/**
 * Full details of one event, with the register button.
 */
export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isStudent, isLoggedIn } = useAuth();
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await eventApi.getById(id);
      setEvent(data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  // Has this student already registered for this event?
  useEffect(() => {
    if (!isStudent) return;
    registrationApi.myRegistrations(user.userId)
      .then(({ data }) => {
        setAlreadyRegistered(
          data.some((r) => r.eventId === Number(id) && r.status !== 'CANCELLED')
        );
      })
      .catch(() => setAlreadyRegistered(false));
  }, [isStudent, user, id]);

  const handleRegister = async () => {
    if (!isLoggedIn) {
      toast.info('Please log in as a student to register for events.');
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await registrationApi.register(user.userId, Number(id));
      toast.success(data.message || 'Registered successfully!');
      setAlreadyRegistered(true);
      await load(); // refresh seat count
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container ce-page"><Spinner /></div>;

  if (notFound || !event) {
    return (
      <div className="container ce-page">
        <div className="ce-section">
          <EmptyState
            icon="bi-exclamation-circle"
            title="Event not found"
            message="This event may have been deleted by an administrator."
            action={
              <Link className="btn btn-ce-primary" to="/events">
                <i className="bi bi-arrow-left me-1" />Back to events
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const seatsPercent = event.capacity
    ? Math.min(100, Math.round((event.registeredCount * 100) / event.capacity))
    : 0;

  return (
    <div className="ce-page container">

      {/* back link */}
      <button
        className="btn btn-sm btn-link text-decoration-none mb-2 ps-0"
        onClick={() => navigate(-1)}
      >
        <i className="bi bi-arrow-left me-1" />Back
      </button>

      <div className="row g-4">

        {/* ---------------- main column ---------------- */}
        <div className="col-lg-8">
          <div className="ce-section mb-4">

            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
              <span className={`ce-badge ${String(event.status).toLowerCase()}`}>
                {event.status}
              </span>
              {event.department && (
                <span className="ce-badge dept">
                  <i className="bi bi-building" /> {event.department}
                </span>
              )}
            </div>

            <h1 className="fw-bold mb-3" style={{ color: 'var(--ce-navy-dark)', fontSize: '1.8rem' }}>
              {event.title}
            </h1>

            <p style={{ lineHeight: 1.75, color: '#3b4457' }}>
              {event.description || 'No description has been provided for this event.'}
            </p>
          </div>

          {/* -------- schedule & venue -------- */}
          <div className="ce-section">
            <h5 className="ce-section-title">
              <i className="bi bi-info-circle" />Event Information
            </h5>

            <div className="row g-3">
              <div className="col-md-6">
                <div className="ce-stat-label">Date</div>
                <div className="fw-semibold">{formatDateLong(event.eventDate)}</div>
                <div className="small text-muted-soft">{relativeDays(event.eventDate)}</div>
              </div>

              <div className="col-md-6">
                <div className="ce-stat-label">Time</div>
                <div className="fw-semibold">{formatTime(event.eventTime)}</div>
              </div>

              <div className="col-md-6">
                <div className="ce-stat-label">Venue</div>
                <div className="fw-semibold">
                  <i className="bi bi-geo-alt me-1 text-muted-soft" />{event.venue}
                </div>
              </div>

              <div className="col-md-6">
                <div className="ce-stat-label">Organizer</div>
                <div className="fw-semibold">
                  <i className="bi bi-person-badge me-1 text-muted-soft" />
                  {event.organizer || '—'}
                </div>
              </div>

              <div className="col-md-6">
                <div className="ce-stat-label">Registration Deadline</div>
                <div className="fw-semibold">{formatDateLong(event.registrationDeadline)}</div>
              </div>

              <div className="col-md-6">
                <div className="ce-stat-label">Department</div>
                <div className="fw-semibold">{event.department || 'Open to all'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- side column ---------------- */}
        <div className="col-lg-4">
          <div className="ce-section" style={{ position: 'sticky', top: '96px' }}>

            <h5 className="ce-section-title">
              <i className="bi bi-ticket-perforated" />Registration
            </h5>

            {/* seat meter */}
            <div className="mb-3">
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

            <div className="ce-divider" />

            {/* action area */}
            {alreadyRegistered ? (
              <div className="alert alert-success mb-3 py-2 small">
                <i className="bi bi-check-circle-fill me-1" />
                You are registered for this event.
              </div>
            ) : null}

            {event.registrationOpen ? (
              <>
                <button
                  className="btn btn-ce-primary w-100 py-2"
                  onClick={handleRegister}
                  disabled={submitting || alreadyRegistered}
                >
                  {submitting
                    ? <><span className="spinner-border spinner-border-sm me-2" />Registering...</>
                    : alreadyRegistered
                      ? <><i className="bi bi-check2-circle me-2" />Already Registered</>
                      : <><i className="bi bi-check2-circle me-2" />Register for this Event</>}
                </button>

                {!isLoggedIn && (
                  <p className="small text-muted-soft text-center mt-2 mb-0">
                    You will be asked to log in first.
                  </p>
                )}

                {isLoggedIn && !isStudent && (
                  <p className="small text-muted-soft text-center mt-2 mb-0">
                    Administrators cannot register for events.
                  </p>
                )}
              </>
            ) : (
              <div className="alert alert-secondary mb-0 py-2 small">
                <i className="bi bi-lock me-1" />
                Registration is not open for this event
                {event.full ? ' — all seats are taken.' : '.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
