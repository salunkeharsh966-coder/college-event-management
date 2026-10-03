import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from './Spinner.jsx';

/**
 * Wraps a route so that only logged-in users can open it.
 *
 * <ProtectedRoute adminOnly>
 *   <AdminDashboard />
 * </ProtectedRoute>
 *
 *  - not logged in       -> redirected to /login
 *  - logged in but not admin, on an admin page -> redirected to /student/dashboard
 *
 * `replace` is used so the blocked page does not stay in the browser
 * history - pressing Back then will not bounce the user in circles.
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Wait until the saved session has been read from localStorage,
  // otherwise we would redirect a logged-in user on a page refresh.
  if (loading) return <Spinner message="Checking your session..." />;

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/student/dashboard" replace />;
  }

  // A student trying to open an admin page is handled above;
  // an admin opening a student page is allowed (they can browse events).

  return children;
}
