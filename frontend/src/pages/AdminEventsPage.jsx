import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi, eventApi, getErrorMessage } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate, formatTime } from '../utils/format.js';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';

/**
 * Admin event management.
 *
 * A searchable table of every event with Edit / Delete / View Registrations
 * actions. Deleting asks for confirmation first, because it also deletes
 * the registrations attached to that event.
 */
export default function AdminEventsPage() {
  const toast = useToast();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await eventApi.list({});
      setEvents(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const handleDelete = async (event) => {
    const confirmed = window.confirm(
      `Delete the event "${event.title}"?\n\n` +
      'This will also remove all student registrations for it. ' +
      'This action cannot be undone.'
    );
    if (!confirmed) return;

    setDeletingId(event.id);
    try {
      const { data } = await adminApi.deleteEvent(event.id);
      toast.success(data.message || 'Event deleted successfully.');
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  // Simple client-side filter over the already-loaded list.
  const filtered = events.filter((event) => {
    if (!keyword.trim()) return true;
    const needle = keyword.trim().toLowerCase();
    return (
      event.title?.toLowerCase().includes(needle) ||
      event.venue?.toLowerCase().includes(needle) ||
      event.department?.toLowerCase().includes(needle)
    );
  });

  return (
    <div className="ce-page container">

      <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
        <div className="ce-page-head mb-0">
          <h1>Manage Events</h1>
          <p>{events.length} event{events.length === 1 ? '' : 's'} in the system</p>
        </div>
        <Link className="btn btn-ce-gold" to="/admin/events/new">
          <i className="bi bi-plus-circle me-1" />Create New Event
        </Link>
      </div>

      {/* ---------------- search bar ---------------- */}
      <div className="ce-section py-3">
        <div className="row g-2 align-items-center">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-white"><i className="bi bi-search" /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by title, venue or department"
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
          <div className="col-md-6 text-md-end">
            <button className="btn btn-ce-outline" onClick={load}>
              <i className="bi bi-arrow-clockwise me-1" />Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- table ---------------- */}
      <div className="ce-section">
        {loading ? (
          <Spinner message="Loading events..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="bi-calendar-x"
            title={keyword ? 'No events match your search' : 'No events created yet'}
            message={
              keyword
                ? 'Try a different keyword.'
                : 'Create your first event so students can register for it.'
            }
            action={
              !keyword && (
                <Link className="btn btn-ce-primary" to="/admin/events/new">
                  <i className="bi bi-plus-circle me-1" />Create Event
                </Link>
              )
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="table ce-table align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th style={{ minWidth: '200px' }}>Event</th>
                  <th>Date &amp; Time</th>
                  <th>Venue</th>
                  <th>Department</th>
                  <th className="text-center">Seats</th>
                  <th className="text-center">Status</th>
                  <th className="text-end" style={{ minWidth: '210px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((event, index) => (
                  <tr key={event.id}>
                    <td className="text-muted-soft">{index + 1}</td>

                    <td>
                      <Link
                        to={`/events/${event.id}`}
                        className="fw-semibold text-decoration-none"
                        style={{ color: 'var(--ce-navy)' }}
                      >
                        {event.title}
                      </Link>
                      <div className="small text-muted-soft">
                        {event.organizer || 'No organizer set'}
                      </div>
                    </td>

                    <td className="ce-nowrap">
                      {formatDate(event.eventDate)}
                      <div className="small text-muted-soft">
                        {formatTime(event.eventTime)}
                      </div>
                    </td>

                    <td>{event.venue}</td>
                    <td>{event.department || '—'}</td>

                    <td className="text-center ce-nowrap">
                      <span className="fw-semibold">{event.registeredCount}</span>
                      <span className="text-muted-soft"> / {event.capacity}</span>
                      {event.full && (
                        <div><span className="ce-badge full">Full</span></div>
                      )}
                    </td>

                    <td className="text-center">
                      <span className={`ce-badge ${String(event.status).toLowerCase()}`}>
                        {event.status}
                      </span>
                    </td>

                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end flex-wrap">
                        <button
                          className="btn btn-sm btn-ce-outline"
                          title="View students who registered"
                          onClick={() =>
                            navigate(`/admin/registrations?eventId=${event.id}`)
                          }
                        >
                          <i className="bi bi-people" />
                        </button>

                        <Link
                          className="btn btn-sm btn-ce-primary"
                          to={`/admin/events/${event.id}/edit`}
                          title="Edit this event"
                        >
                          <i className="bi bi-pencil" />
                        </Link>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Delete this event"
                          onClick={() => handleDelete(event)}
                          disabled={deletingId === event.id}
                        >
                          {deletingId === event.id
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
