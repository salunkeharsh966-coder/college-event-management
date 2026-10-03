import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventApi, registrationApi } from '../services/api.js';
import { getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import EventCard from '../components/EventCard.jsx';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';

/**
 * Landing page.
 *
 * Shows a hero band, four feature highlights and the next few upcoming
 * events. A logged-in student can register straight from the cards here.
 */
export default function HomePage() {
  const { user, isLoggedIn, isStudent } = useAuth();
  const toast = useToast();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  // Which events am I already registered for? (so we can label the button)
  const [myEventIds, setMyEventIds] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { data } = await eventApi.list({ upcoming: true });
        if (!cancelled) setEvents(data);

        if (isStudent) {
          const mine = await registrationApi.myRegistrations(user.userId);
          if (!cancelled) {
            setMyEventIds(
              mine.data
                .filter((r) => r.status !== 'CANCELLED')
                .map((r) => r.eventId)
            );
          }
        }
      } catch (error) {
        if (!cancelled) toast.error(getErrorMessage(error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [isStudent, user, toast]);

  const handleRegister = async (event) => {
    setBusyId(event.id);
    try {
      const { data } = await registrationApi.register(user.userId, event.id);
      toast.success(data.message || 'Registered successfully!');
      setMyEventIds((ids) => [...ids, event.id]);
      // refresh the seat counters
      const refreshed = await eventApi.list({ upcoming: true });
      setEvents(refreshed.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const features = [
    {
      icon: 'bi-search',
      title: 'Browse & Search Events',
      text: 'Filter upcoming college events by department, keyword or status and see every detail before you commit.',
    },
    {
      icon: 'bi-calendar-check',
      title: 'One-Click Registration',
      text: 'Register for any open event in a single click. Seat availability updates instantly across the portal.',
    },
    {
      icon: 'bi-journal-check',
      title: 'Track Your Registrations',
      text: 'Your personal dashboard lists every event you signed up for, with dates, venue and current status.',
    },
    {
      icon: 'bi-shield-check',
      title: 'Admin Control',
      text: 'Administrators publish events, monitor seat capacity and manage every registration from one dashboard.',
    },
  ];

  return (
    <div className="ce-page container">

      {/* ---------------- hero ---------------- */}
      <section className="ce-hero mb-5">
        <span className="ce-hero-badge">
          <i className="bi bi-mortarboard-fill" />
          College Event Management Portal
        </span>

        <h1>
          Every campus event, <br className="d-none d-md-block" />
          one simple place.
        </h1>

        <p className="lead mb-4">
          Discover workshops, competitions, fests and seminars happening on
          campus — and register in seconds. Built as a college mini project
          with Java, Spring Boot, MySQL and React.
        </p>

        <div className="d-flex flex-wrap gap-2">
          <Link className="btn btn-ce-gold btn-lg px-4" to="/events">
            <i className="bi bi-calendar-event me-2" />Browse Events
          </Link>

          {!isLoggedIn && (
            <Link className="btn btn-outline-light btn-lg px-4" to="/register">
              <i className="bi bi-person-plus me-2" />Create an Account
            </Link>
          )}

          {isStudent && (
            <Link className="btn btn-outline-light btn-lg px-4" to="/student/dashboard">
              <i className="bi bi-journal-check me-2" />My Registrations
            </Link>
          )}
        </div>
      </section>

      {/* ---------------- features ---------------- */}
      <section className="mb-5">
        <div className="ce-page-head">
          <h2>What you can do here</h2>
          <p>Four things the portal handles for students and administrators.</p>
        </div>

        <div className="row g-4">
          {features.map((feature) => (
            <div className="col-md-6 col-lg-3" key={feature.title}>
              <div className="ce-card h-100">
                <div className="ce-card-body">
                  <div className="ce-stat-icon mb-3">
                    <i className={`bi ${feature.icon}`} />
                  </div>
                  <h6 className="ce-card-title">{feature.title}</h6>
                  <p className="ce-card-text mb-0">{feature.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- upcoming events ---------------- */}
      <section>
        <div className="d-flex justify-content-between align-items-end flex-wrap gap-2 mb-3">
          <div className="ce-page-head mb-0">
            <h2>Upcoming Events</h2>
            <p>Register before the deadline — seats are limited.</p>
          </div>
          <Link className="btn btn-ce-outline" to="/events">
            View all <i className="bi bi-arrow-right ms-1" />
          </Link>
        </div>

        {loading ? (
          <Spinner message="Loading upcoming events..." />
        ) : events.length === 0 ? (
          <div className="ce-section">
            <EmptyState
              icon="bi-calendar-x"
              title="No upcoming events right now"
              message="Please check back later, or ask an administrator to publish new events."
            />
          </div>
        ) : (
          <div className="row g-4">
            {events.slice(0, 3).map((event) => (
              <div className="col-md-6 col-lg-4" key={event.id}>
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
      </section>
    </div>
  );
}
