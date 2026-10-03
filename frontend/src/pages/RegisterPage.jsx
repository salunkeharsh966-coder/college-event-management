import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../services/api.js';

/**
 * Student self-registration.
 *
 * Every account created here gets the STUDENT role. Administrator accounts
 * are created directly in the database (see seed.sql), so nobody can give
 * themselves admin rights through this form.
 */
export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const emptyForm = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    course: '',
    rollNumber: '',
  };

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const courses = [
    'B.Sc. Computer Science',
    'B.Sc. Information Technology',
    'B.Sc. Mathematics',
    'B.Com.',
    'B.A.',
    'B.E. / B.Tech',
    'Other',
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  /** The same rules the backend enforces, applied before we send the request. */
  const validate = () => {
    const next = {};

    if (!form.fullName.trim()) next.fullName = 'Full name is required.';
    else if (form.fullName.trim().length < 3) {
      next.fullName = 'Please enter your full name.';
    }

    if (!form.email.trim()) next.email = 'Email address is required.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
      next.email = 'Please enter a valid email address.';
    }

    if (!form.password) next.password = 'Password is required.';
    else if (form.password.length < 6) {
      next.password = 'Password must be at least 6 characters.';
    }

    if (form.password !== form.confirmPassword) {
      next.confirmPassword = 'The two passwords do not match.';
    }

    if (form.phone && !/^[0-9+\-\s]{10,15}$/.test(form.phone.trim())) {
      next.phone = 'Enter a valid phone number (10 to 15 digits).';
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

    setSubmitting(true);
    try {
      const account = await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        course: form.course,
        rollNumber: form.rollNumber.trim(),
      });

      toast.success(`Account created for ${account.fullName}. Please log in.`);
      navigate('/login');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ce-auth-wrap">
      <div className="ce-auth-card wide">

        <div className="ce-auth-icon">
          <i className="bi bi-person-plus" />
        </div>

        <h3 className="text-center fw-bold mb-1" style={{ color: 'var(--ce-navy-dark)' }}>
          Create your account
        </h3>
        <p className="text-center text-muted-soft mb-4">
          Register as a student to sign up for college events.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-3">

            <div className="col-md-6">
              <label className="ce-form-label" htmlFor="fullName">Full name *</label>
              <input
                id="fullName" name="fullName" type="text"
                className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                placeholder="Rahul Sharma"
                value={form.fullName} onChange={handleChange}
              />
              {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
            </div>

            <div className="col-md-6">
              <label className="ce-form-label" htmlFor="email">Email address *</label>
              <input
                id="email" name="email" type="email" autoComplete="username"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="rahul@student.edu"
                value={form.email} onChange={handleChange}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="col-md-6">
              <label className="ce-form-label" htmlFor="password">Password *</label>
              <input
                id="password" name="password" type="password" autoComplete="new-password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="At least 6 characters"
                value={form.password} onChange={handleChange}
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            <div className="col-md-6">
              <label className="ce-form-label" htmlFor="confirmPassword">
                Confirm password *
              </label>
              <input
                id="confirmPassword" name="confirmPassword" type="password"
                autoComplete="new-password"
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                placeholder="Re-type your password"
                value={form.confirmPassword} onChange={handleChange}
              />
              {errors.confirmPassword && (
                <div className="invalid-feedback">{errors.confirmPassword}</div>
              )}
            </div>

            <div className="col-md-6">
              <label className="ce-form-label" htmlFor="phone">Phone number</label>
              <input
                id="phone" name="phone" type="tel"
                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                placeholder="9820011001"
                value={form.phone} onChange={handleChange}
              />
              {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
            </div>

            <div className="col-md-6">
              <label className="ce-form-label" htmlFor="rollNumber">Roll number</label>
              <input
                id="rollNumber" name="rollNumber" type="text"
                className="form-control"
                placeholder="CS2023001"
                value={form.rollNumber} onChange={handleChange}
              />
            </div>

            <div className="col-12">
              <label className="ce-form-label" htmlFor="course">Course / Department</label>
              <select
                id="course" name="course" className="form-select"
                value={form.course} onChange={handleChange}
              >
                <option value="">-- Select your course --</option>
                {courses.map((course) => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-ce-primary w-100 py-2 mt-4"
            disabled={submitting}
          >
            {submitting
              ? <><span className="spinner-border spinner-border-sm me-2" />Creating account...</>
              : <><i className="bi bi-check2-circle me-2" />Create Account</>}
          </button>
        </form>

        <p className="text-center text-muted-soft mt-4 mb-0">
          Already registered?{' '}
          <Link to="/login" className="fw-semibold">Log in here</Link>
        </p>
      </div>
    </div>
  );
}
