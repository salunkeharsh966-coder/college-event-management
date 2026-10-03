import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminApi, eventApi, getErrorMessage } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate, formatTime, formatDateTime } from '../utils/format.js';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';

/**
 * Admin - view and manage student registrations.
 *
 * Supports a quick filter by event through the URL:
 *   /admin/registrations?eventId=3
 * which is what the "people" button on the Manage Events page links to.
 */
export default function AdminRegistrationsPage() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const eventFilter = searchParams.get('eventId') || '';

  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [keyword, setKeyword] = useState('');

  /** Loads registrations - either all of them, or just one event's. */
  const load = useCallback(async (eventId) => {
    setLoading(true);
    try {
      const { data } = eventId
        ? await adminApi.registrationsForEvent(eventId)
        : await adminApi.allRegistrations();
      setRegistrations(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(eventFilter); }, [eventFilter, load]);

  useEffect(() => {
    eventApi.list({})
      .then(({ data }) => setEvents(data))
      .catch(() => setEvents([]));
  }, []);

  /* ---------------- actions ---------------- */

  const changeStatus = async (registration, value) => {
    setBusyId(registration.id);
    try {
      const { data } = await adminApi.updateRegistrationStatus(registration.id, value);
      toast.success(data.message || 'Registration updated.');
      await load(eventFilter);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const removeRegistration = async (registration) => {
    const confirmed = window.confirm(
      `Remove the registration of "${registration.studentName}" ` +
      `for "${registration.eventTitle}"?\n\nThis cannot be undone.`
    );
    if (!confirmed) return;

    setBusyId(registration.id);
    try {
      const { data } = await adminApi.deleteRegistration(registration.id);
      toast.success(data.message || 'Registration removed.');
      await load(eventFilter);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  /* ---------------- filtering ---------------- */

  const filtered = registrations.filter((registration) => {
    if (!keyword.trim()) return true;
    const needle = keyword.trim().toLowerCase();
    return (
      registration.studentName?.toLowerCase().includes(needle) ||
      registration.studentEmail?.toLowerCase().includes(needle) ||
      registration.studentRollNumber?.toLowerCase().includes(needle) ||
      registration.eventTitle?.toLowerCase().includes(needle)
    );
  });

  const confirmedCount = registrations.filter((r) => r.status === 'CONFIRMED').length;
  const attendedCount = registrations.filter((r) => r.status === 'ATTENDED').length;
  const cancelledCount = registrations.filter((r) => r.status === 'CANCELLED').length;

  return (
    <div className="ce-page container">

      <div className="ce-page-head">
        <h1>Student Registrations</h1>
        <p>
          {eventFilter
            ? 'Showing registrations for one selected event.'
            : 'Every registration across all events.'}
        </p>
      </div>

      {/* ---------------- counters ---------------- */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="ce-stat">
            <div className="ce-stat-icon"><i className="bi bi-people" /></div>
            <div>
              <div className="ce-stat-label">Total Shown</div>
              <div className="ce-stat-value">{registrations.length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="ce-stat">
            <div className="ce-stat-icon teal"><i className="bi bi-check2-circle" /></div>
            <div>
              <div className="ce-stat-label">Confirmed</div>
              <div className="ce-stat-value">{confirmedCount}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="ce-stat">
            <div className="ce-stat-icon gold"><i className="bi bi-person-check" /></div>
            <div>
              <div className="ce-stat-label">Attended</div>
              <div className="ce-stat-value">{attendedCount}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="ce-stat">
            <div className="ce-stat-icon"><i className="bi bi-x-circle" /></div>
            <div>
              <div className="ce-stat-label">Cancelled</div>
              <div className="ce-stat-value">{cancelledCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- filters ---------------- */}
      <div className="ce-section py-3">
        <div className="row g-2 align-items-end">

          <div className="col-lg-5 col-md-6">
            <label className="ce-form-label" htmlFor="student-search">Search student</label>
            <div className="input-group">
              <span className="input-group-text bg-white"><i className="bi bi-search" /></span>
              <input
                id="student-search"
                type="text"
                className="form-control"
                placeholder="Name, email, roll number or event"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              {keyword && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setKeyword('')}
                >
                  <i className="bi bi-x-lg" />
                </button>
              )}
            </div>
          </div>

          <div className="col-lg-5 col-md-6">
            <label className="ce-form-label" htmlFor="event-filter">Filter by event</label>
            <select
              id="event-filter"
              className="form-select"
              value={eventFilter}
              onChange={(e) => {
                const value = e.target.value;
                if (value) setSearchParams({ eventId: value });
                else setSearchParams({});
              }}
            >
              <option value="">All events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>{event.title}</option>
              ))}
            </select>
          </div>

          <div className="col-lg-2 col-md-12 text-lg-end">
            <button className="btn btn-ce-outline w-100" onClick={() => load(eventFilter)}>
              <i className="bi bi-arrow-clockwise me-1" />Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- table ---------------- */}
      <div className="ce-section">
        {loading ? (
          <Spinner message="Loading registrations..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="bi-person-x"
            title="No registrations found"
            message={
              keyword
                ? 'No student matches your search.'
                : 'No student has registered for this selection yet.'
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="table ce-table align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th style={{ minWidth: '180px' }}>Student</th>
                  <th style={{ minWidth: '170px' }}>Event</th>
                  <th>Date</th>
                  <th>Registered On</th>
                  <th className="text-center">Status</th>
                  <th className="text-end" style={{ minWidth: '190px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((registration, index) => (
                  <tr key={registration.id}>
                    <td className="text-muted-soft">{index + 1}</td>

                    <td>
                      <div className="fw-semibold">{registration.studentName}</div>
                      <div className="small text-muted-soft">
                        {registration.studentEmail}
                      </div>
                      {registration.studentRollNumber && (
                        <div className="small text-muted-soft">
                          Roll No: {registration.studentRollNumber}
                        </div>
                      )}
                    </td>

                    <td>
                      <Link
                        to={`/events/${registration.eventId}`}
                        className="text-decoration-none fw-semibold"
                        style={{ color: 'var(--ce-navy)' }}
                      >
                        {registration.eventTitle}
                      </Link>
                      <div className="small text-muted-soft">
                        {registration.venue}
                      </div>
                    </td>

                    <td className="ce-nowrap">
                      {formatDate(registration.eventDate)}
                      <div className="small text-muted-soft">
                        {formatTime(registration.eventTime)}
                      </div>
                    </td>

                    <td className="small ce-nowrap">
                      {formatDateTime(registration.registeredAt)}
                    </td>

                    <td className="text-center">
                      <span className={`ce-badge ${String(registration.status).toLowerCase()}`}>
                        {registration.status}
                      </span>
                    </td>

                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end flex-wrap">
                        {registration.status !== 'ATTENDED' && (
                          <button
                            className="btn btn-sm btn-ce-outline"
                            title="Mark as attended"
                            disabled={busyId === registration.id}
                            onClick={() => changeStatus(registration, 'ATTENDED')}
                          >
                            <i className="bi bi-person-check" />
                          </button>
                        )}

                        {registration.status === 'CANCELLED' ? (
                          <button
                            className="btn btn-sm btn-ce-outline"
                            title="Restore this registration"
                            disabled={busyId === registration.id}
                            onClick={() => changeStatus(registration, 'CONFIRMED')}
                          >
                            <i className="bi bi-arrow-counterclockwise" />
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline-warning"
                            title="Mark as cancelled"
                            disabled={busyId === registration.id}
                            onClick={() => changeStatus(registration, 'CANCELLED')}
                          >
                            <i className="bi bi-slash-circle" />
                          </button>
                        )}

                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Delete this registration"
                          disabled={busyId === registration.id}
                          onClick={() => removeRegistration(registration)}
                        >
                          {busyId === registration.id
                            ? <span className="spinner-border spinner-border-sm" />
                            : <i className="bi bi-trash" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
