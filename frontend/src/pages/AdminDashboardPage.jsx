import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, getErrorMessage } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import StatCard from '../components/StatCard.jsx';
import BarChart from '../components/BarChart.jsx';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';

/**
 * Admin dashboard.
 *
 * Everything on this page comes from a single backend call:
 *   GET /api/admin/dashboard
 * which returns the KPI cards, two bar charts and the fill-level list.
 * Computing these numbers in Java (rather than in the browser) is what
 * lets the same endpoint be reused later for a printed report.
 */
export default function AdminDashboardPage() {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await adminApi.dashboard();
        setStats(data);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  if (loading) return <div className="container ce-page"><Spinner message="Loading dashboard..." /></div>;

  if (!stats) {
    return (
      <div className="container ce-page">
        <EmptyState
          icon="bi-exclamation-triangle"
          title="Could not load the dashboard"
          message="Make sure the backend is running, then refresh the page."
        />
      </div>
    );
  }

  const toneFor = (index) => ['', 'gold', 'teal', ''][index % 4];

  return (
    <div className="ce-page container">

      <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
        <div className="ce-page-head mb-0">
          <h1>Admin Dashboard</h1>
          <p>An overview of events, students and registrations.</p>
        </div>
        <Link className="btn btn-ce-gold" to="/admin/events/new">
          <i className="bi bi-plus-circle me-1" />Create New Event
        </Link>
      </div>

      {/* ---------------- KPI cards ---------------- */}
      <div className="row g-3 mb-4">
        {stats.statistics.map((stat, index) => (
          <div className="col-sm-6 col-xl-3" key={stat.label}>
            <StatCard
              icon={`bi-${stat.icon}`}
              value={stat.value}
              label={stat.label}
              hint={stat.hint}
              tone={toneFor(index)}
            />
          </div>
        ))}
      </div>

      {/* ---------------- charts ---------------- */}
      <div className="row g-4 mb-4">

        <div className="col-lg-6">
          <div className="ce-section h-100 mb-0">
            <h5 className="ce-section-title">
              <i className="bi bi-bar-chart-line" />Registrations per Event
            </h5>
            <BarChart
              labels={stats.chartLabels}
              values={stats.chartValues}
              color="#1b4a86"
            />
          </div>
        </div>

        <div className="col-lg-6">
          <div className="ce-section h-100 mb-0">
            <h5 className="ce-section-title">
              <i className="bi bi-pie-chart" />Registrations per Department
            </h5>
            <BarChart
              labels={stats.departmentLabels}
              values={stats.departmentValues}
              color="#0e9594"
            />
          </div>
        </div>
      </div>

      {/* ---------------- seat fill levels ---------------- */}
      <div className="ce-section">
        <h5 className="ce-section-title">
          <i className="bi bi-speedometer" />Event Capacity Utilisation
        </h5>

        {stats.fillLevels.length === 0 ? (
          <EmptyState
            icon="bi-calendar-plus"
            title="No events yet"
            message="Create your first event to see capacity information here."
            action={
              <Link className="btn btn-ce-primary" to="/admin/events/new">
                <i className="bi bi-plus-circle me-1" />Create Event
              </Link>
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="table ce-table align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ minWidth: '220px' }}>Event</th>
                  <th className="text-center">Registered</th>
                  <th className="text-center">Capacity</th>
                  <th style={{ minWidth: '180px' }}>Fill Level</th>
                </tr>
              </thead>
              <tbody>
                {stats.fillLevels.map((level) => (
                  <tr key={level.title}>
                    <td className="fw-semibold">{level.title}</td>
                    <td className="text-center">{level.registered}</td>
                    <td className="text-center">{level.capacity}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="ce-progress flex-grow-1">
                          <div className="bar" style={{ width: `${level.percent}%` }} />
                        </div>
                        <span className="small fw-bold ce-nowrap" style={{ width: '42px' }}>
                          {level.percent}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---------------- quick links ---------------- */}
      <div className="row g-3">
        <div className="col-md-6">
          <div className="ce-card">
            <div className="ce-card-body d-flex align-items-center gap-3">
              <div className="ce-stat-icon"><i className="bi bi-calendar3" /></div>
              <div className="flex-grow-1">
                <h6 className="ce-card-title mb-1">Manage Events</h6>
                <p className="ce-card-text mb-0">
                  Create, edit or delete events and control registration status.
                </p>
              </div>
              <Link className="btn btn-sm btn-ce-outline" to="/admin/events">Open</Link>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="ce-card">
            <div className="ce-card-body d-flex align-items-center gap-3">
              <div className="ce-stat-icon teal"><i className="bi bi-people" /></div>
              <div className="flex-grow-1">
                <h6 className="ce-card-title mb-1">Student Registrations</h6>
                <p className="ce-card-text mb-0">
                  See who registered, mark attendance or remove an entry.
                </p>
              </div>
              <Link className="btn btn-sm btn-ce-outline" to="/admin/registrations">
                Open
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
