import { useEffect, useState, useCallback } from 'react';
import { eventApi, registrationApi, getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import EventCard from '../components/EventCard.jsx';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';

/**
 * Events list page with search and filters.
 *
 * The filters are sent to the backend as query parameters
 * (/api/events?keyword=...&department=...&status=...), so filtering happens
 * in SQL rather than in JavaScript. That is the point worth explaining in
 * the viva: the browser downloads only the rows it needs.
 */
export default function EventListPage() {
  const { user, isStudent } = useAuth();
  const toast = useToast();

  const [events, setEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [myEventIds, setMyEventIds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const [filters, setFilters] = useState({
    keyword: '',
    department: '',
    status: '',
    upcoming: false,
  });

  // The text the user is typing, applied on submit so we do not fire a
  // request on every keystroke.
  const [keywordInput, setKeywordInput] = useState('');

  const statuses = ['OPEN', 'UPCOMING', 'CLOSED', 'COMPLETED', 'CANCELLED'];

  /** Loads events using the current filters. */
  const loadEvents = useCallback(async (activeFilters) => {
    setLoading(true);
    try {
      const { data } = await eventApi.list({
        keyword: activeFilters.keyword || undefined,
        department: activeFilters.department || undefined,
        status: activeFilters.status || undefined,
        upcoming: activeFilters.upcoming || undefined,
      });
      setEvents(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load the department list once, and the events on mount / filter change.
  useEffect(() => {
    eventApi.departments()
      .then(({ data }) => setDepartments(data))
      .catch(() => setDepartments([]));
  }, []);

  useEffect(() => {
    loadEvents(filters);
  }, [filters, loadEvents]);

  // Which events has this student already registered for?
  useEffect(() => {
    if (!isStudent) {
      setMyEventIds([]);
      return;
    }
    registrationApi.myRegistrations(user.userId)
      .then(({ data }) => {
        setMyEventIds(
          data.filter((r) => r.status !== 'CANCELLED').map((r) => r.eventId)
        );
      })
      .catch(() => setMyEventIds([]));
  }, [isStudent, user]);

  const handleFilterChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setFilters((prev) => ({ ...prev, keyword: keywordInput }));
  };

  const clearFilters = () => {
    setKeywordInput('');
    setFilters({ keyword: '', department: '', status: '', upcoming: false });
  };

  const handleRegister = async (event) => {
    setBusyId(event.id);
    try {
      const { data } = await registrationApi.register(user.userId, event.id);
      toast.success(data.message || 'Registered successfully!');
      setMyEventIds((ids) => [...ids, event.id]);
      await loadEvents(filters); // refresh the seat counters
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const activeFilterCount =
    (filters.keyword ? 1 : 0) +
    (filters.department ? 1 : 0) +
    (filters.status ? 1 : 0) +
    (filters.upcoming ? 1 : 0);

  return (
    <div className="ce-page container">

      <div className="ce-page-head">
        <h1>College Events</h1>
        <p>
          {loading
            ? 'Loading events...'
            : `${events.length} event${events.length === 1 ? '' : 's'} found`}
        </p>
      </div>

      {/* ---------------- filter bar ---------------- */}
      <div className="ce-section">
        <form onSubmit={handleSearchSubmit}>
          <div className="row g-3 align-items-end">

            <div className="col-lg-4 col-md-6">
              <label className="ce-form-label" htmlFor="keyword">Search</label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search" />
                </span>
                <input
                  id="keyword"
                  type="text"
                  className="form-control"
                  placeholder="Title, venue or department"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                />
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <label className="ce-form-label" htmlFor="department">Department</label>
              <select
                id="department" name="department" className="form-select"
                value={filters.department} onChange={handleFilterChange}
              >
                <option value="">All departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="col-lg-2 col-md-6">
              <label className="ce-form-label" htmlFor="status">Status</label>
              <select
                id="status" name="status" className="form-select"
                value={filters.status} onChange={handleFilterChange}
              >
                <option value="">All statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-ce-primary flex-grow-1">
                  <i className="bi bi-funnel me-1" />Apply
                </button>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={clearFilters}
                    title="Clear all filters"
                  >
                    <i className="bi bi-x-lg" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="form-check mt-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="upcoming"
              name="upcoming"
              checked={filters.upcoming}
              onChange={handleFilterChange}
            />
            <label className="form-check-label small" htmlFor="upcoming">
              Show only events that have not happened yet
            </label>
          </div>
        </form>
      </div>

      {/* ---------------- results ---------------- */}
      {loading ? (
        <Spinner message="Fetching events..." />
      ) : events.length === 0 ? (
        <div className="ce-section">
          <EmptyState
            icon="bi-search"
            title="No events match your filters"
            message="Try a different keyword, or clear the filters to see everything."
            action={
              <button className="btn btn-ce-outline" onClick={clearFilters}>
                <i className="bi bi-arrow-counterclockwise me-1" />Clear filters
              </button>
            }
          />
        </div>
      ) : (
        <div className="row g-4">
          {events.map((event) => (
            <div className="col-md-6 col-xl-4" key={event.id}>
              <EventCard
                event={event}
                showRegister={isStudent}
                busy={busyId === event.id}
                onRegister={handleRegister}
                registerLabel={
                  myEventIds.includes(event.id) ? 'Registered' : 'Register Now'
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
