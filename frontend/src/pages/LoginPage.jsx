import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../services/api.js';

/**
 * Login page.
 *
 * After a successful login the user is sent to the right place:
 *   ADMIN   -> /admin/dashboard
 *   STUDENT -> /student/dashboard
 *
 * The two demo accounts are shown in a box underneath the form so that
 * the evaluator can log in immediately during the viva.
 */
export default function LoginPage() {
  const { login, isLoggedIn, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Where should we go after login?
  const redirectTo =
    location.state?.from ||
    (isAdmin ? '/admin/dashboard' : '/student/dashboard');

  // If already logged in, do not show the form again.
  if (isLoggedIn) {
    navigate(isAdmin ? '/admin/dashboard' : '/student/dashboard', { replace: true });
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  /** Client-side checks run before the request is sent. */
  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = 'Email address is required.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
      next.email = 'Please enter a valid email address.';
    }
    if (!form.password) next.password = 'Password is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const account = await login(form.email.trim(), form.password);
      toast.success(`Welcome back, ${account.fullName}!`);
      navigate(
        account.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard',
        { replace: true }
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  /** One click fills the demo credentials. */
  const fillDemo = (email, password) => {
    setForm({ email, password });
    setErrors({});
  };

  return (
    <div className="ce-auth-wrap">
      <div className="ce-auth-card">

        <div className="ce-auth-icon">
          <i className="bi bi-box-arrow-in-right" />
        </div>

        <h3 className="text-center fw-bold mb-1" style={{ color: 'var(--ce-navy-dark)' }}>
          Welcome back
        </h3>
        <p className="text-center text-muted-soft mb-4">
          Log in to register for events and track your registrations.
        </p>

        <form onSubmit={handleSubmit} noValidate>

          <div className="mb-3">
            <label className="ce-form-label" htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="you@student.edu"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="mb-4">
            <label className="ce-form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-ce-primary w-100 py-2"
            disabled={submitting}
          >
            {submitting
              ? <><span className="spinner-border spinner-border-sm me-2" />Logging in...</>
              : <><i className="bi bi-box-arrow-in-right me-2" />Log In</>}
          </button>
        </form>

        <p className="text-center text-muted-soft mt-4 mb-0">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="fw-semibold">Register here</Link>
        </p>

        {/* ---------- demo credentials ---------- */}
        <div className="ce-demo-box">
          <strong className="d-block mb-2 text-dark">
            <i className="bi bi-info-circle me-1" />Demo accounts
          </strong>

          <div className="d-flex justify-content-between align-items-center mb-1">
            <span>Admin</span>
            <button
              type="button"
              className="btn btn-sm btn-link p-0 text-decoration-none"
              onClick={() => fillDemo('admin@college.edu', 'admin123')}
            >
              <code>admin@college.edu</code> / <code>admin123</code>
            </button>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <span>Student</span>
            <button
              type="button"
              className="btn btn-sm btn-link p-0 text-decoration-none"
              onClick={() => fillDemo('rahul@student.edu', 'student123')}
            >
              <code>rahul@student.edu</code> / <code>student123</code>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
