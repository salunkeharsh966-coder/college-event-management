import { Navigate, Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ToastStack from './components/ToastStack.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import EventListPage from './pages/EventListPage.jsx';
import EventDetailsPage from './pages/EventDetailsPage.jsx';
import StudentDashboardPage from './pages/StudentDashboardPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import AdminEventsPage from './pages/AdminEventsPage.jsx';
import AdminEventFormPage from './pages/AdminEventFormPage.jsx';
import AdminRegistrationsPage from './pages/AdminRegistrationsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

/**
 * All client-side routes.
 *
 * React Router swaps the page component without reloading the browser,
 * which is what makes the app feel like a single-page application.
 */
export default function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <ToastStack />

      <main className="flex-grow-1">
        <Routes>
          {/* ---------------- public ---------------- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventListPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ---------------- student ---------------- */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* ---------------- admin ---------------- */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute adminOnly>
                <AdminEventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/new"
            element={
              <ProtectedRoute adminOnly>
                <AdminEventFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/:id/edit"
            element={
              <ProtectedRoute adminOnly>
                <AdminEventFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/registrations"
            element={
              <ProtectedRoute adminOnly>
                <AdminRegistrationsPage />
              </ProtectedRoute>
            }
          />

          {/* ---------------- fallback ---------------- */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
