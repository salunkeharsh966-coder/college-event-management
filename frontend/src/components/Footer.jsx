import { Link } from 'react-router-dom';

/** Simple footer shown on every page. */
export default function Footer() {
  return (
    <footer className="ce-footer mt-auto">
      <div className="container">
        <div className="row gy-2 align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <i className="bi bi-mortarboard-fill me-2" />
            <strong className="text-white">CampusEvents</strong> — College Event
            Management &amp; Student Registration System
          </div>
          <div className="col-md-6 text-center text-md-end">
            College Mini Project · Java · Spring Boot · MySQL · React
          </div>
        </div>
        <div className="ce-divider" style={{ background: 'rgba(255,255,255,0.14)' }} />
        <div className="text-center small">
          Demo project for academic use. Data shown is sample data.{' '}
          <Link to="/events">Browse events</Link>
        </div>
      </div>
    </footer>
  );
}
