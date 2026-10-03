import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi, eventApi, getErrorMessage } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { toInputDate } from '../utils/format.js';
import Spinner from '../components/Spinner.jsx';

/**
 * One page used for BOTH creating and editing an event.
 *
 * How it knows which mode it is in:
 *   /admin/events/new          -> no :id parameter  -> CREATE
 *   /admin/events/5/edit       -> :id = 5           -> EDIT
 * In edit mode the existing values are loaded first and used to pre-fill
 * the form. This avoids duplicating a large form in two components.
 */
export default function AdminEventFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const isEditMode = Boolean(id);

  const emptyForm = {
    title: '',
    description: '',
    eventDate: toInputDate(new Date(Date.now() + 7 * 86400000)),
    eventTime: '10:00',
    venue: '',
    department: '',
    organizer: '',
    capacity: 50,
    registrationDeadline: toInputDate(new Date(Date.now() + 4 * 86400000)),
    status: 'OPEN',
  };

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  const statuses = ['UPCOMING', 'OPEN', 'CLOSED', 'CANCELLED', 'COMPLETED'];

  /* ---------------- load existing event (edit mode) ---------------- */
  useEffect(() => {
    if (!isEditMode) return;

    const load = async () => {
      try {
        const { data } = await eventApi.getById(id);
        setForm({
          title: data.title || '',
          description: data.description || '',
          eventDate: data.eventDate || '',
          // <input type="time"> wants "HH:mm", the API returns "HH:mm:ss"
          eventTime: (data.eventTime || '10:00:00').slice(0, 5),
          venue: data.venue || '',
          department: data.department || '',
          organizer: data.organizer || '',
          capacity: data.capacity ?? 50,
          registrationDeadline: data.registrationDeadline || '',
          status: data.status || 'OPEN',
        });
      } catch (error) {
        toast.error(getErrorMessage(error));
        navigate('/admin/events');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, isEditMode, toast, navigate]);

  /* ---------------- form handling ---------------- */

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  /** Same rules the backend applies, checked here for instant feedback. */
  const validate = () => {
    const next = {};

    if (!form.title.trim()) next.title = 'Event title is required.';
    else if (form.title.trim().length < 4) {
      next.title = 'Please enter a more descriptive title.';
    }

    if (!form.eventDate) next.eventDate = 'Event date is required.';
    if (!form.eventTime) next.eventTime = 'Event time is required.';
    if (!form.venue.trim()) next.venue = 'Venue is required.';

    const capacity = Number(form.capacity);
    if (!form.capacity) next.capacity = 'Capacity is required.';
    else if (Number.isNaN(capacity) || capacity < 1) {
      next.capacity = 'Capacity must be at least 1.';
    }

    if (!form.registrationDeadline) {
      next.registrationDeadline = 'Registration deadline is required.';
    } else if (form.eventDate && form.registrationDeadline > form.eventDate) {
      next.registrationDeadline =
        'The deadline cannot be after the event date.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      toast.error('Please correct the highlighted fields.');
      return;
    }

    // Build exactly the shape the backend's EventRequest expects.
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      eventDate: form.eventDate,
      eventTime: form.eventTime.length === 5 ? `${form.eventTime}:00` : form.eventTime,
      venue: form.venue.trim(),
      department: form.department.trim(),
      organizer: form.organizer.trim(),
      capacity: Number(form.capacity),
      registrationDeadline: form.registrationDeadline,
      status: form.status,
    };

    setSubmitting(true);
    try {
      if (isEditMode) {
        const { data } = await adminApi.updateEvent(id, payload);
        toast.success(data.message || 'Event updated successfully.');
      } else {
        const { data } = await adminApi.createEvent(payload);
        toast.success(data.message || 'Event created successfully.');
      }
      navigate('/admin/events');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container ce-page"><Spinner message="Loading event..." /></div>;
  }

  return (
    <div className="ce-page container" style={{ maxWidth: '900px' }}>

      <button
        className="btn btn-sm btn-link text-decoration-none mb-2 ps-0"
        onClick={() => navigate('/admin/events')}
      >
        <i className="bi bi-arrow-left me-1" />Back to events
      </button>

      <div className="ce-page-head">
        <h1>{isEditMode ? 'Edit Event' : 'Create New Event'}</h1>
        <p>
          {isEditMode
            ? 'Update the details below. Students will see the changes immediately.'
            : 'Fill in the details below to publish a new event on the portal.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="ce-section">
          <h5 className="ce-section-title"><i className="bi bi-card-text" />Basic Details</h5>

          <div className="row g-3">
            <div className="col-12">
              <label className="ce-form-label" htmlFor="title">Event title *</label>
              <input
                id="title" name="title" type="text"
                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                placeholder="e.g. Code Sprint 2026"
                value={form.title} onChange={handleChange}
              />
              {errors.title && <div className="invalid-feedback">{errors.title}</div>}
            </div>

            <div className="col-12">
              <label className="ce-form-label" htmlFor="description">Description</label>
              <textarea
                id="description" name="description" rows="4"
                className="form-control"
                placeholder="What will happen at this event? Who should attend?"
                value={form.description} onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="ce-form-label" htmlFor="department">Department</label>
              <input
                id="department" name="department" type="text"
                className="form-control"
                placeholder="e.g. Computer Science"
                value={form.department} onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="ce-form-label" htmlFor="organizer">Organizer</label>
              <input
                id="organizer" name="organizer" type="text"
                className="form-control"
                placeholder="e.g. Prof. S. R. Joshi"
                value={form.organizer} onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="ce-section">
          <h5 className="ce-section-title"><i className="bi bi-calendar-week" />Schedule &amp; Venue</h5>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="ce-form-label" htmlFor="eventDate">Event date *</label>
              <input
                id="eventDate" name="eventDate" type="date"
                className={`form-control ${errors.eventDate ? 'is-invalid' : ''}`}
                value={form.eventDate} onChange={handleChange}
              />
              {errors.eventDate && <div className="invalid-feedback">{errors.eventDate}</div>}
            </div>

            <div className="col-md-6">
              <label className="ce-form-label" htmlFor="eventTime">Start time *</label>
              <input
                id="eventTime" name="eventTime" type="time"
                className={`form-control ${errors.eventTime ? 'is-invalid' : ''}`}
                value={form.eventTime} onChange={handleChange}
              />
              {errors.eventTime && <div className="invalid-feedback">{errors.eventTime}</div>}
            </div>

            <div className="col-12">
              <label className="ce-form-label" htmlFor="venue">Venue *</label>
              <input
                id="venue" name="venue" type="text"
                className={`form-control ${errors.venue ? 'is-invalid' : ''}`}
                placeholder="e.g. Seminar Hall A"
                value={form.venue} onChange={handleChange}
              />
              {errors.venue && <div className="invalid-feedback">{errors.venue}</div>}
            </div>
          </div>
        </div>

        <div className="ce-section">
          <h5 className="ce-section-title"><i className="bi bi-sliders" />Capacity &amp; Status</h5>

          <div className="row g-3">
            <div className="col-md-4">
              <label className="ce-form-label" htmlFor="capacity">Capacity *</label>
              <input
                id="capacity" name="capacity" type="number" min="1" max="10000"
                className={`form-control ${errors.capacity ? 'is-invalid' : ''}`}
                value={form.capacity} onChange={handleChange}
              />
              {errors.capacity && <div className="invalid-feedback">{errors.capacity}</div>}
            </div>

            <div className="col-md-4">
              <label className="ce-form-label" htmlFor="registrationDeadline">
                Registration deadline *
              </label>
              <input
                id="registrationDeadline" name="registrationDeadline" type="date"
                className={`form-control ${errors.registrationDeadline ? 'is-invalid' : ''}`}
                value={form.registrationDeadline} onChange={handleChange}
              />
              {errors.registrationDeadline && (
                <div className="invalid-feedback">{errors.registrationDeadline}</div>
              )}
            </div>

            <div className="col-md-4">
              <label className="ce-form-label" htmlFor="status">Status</label>
              <select
                id="status" name="status" className="form-select"
                value={form.status} onChange={handleChange}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <div className="form-text">
                Only <strong>OPEN</strong> events accept new registrations.
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2 justify-content-end">
          <button
            type="button"
            className="btn btn-outline-secondary px-4"
            onClick={() => navigate('/admin/events')}
            disabled={submitting}
          >
            Cancel
          </button>

          <button type="submit" className="btn btn-ce-primary px-4" disabled={submitting}>
            {submitting
              ? <><span className="spinner-border spinner-border-sm me-2" />
                  {isEditMode ? 'Updating...' : 'Creating...'}</>
              : <><i className="bi bi-check2-circle me-2" />
                  {isEditMode ? 'Save Changes' : 'Create Event'}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
