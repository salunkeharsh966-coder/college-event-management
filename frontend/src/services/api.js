import axios from 'axios';

/**
 * One shared axios instance for the whole app.
 *
 * baseURL '/api' works because of the proxy rule in vite.config.js:
 * the dev server forwards /api/* to the Spring Boot server on port 8080.
 * In production you would point this at your deployed backend URL.
 */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

/* ---------------------------------------------------------------------
   Request interceptor
   ---------------------------------------------------------------------
   Reads the logged-in user from localStorage and adds the X-User-Id
   header. The backend's AuthInterceptor needs this header on every
   /api/admin/** call.
   --------------------------------------------------------------------- */
api.interceptors.request.use(
  (config) => {
    try {
      const raw = localStorage.getItem('ce_user');
      if (raw) {
        const user = JSON.parse(raw);
        if (user && user.userId) {
          config.headers['X-User-Id'] = user.userId;
        }
      }
    } catch {
      // Ignore a corrupted localStorage entry - the request simply
      // goes out without the header and the server replies 400/403.
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ---------------------------------------------------------------------
   Response interceptor
   ---------------------------------------------------------------------
   Turns every failure into the same shape:
       new Error("a message worth showing to the user")
   The UI components therefore never have to dig through
   error.response.data.message themselves.
   --------------------------------------------------------------------- */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Something went wrong. Please try again.';

    if (error.response) {
      const data = error.response.data;

      if (data) {
        // Our GlobalExceptionHandler always sends a "message" field.
        if (typeof data === 'string') message = data;
        else if (data.message) message = data.message;
        else if (data.error) message = data.error;
      }

      if (error.response.status === 401) {
        message = 'Your session has expired. Please log in again.';
      }
    } else if (error.request) {
      message =
        'Cannot reach the server. Make sure the Spring Boot backend is running on port 8080.';
    }

    error.friendlyMessage = message;
    return Promise.reject(error);
  }
);

/* ---------------------------------------------------------------------
   Small helper so components can do: catch (err) => showError(err)
   --------------------------------------------------------------------- */
export const getErrorMessage = (error) =>
  error?.friendlyMessage || error?.message || 'Unexpected error.';

export default api;

/* =====================================================================
   API endpoint groups - keeps the components free of URL strings
   ===================================================================== */

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  me: (id) => api.get(`/auth/me/${id}`),
};

export const eventApi = {
  /** params: { keyword, department, status, upcoming } */
  list: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  departments: () => api.get('/events/departments'),
  statuses: () => api.get('/events/statuses'),
};

export const registrationApi = {
  register: (userId, eventId) =>
    api.post('/registrations', { userId, eventId }),
  myRegistrations: (userId) => api.get(`/registrations/my/${userId}`),
  cancel: (registrationId, userId) =>
    api.delete(`/registrations/${registrationId}/cancel`, {
      params: { userId },
    }),
};

export const adminApi = {
  dashboard: () => api.get('/admin/dashboard'),

  createEvent: (payload) => api.post('/admin/events', payload),
  updateEvent: (id, payload) => api.put(`/admin/events/${id}`, payload),
  deleteEvent: (id) => api.delete(`/admin/events/${id}`),

  allRegistrations: () => api.get('/admin/registrations'),
  registrationsForEvent: (eventId) =>
    api.get(`/admin/events/${eventId}/registrations`),
  updateRegistrationStatus: (id, value) =>
    api.put(`/admin/registrations/${id}/status`, null, { params: { value } }),
  deleteRegistration: (id) => api.delete(`/admin/registrations/${id}`),
};
