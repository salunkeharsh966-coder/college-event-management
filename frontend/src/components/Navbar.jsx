import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

/**
 * Top navigation bar.
 *
 * The links change depending on who is logged in:
 *   guest   -> Home, Events, Login, Register
 *   student -> Home, Events, My Events, Logout
 *   admin   -> Home, Events, Dashboard, Manage Events, Registrations, Logout
 */
export default function Navbar() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    const name = user?.fullName?.split(' ')[0] || 'there';
    logout();
    setOpen(false);
    toast.info(`Goodbye, ${name}. You have been logged out.`);
    navigate('/');
  };

  const close = () => setOpen(false);

  return (
    <nav className="navbar navbar-expand-lg ce-navbar sticky-top">
      <div className="container">

        <Link className="navbar-brand" to="/" onClick={close}>
          <span className="ce-logo">
            <i className="bi bi-mortarboard-fill" />
          </span>
          CampusEvents
        </Link>

        <button
          className="navbar-toggler border-0 text-white"
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          <i className="bi bi-list fs-3 text-white" />
        </button>

        <div className={`collapse navbar-collapse ${open ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end onClick={close}>
                <i className="bi bi-house-door me-1" />Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/events" onClick={close}>
                <i className="bi bi-calendar-event me-1" />Events
              </NavLink>
            </li>

            {isLoggedIn && !isAdmin && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/student/dashboard" onClick={close}>
                  <i className="bi bi-journal-check me-1" />My Events
                </NavLink>
              </li>
            )}

            {isAdmin && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin/dashboard" onClick={close}>
                    <i className="bi bi-speedometer2 me-1" />Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin/events" onClick={close}>
                    <i className="bi bi-calendar3 me-1" />Manage Events
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin/registrations" onClick={close}>
                    <i className="bi bi-people me-1" />Registrations
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2 py-2 py-lg-0">
            {!isLoggedIn ? (
              <>
                <Link className="btn btn-ce-outline btn-sm px-3" to="/login" onClick={close}>
                  <i className="bi bi-box-arrow-in-right me-1" />Login
                </Link>
                <Link className="btn btn-ce-gold btn-sm px-3" to="/register" onClick={close}>
                  <i className="bi bi-person-plus me-1" />Register
                </Link>
              </>
            ) : (
              <>
                <span className="ce-user-chip">
                  <i className="bi bi-person-circle" />
                  <span className="d-none d-sm-inline">
                    {user.fullName?.split(' ')[0]}
                  </span>
                  <span className="ce-role-badge">
                    {isAdmin ? 'Admin' : 'Student'}
                  </span>
                </span>
                <button
                  className="btn btn-sm btn-outline-light"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-1" />Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
